<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BeneficiaryStatusHistory extends Model
{
    protected $table = 'beneficiary_status_history';

    protected $fillable = [
        'beneficiary_id',
        'from_status',
        'to_status',
        'changed_by',
        'changed_at',
        'reason',
        'notes',
        'ip_address',
    ];

    protected function casts(): array
    {
        return ['changed_at' => 'datetime'];
    }

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
