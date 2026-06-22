<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePublicApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'child_name' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:40'],
            'date_of_birth' => ['nullable', 'date', 'after:1900-01-01', 'before:today'],
            'school_name' => ['nullable', 'string', 'max:255'],
            'grade_level' => ['nullable', 'string', 'max:120'],
            'region_name' => ['nullable', 'string', 'max:255'],
            'village_name' => ['nullable', 'string', 'max:255'],
            'school_enrollment_status' => ['nullable', Rule::in(['enrolled', 'not_enrolled', 'unsure'])],
            'last_school_attended' => ['nullable', 'string', 'max:255'],
            'education_interruption_reason' => ['nullable', 'string', 'max:1500'],
            'teacher_school_name' => ['nullable', 'string', 'max:255'],
            'teacher_position' => ['nullable', 'string', 'max:255'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'institution_role' => ['nullable', 'string', 'max:255'],
            'fee_amount' => ['nullable', 'string', 'max:120'],
            'fee_due_date' => ['nullable', 'date'],
            'exam_name' => ['nullable', 'string', 'max:255'],
            'exam_date' => ['nullable', 'date'],
            'exam_fee_amount' => ['nullable', 'string', 'max:120'],
            'need_type' => ['required', Rule::in(['fees', 'books', 'uniform', 'exam', 'transport', 'meals', 'other'])],
            'need_summary' => ['required', 'string', 'min:30', 'max:5000'],
            'situation_summary' => ['required', 'string', 'min:60', 'max:7000'],
            'contact_role' => ['required', Rule::in(['parent', 'guardian', 'school', 'school_representative', 'teacher', 'community_leader', 'child', 'other'])],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:40'],
            'contact_email' => ['nullable', 'email:rfc,dns', 'max:255'],
            'preferred_contact_method' => ['required', Rule::in(['phone', 'sms', 'whatsapp', 'email'])],
            'consent' => ['accepted'],
        ];
    }
}
