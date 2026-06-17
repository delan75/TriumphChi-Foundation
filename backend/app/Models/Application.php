<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'source',
        'status',
        'applicant_name',
        'date_of_birth',
        'guardian_name',
        'guardian_phone',
        'region',
        'village',
        'school_id',
        'needs_assessment',
        'verification_notes',
        'submitted_at',
        'verified_at',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ApplicationStatus::class,
            'date_of_birth' => 'date',
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}

