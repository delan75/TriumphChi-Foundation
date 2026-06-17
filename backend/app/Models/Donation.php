<?php

namespace App\Models;

use App\Enums\DonationStatus;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'reference_number',
        'donor_id',
        'fund_id',
        'amount',
        'currency',
        'method',
        'status',
        'donated_at',
        'receipt_path',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => DonationStatus::class,
            'donated_at' => 'datetime',
        ];
    }
}

