<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationEducationDetail extends Model
{
    protected $fillable = [
        'application_id',
        'is_currently_enrolled',
        'school_name',
        'grade_level',
        'distance_to_school',
        'interruption_reasons',
    ];

    protected function casts(): array
    {
        return [
            'is_currently_enrolled' => 'boolean',
        ];
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
