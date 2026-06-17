<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sponsorship extends Model
{
    protected $fillable = [
        'donor_id',
        'beneficiary_id',
        'type',
        'pledged_amount',
        'starts_at',
        'ends_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'pledged_amount' => 'decimal:2',
            'starts_at' => 'date',
            'ends_at' => 'date',
        ];
    }
}

