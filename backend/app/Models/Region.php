<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $fillable = ['name', 'code', 'status'];

    public function villages()
    {
        return $this->hasMany(Village::class);
    }

    public function schools()
    {
        return $this->hasMany(School::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function beneficiaries()
    {
        return $this->hasMany(Beneficiary::class);
    }
}
