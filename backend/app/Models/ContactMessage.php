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
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
        ];
    }

    public function attachments()
    {
        return $this->hasMany(ContactMessageAttachment::class);
    }
}
