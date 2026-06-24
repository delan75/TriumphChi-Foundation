<?php

namespace Tests\Feature;

use App\Models\Donation;
use App\Models\Donor;
use App\Models\PaymentIntent;
use App\Models\PaymentProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PublicDonationIntentTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_donation_config_returns_provider_agnostic_options(): void
    {
        $this->enableDonationProvider('paypal');

        $this->getJson('/api/v1/public/donation-config')
            ->assertOk()
            ->assertJsonPath('data.default_currency', 'USD')
            ->assertJsonPath('data.default_purpose', 'greatest_need')
            ->assertJsonPath('data.currencies.USD.minimum_amount', 2)
            ->assertJsonPath('data.detected_country.country', null)
            ->assertJsonFragment(['key' => 'cards'])
            ->assertJsonFragment(['key' => 'paypal'])
            ->assertJsonFragment(['key' => 'momo'])
            ->assertJsonFragment(['country_codes' => ['CM']])
            ->assertJsonFragment(['country_currency_map' => ['CM' => 'XAF']])
            ->assertJsonFragment(['key' => 'bank_transfer']);
    }

    public function test_public_donation_config_includes_detected_country_from_geo_header(): void
    {
        $this->withHeaders(['CF-IPCountry' => 'CM'])
            ->getJson('/api/v1/public/donation-config')
            ->assertOk()
            ->assertJsonPath('data.detected_country.country', 'CM')
            ->assertJsonPath('data.detected_country.source', 'geo_header');
    }

    public function test_public_donation_intent_creates_pending_donation_and_payment_intent(): void
    {
        $payload = [
            'frequency' => 'one_time',
            'currency' => 'USD',
            'amount' => 25,
            'purpose' => 'greatest_need',
            'payment_provider' => 'cards',
            'donor' => [
                'name' => 'Grace Donor',
                'email' => 'grace@example.com',
                'phone' => '+237600000000',
                'country' => 'CM',
            ],
            'anonymous' => true,
        ];

        $this->postJson('/api/v1/public/donation-intents', $payload)
            ->assertCreated()
            ->assertJsonPath('data.currency', 'USD')
            ->assertJsonPath('data.frequency', 'one_time')
            ->assertJsonPath('data.purpose', 'greatest_need')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.payment_provider.key', 'cards')
            ->assertJsonStructure([
                'data' => [
                    'uuid',
                    'intent_reference',
                    'donation' => ['uuid', 'reference_number', 'status'],
                    'payment_provider' => ['key', 'name', 'category'],
                    'expires_at',
                ],
            ]);

        $this->assertDatabaseHas('donors', [
            'email' => 'grace@example.com',
            'name' => 'Grace Donor',
        ]);

        $this->assertDatabaseHas('donations', [
            'amount' => 25,
            'currency' => 'USD',
            'method' => 'stripe',
            'provider' => 'cards',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('payment_providers', [
            'key' => 'cards',
            'method' => 'stripe',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('payment_intents', [
            'amount' => 25,
            'currency' => 'USD',
            'frequency' => 'one_time',
            'purpose' => 'greatest_need',
            'status' => 'pending',
        ]);

        $this->assertSame(1, Donor::count());
        $this->assertSame(1, Donation::count());
        $this->assertSame(1, PaymentProvider::count());
        $this->assertSame(1, PaymentIntent::count());
    }

    public function test_public_donation_intent_rejects_amount_below_currency_minimum(): void
    {
        $this->postJson('/api/v1/public/donation-intents', [
            'frequency' => 'one_time',
            'currency' => 'USD',
            'amount' => 1,
            'purpose' => 'greatest_need',
            'payment_provider' => 'cards',
            'donor' => [
                'name' => 'Grace Donor',
                'email' => 'grace@example.com',
                'country' => 'CM',
            ],
            'anonymous' => false,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('amount');
    }

    public function test_public_donation_intent_rejects_provider_currency_mismatch(): void
    {
        $this->enableDonationProvider('paypal');

        $this->postJson('/api/v1/public/donation-intents', [
            'frequency' => 'one_time',
            'currency' => 'XAF',
            'amount' => 5000,
            'purpose' => 'greatest_need',
            'payment_provider' => 'paypal',
            'donor' => [
                'name' => 'Grace Donor',
                'email' => 'grace@example.com',
                'country' => 'CM',
            ],
            'anonymous' => false,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('payment_provider');
    }

    public function test_public_paypal_donation_intent_creates_order_and_returns_approval_url(): void
    {
        $this->configurePaypal();

        Http::fake([
            'https://api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response(['access_token' => 'paypal-token', 'expires_in' => 3600], 200),
            'https://api-m.sandbox.paypal.com/v2/checkout/orders' => Http::response($this->paypalOrderPayload([
                'status' => 'PAYER_ACTION_REQUIRED',
                'links' => [
                    [
                        'href' => 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-123',
                        'rel' => 'payer-action',
                        'method' => 'GET',
                    ],
                ],
            ]), 200),
        ]);

        $this->postJson('/api/v1/public/donation-intents', $this->paypalPayload())
            ->assertCreated()
            ->assertJsonPath('data.payment_provider.key', 'paypal')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.checkout_url', 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-123');

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://api-m.sandbox.paypal.com/v2/checkout/orders'
                && $request->hasHeader('Authorization', 'Bearer paypal-token')
                && $request->hasHeader('PayPal-Request-Id')
                && $request['intent'] === 'CAPTURE'
                && $request['purchase_units'][0]['amount']['currency_code'] === 'USD'
                && $request['purchase_units'][0]['amount']['value'] === '25.00'
                && $request['payment_source']['paypal']['email_address'] === 'grace@example.com';
        });

        $intent = PaymentIntent::firstOrFail();

        $this->assertSame('ORDER-123', $intent->provider_intent_id);
        $this->assertSame('ORDER-123', $intent->metadata['paypal_order_id']);
        $this->assertDatabaseHas('payment_transactions', [
            'payment_intent_id' => $intent->id,
            'provider_transaction_id' => 'ORDER-123',
            'type' => 'paypal_order',
            'status' => 'pending',
        ]);
    }

    public function test_public_paypal_capture_verifies_amount_and_confirms_donation(): void
    {
        $intent = $this->createPendingPaypalIntent();

        Http::fake([
            'https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-123/capture' => Http::response($this->paypalCapturePayload(), 201),
        ]);

        $this->postJson("/api/v1/public/donation-intents/{$intent->uuid}/paypal/capture", [
            'order_id' => 'ORDER-123',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.donation.status', 'confirmed');

        $intent->refresh();

        $this->assertSame('completed', $intent->status);
        $this->assertSame('confirmed', $intent->donation->refresh()->status->value);
        $this->assertSame('CAPTURE-123', $intent->donation->provider_reference);
        $this->assertDatabaseHas('payment_transactions', [
            'payment_intent_id' => $intent->id,
            'provider_transaction_id' => 'CAPTURE-123',
            'type' => 'paypal_capture',
            'status' => 'completed',
        ]);
    }

    public function test_public_paypal_capture_rejects_amount_mismatch(): void
    {
        $intent = $this->createPendingPaypalIntent();

        Http::fake([
            'https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-123/capture' => Http::response($this->paypalCapturePayload([
                'amount' => ['currency_code' => 'USD', 'value' => '5.00'],
            ]), 201),
        ]);

        $this->postJson("/api/v1/public/donation-intents/{$intent->uuid}/paypal/capture", [
            'order_id' => 'ORDER-123',
        ])
            ->assertStatus(422);

        $this->assertDatabaseHas('payment_intents', ['id' => $intent->id, 'status' => 'failed']);
        $this->assertDatabaseHas('donations', ['id' => $intent->donation_id, 'status' => 'failed']);
    }

    public function test_public_paypal_cancel_marks_pending_donation_cancelled(): void
    {
        $intent = $this->createPendingPaypalIntent();

        $this->postJson("/api/v1/public/donation-intents/{$intent->uuid}/paypal/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.donation.status', 'cancelled');
    }

    public function test_public_paypal_webhook_confirms_capture_once_when_signature_is_valid(): void
    {
        $intent = $this->createPendingPaypalIntent();

        Http::fake([
            'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response(['verification_status' => 'SUCCESS'], 200),
        ]);

        $payload = $this->paypalWebhookPayload($intent->provider_intent_id);

        $this->withPaypalWebhookHeaders()
            ->postJson('/api/v1/public/paypal/webhooks', $payload)
            ->assertOk();

        $this->withPaypalWebhookHeaders()
            ->postJson('/api/v1/public/paypal/webhooks', $payload)
            ->assertOk();

        $intent->refresh();

        $this->assertSame('completed', $intent->status);
        $this->assertSame('confirmed', $intent->donation->refresh()->status->value);
        $this->assertDatabaseCount('payment_transactions', 3);
        $this->assertSame(1, \App\Models\PaymentTransaction::query()->where('type', 'paypal_webhook')->count());
    }

    public function test_public_paypal_webhook_rejects_invalid_signature(): void
    {
        $this->createPendingPaypalIntent();

        Http::fake([
            'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response(['verification_status' => 'FAILURE'], 200),
        ]);

        $this->withPaypalWebhookHeaders()
            ->postJson('/api/v1/public/paypal/webhooks', $this->paypalWebhookPayload('ORDER-123'))
            ->assertBadRequest();

        $this->assertDatabaseMissing('donations', ['status' => 'confirmed']);
    }

    public function test_public_momo_donation_intent_starts_request_to_pay_with_server_reference(): void
    {
        $this->configureMomo();

        Http::fake([
            'https://sandbox.momodeveloper.mtn.com/collection/token/' => Http::response(['access_token' => 'test-token'], 200),
            'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay' => Http::response(null, 202),
        ]);

        $this->postJson('/api/v1/public/donation-intents', $this->momoPayload())
            ->assertCreated()
            ->assertJsonPath('data.currency', 'XAF')
            ->assertJsonPath('data.payment_provider.key', 'momo')
            ->assertJsonPath('data.status', 'pending');

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay'
                && $request->hasHeader('Authorization', 'Bearer test-token')
                && $request->hasHeader('X-Target-Environment', 'sandbox')
                && $request->hasHeader('Ocp-Apim-Subscription-Key', 'subscription-key')
                && $request->hasHeader('X-Reference-Id')
                && $request['payer']['partyId'] === '237670000000'
                && $request['currency'] === 'XAF';
        });

        $intent = PaymentIntent::firstOrFail();

        $this->assertNotNull($intent->provider_intent_id);
        $this->assertNotEmpty($intent->metadata['momo_callback_hash']);
        $this->assertSame('********0000', $intent->metadata['momo_msisdn_masked']);

        $this->assertDatabaseHas('payment_transactions', [
            'payment_intent_id' => $intent->id,
            'provider_transaction_id' => $intent->provider_intent_id,
            'status' => 'pending',
            'type' => 'collection_request',
        ]);
    }

    public function test_public_momo_callback_confirms_donation_without_relying_on_public_child_data(): void
    {
        $intent = $this->createPendingMomoIntent();
        $hash = $intent->metadata['momo_callback_hash'];

        $this->postJson("/api/v1/public/momo/callbacks/{$hash}", [
            'status' => 'SUCCESSFUL',
            'financialTransactionId' => 'FIN-123',
            'externalId' => $intent->intent_reference,
            'payer' => [
                'partyIdType' => 'MSISDN',
                'partyId' => '237670000000',
            ],
        ])->assertOk();

        $intent->refresh();

        $this->assertSame('successful', $intent->status);
        $this->assertSame('confirmed', $intent->donation->refresh()->status->value);
        $this->assertSame('FIN-123', $intent->donation->provider_reference);
        $this->assertDatabaseHas('payment_transactions', [
            'payment_intent_id' => $intent->id,
            'provider_transaction_id' => $intent->provider_intent_id,
            'status' => 'successful',
        ]);
    }

    public function test_public_momo_status_endpoint_reconciles_successful_payment(): void
    {
        $intent = $this->createPendingMomoIntent();

        Http::fake([
            "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/{$intent->provider_intent_id}" => Http::response([
                'status' => 'SUCCESSFUL',
                'financialTransactionId' => 'FIN-456',
                'externalId' => $intent->intent_reference,
            ], 200),
        ]);

        $this->getJson("/api/v1/public/donation-intents/{$intent->uuid}/status")
            ->assertOk()
            ->assertJsonPath('data.status', 'successful')
            ->assertJsonPath('data.donation.status', 'confirmed');
    }

    public function test_public_momo_request_failure_marks_intent_failed(): void
    {
        $this->configureMomo();

        Http::fake([
            'https://sandbox.momodeveloper.mtn.com/collection/token/' => Http::response(['access_token' => 'test-token'], 200),
            'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay' => Http::response(['message' => 'provider down'], 500),
        ]);

        $this->postJson('/api/v1/public/donation-intents', $this->momoPayload())
            ->assertStatus(502);

        $this->assertDatabaseHas('payment_intents', ['status' => 'failed']);
        $this->assertDatabaseHas('donations', ['status' => 'failed']);
        $this->assertDatabaseHas('payment_transactions', ['status' => 'failed']);
    }

    public function test_public_momo_intent_requires_phone_and_consent(): void
    {
        $payload = $this->momoPayload();
        $payload['donor']['phone'] = '';
        $payload['payment_consent'] = false;

        $this->postJson('/api/v1/public/donation-intents', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['donor.phone', 'payment_consent']);
    }

    public function test_public_momo_intent_is_restricted_to_configured_country_and_currency(): void
    {
        $payload = $this->momoPayload();
        $payload['currency'] = 'ZAR';
        $payload['donor']['country'] = 'ZA';

        $this->postJson('/api/v1/public/donation-intents', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['currency', 'payment_provider']);
    }

    public function test_similar_pending_donation_warns_before_creating_another_intent(): void
    {
        $payload = $this->cardPayload(['client_reference' => 'first-client-reference']);

        $this->postJson('/api/v1/public/donation-intents', $payload)
            ->assertCreated();

        $this->postJson('/api/v1/public/donation-intents', $this->cardPayload(['client_reference' => 'second-client-reference']))
            ->assertConflict()
            ->assertJsonPath('code', 'similar_donation_pending')
            ->assertJsonPath('data.similar_donation.currency', 'USD');

        $this->assertSame(1, PaymentIntent::count());
    }

    public function test_similar_pending_donation_can_be_confirmed_to_create_another_intent(): void
    {
        $this->postJson('/api/v1/public/donation-intents', $this->cardPayload(['client_reference' => 'first-client-reference']))
            ->assertCreated();

        $payload = $this->cardPayload([
            'client_reference' => 'second-client-reference',
            'similar_donation_acknowledged' => true,
        ]);

        $this->postJson('/api/v1/public/donation-intents', $payload)
            ->assertCreated();

        $this->assertSame(2, PaymentIntent::count());
    }

    public function test_retried_client_reference_returns_existing_payment_intent(): void
    {
        $payload = $this->cardPayload(['client_reference' => 'same-client-reference']);

        $first = $this->postJson('/api/v1/public/donation-intents', $payload)
            ->assertCreated()
            ->json('data.uuid');

        $second = $this->postJson('/api/v1/public/donation-intents', $payload)
            ->assertCreated()
            ->json('data.uuid');

        $this->assertSame($first, $second);
        $this->assertSame(1, PaymentIntent::count());
    }

    public function test_momo_account_holder_status_endpoint_checks_active_msisdn(): void
    {
        $this->configureMomo();
        $this->actingAsPaymentViewer();

        Http::fake([
            'https://sandbox.momodeveloper.mtn.com/collection/token/' => Http::response(['access_token' => 'test-token'], 200),
            'https://sandbox.momodeveloper.mtn.com/collection/v1_0/accountholder/msisdn/237670000000/active' => Http::response(['result' => true], 200),
        ]);

        $this->getJson('/api/v1/payment-providers/momo/account-holder-status?msisdn=%2B237670000000')
            ->assertOk()
            ->assertJsonPath('data.active', true)
            ->assertJsonPath('data.masked_msisdn', '********0000')
            ->assertJsonPath('data.target_environment', 'sandbox');

        Http::assertSent(function (Request $request): bool {
            return $request->url() === 'https://sandbox.momodeveloper.mtn.com/collection/v1_0/accountholder/msisdn/237670000000/active'
                && $request->hasHeader('Authorization', 'Bearer test-token')
                && $request->hasHeader('X-Target-Environment', 'sandbox')
                && $request->hasHeader('Ocp-Apim-Subscription-Key', 'subscription-key')
                && $request->hasHeader('Cache-Control', 'no-cache');
        });
    }

    public function test_momo_account_holder_status_requires_payment_permission(): void
    {
        $this->configureMomo();

        Sanctum::actingAs(User::create([
            'name' => 'No Payment Access',
            'email' => 'no-payment-access@example.test',
            'password' => 'password',
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]));

        $this->getJson('/api/v1/payment-providers/momo/account-holder-status?msisdn=%2B237670000000')
            ->assertForbidden();
    }

    public function test_momo_account_holder_status_reports_provider_failure_without_leaking_number(): void
    {
        $this->configureMomo();
        $this->actingAsPaymentViewer();

        Http::fake([
            'https://sandbox.momodeveloper.mtn.com/collection/token/' => Http::response(['access_token' => 'test-token'], 200),
            'https://sandbox.momodeveloper.mtn.com/collection/v1_0/accountholder/msisdn/237670000000/active' => Http::response(['message' => 'service unavailable'], 500),
        ]);

        $this->getJson('/api/v1/payment-providers/momo/account-holder-status?msisdn=%2B237670000000')
            ->assertStatus(502)
            ->assertJsonMissing(['237670000000']);
    }

    private function createPendingMomoIntent(): PaymentIntent
    {
        $this->configureMomo();

        Http::fake([
            'https://sandbox.momodeveloper.mtn.com/collection/token/' => Http::response(['access_token' => 'test-token'], 200),
            'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay' => Http::response(null, 202),
        ]);

        $this->postJson('/api/v1/public/donation-intents', $this->momoPayload())
            ->assertCreated();

        Http::fake([]);

        return PaymentIntent::firstOrFail()->load(['donation', 'provider']);
    }

    private function configureMomo(): void
    {
        Cache::flush();

        config([
            'momo.collections.subscription_key' => 'subscription-key',
            'momo.collections.api_user' => 'api-user',
            'momo.collections.api_key' => 'api-key',
            'momo.collections.callback_base_url' => 'https://api.triumphchi.test',
            'momo.collections.callback_secret' => 'callback-secret',
            'momo.collections.target_environment' => 'sandbox',
            'momo.collections.base_url' => 'https://sandbox.momodeveloper.mtn.com',
        ]);
    }

    private function configurePaypal(): void
    {
        Cache::flush();
        $this->enableDonationProvider('paypal');

        config([
            'paypal.base_url' => 'https://api-m.sandbox.paypal.com',
            'paypal.client_id' => 'paypal-client-id',
            'paypal.client_secret' => 'paypal-client-secret',
            'paypal.webhook_id' => 'WH-123',
            'paypal.verify_webhooks' => true,
        ]);
    }

    private function enableDonationProvider(string $key): void
    {
        $providers = collect(config('donations.providers'))
            ->map(function (array $provider) use ($key): array {
                if (($provider['key'] ?? null) === $key) {
                    $provider['enabled'] = true;
                }

                return $provider;
            })
            ->all();

        config(['donations.providers' => $providers]);
    }

    private function createPendingPaypalIntent(): PaymentIntent
    {
        $this->configurePaypal();

        Http::fake([
            'https://api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response(['access_token' => 'paypal-token', 'expires_in' => 3600], 200),
            'https://api-m.sandbox.paypal.com/v2/checkout/orders' => Http::response($this->paypalOrderPayload(), 201),
        ]);

        $this->postJson('/api/v1/public/donation-intents', $this->paypalPayload())
            ->assertCreated();

        Http::fake([]);

        return PaymentIntent::firstOrFail()->load(['donation', 'provider']);
    }

    private function actingAsPaymentViewer(): User
    {
        Permission::firstOrCreate(['name' => 'payments.view', 'guard_name' => 'web'], ['group' => 'payments']);

        $user = User::create([
            'name' => 'Payment Viewer',
            'email' => 'payment-viewer@example.test',
            'password' => 'password',
            'status' => User::STATUS_ACTIVE,
            'email_verified_at' => now(),
        ]);

        $user->givePermissionTo('payments.view');
        Sanctum::actingAs($user);

        return $user;
    }

    private function momoPayload(): array
    {
        return [
            'frequency' => 'one_time',
            'currency' => 'XAF',
            'amount' => 5000,
            'purpose' => 'greatest_need',
            'payment_provider' => 'momo',
            'donor' => [
                'name' => 'Grace Donor',
                'email' => 'grace@example.com',
                'phone' => '+237670000000',
                'country' => 'CM',
            ],
            'anonymous' => false,
            'payment_consent' => true,
        ];
    }

    private function paypalPayload(array $overrides = []): array
    {
        return array_replace_recursive([
            'frequency' => 'one_time',
            'currency' => 'USD',
            'amount' => 25,
            'purpose' => 'greatest_need',
            'payment_provider' => 'paypal',
            'donor' => [
                'name' => 'Grace Donor',
                'email' => 'grace@example.com',
                'phone' => '+237600000000',
                'country' => 'CM',
            ],
            'anonymous' => false,
            'client_reference' => 'paypal-client-reference',
        ], $overrides);
    }

    private function paypalOrderPayload(array $overrides = []): array
    {
        return array_replace_recursive([
            'id' => 'ORDER-123',
            'status' => 'CREATED',
            'links' => [
                [
                    'href' => 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER-123',
                    'rel' => 'approve',
                    'method' => 'GET',
                ],
            ],
        ], $overrides);
    }

    private function paypalCapturePayload(array $captureOverrides = []): array
    {
        return [
            'id' => 'ORDER-123',
            'status' => 'COMPLETED',
            'purchase_units' => [
                [
                    'reference_id' => PaymentIntent::first()?->uuid ?? 'intent-uuid',
                    'payments' => [
                        'captures' => [
                            array_replace_recursive([
                                'id' => 'CAPTURE-123',
                                'status' => 'COMPLETED',
                                'amount' => [
                                    'currency_code' => 'USD',
                                    'value' => '25.00',
                                ],
                            ], $captureOverrides),
                        ],
                    ],
                ],
            ],
        ];
    }

    private function paypalWebhookPayload(string $orderId): array
    {
        return [
            'id' => 'WH-EVENT-123',
            'event_type' => 'PAYMENT.CAPTURE.COMPLETED',
            'resource' => [
                'id' => 'CAPTURE-123',
                'status' => 'COMPLETED',
                'amount' => [
                    'currency_code' => 'USD',
                    'value' => '25.00',
                ],
                'supplementary_data' => [
                    'related_ids' => [
                        'order_id' => $orderId,
                    ],
                ],
            ],
        ];
    }

    private function withPaypalWebhookHeaders(): self
    {
        return $this->withHeaders([
            'PAYPAL-AUTH-ALGO' => 'SHA256withRSA',
            'PAYPAL-CERT-URL' => 'https://api-m.sandbox.paypal.com/certs/test',
            'PAYPAL-TRANSMISSION-ID' => 'transmission-id',
            'PAYPAL-TRANSMISSION-SIG' => 'signature',
            'PAYPAL-TRANSMISSION-TIME' => now()->toISOString(),
        ]);
    }

    private function cardPayload(array $overrides = []): array
    {
        return array_replace_recursive([
            'frequency' => 'one_time',
            'currency' => 'USD',
            'amount' => 25,
            'purpose' => 'greatest_need',
            'payment_provider' => 'cards',
            'donor' => [
                'name' => 'Grace Donor',
                'email' => 'grace@example.com',
                'phone' => '+237600000000',
                'country' => 'CM',
            ],
            'anonymous' => false,
        ], $overrides);
    }
}
