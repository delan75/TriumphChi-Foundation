<?php

namespace App\Models;

use App\Models\Concerns\HasOpaqueReference;
use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlogPost extends Model
{
    use HasOpaqueReference;
    use HasPublicUuid;
    use SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_REVIEW = 'review';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'reference',
        'author_id',
        'published_by',
        'blog_category_id',
        'title',
        'slug',
        'excerpt',
        'body',
        'status',
        'is_featured',
        'featured_image_path',
        'featured_image_alt',
        'seo_title',
        'seo_description',
        'reading_minutes',
        'published_at',
        'archived_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'slug' => 'array',
            'excerpt' => 'array',
            'body' => 'array',
            'is_featured' => 'boolean',
            'featured_image_alt' => 'array',
            'seo_title' => 'array',
            'seo_description' => 'array',
            'metadata' => 'array',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function publisher()
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    public function tags()
    {
        return $this->belongsToMany(BlogTag::class)->withTimestamps();
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', self::STATUS_PUBLISHED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function referenceColumn(): string
    {
        return 'reference';
    }

    public function referencePrefix(): string
    {
        return 'BLOG';
    }

    public function referenceDateValue(): mixed
    {
        return $this->published_at;
    }
}
