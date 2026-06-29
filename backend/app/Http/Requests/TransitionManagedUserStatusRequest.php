<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransitionManagedUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can($this->permissionForAction()) ?? false;
    }

    public function rules(): array
    {
        return [
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    private function permissionForAction(): string
    {
        return match ($this->route()?->getActionMethod()) {
            'activate' => 'users.activate',
            'suspend' => 'users.suspend',
            'archive' => 'users.archive',
            default => 'users.update',
        };
    }
}
