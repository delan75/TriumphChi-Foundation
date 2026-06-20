<?php

return [
    /*
    |--------------------------------------------------------------------------
    | API token lifecycle
    |--------------------------------------------------------------------------
    |
    | Access tokens are intentionally short enough to reduce damage from leaked
    | credentials, while still being practical for API clients and staff users.
    |
    */
    'token_expiration_days' => (int) env('AUTH_TOKEN_EXPIRATION_DAYS', 30),
    'rotate_tokens_on_login' => (bool) env('AUTH_ROTATE_TOKENS_ON_LOGIN', true),

    /*
    |--------------------------------------------------------------------------
    | OAuth callback exchange
    |--------------------------------------------------------------------------
    |
    | OAuth redirects never expose Sanctum tokens directly. The backend creates
    | a short-lived one-time code, then the frontend exchanges it over the API.
    |
    */
    'oauth_code_expiration_minutes' => (int) env('OAUTH_LOGIN_CODE_EXPIRATION_MINUTES', 5),

    /*
    |--------------------------------------------------------------------------
    | Account verification OTP
    |--------------------------------------------------------------------------
    */
    'verification_otp_expiration_minutes' => (int) env('AUTH_VERIFICATION_OTP_EXPIRATION_MINUTES', 10),
    'verification_otp_max_attempts' => (int) env('AUTH_VERIFICATION_OTP_MAX_ATTEMPTS', 5),
    'otp_channels' => [
        'sms' => [
            'webhook_url' => env('AUTH_OTP_SMS_WEBHOOK_URL'),
        ],
        'whatsapp' => [
            'webhook_url' => env('AUTH_OTP_WHATSAPP_WEBHOOK_URL'),
        ],
    ],
];
