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
            'internal_id' => ['nullable', 'string', 'max:80', Rule::unique('beneficiaries', 'internal_id')->ignore($this->route('beneficiary'))],
            'application_id' => ['nullable', 'exists:applications,id', Rule::unique('beneficiaries', 'application_id')->ignore($this->route('beneficiary'))],
            'school_id' => ['nullable', 'exists:schools,id'],
            'region_id' => ['nullable', 'exists:regions,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
            'status' => ['required', Rule::enum(BeneficiaryStatus::class)],
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'gender' => ['nullable', 'string', 'max:40'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:40'],
            'education_level' => ['nullable', 'string', 'max:120'],
            'admission_date' => ['nullable', 'date'],
            'graduation_date' => ['nullable', 'date', 'after_or_equal:admission_date'],
            'funding_progress' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
