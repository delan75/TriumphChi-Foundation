<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class School extends Model
{
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'region_id',
        'village_id',
        'address',
        'principal_name',
        'phone',
        'email',
        'verification_status',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function village()
    {
        return $this->belongsTo(Village::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
