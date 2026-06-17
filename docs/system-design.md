# System Design

## Architecture Decision

The project uses Laravel as the API backend and React as the product frontend.

Backend:

- Laravel 12
- Sanctum
- Spatie Permission
- Laravel Policies
- MySQL

Frontend:

- React
- TypeScript
- TanStack Query
- Tailwind CSS

Admin support:

- Filament may be added later for users, roles, permissions, audit logs, settings, and CMS content only.
- Core business workflows stay in React.

## Design Principles

- Single source of truth for each major entity.
- Clear ownership boundaries between modules.
- Strong referential integrity.
- Minimal duplication.
- Permission-based API authorization.
- Policy-based resource authorization.
- API-level localization for server-owned labels and messages.
- Auditable financial and beneficiary workflows.
- Soft deletion for sensitive and financial records.
- Tamper-resistant audit evidence through queryable logs and append-only audit files.
- Donor accountability from donation receipt through impact evidence.
- Public pages never expose private child records.

## Module Boundaries

### Beneficiary Domain

Owned records:

- Beneficiaries
- Applications linked to beneficiaries after acceptance
- Educational needs
- Academic records
- Mentorship sessions
- Impact updates
- Beneficiary documents
- Sponsorship relationships

The beneficiary table is the main record for child support operations. Related modules reference the beneficiary instead of duplicating child information.

### School Domain

Owned records:

- Schools
- School verification status
- School reports
- School payment confirmations

Schools can submit applications and receive payments, but they do not own beneficiary identity data.

### Funding Domain

Owned records:

- Donors
- Donations
- Funds
- Allocations
- Sponsorships
- Payments

Money enters through donations, is assigned through allocations, and leaves through payments. These steps remain separate for traceability.

### Evidence and Reporting Domain

Owned records:

- Documents
- Document links
- Donation receipts
- Tax certificates
- Report snapshots
- Evidence packages
- Evidence package items
- Audit event files

Evidence records prove what happened to donated money after receipt. Generated reports store snapshots so issued documents remain historically accurate even if source records are corrected later.

### Content and Public Website

Owned records:

- Pages
- Blog posts
- News posts
- Categories
- Tags
- Media
- Localized metadata

CMS content is separate from beneficiary records. Public success stories require explicit visibility and review.

## Authorization Model

Roles are permission bundles.

The API checks permissions:

```php
$user->can('beneficiaries.update');
```

Policies check the specific record:

```php
$user->can('update', $beneficiary);
```

This keeps the system flexible. Roles can change without changing controller code.

## Request Flow

1. React calls `/api/v1`.
2. Locale middleware resolves the active language.
3. Sanctum authenticates the request.
4. Route middleware checks the required permission.
5. Controller calls policy checks for resource-specific authorization.
6. Form Request validates input.
7. Database transaction writes related state changes.
8. API resources return stable values with localized labels.
9. Audit log records critical actions.

## Localization Model

The API supports localized responses without duplicating domain records.

Locale is resolved from explicit request locale, saved user preference, browser language, then fallback language. API resources return source values and localized labels together:

```json
{
  "status": "active_support",
  "status_label": "Soutien actif"
}
```

System language such as statuses, permissions, validation messages, report headings, and notification text belongs in language files.

Public CMS content such as pages, blog posts, news posts, program descriptions, success stories, and SEO metadata belongs in translation tables.

Beneficiaries, schools, donors, donations, allocations, payments, and audit records remain single-source domain data.

## Transaction Boundaries

Use database transactions for operations that modify more than one financial or lifecycle record.

Examples:

- Accepting an application and creating a beneficiary.
- Allocating donation money to an educational need.
- Creating a payment and linking allocations.
- Publishing an impact update to sponsors.

For financial operations, lock affected rows with `SELECT ... FOR UPDATE` through Laravel's `lockForUpdate()` before adjusting balances.

## Information Architecture

The database design is responsible for representing the business accurately:

- conceptual entities and relationships
- logical tables and cardinality
- normalization
- referential integrity
- lifecycle states and status history
- data classification
- auditability
- reportability
- growth and archival strategy

Framework code implements these rules, but the rules belong to the data model.

