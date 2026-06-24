<?php

namespace App\Models;

use App\Models\Concerns\HasOpaqueReference;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DonationDocument extends Model
{
    use HasOpaqueReference;
    use HasPublicUuid;
    use SoftDeletes;

    protected $fillable = [
        'donation_id',
        'document_number',
        'type',
        'status',
        'locale',
        'title',
        'snapshot',
        'path',
        'issued_at',
        'voided_at',
    ];

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'issued_at' => 'datetime',
            'voided_at' => 'datetime',
        ];
    }

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function referenceColumn(): string
    {
        return 'document_number';
    }

    public function referencePrefix(): string
    {
        return strtoupper($this->type === 'invoice' ? 'INV' : 'REC');
    }

    public function referenceDateValue(): mixed
    {
        return $this->issued_at ?? $this->created_at;
    }
}
