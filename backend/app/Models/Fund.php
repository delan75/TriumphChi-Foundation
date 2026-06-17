<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fund extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'slug',
        'description',
        'currency',
        'restriction_type',
        'restricted_to_type',
        'restricted_to_id',
        'status',
        'starts_at',
        'ends_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'date',
            'ends_at' => 'date',
        ];
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function allocations()
    {
        return $this->hasMany(Allocation::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function sponsorships()
    {
        return $this->hasMany(Sponsorship::class);
    }
}
