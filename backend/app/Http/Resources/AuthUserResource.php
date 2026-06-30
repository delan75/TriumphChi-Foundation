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
            'uuid'             => $this->uuid,
            'employee_number'  => $this->employee_number,
            'name'             => $this->name,
            'email'            => $this->email,
            'phone'            => $this->phone,
            'preferred_locale' => $this->preferred_locale,
            'status'           => $this->status,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'registered_via'   => $this->registered_via,
            'last_login_at'    => $this->last_login_at?->toISOString(),
            'profile'          => $this->whenLoaded('profile', fn () => $this->profile ? [
                'department' => $this->profile->department,
                'position' => $this->profile->position,
                'employment_type' => $this->profile->employment_type,
                'office_location' => $this->profile->office_location,
                'joined_foundation_at' => $this->profile->joined_foundation_at?->toDateString(),
                'bio' => $this->profile->bio,
                'skills' => $this->profile->skills ?? [],
                'languages' => $this->profile->languages ?? [],
                'certifications' => $this->profile->certifications ?? [],
            ] : null),
            // Which providers this user can sign in with
            'auth_providers'   => $this->whenLoaded('authProviders', fn () =>
                $this->authProviders->map(fn ($p) => [
                    'provider'       => $p->provider,
                    'provider_email' => $p->provider_email,
                    'linked_at'      => $p->linked_at?->toISOString(),
                    'last_used_at'   => $p->last_used_at?->toISOString(),
                ])
            ),
            'sessions' => $this->whenLoaded('tokens', fn () => $this->tokens->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at?->toISOString(),
                'expires_at' => $token->expires_at?->toISOString(),
                'created_at' => $token->created_at?->toISOString(),
            ])->values()),
            'activity' => $this->whenLoaded('auditLogs', fn () => $this->auditLogs->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'metadata' => $log->after_values,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at?->toISOString(),
            ])->values()),
            'roles'       => $this->getRoleNames()->sort()->values(),
            'permissions' => $this->getAllPermissions()->pluck('name')->sort()->values(),
        ];
    }
}
