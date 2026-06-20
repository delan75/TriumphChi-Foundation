<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuthAuditLogger
{
    public function log(
        ?User $user,
        string $action,
        ?Request $request = null,
        ?Model $auditable = null,
        array $metadata = [],
    ): void {
        AuditLog::create([
            'user_id' => $user?->id,
            'auditable_type' => $auditable ? $auditable::class : ($user ? User::class : null),
            'auditable_id' => $auditable?->getKey() ?? $user?->id,
            'action' => $action,
            'before_values' => null,
            'after_values' => $metadata ?: null,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }
}
