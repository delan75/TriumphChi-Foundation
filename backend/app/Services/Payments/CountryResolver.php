<?php

namespace App\Services\Payments;

use Illuminate\Http\Request;

class CountryResolver
{
    /**
     * @return array{country: string|null, source: string|null, signals: array<string, string|null>}
     */
    public function resolve(Request $request, array $donorData = []): array
    {
        $selectedCountry = $this->normalizeCountry($donorData['country'] ?? $request->input('country'));
        $phoneCountry = $this->countryFromPhone((string) ($donorData['phone'] ?? $request->input('phone', '')));
        $headerCountry = $this->countryFromHeaders($request);
        $localeCountry = $this->countryFromAcceptLanguage((string) $request->header('Accept-Language', ''));

        foreach ([
            'selected' => $selectedCountry,
            'phone' => $phoneCountry,
            'geo_header' => $headerCountry,
            'accept_language' => $localeCountry,
        ] as $source => $country) {
            if ($country) {
                return [
                    'country' => $country,
                    'source' => $source,
                    'signals' => [
                        'selected' => $selectedCountry,
                        'phone' => $phoneCountry,
                        'geo_header' => $headerCountry,
                        'accept_language' => $localeCountry,
                    ],
                ];
            }
        }

        return [
            'country' => null,
            'source' => null,
            'signals' => [
                'selected' => null,
                'phone' => null,
                'geo_header' => null,
                'accept_language' => null,
            ],
        ];
    }

    public function countryFromPhone(string $phone): ?string
    {
        $normalized = ltrim(preg_replace('/\D+/', '', $phone) ?? '', '0');

        if ($normalized === '') {
            return null;
        }

        $prefixes = [
            '237' => 'CM',
            '233' => 'GH',
            '256' => 'UG',
            '250' => 'RW',
            '27' => 'ZA',
            '234' => 'NG',
            '44' => 'GB',
            '33' => 'FR',
            '1' => 'US',
        ];

        foreach ($prefixes as $prefix => $country) {
            if (str_starts_with($normalized, $prefix)) {
                return $country;
            }
        }

        return null;
    }

    private function countryFromHeaders(Request $request): ?string
    {
        foreach ([
            'CF-IPCountry',
            'X-Vercel-IP-Country',
            'CloudFront-Viewer-Country',
            'X-AppEngine-Country',
        ] as $header) {
            $country = $this->normalizeCountry($request->header($header));

            if ($country && $country !== 'XX') {
                return $country;
            }
        }

        return null;
    }

    private function countryFromAcceptLanguage(string $acceptLanguage): ?string
    {
        if (preg_match('/(?:^|,)[a-z]{2,3}-([A-Z]{2})(?:[;,]|$)/', $acceptLanguage, $matches)) {
            return $this->normalizeCountry($matches[1]);
        }

        return null;
    }

    private function normalizeCountry(mixed $country): ?string
    {
        $country = strtoupper(trim((string) $country));

        return preg_match('/^[A-Z]{2}$/', $country) ? $country : null;
    }
}
