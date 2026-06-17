<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_reference' => ['required', 'string', 'max:120'],
            'school_id' => ['required', 'exists:schools,id'],
            'beneficiary_id' => ['nullable', 'exists:beneficiaries,id'],
            'educational_need_id' => ['nullable', 'exists:educational_needs,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'proof_path' => ['nullable', 'string', 'max:500'],
            'status' => ['required', Rule::in(['draft', 'pending', 'paid', 'confirmed', 'void'])],
            'notes' => ['nullable', 'string'],
        ];
    }
}

