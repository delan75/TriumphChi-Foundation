<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class BlogCategory extends Model
{
    use HasPublicUuid;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'slug' => 'array',
            'description' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function posts()
    {
        return $this->hasMany(BlogPost::class);
    }
}
