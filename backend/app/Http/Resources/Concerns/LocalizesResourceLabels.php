<?php

namespace App\Http\Resources\Concerns;

use App\Support\Localization\LocaleResolver;
use Carbon\Carbon;

trait LocalizesResourceLabels
{
    protected function localizedLabel(string $group, mixed $value): ?string
    {
        $this->applyResourceLocale();

        $normalizedValue = $this->normalizedLabelValue($value);

        if ($normalizedValue === null) {
            return null;
        }

        $key = "labels.{$group}.{$normalizedValue}";
        $label = __($key);

        if ($label === $key) {
            return ucwords(str_replace('_', ' ', $normalizedValue));
        }

        return $label;
    }

    protected function normalizedLabelValue(mixed $value): ?string
    {
        if (is_object($value) && property_exists($value, 'value')) {
            $value = $value->value;
        }

        if ($value === null || $value === '') {
            return null;
        }

        return (string) $value;
    }

    private function applyResourceLocale(): void
    {
        $request = request();
        $locale = app(LocaleResolver::class)->resolve($request);

        app()->setLocale($locale);
        Carbon::setLocale($locale);
    }
}
