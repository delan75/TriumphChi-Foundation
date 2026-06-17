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
            'source' => ['required', Rule::in(['online', 'school', 'field_officer', 'ngo_staff'])],
            'status' => ['sometimes', Rule::enum(ApplicationStatus::class)],
            'applicant_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:40'],
            'region' => ['nullable', 'string', 'max:120'],
            'village' => ['nullable', 'string', 'max:120'],
            'school_id' => ['nullable', 'exists:schools,id'],
            'needs_assessment' => ['nullable', 'string'],
            'verification_notes' => ['nullable', 'string'],
            'submitted_at' => ['nullable', 'date'],
            'verified_at' => ['nullable', 'date'],
            'reviewed_at' => ['nullable', 'date'],
        ];
    }
}

