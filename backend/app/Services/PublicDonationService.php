<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\Donor;
use App\Models\Fund;
use App\Models\PaymentIntent;
use App\Models\PaymentProvider;
use App\Services\Payments\CountryResolver;
use App\Services\Payments\MtnMomoCollectionsService;
use App\Services\Payments\PaymentCapabilityRegistry;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Exceptions\SimilarDonationPendingException;
use Illuminate\Http\Request;

class PublicDonationService
{
    public function __construct(
        private readonly MtnMomoCollectionsService $momo,
        private readonly CountryResolver $countries,
        private readonly PaymentCapabilityRegistry $capabilities,
    )
    {
    }

    public function config(?Request $request = null): array
    {
        $resolvedCountry = $request ? $this->countries->resolve($request) : ['country' => null, 'source' => null, 'signals' => []];
        $providers = collect(config('donations.providers', []))
            ->filter(fn (array $provider): bool => (bool) ($provider['enabled'] ?? false))
            ->values()
            ->map(fn (array $provider): array => [
                'key' => $provider['key'],
                'name' => __('labels.payment_providers.'.$provider['key'], [], app()->getLocale()) ?: $provider['name'],
                'method' => $provider['method'],
                'category' => $provider['category'],
                'currencies' => $provider['currencies'],
                'country_codes' => $provider['country_codes'] ?? ['*'],
                'country_currency_map' => $provider['key'] === 'momo' ? $this->capabilities->momoCountryCurrencyMap() : null,
            ]);

        return [
            'default_currency' => config('donations.default_currency'),
            'default_frequency' => config('donations.default_frequency'),
            'default_purpose' => config('donations.default_purpose'),
            'detected_country' => $resolvedCountry,
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
        if ($existingIntent = $this->findExistingIntentByClientReference($data)) {
            return $existingIntent->load(['donation', 'provider']);
        }

        if (! (bool) ($data['similar_donation_acknowledged'] ?? false)) {
            $similarDonation = $this->findSimilarPendingDonation($data);

            if ($similarDonation) {
                throw new SimilarDonationPendingException($this->similarDonationPayload($similarDonation));
            }
        }

        $intent = DB::transaction(function () use ($data): PaymentIntent {
            $providerConfig = collect(config('donations.providers', []))->firstWhere('key', $data['payment_provider']);
            $purposeConfig = collect(config('donations.purposes', []))->firstWhere('key', $data['purpose']);
            $provider = $this->syncProvider($providerConfig);
            $fund = $this->findOrCreateFund($purposeConfig, $data['currency']);
            $donor = $this->findOrCreateDonor($data['donor'], (bool) ($data['anonymous'] ?? false));
            $idempotencyKey = $this->idempotencyKey($data);

            $donation = Donation::create([
                'idempotency_key' => $idempotencyKey,
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

    private function findExistingIntentByClientReference(array $data): ?PaymentIntent
    {
        $idempotencyKey = $this->idempotencyKey($data);

        if (! $idempotencyKey) {
            return null;
        }

        $donation = Donation::query()
            ->where('idempotency_key', $idempotencyKey)
            ->with(['paymentIntents.provider', 'paymentIntents.donation'])
            ->first();

        return $donation?->paymentIntents()->latest()->first();
    }

    private function findSimilarPendingDonation(array $data): ?Donation
    {
        return Donation::query()
            ->where('amount', $data['amount'])
            ->where('currency', $data['currency'])
            ->where('provider', $data['payment_provider'])
            ->where('status', 'pending')
            ->where('created_at', '>=', now()->subMinutes(30))
            ->whereHas('donor', fn ($query) => $query->where('email', strtolower($data['donor']['email'])))
            ->with(['donor', 'paymentIntents.provider'])
            ->latest()
            ->first();
    }

    private function similarDonationPayload(Donation $donation): array
    {
        $intent = $donation->paymentIntents()->latest()->first();

        return [
            'reference_number' => $donation->reference_number,
            'amount' => $donation->amount,
            'currency' => $donation->currency,
            'provider' => $donation->provider,
            'status' => $donation->status->value ?? $donation->status,
            'created_at' => $donation->created_at?->toISOString(),
            'intent_uuid' => $intent?->uuid,
        ];
    }

    private function idempotencyKey(array $data): ?string
    {
        if (blank($data['client_reference'] ?? null)) {
            return null;
        }

        return hash('sha256', Str::limit((string) $data['client_reference'], 120, ''));
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
