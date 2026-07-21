<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('blog_tags.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'array'],
            'name.en' => ['required', 'string', 'max:80'],
            'name.fr' => ['nullable', 'string', 'max:80'],
            'slug' => ['nullable', 'array'],
            'slug.en' => ['nullable', 'string', 'max:100'],
            'slug.fr' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'array'],
            'description.en' => ['nullable', 'string', 'max:300'],
            'description.fr' => ['nullable', 'string', 'max:300'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
