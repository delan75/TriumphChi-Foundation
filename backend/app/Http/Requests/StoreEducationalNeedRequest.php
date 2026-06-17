<?php

namespace App\Http\Requests;

use App\Enums\NeedStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEducationalNeedRequest extends FormRequest
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
            'description' => ['nullable', 'string'],
            'amount_required' => ['required', 'numeric', 'min:0.01'],
            'amount_funded' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::enum(NeedStatus::class)],
            'funding_starts_at' => ['nullable', 'date'],
            'funding_ends_at' => ['nullable', 'date', 'after_or_equal:funding_starts_at'],
        ];
    }
}

