<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donor extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'type',
        'communication_preferences',
    ];

    protected function casts(): array
    {
        return ['communication_preferences' => 'array'];
    }
}

