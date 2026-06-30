<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListBlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('blog_posts.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', Rule::in(['draft', 'review', 'published', 'archived'])],
            'category' => ['nullable', 'string', 'max:80'],
            'tag' => ['nullable', 'string', 'max:80'],
            'search' => ['nullable', 'string', 'min:2', 'max:120'],
            'featured' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:50'],
            'sort' => ['nullable', 'string', Rule::in(['created_at', 'updated_at', 'published_at', 'title'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ];
    }
}
