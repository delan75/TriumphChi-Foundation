<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationNeedAssessment extends Model
{
    protected $fillable = [
        'application_id',
        'need_type',
        'urgency',
        'description',
        'estimated_cost',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
