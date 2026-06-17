# TriumphChi Foundation

TriumphChi Foundation is an education sponsorship and beneficiary management platform for orphan-focused support programs in Cameroon.

The system manages the full beneficiary lifecycle, from application intake and verification through sponsorship, school payments, active support, reporting, and completion.

## Product Direction

This is a beneficiary management and education sponsorship system. Donation handling is part of the platform, but the product is centered on accountable support for children, schools, donors, field teams, and NGO staff.

The lifecycle model is:

```text
Application
  -> Verification
  -> Review
  -> Accepted
  -> Sponsored
  -> Active Support
  -> Graduated / Completed
```

## Architecture

The platform uses a decoupled architecture.

- Backend: Laravel 12 REST API
- Authentication: Laravel Sanctum
- Authorization: Spatie Permission and Laravel Policies
- Database: MySQL with InnoDB
- Frontend: React, TypeScript, Vite, TanStack Query, Tailwind CSS
- API versioning: `/api/v1`

Roles are bundles of permissions. APIs authorize permissions, not role names. Policies handle record-level rules such as future field officer region ownership.

## Frontend Ownership

React is the product frontend for core workflows:

- Applications
- Beneficiaries
- Schools
- Donor portal
- Sponsor portal
- Impact tracking
- Allocations
- Funding dashboard
- Reports

These areas need workflow-specific UX, mobile support, localization, and future public or portal access.

Filament may be introduced later only for internal administration:

- Users
- Roles
- Permissions
- Audit logs
- Settings
- CMS content

## Domain Model

The main domain records are:

- Applications
- Beneficiaries
- Schools
- Donors
- Donations
- Funds
- Educational needs
- Allocations
- Sponsorships
- Payments
- Academic records
- Mentorship sessions
- Impact updates
- Documents
- Audit logs

Beneficiary records are private. Public pages use curated content and aggregate impact reporting, not raw child records.

## Local Development

Backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan test
php artisan serve
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Machine-specific settings such as database host, port, username, and password belong in the local `.env` file.

## Documentation

- [Architecture](docs/architecture.md)
- [System Design](docs/system-design.md)
- [Conceptual Data Model](docs/conceptual-data-model.md)
- [Lifecycle](docs/lifecycle.md)
- [Database Design](docs/database-design.md)
- [Data Dictionary](docs/data-dictionary.md)
- [ERD](docs/erd.md)
- [Indexes and Transactions](docs/indexes-and-transactions.md)
- [Donor Evidence Model](docs/donor-evidence-model.md)
- [Reporting and Growth](docs/reporting-and-growth.md)
- [Data Classification](docs/data-classification.md)
- [Permissions](docs/permissions.md)
- [Localization](docs/localization.md)
- [Frontend SEO and i18n](docs/frontend-seo-i18n.md)
- [GitHub Workflow](docs/github-workflow.md)
