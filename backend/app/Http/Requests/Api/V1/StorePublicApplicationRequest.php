<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'applying_for' => ['nullable', 'string', 'in:self,child,other'],
            'child_name' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'in:male,female,other,prefer-not-to-say'],
            'date_of_birth' => ['nullable', 'date'],
            'is_enrolled' => ['nullable', 'boolean'],
            'school_name' => ['nullable', 'string', 'max:255'],
            'grade_level' => ['nullable', 'string', 'max:255'],
            'distance_to_school' => ['nullable', 'string', 'max:255'],
            'interruption_reasons' => ['nullable', 'string', 'max:1000'],
            'region_name' => ['nullable', 'string', 'max:255'],
            'village_name' => ['nullable', 'string', 'max:255'],
            'school_enrollment_status' => ['nullable', 'string', 'in:enrolled,not_enrolled,unsure'],
            'last_school_attended' => ['nullable', 'string', 'max:255'],
            'education_interruption_reason' => ['nullable', 'string', 'max:1000'],
            'teacher_school_name' => ['nullable', 'string', 'max:255'],
            'teacher_position' => ['nullable', 'string', 'max:255'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'institution_role' => ['nullable', 'string', 'max:255'],
            'fee_amount' => ['nullable', 'string', 'max:100'],
            'fee_due_date' => ['nullable', 'date'],
            'exam_name' => ['nullable', 'string', 'max:255'],
            'exam_date' => ['nullable', 'date'],
            'exam_fee_amount' => ['nullable', 'string', 'max:100'],
            'need_type' => ['required', 'string', 'in:fees,books,uniform,exam,transport,meals,other'],
            'need_summary' => ['required', 'string', 'max:5000'],
            'situation_summary' => ['required', 'string', 'max:7000'],
            'household_income_range' => ['nullable', 'string', 'max:255'],
            'household_size' => ['nullable', 'integer', 'min:1'],
            'primary_caregiver_occupation' => ['nullable', 'string', 'max:255'],
            'household_challenges' => ['nullable', 'array'],
            'household_challenges.*' => ['string'],
            'contact_role' => ['required', 'string', 'in:parent,guardian,school,school_representative,teacher,community_leader,child,other'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:20'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'preferred_contact_method' => ['required', 'string', 'in:phone,sms,whatsapp,email'],
            'documents' => ['nullable', 'array'],
            'documents.*.type' => ['string'],
            'documents.*.id' => ['integer'],
            'consent' => ['required', 'boolean', 'accepted'],
        ];
    }
}
