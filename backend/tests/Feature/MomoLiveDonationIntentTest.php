<?php

namespace Tests\Feature;

use App\Models\PaymentIntent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MomoLiveDonationIntentTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_donation_intent_can_start_real_momo_request_when_live_testing_enabled(): void
    {
        if (! filter_var(env('MOMO_COLLECTIONS_RUN_LIVE_TESTS', false), FILTER_VALIDATE_BOOLEAN)) {
            $this->markTestSkipped('Set MOMO_COLLECTIONS_RUN_LIVE_TESTS=true to run the live MoMo sandbox donation-intent test.');
        }

        $this->configureLiveMomoFromEnvironment();

        $currency = (string) env('MOMO_COLLECTIONS_LIVE_TEST_CURRENCY', 'XAF');
        $amount = (float) env('MOMO_COLLECTIONS_LIVE_TEST_AMOUNT', 100);
        $msisdn = (string) env('MOMO_COLLECTIONS_LIVE_TEST_MSISDN');

        if (! in_array($currency, $this->momoProviderCurrencies(), true)) {
            $this->markTestSkipped("MoMo provider is not configured for {$currency}. Set MOMO_COLLECTIONS_CURRENCIES={$currency} for this live test.");
        }

        $response = $this->postJson('/api/v1/public/donation-intents', [
            'frequency' => 'one_time',
            'currency' => $currency,
            'amount' => $amount,
            'purpose' => 'greatest_need',
            'payment_provider' => 'momo',
            'donor' => [
                'name' => 'MoMo Sandbox Donor',
                'email' => 'momo-sandbox@example.test',
                'phone' => $msisdn,
                'country' => 'CM',
            ],
            'anonymous' => false,
            'payment_consent' => true,
        ]);

        if (! $response->isCreated()) {
            fwrite(STDERR, PHP_EOL.'MoMo live donation-intent response: '.$response->getContent().PHP_EOL);
        }

        $response
            ->assertCreated()
            ->assertJsonPath('data.payment_provider.key', 'momo')
            ->assertJsonPath('data.status', 'pending');

        $intent = PaymentIntent::query()->firstOrFail();

        $this->assertNotEmpty($intent->provider_intent_id);
        $this->assertSame('pending', $intent->status);
        $this->assertNotEmpty($intent->metadata['momo_callback_hash'] ?? null);
    }

    private function configureLiveMomoFromEnvironment(): void
    {
        Cache::flush();

        $required = [
            'MOMO_COLLECTIONS_SUBSCRIPTION_KEY',
            'MOMO_COLLECTIONS_API_USER',
            'MOMO_COLLECTIONS_API_KEY',
            'MOMO_COLLECTIONS_LIVE_TEST_MSISDN',
        ];

        foreach ($required as $key) {
            if (! env($key)) {
                $this->markTestSkipped("Set {$key} before running the live MoMo sandbox donation-intent test.");
            }
        }

        config([
            'momo.collections.environment' => env('MOMO_COLLECTIONS_ENVIRONMENT', 'sandbox'),
            'momo.collections.target_environment' => env('MOMO_COLLECTIONS_TARGET_ENVIRONMENT', 'sandbox'),
            'momo.collections.base_url' => env('MOMO_COLLECTIONS_BASE_URL', 'https://sandbox.momodeveloper.mtn.com'),
            'momo.collections.subscription_key' => env('MOMO_COLLECTIONS_SUBSCRIPTION_KEY'),
            'momo.collections.api_user' => env('MOMO_COLLECTIONS_API_USER'),
            'momo.collections.api_key' => env('MOMO_COLLECTIONS_API_KEY'),
            'momo.collections.callback_base_url' => env('MOMO_COLLECTIONS_CALLBACK_BASE_URL', config('app.url')),
            'momo.collections.callback_secret' => env('MOMO_COLLECTIONS_CALLBACK_SECRET', config('app.key')),
            'momo.collections.timeout_seconds' => (int) env('MOMO_COLLECTIONS_TIMEOUT_SECONDS', 15),
            'momo.collections.token_cache_seconds' => (int) env('MOMO_COLLECTIONS_TOKEN_CACHE_SECONDS', 3300),
        ]);
    }

    private function momoProviderCurrencies(): array
    {
        foreach (config('donations.providers') as $provider) {
            if (($provider['key'] ?? null) === 'momo') {
                return $provider['currencies'] ?? [];
            }
        }

        return [];
    }
}
