<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class ImpactUpdate extends Model
{
    use HasPublicUuid;

    protected $fillable = [
        'beneficiary_id',
        'title',
        'body',
        'visibility',
        'published_at',
    ];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }
}
