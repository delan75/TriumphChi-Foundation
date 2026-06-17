<?php

namespace App\Http\Requests;

use App\Enums\BeneficiaryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBeneficiaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'internal_id' => ['required', 'string', 'max:80'],
            'application_id' => ['nullable', 'exists:applications,id'],
            'school_id' => ['nullable', 'exists:schools,id'],
            'status' => ['required', Rule::enum(BeneficiaryStatus::class)],
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:40'],
            'region' => ['nullable', 'string', 'max:120'],
            'village' => ['nullable', 'string', 'max:120'],
            'education_level' => ['nullable', 'string', 'max:120'],
            'funding_progress' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}

