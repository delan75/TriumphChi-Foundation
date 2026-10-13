<?php

namespace App\Support\Localization;

use Illuminate\Http\Request;

class LocaleResolver
{
    public function resolve(Request $request): string
    {
        $supportedLocales = $this->supportedLocales();

        return $this->normalize($request->header('X-Locale'), $supportedLocales)
            ?? $this->normalize($request->query('locale'), $supportedLocales)
            ?? $this->authenticatedUserLocale($request, $supportedLocales)
            ?? $this->preferredHeaderLocale($request, $supportedLocales)
            ?? $this->fallbackLocale();
    }

    /**
     * @return array<int, string>
     */
    private function supportedLocales(): array
    {
        return config('localization.supported_locales', ['en', 'fr']);
    }

    /**
     * @param  array<int, string>  $supportedLocales
     */
    private function normalize(mixed $locale, array $supportedLocales): ?string
    {
        if (! is_string($locale) || $locale === '') {
            return null;
        }

        $normalizedLocale = strtolower(str_replace('_', '-', $locale));
        $primaryLocale = explode('-', $normalizedLocale)[0];

        return in_array($primaryLocale, $supportedLocales, true)
            ? $primaryLocale
            : null;
    }

    private function fallbackLocale(): string
    {
        return config('localization.fallback_locale', config('app.fallback_locale', 'en'));
    }

    /**
     * @param  array<int, string>  $supportedLocales
     */
    private function preferredHeaderLocale(Request $request, array $supportedLocales): ?string
    {
        if (! $request->headers->has('Accept-Language') || trim((string) $request->header('Accept-Language')) === '') {
            return null;
        }

        return $this->normalize($request->getPreferredLanguage($supportedLocales), $supportedLocales);
    }

    /**
     * @param  array<int, string>  $supportedLocales
     */
    private function authenticatedUserLocale(Request $request, array $supportedLocales): ?string
    {
        return $this->normalize($request->user()?->preferred_locale, $supportedLocales)
            ?? $this->normalize(auth('sanctum')->user()?->preferred_locale, $supportedLocales)
            ?? $this->normalize(auth()->user()?->preferred_locale, $supportedLocales);
    }
}
