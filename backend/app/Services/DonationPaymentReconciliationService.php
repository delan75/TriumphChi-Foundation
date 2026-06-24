<?php

namespace App\Services;

use App\Exceptions\PaymentProviderException;
use App\Models\Donation;
use App\Models\PaymentIntent;
use App\Services\Payments\PaypalDonationProvider;
use Illuminate\Support\Facades\Log;

class DonationPaymentReconciliationService
{
    public function __construct(
        private readonly PaypalDonationProvider $paypal,
    ) {
    }

    public function reconcileDonation(Donation $donation): Donation
    {
        $intent = $this->latestOpenPaypalIntent($donation);

        if (! $intent) {
            return $this->loadDonation($donation);
        }

        $this->paypal->refreshStatus($intent);

        return $this->loadDonation($donation->refresh());
    }

    public function reconcileOpenPaypalDonations(int $limit = 100): array
    {
        $summary = [
            'checked' => 0,
            'updated' => 0,
            'failed' => 0,
        ];

        PaymentIntent::query()
            ->with(['donation', 'provider'])
            ->whereIn('status', ['pending', 'processing'])
            ->whereHas('provider', fn ($query) => $query->where('key', 'paypal'))
            ->whereNotNull('provider_intent_id')
            ->oldest('updated_at')
            ->limit($limit)
            ->get()
            ->each(function (PaymentIntent $intent) use (&$summary): void {
                $summary['checked']++;
                $before = $intent->status.'|'.($intent->donation->status->value ?? $intent->donation->status);

                try {
                    $updated = $this->paypal->refreshStatus($intent);
                    $after = $updated->status.'|'.($updated->donation->status->value ?? $updated->donation->status);

                    if ($before !== $after) {
                        $summary['updated']++;
                    }
                } catch (PaymentProviderException $exception) {
                    $summary['failed']++;

                    Log::warning('PayPal donation reconciliation failed.', [
                        'intent_uuid' => $intent->uuid,
                        'donation_uuid' => $intent->donation?->uuid,
                        'message' => $exception->getMessage(),
                    ]);
                }
            });

        return $summary;
    }

    private function latestOpenPaypalIntent(Donation $donation): ?PaymentIntent
    {
        return $donation->paymentIntents()
            ->with(['donation', 'provider'])
            ->whereIn('status', ['pending', 'processing'])
            ->whereHas('provider', fn ($query) => $query->where('key', 'paypal'))
            ->whereNotNull('provider_intent_id')
            ->latest()
            ->first();
    }

    private function loadDonation(Donation $donation): Donation
    {
        return $donation->load([
            'donor',
            'fund',
            'allocations.educationalNeed.beneficiary',
            'documents',
            'paymentIntents.provider',
            'paymentTransactions.provider',
        ]);
    }
}
