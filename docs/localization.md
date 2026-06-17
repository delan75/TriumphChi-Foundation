# Localization Standard

## Goal

The system supports English and French across public pages, dashboards, reports, validation errors, notifications, and API responses without duplicating operational records.

Localization is handled in layers:

- System labels use translation files.
- CMS and public content use translation tables.
- Domain data is stored once and returned as source data.

## Locale Resolution

API requests resolve locale in this order:

1. `X-Locale` request header
2. `locale` query parameter
3. Authenticated user's `preferred_locale`
4. `Accept-Language` request header
5. Application fallback locale

The response includes `Content-Language` so clients can confirm which locale was used.

## API Response Shape

APIs return stable keys and localized labels together.

Example:

```json
{
  "status": "active_support",
  "status_label": "Soutien actif"
}
```

Clients use stable keys for filtering, workflow rules, and persistence. Labels are for display only.

## What Uses Translation Files

Use Laravel language files for fixed system language:

- Status labels
- Permission labels
- Validation messages
- Dashboard labels
- Report column headings
- Notification subjects
- API response messages
- Lifecycle labels

Do not store columns such as `status_name_en` or `status_name_fr`.

## What Uses Translation Tables

Use database translation tables only for content that is genuinely written in different languages:

- Public pages
- Blog posts
- News posts
- Program descriptions
- SEO titles and descriptions
- Curated success stories
- Email templates

The base table owns identity, workflow state, and publishing rules. The translation table owns language-specific text.

## What Is Not Translated

Do not translate source facts:

- Beneficiary names
- School names
- Donor names
- Donation references
- Payment references
- Allocation records
- Audit records

These records remain the single source of truth.

## Backend Standard

The API localization standard is:

- `SetLocale` middleware runs on API requests.
- API resources expose stable values and localized `*_label` fields.
- Validation and API messages use Laravel translation files.
- Reports and exports use the same locale resolver as API responses.
- CMS/public content reads the translation row for the active locale and falls back to English when needed.

## Frontend Standard

React should send the selected dashboard language through `X-Locale` for API requests. Public visitor requests can rely on `Accept-Language` when no explicit selection exists.

React remains responsible for client-owned UI labels such as navigation, buttons, tabs, and form captions. Laravel remains responsible for server-owned messages, validation errors, resource labels, reports, notifications, and CMS content.
