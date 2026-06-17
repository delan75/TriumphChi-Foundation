<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAllocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fund_id' => ['required', 'exists:funds,id'],
            'educational_need_id' => ['required', 'exists:educational_needs,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

