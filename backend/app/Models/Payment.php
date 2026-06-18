<?php

namespace App\Models;

use App\Models\Concerns\HasOpaqueReference;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasOpaqueReference;
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'payment_reference',
        'idempotency_key',
        'fund_id',
        'school_id',
        'beneficiary_id',
        'educational_need_id',
        'payee_type',
        'payee_name',
        'vendor_reference',
        'amount',
        'currency',
        'method',
        'payment_date',
        'approved_by',
        'disbursed_by',
        'proof_path',
        'status',
        'metadata',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'date',
            'metadata' => 'array',
        ];
    }

    public function fund()
    {
        return $this->belongsTo(Fund::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function educationalNeed()
    {
        return $this->belongsTo(EducationalNeed::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function disburser()
    {
        return $this->belongsTo(User::class, 'disbursed_by');
    }

    public function allocations()
    {
        return $this->belongsToMany(Allocation::class)
            ->withPivot('amount_applied')
            ->withTimestamps();
    }

    public function referenceColumn(): string
    {
        return 'payment_reference';
    }

    public function referencePrefix(): string
    {
        return 'PAY';
    }

    public function referenceDateValue(): mixed
    {
        return $this->payment_date;
    }
}
