<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use App\Models\Concerns\HasOpaqueReference;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    use HasOpaqueReference;
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'application_number',
        'source',
        'status',
        'applicant_name',
        'gender',
        'date_of_birth',
        'guardian_name',
        'guardian_phone',
        'region_id',
        'village_id',
        'school_id',
        'submitted_by',
        'needs_assessment',
        'intake_payload',
        'verification_notes',
        'public_comment',
        'submitted_at',
        'verified_at',
        'reviewed_at',
        'draft_token',
        'current_step',
        'household_income_range',
        'household_size',
        'primary_caregiver_occupation',
        'household_challenges',
    ];

    protected function casts(): array
    {
        return [
            'status' => ApplicationStatus::class,
            'date_of_birth' => 'date',
            'intake_payload' => 'array',
            'household_challenges' => 'array',
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
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

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function beneficiary()
    {
        return $this->hasOne(Beneficiary::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(ApplicationStatusHistory::class)->orderByDesc('changed_at');
    }

    public function notes()
    {
        return $this->hasMany(ApplicationNote::class)->orderByDesc('created_at');
    }

    public function steps()
    {
        return $this->hasMany(ApplicationStep::class);
    }

    public function documents()
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function verificationContacts()
    {
        return $this->hasMany(ApplicationVerificationContact::class);
    }

    public function educationDetails()
    {
        return $this->hasOne(ApplicationEducationDetail::class);
    }

    public function needAssessments()
    {
        return $this->hasMany(ApplicationNeedAssessment::class);
    }

    public function referenceColumn(): string
    {
        return 'application_number';
    }

    public function referencePrefix(): string
    {
        return 'APP';
    }

    public function referenceDateValue(): mixed
    {
        return $this->submitted_at;
    }
}
