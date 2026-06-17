<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAllocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'allocation_reference' => ['required', 'string', 'max:120'],
            'donation_id' => ['nullable', 'exists:donations,id'],
            'fund_id' => ['required', 'exists:funds,id'],
            'educational_need_id' => ['required', 'exists:educational_needs,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['required', 'string', 'size:3'],
            'status' => ['required', Rule::in(['proposed', 'approved', 'cancelled'])],
            'allocated_at' => ['nullable', 'date'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'created_by' => ['required', 'exists:users,id'],
            'approved_by' => ['nullable', 'exists:users,id'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
