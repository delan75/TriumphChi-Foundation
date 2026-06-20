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

            throw ValidationException::withMessages([
                'email' => __('api.auth.email_not_verified'),
            ]);
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
        return AuthUserResource::make($request->user());
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
}
