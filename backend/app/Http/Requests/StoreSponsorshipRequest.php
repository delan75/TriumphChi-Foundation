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
            'sponsorship_reference' => [
                'nullable',
                'string',
                'max:120',
                Rule::unique('sponsorships', 'sponsorship_reference')->ignore($this->route('sponsorship')),
            ],
            'donor_id' => ['required', 'exists:donors,id'],
            'beneficiary_id' => ['required', 'exists:beneficiaries,id'],
            'fund_id' => ['nullable', 'exists:funds,id'],
            'type' => ['required', Rule::in(['full', 'partial', 'recurring', 'one_time', 'program'])],
            'pledged_amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['required', 'string', 'size:3'],
            'billing_frequency' => ['nullable', Rule::in(['one_time', 'monthly', 'quarterly', 'annual'])],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'status' => ['required', Rule::in(['draft', 'active', 'paused', 'completed', 'cancelled'])],
            'notes' => ['nullable', 'string'],
        ];
    }
}
