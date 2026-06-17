<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDonorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'type' => ['required', Rule::in(['individual', 'organization', 'corporate', 'anonymous'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'blocked'])],
            'preferred_locale' => ['nullable', Rule::in(['en', 'fr'])],
            'communication_preferences' => ['nullable', 'array'],
        ];
    }
}
