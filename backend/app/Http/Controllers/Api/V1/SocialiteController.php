<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserAuthProvider;
use App\Services\AuthAuditLogger;
use App\Services\OAuthLoginCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Throwable;

class SocialiteController extends Controller
{
    private const SUPPORTED_PROVIDERS = ['google', 'facebook'];

    public function __construct(
        private readonly AuthAuditLogger $auditLogger,
        private readonly OAuthLoginCodeService $oauthLoginCodes,
    ) {
    }

    public function redirectToGoogle(): RedirectResponse
    {
        return $this->redirectToProvider('google');
    }

    public function redirectToFacebook(): RedirectResponse
    {
        return $this->redirectToProvider('facebook');
    }

    private function redirectToProvider(string $provider): RedirectResponse
    {
        return Socialite::driver($provider)
            ->stateless()
            ->scopes($this->scopesFor($provider))
            ->redirect();
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        return $this->handleProviderCallback($request, 'google');
    }

    public function handleFacebookCallback(Request $request): RedirectResponse
    {
        return $this->handleProviderCallback($request, 'facebook');
    }

    private function handleProviderCallback(Request $request, string $provider): RedirectResponse
    {
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (Throwable $exception) {
            Log::warning('OAuth callback failed.', [
                'provider' => $provider,
                'error' => $exception->getMessage(),
            ]);

            return redirect("{$frontendUrl}/login?error=oauth_failed");
        }

        if (! $socialUser->getEmail()) {
            return redirect("{$frontendUrl}/login?error=email_required");
        }

        if (! $this->hasVerifiedEmail($provider, $socialUser)) {
            return redirect("{$frontendUrl}/login?error=email_not_verified");
        }

        try {
            [$user, $isNew] = DB::transaction(
                fn () => $this->findOrCreateUserFromProvider($request, $provider, $socialUser)
            );

            if (! $user->isActive()) {
                $this->auditLogger->log($user, 'oauth_login_denied', $request, metadata: [
                    'provider' => $provider,
                    'status' => $user->status,
                ]);

                return redirect("{$frontendUrl}/login?error=account_inactive");
            }

            $code = $this->oauthLoginCodes->create($user, $provider, $request);
            $locale = $user->preferred_locale ?? 'en';
            $newUserFlag = $isNew ? '&new=1' : '';

            return redirect("{$frontendUrl}/{$locale}/oauth/callback?code=" . urlencode($code) . $newUserFlag);
        } catch (Throwable $exception) {
            Log::error('OAuth user resolution failed.', [
                'provider' => $provider,
                'error' => $exception->getMessage(),
            ]);

            return redirect("{$frontendUrl}/login?error=server_error");
        }
    }

    /**
     * @return array{0: User, 1: bool}
     */
    private function findOrCreateUserFromProvider(Request $request, string $provider, SocialiteUser $socialUser): array
    {
        $providerUserId = $socialUser->getId();
        $providerEmail = $socialUser->getEmail();
        $providerName = $socialUser->getName() ?: $providerEmail;
        $providerAvatar = $socialUser->getAvatar();

        $existingProvider = UserAuthProvider::query()
            ->where('provider', $provider)
            ->where('provider_user_id', $providerUserId)
            ->first();

        if ($existingProvider) {
            $user = $existingProvider->user;

            $existingProvider->update([
                'last_used_at' => now(),
                'provider_avatar' => $providerAvatar,
            ]);

            return [$user, false];
        }

        $existingUser = User::query()
            ->where('email', $providerEmail)
            ->first();

        if ($existingUser) {
            if (! $existingUser->isActive() && ! $existingUser->isPending()) {
                return [$existingUser, false];
            }

            $linkedProvider = $existingUser->authProviders()
                ->where('provider', $provider)
                ->first();

            if ($linkedProvider) {
                if (! hash_equals((string) $linkedProvider->provider_user_id, (string) $providerUserId)) {
                    throw new \RuntimeException('OAuth provider conflict for existing account.');
                }

                $linkedProvider->update([
                    'last_used_at' => now(),
                    'provider_avatar' => $providerAvatar,
                ]);

                return [$existingUser, false];
            }

            $existingUser->authProviders()->create([
                'provider' => $provider,
                'provider_user_id' => $providerUserId,
                'provider_email' => $providerEmail,
                'provider_avatar' => $providerAvatar,
                'linked_at' => now(),
                'last_used_at' => now(),
            ]);

            if (! $existingUser->hasVerifiedEmail()) {
                $existingUser->forceFill(['email_verified_at' => now()])->save();
            }

            if ($existingUser->isPending()) {
                $existingUser->activate();
            }

            $this->auditLogger->log($existingUser, 'oauth_provider_linked', $request, metadata: [
                'provider' => $provider,
            ]);

            return [$existingUser, false];
        }

        $newUser = User::create([
            'name' => $providerName,
            'email' => $providerEmail,
            'password' => null,
            'preferred_locale' => app()->getLocale(),
            'status' => User::STATUS_ACTIVE,
            'registered_via' => $provider,
            'email_verified_at' => now(),
        ]);

        $newUser->authProviders()->create([
            'provider' => $provider,
            'provider_user_id' => $providerUserId,
            'provider_email' => $providerEmail,
            'provider_avatar' => $providerAvatar,
            'linked_at' => now(),
            'last_used_at' => now(),
        ]);

        $this->auditLogger->log($newUser, 'oauth_registered', $request, metadata: [
            'provider' => $provider,
        ]);

        return [$newUser, true];
    }

    public function linkProvider(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => ['required', 'string', 'in:' . implode(',', self::SUPPORTED_PROVIDERS)],
        ]);

        return $this->error('Provider linking via API redirect is not implemented yet.', 501);
    }

    public function unlinkProvider(Request $request, string $provider): JsonResponse
    {
        $user = $request->user();
        $authProvider = $user->authProviders()->where('provider', $provider)->first();

        if (! $authProvider) {
            return $this->notFound("The {$provider} provider is not linked to your account.");
        }

        if ($user->authProviders()->count() <= 1) {
            return $this->error('At least one sign-in method must remain connected.', 422);
        }

        $authProvider->delete();
        $this->auditLogger->log($user, 'oauth_provider_removed', $request, metadata: [
            'provider' => $provider,
        ]);

        return $this->success(null, ucfirst($provider) . ' account disconnected successfully.');
    }

    public function listProviders(Request $request): JsonResponse
    {
        $providers = $request->user()->authProviders()
            ->select(['provider', 'provider_email', 'provider_avatar', 'linked_at', 'last_used_at'])
            ->get();

        return $this->success($providers, 'Providers retrieved.');
    }

    private function scopesFor(string $provider): array
    {
        return match ($provider) {
            'google' => ['openid', 'profile', 'email'],
            'facebook' => ['email'],
        };
    }

    private function hasVerifiedEmail(string $provider, SocialiteUser $socialUser): bool
    {
        return match ($provider) {
            'google' => (bool) ($socialUser->user['email_verified'] ?? false),
            'facebook' => (bool) ($socialUser->user['verified'] ?? false),
        };
    }
}
