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
];
