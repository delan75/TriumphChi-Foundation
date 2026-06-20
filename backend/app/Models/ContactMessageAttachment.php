<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactMessageAttachment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'original_name',
        'stored_name',
        'path',
        'disk',
        'mime_type',
        'size_bytes',
        'scan_status',
    ];

    public function contactMessage()
    {
        return $this->belongsTo(ContactMessage::class);
    }
}
