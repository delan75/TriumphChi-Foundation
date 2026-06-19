<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserAuthProvider;
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
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')
            ->stateless()
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');

        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
        } catch (Throwable $exception) {
            Log::warning('Google OAuth callback failed.', [
                'error' => $exception->getMessage(),
            ]);

            return redirect("{$frontendUrl}/login?error=oauth_failed");
        }

        if (! ($socialUser->user['email_verified'] ?? false)) {
            return redirect("{$frontendUrl}/login?error=email_not_verified");
        }

        try {
            [$user, $isNew] = DB::transaction(
                fn () => $this->findOrCreateUserFromGoogle($socialUser)
            );

            $token = $user->createToken('google-oauth')->plainTextToken;
            $redirectPath = $isNew ? '/complete-profile' : '/dashboard';
            $locale = $user->preferred_locale ?? 'en';

            return redirect("{$frontendUrl}/{$locale}{$redirectPath}?token=" . urlencode($token));
        } catch (Throwable $exception) {
            Log::error('Google OAuth user resolution failed.', [
                'error' => $exception->getMessage(),
            ]);

            return redirect("{$frontendUrl}/login?error=server_error");
        }
    }

    /**
     * @return array{0: User, 1: bool}
     */
    private function findOrCreateUserFromGoogle(SocialiteUser $socialUser): array
    {
        $googleSub = $socialUser->getId();
        $googleEmail = $socialUser->getEmail();
        $googleName = $socialUser->getName() ?: $googleEmail;
        $googleAvatar = $socialUser->getAvatar();

        $existingProvider = UserAuthProvider::query()
            ->where('provider', 'google')
            ->where('provider_user_id', $googleSub)
            ->first();

        if ($existingProvider) {
            $user = $existingProvider->user;

            $existingProvider->update([
                'last_used_at' => now(),
                'provider_avatar' => $googleAvatar,
            ]);
            $user->touchLastLogin();

            return [$user, false];
        }

        $existingUser = User::query()
            ->where('email', $googleEmail)
            ->first();

        if ($existingUser) {
            $existingUser->authProviders()->create([
                'provider' => 'google',
                'provider_user_id' => $googleSub,
                'provider_email' => $googleEmail,
                'provider_avatar' => $googleAvatar,
                'linked_at' => now(),
                'last_used_at' => now(),
            ]);
            $existingUser->touchLastLogin();

            return [$existingUser, false];
        }

        $newUser = User::create([
            'name' => $googleName,
            'email' => $googleEmail,
            'password' => null,
            'preferred_locale' => app()->getLocale(),
            'registered_via' => 'google',
        ]);

        $newUser->authProviders()->create([
            'provider' => 'google',
            'provider_user_id' => $googleSub,
            'provider_email' => $googleEmail,
            'provider_avatar' => $googleAvatar,
            'linked_at' => now(),
            'last_used_at' => now(),
        ]);
        $newUser->touchLastLogin();

        return [$newUser, true];
    }

    public function linkProvider(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => ['required', 'string', 'in:google,apple,microsoft,github'],
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

        return $this->success(null, ucfirst($provider) . ' account disconnected successfully.');
    }

    public function listProviders(Request $request): JsonResponse
    {
        $providers = $request->user()->authProviders()
            ->select(['provider', 'provider_email', 'provider_avatar', 'linked_at', 'last_used_at'])
            ->get();

        return $this->success($providers, 'Providers retrieved.');
    }
}
