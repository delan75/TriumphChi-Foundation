# API Authentication

The backend uses Laravel Sanctum personal access tokens for API clients.

Base path:

```text
/api/v1
```

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
