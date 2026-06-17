<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSponsorshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'donor_id' => ['required', 'exists:donors,id'],
            'beneficiary_id' => ['required', 'exists:beneficiaries,id'],
            'type' => ['required', Rule::in(['partial', 'full', 'program'])],
            'pledged_amount' => ['required', 'numeric', 'min:0.01'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'status' => ['required', Rule::in(['draft', 'active', 'paused', 'completed', 'cancelled'])],
        ];
    }
}

