<?php

return [
    'environment' => env('PAYPAL_ENVIRONMENT', 'sandbox'),
    'base_url' => env('PAYPAL_BASE_URL', 'https://api-m.sandbox.paypal.com'),
    'client_id' => env('PAYPAL_CLIENT_ID'),
    'client_secret' => env('PAYPAL_CLIENT_SECRET'),
    'webhook_id' => env('PAYPAL_WEBHOOK_ID'),
    'verify_webhooks' => (bool) env('PAYPAL_VERIFY_WEBHOOKS', true),
    'timeout_seconds' => (int) env('PAYPAL_TIMEOUT_SECONDS', 15),
    'token_cache_seconds' => (int) env('PAYPAL_TOKEN_CACHE_SECONDS', 3300),
];
