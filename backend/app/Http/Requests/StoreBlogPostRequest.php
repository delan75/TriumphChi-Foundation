<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        $permission = $this->isMethod('post') ? 'blog_posts.create' : 'blog_posts.update';

        return $this->user()?->can($permission) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'array'],
            'title.en' => ['required', 'string', 'max:180'],
            'title.fr' => ['nullable', 'string', 'max:180'],
            'slug' => ['nullable', 'array'],
            'slug.en' => ['nullable', 'string', 'max:180'],
            'slug.fr' => ['nullable', 'string', 'max:180'],
            'excerpt' => ['nullable', 'array'],
            'excerpt.en' => ['nullable', 'string', 'max:500'],
            'excerpt.fr' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'array'],
            'body.en' => ['required', 'string', 'max:50000'],
            'body.fr' => ['nullable', 'string', 'max:50000'],
            'blog_category_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
            'tag_ids' => ['sometimes', 'array', 'max:12'],
            'tag_ids.*' => ['integer', 'exists:blog_tags,id'],
            'status' => ['nullable', 'string', Rule::in(['draft', 'review', 'published', 'archived'])],
            'is_featured' => ['nullable', 'boolean'],
            'featured_image_path' => ['nullable', 'string', 'max:500'],
            'featured_image_alt' => ['nullable', 'array'],
            'featured_image_alt.en' => ['nullable', 'string', 'max:180'],
            'featured_image_alt.fr' => ['nullable', 'string', 'max:180'],
            'seo_title' => ['nullable', 'array'],
            'seo_title.en' => ['nullable', 'string', 'max:180'],
            'seo_title.fr' => ['nullable', 'string', 'max:180'],
            'seo_description' => ['nullable', 'array'],
            'seo_description.en' => ['nullable', 'string', 'max:220'],
            'seo_description.fr' => ['nullable', 'string', 'max:220'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
