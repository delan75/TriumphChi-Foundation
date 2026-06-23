<?php

namespace Tests\Feature;

use App\Models\Donation;
use App\Models\Donor;
use App\Models\PaymentIntent;
use App\Models\PaymentProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicDonationIntentTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_donation_config_returns_provider_agnostic_options(): void
    {
        $this->getJson('/api/v1/public/donation-config')
            ->assertOk()
            ->assertJsonPath('data.default_currency', 'USD')
            ->assertJsonPath('data.default_purpose', 'greatest_need')
            ->assertJsonPath('data.currencies.USD.minimum_amount', 10)
            ->assertJsonFragment(['key' => 'cards'])
            ->assertJsonFragment(['key' => 'paypal'])
            ->assertJsonFragment(['key' => 'momo'])
            ->assertJsonFragment(['key' => 'bank_transfer']);
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
            'amount' => 5,
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
}
