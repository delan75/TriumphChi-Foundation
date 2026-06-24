<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('contact_messages.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(['new', 'reviewing', 'replied', 'archived', 'spam'])],
            'staff_notes' => ['nullable', 'string', 'max:3000'],
        ];
    }
}
