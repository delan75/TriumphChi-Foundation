<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Represents a single authentication method attached to a user account.
 *
 * A user may have multiple providers (e.g. 'local' + 'google').
 * This is the bridge table that decouples User Identity from Auth Methods.
 *
 * @property int    $id
 * @property int    $user_id
 * @property string $provider          e.g. 'local', 'google', 'apple'
 * @property string|null $provider_user_id  The provider's own user identifier (Google sub, etc.)
 * @property string|null $provider_email
 * @property string|null $provider_avatar
 * @property \Carbon\Carbon $linked_at
 * @property \Carbon\Carbon|null $last_used_at
 */
class UserAuthProvider extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'provider_user_id',
        'provider_email',
        'provider_avatar',
        'linked_at',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'linked_at'    => 'datetime',
            'last_used_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
