<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactMessage extends Model
{
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'reason',
        'subject',
        'message',
        'locale',
        'status',
        'ip_address',
        'user_agent',
        'staff_notes',
        'handled_by',
        'responded_at',
        'reviewed_at',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function attachments()
    {
        return $this->hasMany(ContactMessageAttachment::class);
    }

    public function handler()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}
