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
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'school_name' => ['nullable', 'string', 'max:255'],
            'grade_level' => ['nullable', 'string', 'max:120'],
            'region_name' => ['nullable', 'string', 'max:255'],
            'village_name' => ['nullable', 'string', 'max:255'],
            'need_type' => ['required', Rule::in(['fees', 'books', 'uniform', 'exam', 'transport', 'meals', 'other'])],
            'need_summary' => ['required', 'string', 'min:30', 'max:5000'],
            'situation_summary' => ['required', 'string', 'min:60', 'max:7000'],
            'contact_role' => ['required', Rule::in(['parent', 'guardian', 'school', 'community_leader', 'child', 'other'])],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:40'],
            'contact_email' => ['nullable', 'email:rfc,dns', 'max:255'],
            'preferred_contact_method' => ['required', Rule::in(['phone', 'sms', 'whatsapp', 'email'])],
            'consent' => ['accepted'],
        ];
    }
}
