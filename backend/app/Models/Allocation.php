<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Allocation extends Model
{
    protected $fillable = [
        'fund_id',
        'educational_need_id',
        'amount',
        'reason',
        'created_by',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2'];
    }
}

