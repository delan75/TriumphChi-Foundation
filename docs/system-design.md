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
- Auditable financial and beneficiary workflows.
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
2. Sanctum authenticates the request.
3. Route middleware checks the required permission.
4. Controller calls policy checks for resource-specific authorization.
5. Form Request validates input.
6. Database transaction writes related state changes.
7. Audit log records critical actions.

## Transaction Boundaries

Use database transactions for operations that modify more than one financial or lifecycle record.

Examples:

- Accepting an application and creating a beneficiary.
- Allocating donation money to an educational need.
- Creating a payment and linking allocations.
- Publishing an impact update to sponsors.

For financial operations, lock affected rows with `SELECT ... FOR UPDATE` through Laravel's `lockForUpdate()` before adjusting balances.

