<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;

class AuthTokenService
{
    public function __construct(private readonly AuthAuditLogger $auditLogger)
    {
    }

    public function issueForLogin(
        User $user,
        string $deviceName,
        Request $request,
        string $auditAction = 'login',
    ): array {
        $normalizedDeviceName = $this->normalizeDeviceName($deviceName);

        if (config('auth_security.rotate_tokens_on_login', true)) {
            $user->tokens()->where('name', $normalizedDeviceName)->delete();
        }

        $expiresAt = now()->addDays((int) config('auth_security.token_expiration_days', 30));
        $plainTextToken = $user->createToken($normalizedDeviceName, ['*'], $expiresAt)->plainTextToken;

        $this->auditLogger->log($user, $auditAction, $request, metadata: [
            'device_name' => $normalizedDeviceName,
            'expires_at' => $expiresAt->toISOString(),
        ]);

        return [
            'access_token' => $plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toISOString(),
        ];
    }

    public function revokeCurrent(User $user, Request $request): void
    {
        $token = $user->currentAccessToken();

        $this->auditLogger->log($user, 'logout', $request, metadata: [
            'token_id' => $token?->id,
        ]);

        $token?->delete();
    }

    public function revokeAll(User $user, Request $request): void
    {
        $tokenCount = $user->tokens()->count();
        $user->tokens()->delete();

        $this->auditLogger->log($user, 'logout_all_devices', $request, metadata: [
            'revoked_tokens' => $tokenCount,
        ]);
    }

    private function normalizeDeviceName(?string $deviceName): string
    {
        $name = trim((string) $deviceName);

        return $name !== '' ? mb_substr($name, 0, 120) : 'api-client';
    }
}
