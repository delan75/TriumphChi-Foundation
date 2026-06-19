<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasRoles;
    use Notifiable;

    protected string $guard_name = 'web';

    protected $fillable = [
        'name',
        'email',
        'password',
        'preferred_locale',
        'registered_via',
        'registration_source',
        'last_login_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /**
     * All authentication providers linked to this account.
     * A user may have 'local' (password) + 'google' + future providers.
     */
    public function authProviders(): HasMany
    {
        return $this->hasMany(UserAuthProvider::class);
    }

    /**
     * Returns true if the user has at least one password-based auth provider.
     */
    public function hasPasswordAuth(): bool
    {
        return $this->authProviders()->where('provider', 'local')->exists();
    }

    /**
     * Returns true if the user has the given social provider linked.
     */
    public function hasSocialProvider(string $provider): bool
    {
        return $this->authProviders()->where('provider', $provider)->exists();
    }

    /**
     * Touch the last_login_at timestamp without modifying updated_at.
     */
    public function touchLastLogin(): void
    {
        $this->timestamps = false;
        $this->last_login_at = now();
        $this->save();
        $this->timestamps = true;
    }
}
