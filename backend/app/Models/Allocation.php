<?php

namespace App\Models;

use App\Models\Concerns\HasOpaqueReference;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Allocation extends Model
{
    use HasOpaqueReference;
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'allocation_reference',
        'donation_id',
        'fund_id',
        'educational_need_id',
        'amount',
        'currency',
        'status',
        'allocated_at',
        'reason',
        'created_by',
        'approved_by',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'allocated_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function fund()
    {
        return $this->belongsTo(Fund::class);
    }

    public function educationalNeed()
    {
        return $this->belongsTo(EducationalNeed::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payments()
    {
        return $this->belongsToMany(Payment::class)
            ->withPivot('amount_applied')
            ->withTimestamps();
    }

    public function referenceColumn(): string
    {
        return 'allocation_reference';
    }

    public function referencePrefix(): string
    {
        return 'ALL';
    }

    public function referenceDateValue(): mixed
    {
        return $this->allocated_at;
    }
}
