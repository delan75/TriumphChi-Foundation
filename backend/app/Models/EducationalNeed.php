<?php

namespace App\Models;

use App\Enums\NeedStatus;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class EducationalNeed extends Model
{
    use HasPublicUuid;

    protected $fillable = [
        'beneficiary_id',
        'type',
        'title',
        'description',
        'amount_required',
        'amount_funded',
        'status',
        'academic_year',
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

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function allocations()
    {
        return $this->hasMany(Allocation::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
