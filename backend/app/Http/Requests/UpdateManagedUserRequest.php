<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateManagedUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('users.update') ?? false;
    }

    public function rules(): array
    {
        /** @var User|null $managedUser */
        $managedUser = $this->route('user');
        $userId = $managedUser?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email:rfc,dns', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('users', 'phone')->ignore($userId)->whereNotNull('phone')],
            'employee_number' => ['nullable', 'string', 'max:40', Rule::unique('users', 'employee_number')->ignore($userId)->whereNotNull('employee_number')],
            'preferred_locale' => ['nullable', Rule::in(['en', 'fr'])],
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
