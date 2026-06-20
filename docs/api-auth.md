# API Authentication

The backend uses Laravel Sanctum personal access tokens for API clients and Laravel Socialite for external identity providers.

Base path:

```text
/api/v1
```

## Security Model

- Access tokens expire after 30 days by default.
- Login rotates existing tokens for the same device name.
- Logout revokes the current token.
- Logout all revokes every token for the account.
- Protected APIs require `auth:sanctum`, an active account, route permissions, and resource policies where applicable.
- Local email/password accounts are created as `pending` until email verification is completed.
- OAuth redirects never expose Sanctum tokens in URLs.
- Email verification supports signed-link verification and OTP verification.

Token settings:

```text
SANCTUM_TOKEN_EXPIRATION_MINUTES=43200
AUTH_TOKEN_EXPIRATION_DAYS=30
AUTH_ROTATE_TOKENS_ON_LOGIN=true
OAUTH_LOGIN_CODE_EXPIRATION_MINUTES=5
AUTH_EMAIL_VERIFICATION_EXPIRE_MINUTES=60
AUTH_VERIFICATION_OTP_EXPIRATION_MINUTES=10
AUTH_VERIFICATION_OTP_MAX_ATTEMPTS=5
AUTH_OTP_SMS_WEBHOOK_URL=
AUTH_OTP_WHATSAPP_WEBHOOK_URL=
```

Email verification and password reset delivery use Laravel mail configuration. The default local mailer is `log`; production should configure SMTP or another approved mail transport.

## Register

```http
POST /api/v1/auth/register
Accept: application/json
Accept-Language: en
Content-Type: application/json
```

```json
{
  "name": "New User",
  "email": "new.user@example.org",
  "phone": "+237600000000",
  "password": "secure-password",
  "password_confirmation": "secure-password",
  "preferred_locale": "en",
  "device_name": "Postman"
}
```

Successful local registrations return the created user and no token. The account remains pending until email verification.

```json
{
  "message": "Registration successful. Please verify your email address before signing in.",
  "token": null,
  "user": {
    "id": 1,
    "name": "New User",
    "email": "new.user@example.org",
    "phone": "+237600000000",
    "preferred_locale": "en",
    "status": "pending",
    "email_verified_at": null,
    "roles": [],
    "permissions": []
  }
}
```

Registration sends the signed verification email and an email OTP by default.

## Email Verification

Two verification methods are supported.

Signed link verification:

```http
GET /api/v1/auth/email/verify/{id}/{hash}?expires=...&signature=...
```

OTP verification:

```http
POST /api/v1/auth/email/otp/verify
Accept: application/json
Content-Type: application/json
```

```json
{
  "email": "new.user@example.org",
  "code": "123456",
  "device_name": "web-client"
}
```

Successful OTP verification activates the account and returns a Sanctum token:

```json
{
  "message": "Email address verified successfully.",
  "token": {
    "access_token": "1|...",
    "token_type": "Bearer",
    "expires_at": "2026-07-20T10:00:00.000000Z"
  },
  "user": {
    "email": "new.user@example.org",
    "status": "active",
    "email_verified_at": "2026-06-20T10:00:00.000000Z"
  }
}
```

Request a new verification code:

```http
POST /api/v1/auth/email/otp/resend
Accept: application/json
Content-Type: application/json
```

```json
{
  "email": "new.user@example.org",
  "channel": "email"
}
```

Supported OTP channels:

- `email`: available by default through Laravel notifications
- `sms`: requires `AUTH_OTP_SMS_WEBHOOK_URL`
- `whatsapp`: requires `AUTH_OTP_WHATSAPP_WEBHOOK_URL`

SMS and WhatsApp verification require a phone number on the user account. If a channel is not configured, the API returns a clear unavailable-channel response and the user can continue with email.

## Login

```http
POST /api/v1/auth/login
Accept: application/json
Accept-Language: en
Content-Type: application/json
```

```json
{
  "email": "staff@example.org",
  "password": "password",
  "device_name": "Postman"
}
```

Successful response:

```json
{
  "message": "Login successful.",
  "token": {
    "access_token": "1|...",
    "token_type": "Bearer",
    "expires_at": "2026-07-20T10:00:00.000000Z"
  },
  "user": {
    "id": 1,
    "name": "Staff User",
    "email": "staff@example.org",
    "preferred_locale": "en",
    "status": "active",
    "roles": ["ngo_staff"],
    "permissions": ["beneficiaries.view"]
  }
}
```

Use the returned token on protected requests:

```http
Authorization: Bearer 1|...
Accept: application/json
Accept-Language: en
```

## OAuth

Supported providers:

- Google
- Facebook

Redirect to the provider:

```http
GET /api/v1/auth/google/redirect
GET /api/v1/auth/facebook/redirect
```

Provider callbacks create or resolve the user, link the provider, and redirect to the frontend with a short-lived code:

```text
/{locale}/oauth/callback?code=...
```

The frontend exchanges that code for a Sanctum token:

```http
POST /api/v1/auth/oauth/exchange
Accept: application/json
Content-Type: application/json
```

```json
{
  "code": "one-time-code",
  "device_name": "web-client"
}
```

OAuth codes are stored hashed, expire quickly, and can only be consumed once.

## Current User

```http
GET /api/v1/auth/me
Authorization: Bearer 1|...
Accept: application/json
```

The response includes stable permission keys. Clients should use permissions for UI and API decisions, not role names.

## Seeded Super Administrator

`RolePermissionSeeder` creates one verified, active super administrator account for controlled system bootstrap:

```text
SUPER_ADMIN_NAME
SUPER_ADMIN_EMAIL
SUPER_ADMIN_PASSWORD
SUPER_ADMIN_LOCALE
```

The seeded user is assigned the `super_administrator` role, receives all defined permissions, and is allowed through future authorization checks by the backend gate.

`SUPER_ADMIN_PASSWORD` must be set before seeding outside local and testing environments.

## Logout Current Token

```http
POST /api/v1/auth/logout
Authorization: Bearer 1|...
Accept: application/json
```

## Logout All Tokens

```http
POST /api/v1/auth/logout-all
Authorization: Bearer 1|...
Accept: application/json
```

## Audit Events

The authentication layer writes audit records for:

- registration
- failed login
- successful login
- OAuth registration and provider linking
- OAuth login code creation
- verification OTP sent, failed, and verified
- password reset request and completion
- logout and logout all devices
- email verification

## Localization

Send `Accept-Language: fr` to receive supported API messages in French.

Example invalid login response:

```json
{
  "message": "Les identifiants fournis sont incorrects.",
  "errors": {
    "email": ["Les identifiants fournis sont incorrects."]
  }
}
```
