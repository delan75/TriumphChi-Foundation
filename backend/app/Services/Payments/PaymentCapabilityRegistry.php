<?php

namespace App\Services\Payments;

class PaymentCapabilityRegistry
{
    public function providerSupports(array $providerConfig, ?string $country, string $currency): bool
    {
        $providerKey = (string) ($providerConfig['key'] ?? '');
        $country = $country ? strtoupper($country) : null;
        $currency = strtoupper($currency);

        if (! in_array($currency, $providerConfig['currencies'] ?? [], true)) {
            return false;
        }

        if (! $this->providerSupportsCountry($providerConfig, $country)) {
            return false;
        }

        if ($providerKey === 'momo') {
            return $this->momoCurrencyForCountry($country) === $currency;
        }

        return true;
    }

    public function providerSupportsCountry(array $providerConfig, ?string $country): bool
    {
        $countryCodes = array_map('strtoupper', $providerConfig['country_codes'] ?? ['*']);

        return in_array('*', $countryCodes, true) || ($country && in_array(strtoupper($country), $countryCodes, true));
    }

    public function momoCurrencyForCountry(?string $country): ?string
    {
        if (! $country) {
            return null;
        }

        return $this->momoCountryCurrencyMap()[strtoupper($country)] ?? null;
    }

    public function momoCountryCurrencyMap(): array
    {
        return config('momo.collections.country_currency_map', ['CM' => 'XAF']);
    }
}
