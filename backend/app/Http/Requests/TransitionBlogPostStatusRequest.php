<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransitionBlogPostStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('blog_posts.publish') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(['draft', 'review', 'published', 'archived'])],
        ];
    }
}
