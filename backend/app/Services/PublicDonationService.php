<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\Donor;
use App\Models\Fund;
use App\Models\PaymentIntent;
use App\Models\PaymentProvider;
use App\Services\Payments\MtnMomoCollectionsService;
use Illuminate\Support\Facades\DB;

class PublicDonationService
{
    public function __construct(private readonly MtnMomoCollectionsService $momo)
    {
    }

    public function config(): array
    {
        $providers = collect(config('donations.providers', []))
            ->filter(fn (array $provider): bool => (bool) ($provider['enabled'] ?? false))
            ->values()
            ->map(fn (array $provider): array => [
                'key' => $provider['key'],
                'name' => __('labels.payment_providers.'.$provider['key'], [], app()->getLocale()) ?: $provider['name'],
                'method' => $provider['method'],
                'category' => $provider['category'],
                'currencies' => $provider['currencies'],
            ]);

        return [
            'default_currency' => config('donations.default_currency'),
            'default_frequency' => config('donations.default_frequency'),
            'default_purpose' => config('donations.default_purpose'),
            'frequencies' => collect(config('donations.frequencies', []))->map(fn (array $frequency): array => [
                'key' => $frequency['key'],
                'label' => __('labels.donation_frequencies.'.$frequency['key'], [], app()->getLocale()) ?: $frequency['label'],
            ])->values(),
            'currencies' => config('donations.currencies'),
            'purposes' => collect(config('donations.purposes', []))->map(fn (array $purpose): array => [
                'key' => $purpose['key'],
                'label' => __('labels.donation_purposes.'.$purpose['key'], [], app()->getLocale()) ?: $purpose['label'],
            ])->values(),
            'payment_providers' => $providers,
        ];
    }

    public function createIntent(array $data): PaymentIntent
    {
        $intent = DB::transaction(function () use ($data): PaymentIntent {
            $providerConfig = collect(config('donations.providers', []))->firstWhere('key', $data['payment_provider']);
            $purposeConfig = collect(config('donations.purposes', []))->firstWhere('key', $data['purpose']);
            $provider = $this->syncProvider($providerConfig);
            $fund = $this->findOrCreateFund($purposeConfig, $data['currency']);
            $donor = $this->findOrCreateDonor($data['donor'], (bool) ($data['anonymous'] ?? false));

            $donation = Donation::create([
                'donor_id' => $donor->id,
                'fund_id' => $fund->id,
                'amount' => $data['amount'],
                'currency' => $data['currency'],
                'method' => $provider->method,
                'provider' => $provider->key,
                'status' => 'pending',
                'metadata' => [
                    'frequency' => $data['frequency'],
                    'purpose' => $data['purpose'],
                    'anonymous' => (bool) ($data['anonymous'] ?? false),
                    'country' => strtoupper($data['donor']['country']),
                    'source' => 'public_donate_page',
                ],
            ]);

            return PaymentIntent::create([
                'donation_id' => $donation->id,
                'payment_provider_id' => $provider->id,
                'amount' => $data['amount'],
                'currency' => $data['currency'],
                'frequency' => $data['frequency'],
                'purpose' => $data['purpose'],
                'status' => 'pending',
                'expires_at' => now()->addMinutes(30),
                'metadata' => [
                    'donor_country' => strtoupper($data['donor']['country']),
                    'anonymous' => (bool) ($data['anonymous'] ?? false),
                ],
            ])->load(['donation', 'provider']);
        });

        if ($intent->provider->key === 'momo') {
            return $this->momo->initiate($intent, $data['donor']);
        }

        return $intent;
    }

    private function syncProvider(array $providerConfig): PaymentProvider
    {
        return PaymentProvider::updateOrCreate(
            ['key' => $providerConfig['key']],
            [
                'name' => $providerConfig['name'],
                'method' => $providerConfig['method'],
                'category' => $providerConfig['category'],
                'status' => ($providerConfig['enabled'] ?? false) ? 'active' : 'inactive',
                'currencies' => $providerConfig['currencies'],
            ],
        );
    }

    private function findOrCreateFund(array $purposeConfig, string $currency): Fund
    {
        return Fund::firstOrCreate(
            ['slug' => $purposeConfig['fund_slug']],
            [
                'code' => str($purposeConfig['fund_slug'])->upper()->replace('-', '_')->limit(40, ''),
                'name' => $purposeConfig['fund_name'],
                'description' => $purposeConfig['label'],
                'currency' => $currency,
                'restriction_type' => $purposeConfig['key'] === 'greatest_need' ? 'unrestricted' : 'purpose_restricted',
                'status' => 'active',
            ],
        );
    }

    private function findOrCreateDonor(array $donorData, bool $anonymous): Donor
    {
        $donor = Donor::firstOrCreate(
            ['email' => strtolower($donorData['email'])],
            [
                'name' => $donorData['name'],
                'phone' => $donorData['phone'] ?? null,
                'type' => 'individual',
                'status' => 'active',
                'communication_preferences' => [
                    'country' => strtoupper($donorData['country']),
                    'anonymous_giving' => $anonymous,
                    'source' => 'public_donate_page',
                ],
            ],
        );

        $donor->fill([
            'name' => $donorData['name'],
            'phone' => $donorData['phone'] ?? $donor->phone,
            'communication_preferences' => array_merge($donor->communication_preferences ?? [], [
                'country' => strtoupper($donorData['country']),
                'anonymous_giving' => $anonymous,
            ]),
        ])->save();

        return $donor;
    }
}
