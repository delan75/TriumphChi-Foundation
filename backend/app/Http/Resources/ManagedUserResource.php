<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizesResourceLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Laravel\Sanctum\PersonalAccessToken;

class ManagedUserResource extends JsonResource
{
    use LocalizesResourceLabels;

    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $directPermissions = $this->permissions->pluck('name')->sort()->values();

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'employee_number' => $this->employee_number,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'preferred_locale' => $this->preferred_locale,
            'status' => $this->status,
            'status_label' => $this->localizedLabel('user_statuses', $this->status),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'registered_via' => $this->registered_via,
            'registration_source' => $this->registration_source,
            'last_login_at' => $this->last_login_at?->toISOString(),
            'profile' => $this->whenLoaded('profile', fn () => $this->profile ? [
                'department' => $this->profile->department,
                'position' => $this->profile->position,
                'employment_type' => $this->profile->employment_type,
                'office_location' => $this->profile->office_location,
                'joined_foundation_at' => $this->profile->joined_foundation_at?->toDateString(),
                'bio' => $this->profile->bio,
                'skills' => $this->profile->skills ?? [],
                'languages' => $this->profile->languages ?? [],
                'certifications' => $this->profile->certifications ?? [],
                'emergency_contact_name' => $this->profile->emergency_contact_name,
                'emergency_contact_phone' => $this->profile->emergency_contact_phone,
            ] : null),
            'auth_providers' => $this->whenLoaded('authProviders', fn () => $this->authProviders->map(fn ($provider) => [
                'provider' => $provider->provider,
                'provider_email' => $provider->provider_email,
                'linked_at' => $provider->linked_at?->toISOString(),
                'last_used_at' => $provider->last_used_at?->toISOString(),
            ])->values()),
            'roles' => $this->roles->map(fn ($role) => [
                'name' => $role->name,
                'label' => $role->label ?: str($role->name)->replace('_', ' ')->title()->toString(),
            ])->sortBy('name')->values(),
            'direct_permissions' => $directPermissions,
            'permissions' => $this->getAllPermissions()->pluck('name')->sort()->values(),
            'sessions' => $this->whenLoaded('tokens', fn () => $this->tokens->map(fn (PersonalAccessToken $token) => [
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
            'permissions_context' => [
                'can_view' => $viewer?->can('users.view') ?? false,
                'can_create' => $viewer?->can('users.create') ?? false,
                'can_update' => $viewer?->can('users.update') ?? false,
                'can_manage_access' => $viewer?->can('users.access.manage') ?? false,
                'can_activate' => $viewer?->can('users.activate') ?? false,
                'can_suspend' => $viewer?->can('users.suspend') ?? false,
                'can_archive' => $viewer?->can('users.archive') ?? false,
                'can_terminate_sessions' => $viewer?->can('users.sessions.manage') ?? false,
                'is_self' => $viewer?->is($this->resource) ?? false,
            ],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
