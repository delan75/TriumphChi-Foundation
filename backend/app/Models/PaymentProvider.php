<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class PaymentProvider extends Model
{
    use HasPublicUuid;

    protected $fillable = [
        'key',
        'name',
        'method',
        'category',
        'status',
        'currencies',
        'config',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'currencies' => 'array',
            'config' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function intents()
    {
        return $this->hasMany(PaymentIntent::class);
    }

    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
