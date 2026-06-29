<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'department',
        'position',
        'employment_type',
        'office_location',
        'joined_foundation_at',
        'bio',
        'skills',
        'languages',
        'certifications',
        'emergency_contact_name',
        'emergency_contact_phone',
    ];

    protected function casts(): array
    {
        return [
            'joined_foundation_at' => 'date',
            'skills' => 'array',
            'languages' => 'array',
            'certifications' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
