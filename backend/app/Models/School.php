<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $fillable = [
        'name',
        'region',
        'village',
        'address',
        'principal_name',
        'phone',
        'email',
        'verification_status',
    ];

    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class);
    }
}

