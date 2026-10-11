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
use RuntimeException;
use Throwable;

class SocialiteController extends Controller
{
    private const SUPPORTED_PROVIDERS = ['google', 'facebook'];

    private const SUPPORTED_LOCALES = ['en', 'fr'];

    public function __construct(
        private readonly AuthAuditLogger $auditLogger,
        private readonly OAuthLoginCodeService $oauthLoginCodes,
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | OAuth Redirects
    |--------------------------------------------------------------------------
    */

    public function redirectToGoogle(Request $request): RedirectResponse
    {
        $locale = $this->resolveLocale($request);

        return $this->redirectToProvider('google', $locale);
    }

    public function redirectToFacebook(Request $request): RedirectResponse
    {
        $locale = $this->resolveLocale($request);

        return $this->redirectToProvider('facebook', $locale);
    }

    private function redirectToProvider(
        string $provider,
        string $locale
    ): RedirectResponse {
        abort_unless(
            in_array($provider, self::SUPPORTED_PROVIDERS, true),
            404
        );

        $driver = Socialite::driver($provider)
            ->stateless()
            ->scopes($this->scopesFor($provider));

        // Ask Google to display its authentication interface
        // in the language selected by the user.
        if ($provider === 'google') {
            $driver->with(['hl' => $locale]);
        }

        return $driver->redirect();
    }

    /*
    |--------------------------------------------------------------------------
    | OAuth Callbacks
    |--------------------------------------------------------------------------
    */

    public function handleGoogleCallback(
        Request $request
    ): RedirectResponse {
        return $this->handleProviderCallback($request, 'google');
    }

    public function handleFacebookCallback(
        Request $request
    ): RedirectResponse {
        return $this->handleProviderCallback($request, 'facebook');
    }

    private function handleProviderCallback(
        Request $request,
        string $provider
    ): RedirectResponse {
        $frontendUrl = rtrim(
            (string) config(
                'app.frontend_url',
                'http://localhost:5173'
            ),
            '/'
        );

        try {
            $socialUser = Socialite::driver($provider)
                ->stateless()
                ->user();
        } catch (Throwable $exception) {
            Log::warning('OAuth callback failed.', [
                'provider' => $provider,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            return $this->loginErrorRedirect(
                $frontendUrl,
                $this->resolveLocale($request),
                'oauth_failed'
            );
        }

        if (! $socialUser->getId() || ! $socialUser->getEmail()) {
            return $this->loginErrorRedirect(
                $frontendUrl,
                $this->resolveLocale($request),
                'email_required'
            );
        }

        if (! $this->hasVerifiedEmail($provider, $socialUser)) {
            return $this->loginErrorRedirect(
                $frontendUrl,
                $this->resolveLocale($request),
                'email_not_verified'
            );
        }

        try {
            [$user, $isNew] = DB::transaction(
                fn () => $this->findOrCreateUserFromProvider(
                    $request,
                    $provider,
                    $socialUser
                )
            );

            if (! $user->isActive()) {
                $this->auditLogger->log(
                    $user,
                    'oauth_login_denied',
                    $request,
                    metadata: [
                        'provider' => $provider,
                        'status' => $user->status,
                    ]
                );

                return $this->loginErrorRedirect(
                    $frontendUrl,
                    $this->resolveLocale($request),
                    'account_inactive'
                );
            }

            $code = $this->oauthLoginCodes->create(
                $user,
                $provider,
                $request
            );

            // Preserve the existing account-language behaviour.
            $locale = $this->normaliseLocale(
                $user->preferred_locale
            );

            $callbackUrl = "{$frontendUrl}/{$locale}/oauth/callback";

            return redirect()->to(
                $callbackUrl . '?' . http_build_query([
                    'code' => $code,
                    'new' => $isNew ? '1' : null,
                ])
            );
        } catch (Throwable $exception) {
            Log::error('OAuth user resolution failed.', [
                'provider' => $provider,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            return $this->loginErrorRedirect(
                $frontendUrl,
                $this->resolveLocale($request),
                'server_error'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | User Resolution
    |--------------------------------------------------------------------------
    */

    /**
     * @return array{0: User, 1: bool}
     */
    private function findOrCreateUserFromProvider(
        Request $request,
        string $provider,
        SocialiteUser $socialUser
    ): array {
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
            if (
                ! $existingUser->isActive()
                && ! $existingUser->isPending()
            ) {
                return [$existingUser, false];
            }

            $linkedProvider = $existingUser->authProviders()
                ->where('provider', $provider)
                ->first();

            if ($linkedProvider) {
                if (
                    ! hash_equals(
                        (string) $linkedProvider->provider_user_id,
                        (string) $providerUserId
                    )
                ) {
                    throw new RuntimeException(
                        'OAuth provider conflict for existing account.'
                    );
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
                $existingUser
                    ->forceFill(['email_verified_at' => now()])
                    ->save();
            }

            if ($existingUser->isPending()) {
                $existingUser->activate();
            }

            $this->auditLogger->log(
                $existingUser,
                'oauth_provider_linked',
                $request,
                metadata: [
                    'provider' => $provider,
                ]
            );

            return [$existingUser, false];
        }

        $newUser = User::create([
            'name' => $providerName,
            'email' => $providerEmail,
            'password' => null,
            'preferred_locale' => $this->normaliseLocale(
                app()->getLocale()
            ),
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

        $this->auditLogger->log(
            $newUser,
            'oauth_registered',
            $request,
            metadata: [
                'provider' => $provider,
            ]
        );

        return [$newUser, true];
    }

    /*
    |--------------------------------------------------------------------------
    | Provider Management
    |--------------------------------------------------------------------------
    */

    public function linkProvider(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => [
                'required',
                'string',
                'in:' . implode(',', self::SUPPORTED_PROVIDERS),
            ],
        ]);

        return $this->error(
            'Provider linking via API redirect is not implemented yet.',
            501
        );
    }

    public function unlinkProvider(
        Request $request,
        string $provider
    ): JsonResponse {
        if (
            ! in_array($provider, self::SUPPORTED_PROVIDERS, true)
        ) {
            return $this->notFound('Unsupported authentication provider.');
        }

        $user = $request->user();

        $authProvider = $user->authProviders()
            ->where('provider', $provider)
            ->first();

        if (! $authProvider) {
            return $this->notFound(
                "The {$provider} provider is not linked to your account."
            );
        }

        if ($user->authProviders()->count() <= 1) {
            return $this->error(
                'At least one sign-in method must remain connected.',
                422
            );
        }

        $authProvider->delete();

        $this->auditLogger->log(
            $user,
            'oauth_provider_removed',
            $request,
            metadata: [
                'provider' => $provider,
            ]
        );

        return $this->success(
            null,
            ucfirst($provider) . ' account disconnected successfully.'
        );
    }

    public function listProviders(Request $request): JsonResponse
    {
        $providers = $request->user()
            ->authProviders()
            ->select([
                'provider',
                'provider_email',
                'provider_avatar',
                'linked_at',
                'last_used_at',
            ])
            ->get();

        return $this->success(
            $providers,
            'Providers retrieved.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function scopesFor(string $provider): array
    {
        return match ($provider) {
            'google' => ['openid', 'profile', 'email'],
            'facebook' => ['email'],
        };
    }

    private function hasVerifiedEmail(
        string $provider,
        SocialiteUser $socialUser
    ): bool {
        return match ($provider) {
            'google' => (bool) (
                $socialUser->user['email_verified'] ?? false
            ),
            'facebook' => (bool) (
                $socialUser->user['verified'] ?? false
            ),
        };
    }

    private function resolveLocale(Request $request): string
    {
        $locale = $request->query(
            'locale',
            app()->getLocale()
        );

        return $this->normaliseLocale(
            is_string($locale) ? $locale : null
        );
    }

    private function normaliseLocale(?string $locale): string
    {
        return in_array(
            $locale,
            self::SUPPORTED_LOCALES,
            true
        ) ? $locale : 'en';
    }

    private function loginErrorRedirect(
        string $frontendUrl,
        string $locale,
        string $error
    ): RedirectResponse {
        $url = "{$frontendUrl}/{$locale}/login";

        return redirect()->to(
            $url . '?' . http_build_query([
                'error' => $error,
            ])
        );
    }
}