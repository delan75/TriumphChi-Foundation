<?php

namespace App\Services\Payments;

use App\Exceptions\PaymentProviderException;
use App\Models\PaymentIntent;
use App\Models\PaymentTransaction;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaypalDonationProvider implements PaymentProviderInterface
{
    public function initiate(PaymentIntent $intent, array $donorData): PaymentIntent
    {
        $this->assertConfigured();

        if ($intent->frequency !== 'one_time') {
            throw new PaymentProviderException(__('api.errors.paypal_recurring_not_supported'));
        }

        $payload = $this->createOrderPayload($intent, $donorData);
        $response = Http::baseUrl($this->baseUrl())
            ->timeout($this->timeout())
            ->withToken($this->accessToken())
            ->withHeaders([
                'PayPal-Request-Id' => "order-{$intent->uuid}",
                'Prefer' => 'return=representation',
            ])
            ->post('/v2/checkout/orders', $payload);

        Log::info('PayPal create order response received.', [
            'status' => $response->status(),
            'intent_uuid' => $intent->uuid,
            'has_order_id' => filled($response->json('id')),
            'paypal_status' => $response->json('status'),
            'link_rels' => $this->linkRels($response->json('links') ?? []),
            'has_checkout_url' => filled($this->approvalUrl($response->json('links') ?? [])),
            'paypal_debug_id' => $response->header('PayPal-Debug-Id'),
        ]);

        if (! $response->successful() || ! $response->json('id')) {
            Log::warning('PayPal create order failed before redirect.', [
                'status' => $response->status(),
                'intent_uuid' => $intent->uuid,
                'paypal_status' => $response->json('status'),
                'paypal_debug_id' => $response->header('PayPal-Debug-Id'),
                'provider_body' => $this->safeResponseBody($response),
            ]);

            $this->markFailed($intent, 'order_create', null, [
                'http_status' => $response->status(),
                'provider_body' => $this->safeResponseBody($response),
            ]);

            throw new PaymentProviderException(__('api.errors.paypal_order_failed'), $response->status());
        }

        $orderId = (string) $response->json('id');
        $approvalUrl = $this->approvalUrl($response->json('links') ?? []);

        if (! $approvalUrl) {
            Log::warning('PayPal create order did not include an approval link.', [
                'status' => $response->status(),
                'intent_uuid' => $intent->uuid,
                'paypal_order_id' => $orderId,
                'paypal_status' => $response->json('status'),
                'link_rels' => $this->linkRels($response->json('links') ?? []),
                'paypal_debug_id' => $response->header('PayPal-Debug-Id'),
            ]);

            $this->markFailed($intent, 'order_create', $orderId, [
                'provider_body' => $this->safeResponseBody($response),
                'reason' => 'missing_approval_url',
            ]);

            throw new PaymentProviderException(__('api.errors.paypal_order_failed'));
        }

        $intent->forceFill([
            'provider_intent_id' => $orderId,
            'checkout_url' => $approvalUrl,
            'status' => 'pending',
            'metadata' => array_merge($intent->metadata ?? [], [
                'paypal_order_id' => $orderId,
                'paypal_order_status' => (string) $response->json('status'),
                'paypal_created_at' => now()->toISOString(),
                'paypal_environment' => config('paypal.environment'),
                'paypal_return_url' => $payload['payment_source']['paypal']['experience_context']['return_url'] ?? null,
                'paypal_cancel_url' => $payload['payment_source']['paypal']['experience_context']['cancel_url'] ?? null,
            ]),
        ])->save();

        PaymentTransaction::create([
            'payment_intent_id' => $intent->id,
            'donation_id' => $intent->donation_id,
            'payment_provider_id' => $intent->payment_provider_id,
            'provider_transaction_id' => $orderId,
            'type' => 'paypal_order',
            'status' => 'pending',
            'amount' => $intent->amount,
            'currency' => $intent->currency,
            'raw_payload' => [
                'operation' => 'create_order',
                'provider' => 'paypal',
                'request' => $this->safePayload($payload),
                'response' => $this->safeResponseBody($response),
            ],
        ]);

        return $intent->refresh()->load(['donation', 'provider']);
    }

    public function refreshStatus(PaymentIntent $intent): PaymentIntent
    {
        $this->assertConfigured();

        if (! $intent->provider_intent_id) {
            throw new PaymentProviderException(__('api.errors.paypal_order_missing'));
        }

        $response = Http::baseUrl($this->baseUrl())
            ->timeout($this->timeout())
            ->withToken($this->accessToken())
            ->get("/v2/checkout/orders/{$intent->provider_intent_id}");

        if (! $response->ok()) {
            throw new PaymentProviderException(__('api.errors.paypal_status_failed'), $response->status());
        }

        return $this->applyOrderStatus($intent, $response->json() ?? []);
    }

    public function captureApprovedOrder(PaymentIntent $intent, ?string $orderId): PaymentIntent
    {
        $this->assertConfigured();

        $incomingOrderId = trim((string) $orderId);
        $resolvedOrderId = $incomingOrderId !== '' ? $incomingOrderId : (string) $intent->provider_intent_id;

        Log::info('PayPal capture requested.', [
            'intent_uuid' => $intent->uuid,
            'db_provider_intent_id' => $intent->provider_intent_id,
            'incoming_order_id' => $incomingOrderId,
            'order_id_source' => $incomingOrderId !== '' ? 'paypal_return_token' : 'stored_intent',
        ]);

        if (! $intent->provider_intent_id || ! hash_equals($intent->provider_intent_id, $resolvedOrderId)) {
            Log::warning('PayPal capture aborted: Order ID mismatch.', [
                'intent_uuid' => $intent->uuid,
                'expected' => $intent->provider_intent_id,
                'actual' => $incomingOrderId,
            ]);

            throw new PaymentProviderException(__('api.errors.paypal_order_mismatch'), 422);
        }

        if (($intent->donation->status->value ?? $intent->donation->status) === 'confirmed') {
            return $intent->load(['donation', 'provider']);
        }

        $intent->forceFill([
            'status' => 'processing',
            'metadata' => array_merge($intent->metadata ?? [], [
                'paypal_capture_started_at' => now()->toISOString(),
            ]),
        ])->save();

        $transaction = PaymentTransaction::create([
            'payment_intent_id' => $intent->id,
            'donation_id' => $intent->donation_id,
            'payment_provider_id' => $intent->payment_provider_id,
            'provider_transaction_id' => $resolvedOrderId,
            'type' => 'paypal_capture',
            'status' => 'processing',
            'amount' => $intent->amount,
            'currency' => $intent->currency,
            'raw_payload' => [
                'operation' => 'capture_order',
                'provider' => 'paypal',
                'order_id' => $resolvedOrderId,
                'order_id_source' => $incomingOrderId !== '' ? 'paypal_return_token' : 'stored_intent',
            ],
        ]);

        $response = Http::baseUrl($this->baseUrl())
            ->timeout($this->timeout())
            ->withToken($this->accessToken())
            ->withHeaders([
                'PayPal-Request-Id' => "capture-{$intent->uuid}",
                'Prefer' => 'return=representation',
            ])
            ->withBody('{}', 'application/json')
            ->post("/v2/checkout/orders/{$resolvedOrderId}/capture");

        if (! $response->successful()) {
            $this->markFailed($intent, 'paypal_capture', $resolvedOrderId, [
                'http_status' => $response->status(),
                'provider_body' => $this->safeResponseBody($response),
            ], $transaction);

            throw new PaymentProviderException(__('api.errors.paypal_capture_failed'), $response->status());
        }

        return $this->applyCapturePayload($intent, $response->json() ?? [], $transaction);
    }

    public function cancel(PaymentIntent $intent): PaymentIntent
    {
        if (($intent->donation->status->value ?? $intent->donation->status) === 'confirmed') {
            return $intent->load(['donation', 'provider']);
        }

        $intent->forceFill([
            'status' => 'cancelled',
            'metadata' => array_merge($intent->metadata ?? [], [
                'paypal_cancelled_at' => now()->toISOString(),
            ]),
        ])->save();

        $intent->donation->forceFill(['status' => 'cancelled'])->save();

        PaymentTransaction::firstOrCreate(
            [
                'payment_intent_id' => $intent->id,
                'provider_transaction_id' => $intent->provider_intent_id,
                'type' => 'paypal_cancel',
            ],
            [
                'donation_id' => $intent->donation_id,
                'payment_provider_id' => $intent->payment_provider_id,
                'status' => 'cancelled',
                'amount' => $intent->amount,
                'currency' => $intent->currency,
                'processed_at' => now(),
                'raw_payload' => [
                    'operation' => 'cancel_order',
                    'provider' => 'paypal',
                    'order_id' => $intent->provider_intent_id,
                ],
            ],
        );

        return $intent->refresh()->load(['donation', 'provider']);
    }

    public function handleWebhook(Request $request): ?PaymentIntent
    {
        $payload = $request->all();
        $eventId = (string) ($payload['id'] ?? '');

        if (! $this->webhookSignatureIsValid($request)) {
            throw new PaymentProviderException(__('api.errors.paypal_webhook_invalid'), 400);
        }

        if ($eventId !== '' && PaymentTransaction::query()
            ->where('type', 'paypal_webhook')
            ->where('provider_transaction_id', $eventId)
            ->exists()) {
            return null;
        }

        $eventType = (string) ($payload['event_type'] ?? '');
        $resource = $payload['resource'] ?? [];
        $intent = $this->resolveIntentFromWebhookResource($resource);

        if (! $intent) {
            return null;
        }

        PaymentTransaction::create([
            'payment_intent_id' => $intent->id,
            'donation_id' => $intent->donation_id,
            'payment_provider_id' => $intent->payment_provider_id,
            'provider_transaction_id' => $eventId ?: (string) Str::uuid(),
            'type' => 'paypal_webhook',
            'status' => 'received',
            'amount' => $intent->amount,
            'currency' => $intent->currency,
            'processed_at' => now(),
            'raw_payload' => [
                'event_type' => $eventType,
                'event_id' => $eventId,
                'resource' => $this->safePayload(is_array($resource) ? $resource : []),
            ],
        ]);

        return match ($eventType) {
            'CHECKOUT.ORDER.APPROVED' => $this->markProcessing($intent, $resource),
            'PAYMENT.CAPTURE.COMPLETED' => $this->applyCapturePayload($intent, $this->captureEventToOrderPayload($intent, $resource)),
            'PAYMENT.CAPTURE.DENIED' => $this->markFailed($intent, 'paypal_webhook', $this->captureId($resource), [
                'event_type' => $eventType,
                'resource' => $this->safePayload(is_array($resource) ? $resource : []),
            ]),
            'PAYMENT.CAPTURE.REFUNDED' => $this->markRefunded($intent, $resource),
            default => $intent->load(['donation', 'provider']),
        };
    }

    private function createOrderPayload(PaymentIntent $intent, array $donorData): array
    {
        $locale = app()->getLocale();
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $returnUrl = "{$frontendUrl}/{$locale}/donate/paypal/return?intent={$intent->uuid}";
        $cancelUrl = "{$frontendUrl}/{$locale}/donate/paypal/cancel?intent={$intent->uuid}";

        return [
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'reference_id' => $intent->uuid,
                    'custom_id' => $intent->intent_reference,
                    'invoice_id' => $intent->donation->reference_number,
                    'description' => 'TriumphChi Foundation education support donation',
                    'amount' => [
                        'currency_code' => $intent->currency,
                        'value' => $this->decimalAmount($intent->amount),
                    ],
                ],
            ],
            'payment_source' => [
                'paypal' => [
                    'experience_context' => [
                        'brand_name' => config('app.name', 'TriumphChi Foundation'),
                        'shipping_preference' => 'NO_SHIPPING',
                        'user_action' => 'PAY_NOW',
                        'return_url' => $returnUrl,
                        'cancel_url' => $cancelUrl,
                    ],
                    'email_address' => $donorData['email'] ?? null,
                ],
            ],
        ];
    }

    private function applyOrderStatus(PaymentIntent $intent, array $payload): PaymentIntent
    {
        $status = strtoupper((string) ($payload['status'] ?? ''));

        return match ($status) {
            'COMPLETED' => $this->applyCapturePayload($intent, $payload),
            'APPROVED' => $this->markProcessing($intent, $payload),
            'VOIDED' => $this->cancel($intent),
            default => tap($intent, function (PaymentIntent $intent) use ($status): void {
                $intent->forceFill([
                    'status' => $status === 'CREATED' || $status === 'PAYER_ACTION_REQUIRED' ? 'pending' : $intent->status,
                    'metadata' => array_merge($intent->metadata ?? [], [
                        'paypal_order_status' => $status,
                        'paypal_status_checked_at' => now()->toISOString(),
                    ]),
                ])->save();
            })->refresh()->load(['donation', 'provider']),
        };
    }

    private function applyCapturePayload(PaymentIntent $intent, array $payload, ?PaymentTransaction $transaction = null): PaymentIntent
    {
        $capture = $this->captureFromPayload($payload);
        $captureStatus = strtoupper((string) ($capture['status'] ?? $payload['status'] ?? ''));
        $captureId = $this->captureId($capture) ?: $this->captureId($payload) ?: $intent->provider_intent_id;
        $amount = $capture['amount'] ?? ($payload['purchase_units'][0]['amount'] ?? null);

        if ($captureStatus !== 'COMPLETED') {
            return $this->markFailed($intent, 'paypal_capture', $captureId, [
                'reason' => 'capture_not_completed',
                'provider_status' => $captureStatus,
                'provider_body' => $this->safePayload($payload),
            ], $transaction);
        }

        $this->assertCaptureMatchesIntent($intent, is_array($amount) ? $amount : []);

        $transaction ??= PaymentTransaction::query()
            ->where('payment_intent_id', $intent->id)
            ->where('type', 'paypal_capture')
            ->latest()
            ->first();

        if ($transaction) {
            $transaction->forceFill([
                'provider_transaction_id' => $captureId,
                'status' => 'completed',
                'processed_at' => now(),
                'raw_payload' => array_merge($transaction->raw_payload ?? [], [
                    'provider_body' => $this->safePayload($payload),
                    'capture_id' => $captureId,
                ]),
            ])->save();
        } else {
            PaymentTransaction::create([
                'payment_intent_id' => $intent->id,
                'donation_id' => $intent->donation_id,
                'payment_provider_id' => $intent->payment_provider_id,
                'provider_transaction_id' => $captureId,
                'type' => 'paypal_capture',
                'status' => 'completed',
                'amount' => $intent->amount,
                'currency' => $intent->currency,
                'processed_at' => now(),
                'raw_payload' => [
                    'provider_body' => $this->safePayload($payload),
                    'capture_id' => $captureId,
                ],
            ]);
        }

        $intent->forceFill([
            'status' => 'completed',
            'metadata' => array_merge($intent->metadata ?? [], [
                'paypal_order_status' => 'COMPLETED',
                'paypal_capture_id' => $captureId,
                'paypal_captured_at' => now()->toISOString(),
            ]),
        ])->save();

        $intent->donation->forceFill([
            'status' => 'confirmed',
            'provider_reference' => $captureId,
            'donated_at' => $intent->donation->donated_at ?? now(),
            'confirmed_at' => $intent->donation->confirmed_at ?? now(),
        ])->save();

        return $intent->refresh()->load(['donation', 'provider']);
    }

    private function markProcessing(PaymentIntent $intent, array $payload): PaymentIntent
    {
        if (($intent->donation->status->value ?? $intent->donation->status) === 'confirmed') {
            return $intent->load(['donation', 'provider']);
        }

        $intent->forceFill([
            'status' => 'processing',
            'metadata' => array_merge($intent->metadata ?? [], [
                'paypal_order_status' => strtoupper((string) ($payload['status'] ?? 'APPROVED')),
                'paypal_approved_at' => now()->toISOString(),
            ]),
        ])->save();

        return $intent->refresh()->load(['donation', 'provider']);
    }

    private function markFailed(PaymentIntent $intent, string $type, ?string $providerId, array $payload, ?PaymentTransaction $transaction = null): PaymentIntent
    {
        if ($transaction) {
            $transaction->forceFill([
                'provider_transaction_id' => $providerId,
                'status' => 'failed',
                'processed_at' => now(),
                'raw_payload' => array_merge($transaction->raw_payload ?? [], $payload),
            ])->save();
        } else {
            PaymentTransaction::create([
                'payment_intent_id' => $intent->id,
                'donation_id' => $intent->donation_id,
                'payment_provider_id' => $intent->payment_provider_id,
                'provider_transaction_id' => $providerId,
                'type' => $type,
                'status' => 'failed',
                'amount' => $intent->amount,
                'currency' => $intent->currency,
                'processed_at' => now(),
                'raw_payload' => $payload,
            ]);
        }

        $intent->forceFill([
            'status' => 'failed',
            'metadata' => array_merge($intent->metadata ?? [], [
                'paypal_failed_at' => now()->toISOString(),
                'paypal_failure' => $payload,
            ]),
        ])->save();

        $intent->donation->forceFill(['status' => 'failed'])->save();

        return $intent->refresh()->load(['donation', 'provider']);
    }

    private function markRefunded(PaymentIntent $intent, array $resource): PaymentIntent
    {
        $intent->forceFill([
            'metadata' => array_merge($intent->metadata ?? [], [
                'paypal_refunded_at' => now()->toISOString(),
                'paypal_refund_payload' => $this->safePayload($resource),
            ]),
        ])->save();

        return $intent->refresh()->load(['donation', 'provider']);
    }

    private function resolveIntentFromWebhookResource(mixed $resource): ?PaymentIntent
    {
        if (! is_array($resource)) {
            return null;
        }

        $orderId = (string) ($resource['supplementary_data']['related_ids']['order_id'] ?? $resource['id'] ?? '');

        if ($orderId !== '') {
            $intent = PaymentIntent::query()
                ->where('provider_intent_id', $orderId)
                ->with(['donation', 'provider'])
                ->first();

            if ($intent) {
                return $intent;
            }
        }

        $referenceId = (string) ($resource['purchase_units'][0]['reference_id'] ?? '');

        return $referenceId !== ''
            ? PaymentIntent::query()->where('uuid', $referenceId)->with(['donation', 'provider'])->first()
            : null;
    }

    private function webhookSignatureIsValid(Request $request): bool
    {
        if (! (bool) config('paypal.verify_webhooks', true)) {
            if (app()->environment('production')) {
                Log::critical('PayPal webhook verification is disabled in production.', [
                    'transmission_id' => $request->header('PAYPAL-TRANSMISSION-ID'),
                ]);

                return false;
            }

            return true;
        }

        if (! config('paypal.webhook_id')) {
            Log::warning('PayPal webhook verification failed because webhook id is not configured.', [
                'transmission_id' => $request->header('PAYPAL-TRANSMISSION-ID'),
            ]);

            return false;
        }

        $response = Http::baseUrl($this->baseUrl())
            ->timeout($this->timeout())
            ->withToken($this->accessToken())
            ->post('/v1/notifications/verify-webhook-signature', [
                'auth_algo' => $request->header('PAYPAL-AUTH-ALGO'),
                'cert_url' => $request->header('PAYPAL-CERT-URL'),
                'transmission_id' => $request->header('PAYPAL-TRANSMISSION-ID'),
                'transmission_sig' => $request->header('PAYPAL-TRANSMISSION-SIG'),
                'transmission_time' => $request->header('PAYPAL-TRANSMISSION-TIME'),
                'webhook_id' => config('paypal.webhook_id'),
                'webhook_event' => $request->all(),
            ]);

        $isValid = $response->ok() && $response->json('verification_status') === 'SUCCESS';

        if (! $isValid) {
            Log::warning('PayPal webhook signature verification failed.', [
                'status' => $response->status(),
                'verification_status' => $response->json('verification_status'),
                'transmission_id' => $request->header('PAYPAL-TRANSMISSION-ID'),
                'paypal_debug_id' => $response->header('PayPal-Debug-Id'),
            ]);
        }

        return $isValid;
    }

    private function accessToken(): string
    {
        return Cache::remember('paypal.access_token', $this->tokenCacheSeconds(), function (): string {
            $response = Http::baseUrl($this->baseUrl())
                ->timeout($this->timeout())
                ->asForm()
                ->withBasicAuth((string) config('paypal.client_id'), (string) config('paypal.client_secret'))
                ->post('/v1/oauth2/token', [
                    'grant_type' => 'client_credentials',
                ]);

            Log::info('PayPal access token response received.', [
                'status' => $response->status(),
                'base_url' => $this->baseUrl(),
                'client_id_configured' => filled(config('paypal.client_id')),
                'client_secret_configured' => filled(config('paypal.client_secret')),
                'has_access_token' => filled($response->json('access_token')),
                'expires_in' => $response->json('expires_in'),
            ]);

            if (! $response->ok() || ! $response->json('access_token')) {
                throw new PaymentProviderException(__('api.errors.paypal_token_failed'), $response->status());
            }

            return (string) $response->json('access_token');
        });
    }

    private function assertCaptureMatchesIntent(PaymentIntent $intent, array $amount): void
    {
        $currency = (string) ($amount['currency_code'] ?? '');
        $value = (string) ($amount['value'] ?? '');

        if ($currency !== $intent->currency || abs((float) $this->decimalAmount($intent->amount) - (float) $this->decimalAmount($value)) > 0.009) {
            $this->markFailed($intent, 'paypal_capture_validation', $intent->provider_intent_id, [
                'reason' => 'amount_or_currency_mismatch',
                'expected' => [
                    'amount' => $this->decimalAmount($intent->amount),
                    'currency' => $intent->currency,
                ],
                'actual' => [
                    'amount' => $value,
                    'currency' => $currency,
                ],
            ]);

            throw new PaymentProviderException(__('api.errors.paypal_capture_mismatch'), 422);
        }
    }

    private function captureFromPayload(array $payload): array
    {
        return $payload['purchase_units'][0]['payments']['captures'][0] ?? $payload;
    }

    private function captureEventToOrderPayload(PaymentIntent $intent, mixed $resource): array
    {
        $capture = is_array($resource) ? $resource : [];

        return [
            'id' => $intent->provider_intent_id,
            'status' => 'COMPLETED',
            'purchase_units' => [
                [
                    'reference_id' => $intent->uuid,
                    'payments' => [
                        'captures' => [
                            $capture,
                        ],
                    ],
                ],
            ],
        ];
    }

    private function captureId(mixed $payload): ?string
    {
        return is_array($payload) && filled($payload['id'] ?? null) ? (string) $payload['id'] : null;
    }

    private function approvalUrl(array $links): ?string
    {
        foreach ($links as $link) {
            if (in_array($link['rel'] ?? null, ['approve', 'payer-action'], true) && filled($link['href'] ?? null)) {
                return (string) $link['href'];
            }
        }

        return null;
    }

    private function linkRels(array $links): array
    {
        return collect($links)
            ->pluck('rel')
            ->filter()
            ->values()
            ->all();
    }

    private function assertConfigured(): void
    {
        foreach (['client_id', 'client_secret'] as $key) {
            if (! config("paypal.{$key}")) {
                throw new PaymentProviderException("PayPal {$key} is not configured.");
            }
        }
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('paypal.base_url'), '/');
    }

    private function timeout(): int
    {
        return (int) config('paypal.timeout_seconds', 15);
    }

    private function tokenCacheSeconds(): int
    {
        return (int) config('paypal.token_cache_seconds', 3300);
    }

    private function decimalAmount(mixed $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }

    private function safeResponseBody(Response $response): array|string|null
    {
        $json = $response->json();

        if (is_array($json)) {
            return $this->safePayload($json);
        }

        return $response->body() ? Str::limit($response->body(), 1000) : null;
    }

    private function safePayload(array $payload): array
    {
        foreach (['access_token', 'client_secret'] as $secretKey) {
            if (isset($payload[$secretKey])) {
                $payload[$secretKey] = '[redacted]';
            }
        }

        return $payload;
    }
}
