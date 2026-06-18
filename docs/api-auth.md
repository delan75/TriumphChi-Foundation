# API Authentication

The backend uses Laravel Sanctum personal access tokens for API clients.

Base path:

```text
/api/v1
```

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
  "password": "secure-password",
  "password_confirmation": "secure-password",
  "preferred_locale": "en",
  "device_name": "Postman"
}
```

Successful registrations return a Sanctum token and the same user context shape as login. Registered users do not receive privileged roles or permissions automatically.

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
    "token_type": "Bearer"
  },
  "user": {
    "id": 1,
    "name": "Staff User",
    "email": "staff@example.org",
    "preferred_locale": "en",
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

## Current User

```http
GET /api/v1/auth/me
Authorization: Bearer 1|...
Accept: application/json
```

The response includes stable permission keys. Clients should use permissions for UI and API decisions, not role names.

## Seeded Super Administrator

`RolePermissionSeeder` creates one super administrator account for controlled system bootstrap:

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
