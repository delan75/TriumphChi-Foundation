<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePublicDonationIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $config = config('donations');
        $currencies = array_keys($config['currencies'] ?? []);
        $purposes = collect($config['purposes'] ?? [])->pluck('key')->all();
        $frequencies = collect($config['frequencies'] ?? [])->pluck('key')->all();
        $providers = collect($config['providers'] ?? [])
            ->where('enabled', true)
            ->pluck('key')
            ->all();

        return [
            'frequency' => ['required', 'string', Rule::in($frequencies)],
            'currency' => ['required', 'string', Rule::in($currencies)],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'purpose' => ['required', 'string', Rule::in($purposes)],
            'payment_provider' => ['required', 'string', Rule::in($providers)],
            'donor.name' => ['required', 'string', 'max:180'],
            'donor.email' => ['required', 'email', 'max:180'],
            'donor.phone' => ['nullable', 'string', 'max:40'],
            'donor.country' => ['required', 'string', 'size:2'],
            'anonymous' => ['sometimes', 'boolean'],
            'payment_consent' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $currency = (string) $this->input('currency');
            $providerKey = (string) $this->input('payment_provider');
            $amount = (float) $this->input('amount');
            $currencyConfig = config("donations.currencies.{$currency}");
            $providerConfig = collect(config('donations.providers', []))->firstWhere('key', $providerKey);

            if ($currencyConfig && $amount < (float) $currencyConfig['minimum_amount']) {
                $validator->errors()->add(
                    'amount',
                    __('api.errors.minimum_donation_amount', ['amount' => $currencyConfig['minimum_amount'], 'currency' => $currency]),
                );
            }

            if ($providerConfig && ! in_array($currency, $providerConfig['currencies'] ?? [], true)) {
                $validator->errors()->add(
                    'payment_provider',
                    __('api.errors.payment_provider_currency_unsupported'),
                );
            }

            if ($providerKey === 'momo') {
                $phone = (string) $this->input('donor.phone');
                $country = strtoupper((string) $this->input('donor.country'));

                if ($phone === '') {
                    $validator->errors()->add('donor.phone', __('api.errors.momo_phone_required'));
                }

                if ($phone !== '' && ! preg_match('/^\+?[1-9][0-9]{7,14}$/', preg_replace('/[\s-]+/', '', $phone))) {
                    $validator->errors()->add('donor.phone', __('api.errors.momo_phone_invalid'));
                }

                if (! $this->boolean('payment_consent')) {
                    $validator->errors()->add('payment_consent', __('api.errors.momo_consent_required'));
                }

                $providerCountries = array_map('strtoupper', $providerConfig['country_codes'] ?? ['CM']);
                $providerAllowsCountry = in_array('*', $providerCountries, true) || in_array($country, $providerCountries, true);

                if (! $providerAllowsCountry) {
                    $validator->errors()->add('payment_provider', __('api.errors.momo_country_unsupported'));
                }

                if (! in_array($currency, $providerConfig['currencies'] ?? ['XAF'], true)) {
                    $validator->errors()->add('currency', __('api.errors.momo_currency_unsupported'));
                }
            }
        });
    }
}
