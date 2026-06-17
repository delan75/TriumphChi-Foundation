<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImpactUpdate extends Model
{
    protected $fillable = [
        'beneficiary_id',
        'title',
        'body',
        'visibility',
        'published_at',
    ];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }
}

