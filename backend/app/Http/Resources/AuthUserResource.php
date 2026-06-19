<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'email'            => $this->email,
            'preferred_locale' => $this->preferred_locale,
            'registered_via'   => $this->registered_via,
            'last_login_at'    => $this->last_login_at?->toISOString(),
            // Which providers this user can sign in with
            'auth_providers'   => $this->whenLoaded('authProviders', fn () =>
                $this->authProviders->map(fn ($p) => [
                    'provider'       => $p->provider,
                    'provider_email' => $p->provider_email,
                    'linked_at'      => $p->linked_at?->toISOString(),
                    'last_used_at'   => $p->last_used_at?->toISOString(),
                ])
            ),
            'roles'       => $this->getRoleNames()->sort()->values(),
            'permissions' => $this->getAllPermissions()->pluck('name')->sort()->values(),
        ];
    }
}
