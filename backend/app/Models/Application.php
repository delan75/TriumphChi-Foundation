<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
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
        return $this->hasMany(ApplicationStatusHistory::class);
    }
}
