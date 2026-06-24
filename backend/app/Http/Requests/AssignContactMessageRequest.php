<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('contact_messages.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'assigned_to' => [
                'nullable',
                'integer',
                Rule::exists(User::class, 'id')->where('status', User::STATUS_ACTIVE),
            ],
        ];
    }
}
