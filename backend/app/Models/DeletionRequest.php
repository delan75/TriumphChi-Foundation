<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeletionRequest extends Model
{
    protected $fillable = [
        'entity_type',
        'entity_id',
        'classification',
        'requested_by',
        'approved_by',
        'status',
        'reason',
        'approved_at',
        'executed_at',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'executed_at' => 'datetime',
        ];
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
