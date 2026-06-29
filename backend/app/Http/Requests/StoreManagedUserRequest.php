<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreManagedUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('users.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255', Rule::unique('users', 'email')],
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('users', 'phone')->whereNotNull('phone')],
            'employee_number' => ['nullable', 'string', 'max:40', Rule::unique('users', 'employee_number')->whereNotNull('employee_number')],
            'preferred_locale' => ['nullable', Rule::in(['en', 'fr'])],
            'status' => ['nullable', Rule::in([
                User::STATUS_INVITED,
                User::STATUS_PENDING,
                User::STATUS_ACTIVE,
                User::STATUS_SUSPENDED,
                User::STATUS_LOCKED,
                User::STATUS_ARCHIVED,
            ])],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', Rule::exists('roles', 'name')],
            'direct_permissions' => ['nullable', 'array'],
            'direct_permissions.*' => ['string', Rule::exists('permissions', 'name')],
            'profile' => ['nullable', 'array'],
            'profile.department' => ['nullable', 'string', 'max:120'],
            'profile.position' => ['nullable', 'string', 'max:120'],
            'profile.employment_type' => ['nullable', 'string', 'max:80'],
            'profile.office_location' => ['nullable', 'string', 'max:120'],
            'profile.joined_foundation_at' => ['nullable', 'date'],
            'profile.bio' => ['nullable', 'string', 'max:2000'],
            'profile.skills' => ['nullable', 'array'],
            'profile.skills.*' => ['string', 'max:80'],
            'profile.languages' => ['nullable', 'array'],
            'profile.languages.*' => ['string', 'max:80'],
            'profile.certifications' => ['nullable', 'array'],
            'profile.certifications.*' => ['string', 'max:120'],
            'profile.emergency_contact_name' => ['nullable', 'string', 'max:120'],
            'profile.emergency_contact_phone' => ['nullable', 'string', 'max:50'],
        ];
    }
}
