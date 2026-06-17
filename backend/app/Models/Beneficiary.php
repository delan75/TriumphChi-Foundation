<?php

namespace App\Models;

use App\Enums\BeneficiaryStatus;
use Illuminate\Database\Eloquent\Model;

class Beneficiary extends Model
{
    protected $fillable = [
        'internal_id',
        'application_id',
        'school_id',
        'status',
        'first_name',
        'last_name',
        'date_of_birth',
        'guardian_name',
        'guardian_phone',
        'region',
        'village',
        'education_level',
        'funding_progress',
    ];

    protected function casts(): array
    {
        return [
            'status' => BeneficiaryStatus::class,
            'date_of_birth' => 'date',
            'funding_progress' => 'decimal:2',
        ];
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function needs()
    {
        return $this->hasMany(EducationalNeed::class);
    }
}

