<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Donor extends Model
{
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'type',
        'status',
        'preferred_locale',
        'communication_preferences',
    ];

    protected function casts(): array
    {
        return ['communication_preferences' => 'array'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function sponsorships()
    {
        return $this->hasMany(Sponsorship::class);
    }
}
