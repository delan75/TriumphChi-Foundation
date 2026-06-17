<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => [
                'nullable',
                'string',
                'max:80',
                Rule::unique('funds', 'code')->ignore($this->route('fund')),
            ],
            'name' => ['required', 'string', 'max:160'],
            'slug' => [
                'required',
                'string',
                'max:180',
                Rule::unique('funds', 'slug')->ignore($this->route('fund')),
            ],
            'description' => ['nullable', 'string'],
            'currency' => ['required', 'string', 'size:3'],
            'restriction_type' => ['required', 'string', 'max:80'],
            'restricted_to_type' => ['nullable', 'string', 'max:120'],
            'restricted_to_id' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', Rule::in(['active', 'paused', 'closed'])],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'created_by' => ['nullable', 'exists:users,id'],
        ];
    }
}
