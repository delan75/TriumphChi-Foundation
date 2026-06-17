<?php

namespace App\Http\Requests;

use App\Enums\DonationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reference_number' => ['required', 'string', 'max:120'],
            'idempotency_key' => ['nullable', 'string', 'max:180'],
            'donor_id' => ['nullable', 'exists:donors,id'],
            'fund_id' => ['required', 'exists:funds,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['required', 'string', 'size:3'],
            'method' => ['required', Rule::in(['mtn_mobile_money', 'orange_money', 'bank_transfer', 'cash', 'stripe', 'paypal'])],
            'provider' => ['nullable', 'string', 'max:120'],
            'provider_reference' => ['nullable', 'string', 'max:180'],
            'status' => ['required', Rule::enum(DonationStatus::class)],
            'donated_at' => ['required', 'date'],
            'confirmed_at' => ['nullable', 'date'],
            'receipt_path' => ['nullable', 'string', 'max:500'],
            'metadata' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
