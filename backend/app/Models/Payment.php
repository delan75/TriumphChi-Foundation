<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'payment_reference',
        'school_id',
        'beneficiary_id',
        'educational_need_id',
        'amount',
        'payment_date',
        'proof_path',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }
}

