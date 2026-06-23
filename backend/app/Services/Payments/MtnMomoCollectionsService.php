<?php

namespace App\Services\Payments;

use App\Exceptions\PaymentProviderException;
use App\Models\PaymentIntent;
use App\Models\PaymentTransaction;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MtnMomoCollectionsService
{
    public function initiate(PaymentIntent $intent, array $donorData): PaymentIntent
    {
        $this->assertConfigured();

        $referenceId = (string) Str::uuid();
        $callbackHash = $this->callbackHash($referenceId);
        $msisdn = $this->normalizeMsisdn((string) ($donorData['phone'] ?? ''));

        $intent->forceFill([
            'provider_intent_id' => $referenceId,
            'status' => 'pending',
            'metadata' => array_merge($intent->metadata ?? [], [
                'momo_callback_hash' => $callbackHash,
                'momo_msisdn_masked' => $this->maskMsisdn($msisdn),
                'momo_target_environment' => $this->targetEnvironment(),
            ]),
        ])->save();

        $transaction = PaymentTransaction::create([
            'payment_intent_id' => $intent->id,
            'donation_id' => $intent->donation_id,
            'payment_provider_id' => $intent->payment_provider_id,
            'provider_transaction_id' => $referenceId,
            'type' => 'collection_request',
            'status' => 'pending',
            'amount' => $intent->amount,
            'currency' => $intent->currency,
            'raw_payload' => [
                'operation' => 'request_to_pay',
                'provider' => 'mtn_momo',
                'reference_id' => $referenceId,
            ],
        ]);

        $response = $this->requestToPay($intent, $msisdn, $referenceId, $callbackHash);

        if ($response->status() !== 202) {
            $this->markFailed($intent, $transaction, [
                'http_status' => $response->status(),
                'provider_body' => $this->safeBody($response),
            ]);

            throw new PaymentProviderException(__('api.errors.momo_request_failed'), $response->status());
        }

        $transaction->forceFill([
            'raw_payload' => array_merge($transaction->raw_payload ?? [], [
                'http_status' => $response->status(),
                'accepted_at' => now()->toISOString(),
            ]),
        ])->save();

        return $intent->refresh()->load(['donation', 'provider']);
    }

    public function refreshStatus(PaymentIntent $intent): PaymentIntent
    {
        $this->assertConfigured();

        if (! $intent->provider_intent_id) {
            throw new PaymentProviderException('MoMo reference is missing for this payment intent.');
        }

        $response = Http::baseUrl($this->baseUrl())
            ->timeout($this->timeout())
            ->withToken($this->accessToken())
            ->withHeaders($this->momoHeaders())
            ->get("/collection/v1_0/requesttopay/{$intent->provider_intent_id}");

        if (! $response->ok()) {
            throw new PaymentProviderException(__('api.errors.momo_status_failed'), $response->status());
        }

        return $this->applyProviderStatus($intent, $response->json() ?? []);
    }

    public function handleCallback(string $hash, array $payload): ?PaymentIntent
    {
        $intent = PaymentIntent::query()
            ->where('metadata->momo_callback_hash', $hash)
            ->first();

        if (! $intent) {
            return null;
        }

        return $this->applyProviderStatus($intent, $payload);
    }

    private function requestToPay(PaymentIntent $intent, string $msisdn, string $referenceId, string $callbackHash): Response
    {
        return Http::baseUrl($this->baseUrl())
            ->timeout($this->timeout())
            ->withToken($this->accessToken())
            ->withHeaders(array_merge($this->momoHeaders(), [
                'X-Reference-Id' => $referenceId,
                'X-Callback-Url' => $this->callbackUrl($callbackHash),
            ]))
            ->post('/collection/v1_0/requesttopay', [
                'amount' => (string) $intent->amount,
                'currency' => $intent->currency,
                'externalId' => $intent->intent_reference,
                'payer' => [
                    'partyIdType' => 'MSISDN',
                    'partyId' => $msisdn,
                ],
                'payerMessage' => 'TriumphChi Foundation education support donation',
                'payeeNote' => $intent->donation?->reference_number ?? $intent->intent_reference,
            ]);
    }

    private function accessToken(): string
    {
        return Cache::remember('momo.collections.access_token', $this->tokenCacheSeconds(), function (): string {
            $response = Http::baseUrl($this->baseUrl())
                ->timeout($this->timeout())
                ->withBasicAuth((string) config('momo.collections.api_user'), (string) config('momo.collections.api_key'))
                ->withHeaders([
                    'Ocp-Apim-Subscription-Key' => (string) config('momo.collections.subscription_key'),
                ])
                ->post('/collection/token/');

            if (! $response->ok() || ! $response->json('access_token')) {
                throw new PaymentProviderException(__('api.errors.momo_token_failed'), $response->status());
            }

            return (string) $response->json('access_token');
        });
    }

    private function applyProviderStatus(PaymentIntent $intent, array $payload): PaymentIntent
    {
        $status = strtoupper((string) ($payload['status'] ?? 'PENDING'));
        $transaction = $intent->transactions()
            ->where('provider_transaction_id', $intent->provider_intent_id)
            ->latest()
            ->first();

        $mappedStatus = match ($status) {
            'SUCCESSFUL' => 'successful',
            'FAILED' => 'failed',
            default => 'pending',
        };

        if ($transaction) {
            $transaction->forceFill([
                'status' => $mappedStatus,
                'processed_at' => $mappedStatus === 'pending' ? $transaction->processed_at : now(),
                'raw_payload' => array_merge($transaction->raw_payload ?? [], [
                    'financial_transaction_id' => $payload['financialTransactionId'] ?? null,
                    'status_payload' => $this->safePayload($payload),
                    'status_checked_at' => now()->toISOString(),
                ]),
            ])->save();
        }

        $intent->forceFill([
            'status' => $mappedStatus,
            'metadata' => array_merge($intent->metadata ?? [], [
                'momo_last_status' => $status,
                'momo_status_checked_at' => now()->toISOString(),
                'momo_reason' => $payload['reason'] ?? null,
            ]),
        ])->save();

        if ($mappedStatus === 'successful') {
            $intent->donation->forceFill([
                'status' => 'confirmed',
                'provider_reference' => $payload['financialTransactionId'] ?? $intent->provider_intent_id,
                'donated_at' => $intent->donation->donated_at ?? now(),
                'confirmed_at' => $intent->donation->confirmed_at ?? now(),
            ])->save();
        }

        if ($mappedStatus === 'failed') {
            $intent->donation->forceFill([
                'status' => 'failed',
            ])->save();
        }

        return $intent->refresh()->load(['donation', 'provider']);
    }

    private function markFailed(PaymentIntent $intent, PaymentTransaction $transaction, array $payload): void
    {
        $transaction->forceFill([
            'status' => 'failed',
            'processed_at' => now(),
            'raw_payload' => array_merge($transaction->raw_payload ?? [], $payload),
        ])->save();

        $intent->forceFill([
            'status' => 'failed',
            'metadata' => array_merge($intent->metadata ?? [], [
                'momo_request_failed_at' => now()->toISOString(),
            ]),
        ])->save();

        $intent->donation->forceFill(['status' => 'failed'])->save();
    }

    private function momoHeaders(): array
    {
        return [
            'Ocp-Apim-Subscription-Key' => (string) config('momo.collections.subscription_key'),
            'X-Target-Environment' => $this->targetEnvironment(),
        ];
    }

    private function assertConfigured(): void
    {
        foreach (['subscription_key', 'api_user', 'api_key'] as $key) {
            if (! config("momo.collections.{$key}")) {
                throw new PaymentProviderException("MoMo Collections {$key} is not configured.");
            }
        }
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('momo.collections.base_url'), '/');
    }

    private function targetEnvironment(): string
    {
        return (string) config('momo.collections.target_environment', 'sandbox');
    }

    private function timeout(): int
    {
        return (int) config('momo.collections.timeout_seconds', 15);
    }

    private function tokenCacheSeconds(): int
    {
        return (int) config('momo.collections.token_cache_seconds', 3300);
    }

    private function callbackUrl(string $hash): string
    {
        return rtrim((string) config('momo.collections.callback_base_url'), '/')."/api/v1/public/momo/callbacks/{$hash}";
    }

    private function callbackHash(string $referenceId): string
    {
        return hash_hmac('sha256', $referenceId, (string) config('momo.collections.callback_secret'));
    }

    private function normalizeMsisdn(string $value): string
    {
        return ltrim(preg_replace('/[\s-]+/', '', $value) ?? '', '+');
    }

    private function maskMsisdn(string $value): string
    {
        if (strlen($value) <= 4) {
            return '****';
        }

        return str_repeat('*', max(strlen($value) - 4, 0)).substr($value, -4);
    }

    private function safeBody(Response $response): array
    {
        return $this->safePayload($response->json() ?? []);
    }

    private function safePayload(array $payload): array
    {
        if (isset($payload['payer']['partyId'])) {
            $payload['payer']['partyId'] = $this->maskMsisdn((string) $payload['payer']['partyId']);
        }

        return $payload;
    }
}
