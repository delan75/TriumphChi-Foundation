<?php

namespace App\Http\Middleware;

use App\Support\Localization\LocaleResolver;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function __construct(private readonly LocaleResolver $locales) {}

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->locales->resolve($request);

        app()->setLocale($locale);
        Carbon::setLocale($locale);

        $response = $next($request);
        $locale = $this->locales->resolve($request);

        app()->setLocale($locale);
        Carbon::setLocale($locale);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }
}
