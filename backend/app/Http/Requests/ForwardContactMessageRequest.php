<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ForwardContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('contact_messages.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'to_email' => ['required', 'email:rfc', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
            'mark_as_replied' => ['sometimes', 'boolean'],
        ];
    }
}
