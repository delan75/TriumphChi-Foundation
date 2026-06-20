<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;
    use HasRoles;
    use Notifiable;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_PENDING = 'pending';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_DISABLED = 'disabled';

    protected string $guard_name = 'web';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'preferred_locale',
        'status',
        'registered_via',
        'registration_source',
        'email_verified_at',
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

    public function oauthLoginCodes(): HasMany
    {
        return $this->hasMany(OAuthLoginCode::class);
    }

    public function verificationOtps(): HasMany
    {
        return $this->hasMany(UserVerificationOtp::class);
    }

    public function isActive(): bool
    {
        return ($this->status ?? self::STATUS_ACTIVE) === self::STATUS_ACTIVE;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function activate(): void
    {
        $this->forceFill(['status' => self::STATUS_ACTIVE])->save();
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
