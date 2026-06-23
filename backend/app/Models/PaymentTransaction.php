<?php

namespace App\Models;

use App\Models\Concerns\HasOpaqueReference;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentTransaction extends Model
{
    use HasOpaqueReference;
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'payment_intent_id',
        'donation_id',
        'payment_provider_id',
        'transaction_reference',
        'provider_transaction_id',
        'type',
        'status',
        'amount',
        'currency',
        'processed_at',
        'raw_payload',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'processed_at' => 'datetime',
            'raw_payload' => 'array',
        ];
    }

    public function intent()
    {
        return $this->belongsTo(PaymentIntent::class, 'payment_intent_id');
    }

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function provider()
    {
        return $this->belongsTo(PaymentProvider::class, 'payment_provider_id');
    }

    public function referenceColumn(): string
    {
        return 'transaction_reference';
    }

    public function referencePrefix(): string
    {
        return 'PTXN';
    }

    public function referenceDateValue(): mixed
    {
        return $this->processed_at ?? $this->created_at;
    }
}
