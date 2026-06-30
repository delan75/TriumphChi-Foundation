<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use App\Services\AuthAuditLogger;
use App\Services\AuthTokenService;
use App\Services\OAuthLoginCodeService;
use App\Services\VerificationOtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthAuditLogger $auditLogger,
        private readonly AuthTokenService $tokenService,
        private readonly OAuthLoginCodeService $oauthLoginCodes,
        private readonly VerificationOtpService $verificationOtps,
    ) {
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data, $request): User {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'preferred_locale' => $data['preferred_locale'] ?? app()->getLocale(),
                'status' => User::STATUS_PENDING,
                'registered_via' => 'local',
            ]);

            $user->authProviders()->create([
                'provider' => 'local',
                'linked_at' => now(),
            ]);

            $this->auditLogger->log($user, 'registered', $request, metadata: [
                'registered_via' => 'local',
                'status' => User::STATUS_PENDING,
            ]);

            return $user;
        });

        $user->sendEmailVerificationNotification();
        $this->verificationOtps->send($user, 'email', $request);

        return response()->json([
            'message' => __('api.auth.registered_verify_email'),
            'token' => null,
            'user' => AuthUserResource::make($user),
        ], Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = User::query()
            ->where('email', $data['email'])
            ->first();

        if (! $user || ! $user->password || ! Hash::check($data['password'], $user->password)) {
            $this->auditLogger->log($user, 'failed_login', $request, metadata: [
                'email' => $data['email'],
                'reason' => 'invalid_credentials',
            ]);

            throw ValidationException::withMessages([
                'email' => __('api.auth.failed'),
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            $this->auditLogger->log($user, 'failed_login', $request, metadata: [
                'email' => $data['email'],
                'reason' => 'email_not_verified',
            ]);

            return response()->json([
                'success' => false,
                'message' => __('api.auth.email_not_verified'),
                'code' => 'email_not_verified',
                'data' => $this->verificationContext($user),
            ], Response::HTTP_CONFLICT);
        }

        if (! $user->isActive()) {
            $this->auditLogger->log($user, 'failed_login', $request, metadata: [
                'email' => $data['email'],
                'reason' => 'account_inactive',
                'status' => $user->status,
            ]);

            return $this->forbidden(__('api.auth.account_inactive'));
        }

        $user->touchLastLogin();
        $user->authProviders()
            ->firstOrCreate(['provider' => 'local'], ['linked_at' => now()])
            ->update(['last_used_at' => now()]);

        $token = $this->tokenService->issueForLogin(
            $user,
            $data['device_name'] ?? 'api-client',
            $request,
        );

        return response()->json([
            'message' => __('api.auth.logged_in'),
            'token' => $token,
            'user' => AuthUserResource::make($user),
        ]);
    }

    public function me(Request $request)
    {
        return AuthUserResource::make($request->user()->load([
            'profile',
            'authProviders',
            'tokens',
            'auditLogs' => fn ($query) => $query->limit(20),
        ]));
    }

    public function logout(Request $request)
    {
        $this->tokenService->revokeCurrent($request->user(), $request);

        return response()->json([
            'message' => __('api.auth.logged_out'),
        ]);
    }

    public function logoutAll(Request $request)
    {
        $this->tokenService->revokeAll($request->user(), $request);

        return response()->json([
            'message' => __('api.auth.logged_out_all'),
        ]);
    }

    public function exchangeOAuthCode(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:120'],
        ]);

        $loginCode = $this->oauthLoginCodes->consume($data['code']);
        $user = $loginCode->user;

        if (! $user || ! $user->isActive()) {
            return $this->forbidden(__('api.auth.account_inactive'));
        }

        $user->touchLastLogin();

        $token = $this->tokenService->issueForLogin(
            $user,
            $data['device_name'] ?? "{$loginCode->provider}-oauth",
            $request,
            'oauth_login',
        );

        return response()->json([
            'message' => __('api.auth.logged_in'),
            'token' => $token,
            'user' => AuthUserResource::make($user),
        ]);
    }

    public function verifyEmail(Request $request, int $id, string $hash)
    {
        $user = User::query()->findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(Response::HTTP_FORBIDDEN);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();

            if ($user->isPending()) {
                $user->activate();
            }

            $this->auditLogger->log($user, 'email_verified', $request, metadata: [
                'status' => $user->status,
            ]);
        }

        if ($request->expectsJson()) {
            return $this->success(AuthUserResource::make($user), __('api.auth.email_verified'));
        }

        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
        $locale = $user->preferred_locale ?? 'en';

        return redirect("{$frontendUrl}/{$locale}/login?verified=1");
    }

    public function resendVerificationOtp(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'channel' => ['nullable', 'string', 'in:email,sms,whatsapp'],
        ]);

        $user = User::query()
            ->where('email', $data['email'])
            ->first();

        if (! $user || $user->hasVerifiedEmail()) {
            return $this->success(null, __('api.auth.otp_sent'));
        }

        $channel = $data['channel'] ?? 'email';
        $this->verificationOtps->send($user, $channel, $request);

        return $this->success([
            'channel' => $this->verificationOtps->normalizeChannel($channel),
            'expires_in_minutes' => (int) config('auth_security.verification_otp_expiration_minutes', 10),
            'verification' => $this->verificationContext($user),
        ], __('api.auth.otp_sent'));
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'digits:6'],
            'device_name' => ['nullable', 'string', 'max:120'],
        ]);

        $user = $this->verificationOtps->verify($data['email'], $data['code'], $request);

        $token = $this->tokenService->issueForLogin(
            $user,
            $data['device_name'] ?? 'api-client',
            $request,
            'verification_otp_login',
        );

        return response()->json([
            'message' => __('api.auth.email_verified'),
            'token' => $token,
            'user' => AuthUserResource::make($user),
        ]);
    }

    public function updateVerificationContact(Request $request)
    {
        $data = $request->validate([
            'current_email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'channel' => ['nullable', 'string', 'in:email,sms,whatsapp'],
        ]);

        $user = User::query()
            ->where('email', $data['current_email'])
            ->first();

        if (! $user || ! $user->password || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_email' => __('api.auth.failed'),
            ]);
        }

        if ($user->hasVerifiedEmail() || ! $user->isPending()) {
            return $this->error(__('api.auth.contact_update_not_allowed'), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $updates = [];

        if (! empty($data['email']) && $data['email'] !== $user->email) {
            if (User::query()->where('email', $data['email'])->exists()) {
                throw ValidationException::withMessages([
                    'email' => __('validation.unique', ['attribute' => 'email']),
                ]);
            }

            $updates['email'] = $data['email'];
        }

        if (array_key_exists('phone', $data)) {
            $phone = filled($data['phone'] ?? null) ? $data['phone'] : null;

            if ($phone === $user->phone) {
                $phone = $user->phone;
            } elseif ($phone && User::query()->where('phone', $phone)->exists()) {
                throw ValidationException::withMessages([
                    'phone' => __('validation.unique', ['attribute' => 'phone']),
                ]);
            }

            if ($phone !== $user->phone) {
                $updates['phone'] = $phone;
            }
        }

        if ($updates) {
            $before = [
                'email_masked' => $this->verificationOtps->maskedEmail($user),
                'phone_masked' => $this->verificationOtps->maskedPhone($user),
            ];

            $user->forceFill($updates)->save();
            $user->verificationOtps()->whereNull('consumed_at')->delete();

            $this->auditLogger->log($user, 'verification_contact_updated', $request, metadata: [
                'before' => $before,
                'after' => $this->verificationContext($user),
            ]);
        }

        $channel = $data['channel'] ?? 'email';
        $this->verificationOtps->send($user->fresh(), $channel, $request);

        return $this->success([
            'channel' => $this->verificationOtps->normalizeChannel($channel),
            'expires_in_minutes' => (int) config('auth_security.verification_otp_expiration_minutes', 10),
            'verification' => $this->verificationContext($user->fresh()),
        ], __('api.auth.contact_updated'));
    }

    private function verificationContext(User $user): array
    {
        return [
            'email' => $user->email,
            'masked_email' => $this->verificationOtps->maskedEmail($user),
            'masked_phone' => $this->verificationOtps->maskedPhone($user),
            'has_phone' => (bool) $user->phone,
        ];
    }
}
