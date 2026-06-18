<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'preferred_locale' => $this->preferred_locale,
            'roles' => $this->getRoleNames()->sort()->values(),
            'permissions' => $this->getAllPermissions()
                ->pluck('name')
                ->sort()
                ->values(),
        ];
    }
}
