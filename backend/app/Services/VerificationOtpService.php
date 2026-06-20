<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserVerificationOtp;
use App\Notifications\VerificationOtpNotification;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class VerificationOtpService
{
    public function __construct(private readonly AuthAuditLogger $auditLogger)
    {
    }

    public function send(User $user, string $channel, Request $request): UserVerificationOtp
    {
        $channel = $this->normalizeChannel($channel);
        $destination = $this->destinationFor($user, $channel);
        $code = (string) random_int(100000, 999999);
        $expiresInMinutes = (int) config('auth_security.verification_otp_expiration_minutes', 10);
        $expiresAt = now()->addMinutes($expiresInMinutes);

        $this->ensureChannelCanDeliver($channel);

        UserVerificationOtp::query()
            ->where('user_id', $user->id)
            ->where('channel', $channel)
            ->whereNull('consumed_at')
            ->delete();

        $otp = UserVerificationOtp::create([
            'user_id' => $user->id,
            'channel' => $channel,
            'destination' => $destination,
            'code_hash' => $this->hash($code),
            'expires_at' => $expiresAt,
            'last_sent_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $this->deliver($user, $channel, $destination, $code, $expiresInMinutes);

        $this->auditLogger->log($user, 'verification_otp_sent', $request, metadata: [
            'channel' => $channel,
            'destination_masked' => $this->maskDestination($destination),
            'expires_at' => $expiresAt->toISOString(),
        ]);

        return $otp;
    }

    public function verify(string $email, string $code, Request $request): User
    {
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => __('api.auth.otp_invalid'),
            ]);
        }

        $otp = UserVerificationOtp::query()
            ->where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->latest()
            ->first();

        if (! $otp || $otp->isExpired()) {
            $this->auditLogger->log($user, 'verification_otp_failed', $request, metadata: [
                'reason' => 'invalid_or_expired',
            ]);

            throw ValidationException::withMessages([
                'code' => __('api.auth.otp_invalid'),
            ]);
        }

        $maxAttempts = (int) config('auth_security.verification_otp_max_attempts', 5);

        if ($otp->attempts >= $maxAttempts) {
            $this->auditLogger->log($user, 'verification_otp_failed', $request, metadata: [
                'reason' => 'too_many_attempts',
            ]);

            throw ValidationException::withMessages([
                'code' => __('api.auth.otp_too_many_attempts'),
            ]);
        }

        $otp->forceFill(['attempts' => $otp->attempts + 1])->save();

        if (! hash_equals($otp->code_hash, $this->hash($code))) {
            $this->auditLogger->log($user, 'verification_otp_failed', $request, metadata: [
                'reason' => 'code_mismatch',
                'attempts' => $otp->attempts,
            ]);

            throw ValidationException::withMessages([
                'code' => __('api.auth.otp_invalid'),
            ]);
        }

        $otp->forceFill([
            'consumed_at' => now(),
        ])->save();

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        if ($user->isPending()) {
            $user->activate();
        }

        $this->auditLogger->log($user, 'verification_otp_verified', $request, metadata: [
            'channel' => $otp->channel,
        ]);

        return $user->fresh();
    }

    public function normalizeChannel(?string $channel): string
    {
        $normalized = Str::lower(trim((string) $channel));

        return in_array($normalized, UserVerificationOtp::CHANNELS, true)
            ? $normalized
            : UserVerificationOtp::CHANNEL_EMAIL;
    }

    public function maskedEmail(User $user): string
    {
        return $this->maskDestination($user->email);
    }

    public function maskedPhone(User $user): ?string
    {
        return $user->phone ? $this->maskDestination($user->phone) : null;
    }

    private function destinationFor(User $user, string $channel): string
    {
        return match ($channel) {
            UserVerificationOtp::CHANNEL_EMAIL => $user->email,
            UserVerificationOtp::CHANNEL_SMS,
            UserVerificationOtp::CHANNEL_WHATSAPP => $this->verifiedPhoneDestination($user),
            default => $user->email,
        };
    }

    private function verifiedPhoneDestination(User $user): string
    {
        if (! $user->phone) {
            throw ValidationException::withMessages([
                'channel' => __('api.auth.otp_phone_required'),
            ]);
        }

        return $user->phone;
    }

    private function deliver(User $user, string $channel, string $destination, string $code, int $expiresInMinutes): void
    {
        if ($channel === UserVerificationOtp::CHANNEL_EMAIL) {
            $user->notify(new VerificationOtpNotification($code, $expiresInMinutes));

            return;
        }

        try {
            Http::timeout(10)->post((string) config("auth_security.otp_channels.{$channel}.webhook_url"), [
                'destination' => $destination,
                'code' => $code,
                'expires_in_minutes' => $expiresInMinutes,
                'channel' => $channel,
            ])->throw();
        } catch (RequestException) {
            abort(Response::HTTP_SERVICE_UNAVAILABLE, __('api.auth.otp_channel_unavailable'));
        }
    }

    private function ensureChannelCanDeliver(string $channel): void
    {
        if ($channel === UserVerificationOtp::CHANNEL_EMAIL) {
            return;
        }

        if (! config("auth_security.otp_channels.{$channel}.webhook_url")) {
            abort(Response::HTTP_SERVICE_UNAVAILABLE, __('api.auth.otp_channel_unavailable'));
        }
    }

    private function hash(string $code): string
    {
        return hash('sha256', $code);
    }

    private function maskDestination(string $destination): string
    {
        if (str_contains($destination, '@')) {
            [$name, $domain] = explode('@', $destination, 2);

            return mb_substr($name, 0, 2) . '***@' . $domain;
        }

        return mb_substr($destination, 0, 4) . '***' . mb_substr($destination, -2);
    }
}
