<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('blog_categories.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'array'],
            'name.en' => ['required', 'string', 'max:120'],
            'name.fr' => ['nullable', 'string', 'max:120'],
            'slug' => ['nullable', 'array'],
            'slug.en' => ['nullable', 'string', 'max:140'],
            'slug.fr' => ['nullable', 'string', 'max:140'],
            'description' => ['nullable', 'array'],
            'description.en' => ['nullable', 'string', 'max:500'],
            'description.fr' => ['nullable', 'string', 'max:500'],
            'color' => ['nullable', 'string', 'max:40'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
