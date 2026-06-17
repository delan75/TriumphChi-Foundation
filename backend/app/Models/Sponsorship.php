<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sponsorship extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sponsorship_reference',
        'donor_id',
        'beneficiary_id',
        'fund_id',
        'type',
        'pledged_amount',
        'currency',
        'billing_frequency',
        'starts_at',
        'ends_at',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'pledged_amount' => 'decimal:2',
            'starts_at' => 'date',
            'ends_at' => 'date',
        ];
    }

    public function donor()
    {
        return $this->belongsTo(Donor::class);
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function fund()
    {
        return $this->belongsTo(Fund::class);
    }
}
