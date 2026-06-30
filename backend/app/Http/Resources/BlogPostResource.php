<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->getPreferredLanguage(['en', 'fr']) ?: app()->getLocale();

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'reference' => $this->reference,
            'title' => $this->title,
            'current_title' => $this->localized($this->title, $locale),
            'slug' => $this->slug,
            'current_slug' => $this->localized($this->slug, $locale),
            'excerpt' => $this->excerpt,
            'current_excerpt' => $this->localized($this->excerpt, $locale),
            'body' => $this->body,
            'current_body' => $this->localized($this->body, $locale),
            'status' => $this->status,
            'status_label' => __('labels.blog_post_statuses.'.$this->status),
            'is_featured' => $this->is_featured,
            'featured_image_path' => $this->featured_image_path,
            'featured_image_alt' => $this->featured_image_alt,
            'current_featured_image_alt' => $this->localized($this->featured_image_alt, $locale),
            'seo_title' => $this->seo_title,
            'current_seo_title' => $this->localized($this->seo_title, $locale) ?: $this->localized($this->title, $locale),
            'seo_description' => $this->seo_description,
            'current_seo_description' => $this->localized($this->seo_description, $locale) ?: $this->localized($this->excerpt, $locale),
            'reading_minutes' => $this->reading_minutes,
            'published_at' => $this->published_at,
            'archived_at' => $this->archived_at,
            'category' => $this->whenLoaded('category', fn () => $this->category ? BlogCategoryResource::make($this->category) : null),
            'tags' => $this->whenLoaded('tags', fn () => BlogTagResource::collection($this->tags)->resolve()),
            'author' => $this->whenLoaded('author', fn () => $this->author ? [
                'id' => $this->author->id,
                'name' => $this->author->name,
                'email' => $request->user()?->can('blog_posts.view') ? $this->author->email : null,
            ] : null),
            'publisher' => $this->whenLoaded('publisher', fn () => $this->publisher ? [
                'id' => $this->publisher->id,
                'name' => $this->publisher->name,
            ] : null),
            'permissions' => [
                'can_view' => $request->user()?->can('blog_posts.view') ?? false,
                'can_create' => $request->user()?->can('blog_posts.create') ?? false,
                'can_update' => $request->user()?->can('blog_posts.update') ?? false,
                'can_publish' => $request->user()?->can('blog_posts.publish') ?? false,
                'can_delete' => $request->user()?->can('blog_posts.delete') ?? false,
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function localized(?array $value, string $locale): ?string
    {
        return $value[$locale] ?? $value['en'] ?? collect($value)->filter()->first();
    }
}
