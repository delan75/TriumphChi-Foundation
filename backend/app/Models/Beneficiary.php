<?php

namespace App\Models;

use App\Enums\BeneficiaryStatus;
use App\Models\Concerns\HasOpaqueReference;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Beneficiary extends Model
{
    use HasOpaqueReference;
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'internal_id',
        'application_id',
        'school_id',
        'region_id',
        'village_id',
        'status',
        'first_name',
        'last_name',
        'gender',
        'date_of_birth',
        'guardian_name',
        'guardian_phone',
        'education_level',
        'admission_date',
        'graduation_date',
        'funding_progress',
    ];

    protected function casts(): array
    {
        return [
            'status' => BeneficiaryStatus::class,
            'date_of_birth' => 'date',
            'admission_date' => 'date',
            'graduation_date' => 'date',
            'funding_progress' => 'decimal:2',
        ];
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function needs()
    {
        return $this->hasMany(EducationalNeed::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(BeneficiaryStatusHistory::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function sponsorships()
    {
        return $this->hasMany(Sponsorship::class);
    }

    public function impactUpdates()
    {
        return $this->hasMany(ImpactUpdate::class);
    }

    public function referenceColumn(): string
    {
        return 'internal_id';
    }

    public function referencePrefix(): string
    {
        return 'BEN';
    }

    public function referenceDateValue(): mixed
    {
        return $this->admission_date;
    }
}
