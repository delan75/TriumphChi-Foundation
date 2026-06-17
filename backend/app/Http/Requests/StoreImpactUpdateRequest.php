<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreImpactUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'beneficiary_id' => ['required', 'exists:beneficiaries,id'],
            'title' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string'],
            'visibility' => ['required', Rule::in(['private', 'sponsors', 'public_curated'])],
            'published_at' => ['nullable', 'date'],
        ];
    }
}

