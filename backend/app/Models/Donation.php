<?php

namespace App\Models;

use App\Enums\DonationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Donation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'reference_number',
        'idempotency_key',
        'donor_id',
        'fund_id',
        'amount',
        'currency',
        'method',
        'provider',
        'provider_reference',
        'status',
        'donated_at',
        'confirmed_at',
        'receipt_path',
        'metadata',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => DonationStatus::class,
            'donated_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function donor()
    {
        return $this->belongsTo(Donor::class);
    }

    public function fund()
    {
        return $this->belongsTo(Fund::class);
    }

    public function allocations()
    {
        return $this->hasMany(Allocation::class);
    }
}
