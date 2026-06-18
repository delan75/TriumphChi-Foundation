<?php

namespace App\Http\Requests;

use App\Enums\ApplicationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'application_number' => ['nullable', 'string', 'max:80', Rule::unique('applications', 'application_number')->ignore($this->route('application'))],
            'source' => ['required', Rule::in(['online', 'school', 'field_officer', 'ngo_staff'])],
            'status' => ['sometimes', Rule::enum(ApplicationStatus::class)],
            'applicant_name' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:40'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:40'],
            'region_id' => ['nullable', 'exists:regions,id'],
            'village_id' => ['nullable', 'exists:villages,id'],
            'school_id' => ['nullable', 'exists:schools,id'],
            'submitted_by' => ['nullable', 'exists:users,id'],
            'needs_assessment' => ['nullable', 'string'],
            'verification_notes' => ['nullable', 'string'],
            'submitted_at' => ['nullable', 'date'],
            'verified_at' => ['nullable', 'date'],
            'reviewed_at' => ['nullable', 'date'],
        ];
    }
}
