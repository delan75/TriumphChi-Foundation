<?php

namespace App\Models;

use App\Models\Concerns\HasOpaqueReference;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentIntent extends Model
{
    use HasOpaqueReference;
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'intent_reference',
        'donation_id',
        'payment_provider_id',
        'amount',
        'currency',
        'frequency',
        'purpose',
        'status',
        'provider_intent_id',
        'checkout_url',
        'expires_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expires_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function provider()
    {
        return $this->belongsTo(PaymentProvider::class, 'payment_provider_id');
    }

    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function referenceColumn(): string
    {
        return 'intent_reference';
    }

    public function referencePrefix(): string
    {
        return 'PINT';
    }

    public function referenceDateValue(): mixed
    {
        return $this->created_at;
    }
}
