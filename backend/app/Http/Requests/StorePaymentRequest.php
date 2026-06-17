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
            'idempotency_key' => ['nullable', 'string', 'max:180'],
            'fund_id' => ['nullable', 'exists:funds,id'],
            'school_id' => ['nullable', 'exists:schools,id'],
            'beneficiary_id' => ['nullable', 'exists:beneficiaries,id'],
            'educational_need_id' => ['nullable', 'exists:educational_needs,id'],
            'payee_type' => ['required', Rule::in(['school', 'vendor', 'guardian'])],
            'payee_name' => ['nullable', 'string', 'max:255'],
            'vendor_reference' => ['nullable', 'string', 'max:180'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['required', 'string', 'size:3'],
            'method' => ['nullable', Rule::in(['mtn_mobile_money', 'orange_money', 'bank_transfer', 'cash', 'stripe', 'paypal'])],
            'payment_date' => ['required', 'date'],
            'approved_by' => ['prohibited'],
            'disbursed_by' => ['prohibited'],
            'proof_path' => ['nullable', 'string', 'max:500'],
            'status' => ['required', Rule::in(['draft', 'pending', 'approved', 'paid', 'confirmed', 'void'])],
            'metadata' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
            'allocations' => ['nullable', 'array'],
            'allocations.*.allocation_id' => ['required_with:allocations', 'distinct', 'exists:allocations,id'],
            'allocations.*.amount_applied' => ['required_with:allocations', 'numeric', 'min:0.01'],
        ];
    }
}
