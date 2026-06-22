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
            'need_type' => ['required', 'string', 'in:fees,books,uniform,exam,transport,meals,other'],
            'need_summary' => ['required', 'string', 'max:1000'],
            'situation_summary' => ['required', 'string', 'max:2000'],
            'household_income_range' => ['nullable', 'string', 'max:255'],
            'household_size' => ['nullable', 'integer', 'min:1'],
            'primary_caregiver_occupation' => ['nullable', 'string', 'max:255'],
            'household_challenges' => ['nullable', 'array'],
            'household_challenges.*' => ['string'],
            'contact_role' => ['required', 'string', 'in:parent,guardian,school,community_leader,child,other'],
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
