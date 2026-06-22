<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationVerificationContact extends Model
{
    protected $fillable = [
        'application_id',
        'name',
        'role',
        'phone',
        'email',
        'organization',
        'notes',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
