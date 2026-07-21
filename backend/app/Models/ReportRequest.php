<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class ReportRequest extends Model
{
    use HasPublicUuid;

    protected $fillable = [
        'requested_by',
        'template_key',
        'title',
        'category',
        'format',
        'status',
        'progress',
        'filters',
        'fields',
        'metadata',
        'queued_at',
        'started_at',
        'completed_at',
        'failed_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'filters' => 'array',
            'fields' => 'array',
            'metadata' => 'array',
            'queued_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
