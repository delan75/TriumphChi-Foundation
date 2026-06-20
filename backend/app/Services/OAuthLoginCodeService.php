<?php

namespace App\Services;

use App\Models\OAuthLoginCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OAuthLoginCodeService
{
    public function __construct(private readonly AuthAuditLogger $auditLogger)
    {
    }

    public function create(User $user, string $provider, Request $request): string
    {
        OAuthLoginCode::query()
            ->where('user_id', $user->id)
            ->where('provider', $provider)
            ->whereNull('consumed_at')
            ->delete();

        $code = Str::random(96);
        $expiresAt = now()->addMinutes((int) config('auth_security.oauth_code_expiration_minutes', 5));

        OAuthLoginCode::create([
            'user_id' => $user->id,
            'provider' => $provider,
            'code_hash' => $this->hash($code),
            'expires_at' => $expiresAt,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $this->auditLogger->log($user, 'oauth_login_code_created', $request, metadata: [
            'provider' => $provider,
            'expires_at' => $expiresAt->toISOString(),
        ]);

        return $code;
    }

    public function consume(string $code): OAuthLoginCode
    {
        $loginCode = OAuthLoginCode::query()
            ->with('user')
            ->where('code_hash', $this->hash($code))
            ->first();

        if (! $loginCode || $loginCode->isConsumed() || $loginCode->isExpired()) {
            throw ValidationException::withMessages([
                'code' => __('api.auth.oauth_code_invalid'),
            ]);
        }

        $loginCode->forceFill(['consumed_at' => now()])->save();

        return $loginCode;
    }

    private function hash(string $code): string
    {
        return hash('sha256', $code);
    }
}
