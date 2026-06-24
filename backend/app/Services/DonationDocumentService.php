<?php

namespace App\Services;

use App\Models\Donation;
use App\Models\DonationDocument;
use Illuminate\Support\Collection;

class DonationDocumentService
{
    public function ensureIssuedDocuments(Donation $donation, ?string $locale = null): Collection
    {
        $locale = $locale ?: app()->getLocale();
        $donation->loadMissing(['donor', 'fund']);
        $status = $donation->status->value ?? $donation->status;

        if ($status !== 'confirmed') {
            return $donation->documents()->latest()->get();
        }

        foreach (['receipt', 'invoice'] as $type) {
            $donation->documents()->firstOrCreate(
                ['type' => $type, 'locale' => $locale],
                [
                    'status' => 'issued',
                    'locale' => $locale,
                    'title' => $this->title($type, $locale),
                    'snapshot' => $this->snapshot($donation, $type, $locale),
                    'issued_at' => $donation->confirmed_at ?? now(),
                ],
            );
        }

        return $donation->documents()->latest('issued_at')->get();
    }

    public function snapshot(Donation $donation, string $type, string $locale): array
    {
        return [
            'type' => $type,
            'locale' => $locale,
            'organization' => [
                'name' => config('app.name', 'TriumphChi Foundation'),
                'mission' => $locale === 'fr'
                    ? "Soutenir l'education des enfants avec dignite et responsabilite."
                    : "Supporting children's education with dignity and accountability.",
            ],
            'donation' => [
                'uuid' => $donation->uuid,
                'reference_number' => $donation->reference_number,
                'amount' => $donation->amount,
                'currency' => $donation->currency,
                'method' => $donation->method,
                'provider' => $donation->provider,
                'provider_reference' => $donation->provider_reference,
                'status' => $donation->status->value ?? $donation->status,
                'donated_at' => $donation->donated_at?->toISOString(),
                'confirmed_at' => $donation->confirmed_at?->toISOString(),
            ],
            'donor' => [
                'name' => $donation->donor?->name ?: 'Anonymous donor',
                'email' => $donation->donor?->email,
                'type' => $donation->donor?->type,
            ],
            'fund' => [
                'code' => $donation->fund?->code,
                'name' => $donation->fund?->name,
                'currency' => $donation->fund?->currency,
            ],
            'message' => $locale === 'fr'
                ? "Merci pour votre generosite. Votre don aide a garder l'education accessible aux enfants."
                : 'Thank you for your generosity. Your gift helps keep education within reach for children.',
            'generated_at' => now()->toISOString(),
        ];
    }

    private function title(string $type, string $locale): string
    {
        return match ($type) {
            'invoice' => $locale === 'fr' ? 'Facture de don' : 'Donation Invoice',
            default => $locale === 'fr' ? 'Recu de don' : 'Donation Receipt',
        };
    }
}
