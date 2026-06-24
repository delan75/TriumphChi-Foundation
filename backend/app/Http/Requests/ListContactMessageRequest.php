<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('contact_messages.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', Rule::in(['new', 'reviewing', 'replied', 'archived', 'spam'])],
            'reason' => ['nullable', 'string', 'max:40'],
            'search' => ['nullable', 'string', 'min:2', 'max:120'],
            'has_attachments' => ['nullable', 'boolean'],
            'created_from' => ['nullable', 'date'],
            'created_to' => ['nullable', 'date'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:50'],
            'sort' => ['nullable', 'string', Rule::in(['created_at', 'updated_at', 'responded_at'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ];
    }
}
