<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        VerifyEmail::createUrlUsing(function (User $notifiable): string {
            return URL::temporarySignedRoute(
                'api.v1.auth.email.verify',
                now()->addMinutes((int) config('auth.verification.expire', 60)),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ],
            );
        });

        Gate::before(function (User $user, string $ability): ?bool {
            return $user->hasRole('super_administrator') ? true : null;
        });
    }
}
