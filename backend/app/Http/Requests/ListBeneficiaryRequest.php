<?php

namespace App\Http\Requests;

use App\Enums\BeneficiaryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListBeneficiaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('beneficiaries.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', Rule::enum(BeneficiaryStatus::class)],
            'search' => ['nullable', 'string', 'min:2', 'max:120'],
            'school_id' => ['nullable', 'integer', 'exists:schools,id'],
            'region_id' => ['nullable', 'integer', 'exists:regions,id'],
            'gender' => ['nullable', 'string', 'max:40'],
            'sponsor_status' => ['nullable', 'string', Rule::in(['sponsored', 'unsponsored'])],
            'funding_status' => ['nullable', 'string', Rule::in(['funded', 'funding_gap'])],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'education_level' => ['nullable', 'string', 'max:120'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:50'],
            'sort' => ['nullable', 'string', Rule::in(['created_at', 'updated_at', 'admission_date', 'last_name'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ];
    }
}
