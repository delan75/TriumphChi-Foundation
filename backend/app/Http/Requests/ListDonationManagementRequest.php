<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListDonationManagementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('donations.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', Rule::in(['pending', 'confirmed', 'failed', 'cancelled', 'refunded'])],
            'provider' => ['nullable', 'string', 'max:80'],
            'source' => ['nullable', 'string', 'max:80'],
            'method' => ['nullable', 'string', 'max:80'],
            'currency' => ['nullable', 'string', 'size:3'],
            'country' => ['nullable', 'string', 'size:2'],
            'region_id' => ['nullable', 'integer', 'exists:regions,id'],
            'fund_id' => ['nullable', 'integer', 'exists:funds,id'],
            'donor_id' => ['nullable', 'integer', 'exists:donors,id'],
            'donated_from' => ['nullable', 'date'],
            'donated_to' => ['nullable', 'date', 'after_or_equal:donated_from'],
            'sort' => ['nullable', 'string', Rule::in(['created_at', 'donated_at', 'confirmed_at', 'amount', 'status'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }
}
