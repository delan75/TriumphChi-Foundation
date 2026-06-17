<?php

namespace App\Models;

use App\Enums\NeedStatus;
use Illuminate\Database\Eloquent\Model;

class EducationalNeed extends Model
{
    protected $fillable = [
        'beneficiary_id',
        'title',
        'description',
        'amount_required',
        'amount_funded',
        'status',
        'funding_starts_at',
        'funding_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_required' => 'decimal:2',
            'amount_funded' => 'decimal:2',
            'status' => NeedStatus::class,
            'funding_starts_at' => 'date',
            'funding_ends_at' => 'date',
        ];
    }
}

