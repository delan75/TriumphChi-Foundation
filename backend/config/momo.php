<?php

return [
    'collections' => [
        'enabled' => env('MOMO_COLLECTIONS_ENABLED', false),
        'environment' => env('MOMO_COLLECTIONS_ENVIRONMENT', 'sandbox'),
        'target_environment' => env('MOMO_COLLECTIONS_TARGET_ENVIRONMENT', env('MOMO_COLLECTIONS_ENVIRONMENT', 'sandbox')),
        'base_url' => env('MOMO_COLLECTIONS_BASE_URL', 'https://sandbox.momodeveloper.mtn.com'),
        'subscription_key' => env('MOMO_COLLECTIONS_SUBSCRIPTION_KEY'),
        'api_user' => env('MOMO_COLLECTIONS_API_USER'),
        'api_key' => env('MOMO_COLLECTIONS_API_KEY'),
        'callback_base_url' => env('MOMO_COLLECTIONS_CALLBACK_BASE_URL', env('APP_URL')),
        'callback_secret' => env('MOMO_COLLECTIONS_CALLBACK_SECRET', env('APP_KEY')),
        'callback_allowed_ips' => array_filter(array_map('trim', explode(',', env('MOMO_COLLECTIONS_CALLBACK_ALLOWED_IPS', '')))),
        'timeout_seconds' => env('MOMO_COLLECTIONS_TIMEOUT_SECONDS', 15),
        'token_cache_seconds' => env('MOMO_COLLECTIONS_TOKEN_CACHE_SECONDS', 3300),
    ],
];
