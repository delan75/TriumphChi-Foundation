# TriumphChi Foundation

TriumphChi Foundation supports orphaned and vulnerable children in rural Cameroon through education support, community partnership, and covenant-driven generosity.

The public website tells the foundation story, protects child dignity, explains the mission, and helps supporters, schools, churches, families, and communities connect with the work.

The internal system manages the full beneficiary lifecycle, from application intake and verification through beneficiary case management, educational needs, sponsorship, donations, school payments, active support, reporting, and completion.

## Product Direction

The public website is not a software product page and not an ecommerce experience. It exists to communicate the mission before fundraising and to keep the child before the technology.

The authenticated app is the beneficiary management and education sponsorship system. Donation handling is part of the internal platform, but the product is centered on accountable support for children, schools, donors, field teams, and NGO staff.

The lifecycle model is:

```text
Application
  -> Verification
  -> Review
  -> Accepted
  -> Beneficiary Created
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

Roles are bundles of permissions. APIs authorize permissions, not role names. Policies handle record-level rules. The frontend hides or shows workspace actions based on permissions, while the backend remains the source of truth.

## API Responses

All API endpoints return standardized responses using `ApiResponseTrait`:

```php
return $this->success($data, 'Success message', 200);
return $this->error('Error message', 400);
```

Responses include `success` boolean, `message` string, and `data` field. CORS is configured for local development with credentials support.

API localization is handled through request locale resolution and `Accept-Language`. Fixed labels such as statuses, validation messages, and API messages are translated through Laravel language files. Translatable public content can use database-backed translation tables when it becomes CMS-driven.

## Authentication

The platform supports:

- Email/password authentication via Laravel Sanctum
- Google OAuth via Laravel Socialite
- Facebook OAuth via Laravel Socialite
- Permission-based API authorization with active-account checks

OAuth endpoints:

- `GET /api/v1/auth/{provider}/redirect` - Initiate OAuth flow
- `GET /api/v1/auth/{provider}/callback` - Handle OAuth callback
- `POST /api/v1/auth/oauth/exchange` - Exchange a short-lived OAuth callback code for a Sanctum token

Email/password registration creates a pending account until email verification. Verification supports signed email links and OTP codes. Email OTP is available by default; SMS and WhatsApp OTP channels can be enabled through configured provider webhooks. Pending users can correct a mistyped email or phone number before verification without creating a duplicate account. Login returns a 30-day Sanctum token with an expiry timestamp and rotates existing tokens for the same device. Socialite runs in stateless mode and never returns Sanctum tokens through browser query strings.

Authenticated profile responses are served from `/api/v1/auth/me` and include identity, profile, roles, permissions, connected providers, token sessions, and recent account activity.

## Authenticated Workspace

The staff workspace is an operational application, not a documentation area. It includes:

- Dashboard summary with permission-aware metrics, queues, quick actions, recent activity, and global search
- Applications intake and review workflows
- Beneficiary case management with source application traceability
- Funding and donations management
- Public contact message management, assignment, and forwarding
- User management with roles, permissions, profile details, status, and access control
- Profile, security, preferences, and activity views

The global search API is permission-aware. Users can search broadly, but the API only returns resources their permissions allow them to see.

## Beneficiary Case Management

Beneficiaries are created from accepted applications. A beneficiary record represents the active education support case and connects:

- Source application
- Child profile and guardian contact
- School, region, and village
- Educational needs
- Allocations, payments, and funding progress
- Sponsorship relationships
- Documents, support history, mentorship, and impact updates

The beneficiary table separates three concepts:

- Case status: whether the child is currently in the foundation support lifecycle
- Funding: whether approved educational needs are financially covered
- Sponsorship: whether sponsorship commitments are attached to the beneficiary

A beneficiary can be fully funded without an individual sponsor if support came from general donations or designated funds.

## Public Contact Messages

Public contact form submissions are handled through `POST /api/v1/public/contact-messages`.

- Contact messages persist with soft deletes
- Optional file attachments with security scanning
- Attachments stored on private disk with UUID filenames
- Original filename retained as metadata
- FileSecurityScanner rejects executables, scripts, SQL files, and suspicious double extensions
- MIME verification via `finfo`, image validation via `getimagesize`
- Localized rejection messages and logging with filename, MIME, size, extension, and reason
- Contact details sourced from environment configuration
- Private upload disk configurable via `PRIVATE_UPLOAD_DISK`

Staff can review, assign, resolve, and forward contact inquiries from the authenticated workspace.

## Donations and Payments

Public donations are handled through donation intents and payment providers. The backend owns provider creation, verification, status polling, and reconciliation. The frontend never marks a donation successful based only on a provider redirect.

Current provider work includes:

- MTN MoMo Collections with country and currency capability checks, pending-payment polling, callback readiness, status checks, and private diagnostic logging
- PayPal Orders API with backend order creation, redirect approval flow, capture verification, webhook reconciliation, and pending-review handling
- Bank transfer and other giving channels represented as provider options for future expansion

Donation receipts and related documents are generated and attached server-side when payment status allows it.

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
- Users and access management
- Contact message management

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

### Backend Environment

Copy `backend/.env.example` and configure:

- Database connection
- Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- Facebook OAuth credentials (`FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`)
- Mail delivery settings for email verification and password reset
- OTP channel settings for SMS or WhatsApp providers
- Private upload disk (`PRIVATE_UPLOAD_DISK`)
- Public contact details

### Frontend Environment

Copy `frontend/.env.example` and configure:

- `VITE_PUBLIC_CONTACT_EMAIL`
- `VITE_PUBLIC_CONTACT_PHONE_DISPLAY`
- `VITE_PUBLIC_CONTACT_PHONE_TEL`

Frontend environment values are embedded at build time. Rebuild after changing them, and never put secrets in `VITE_*` variables. The backend must allow the frontend origin in its CORS configuration.

Production builds use the public API URL in `frontend/.env.production`: `https://api.triumphchi.org/api/v1`. Local development uses `.env`; build-server environment variables can override either file. Ensure any deployment-level `VITE_API_BASE_URL` uses the production API origin, then rebuild and publish the complete `dist/` directory.

For donation setup, `${VITE_API_BASE_URL}/public/donation-config` must return the Laravel JSON configuration. If the donation form reports that it is unavailable, verify this response and the API routing before rebuilding. API requests must reach the backend before any SPA fallback rule.

### Frontend Checks and Deployment

Run from `frontend/`:

```bash
npm run lint
npx playwright install chromium
npm run test:browser
```

`test:browser` runs TypeScript checks, creates a production build, and tests desktop and mobile routes. Use `npm run build` to build without browser tests and `npm run preview` to inspect the result locally. See the [frontend migration guide](frontend/MIGRATION.md) for dependency and compatibility guidance.

Deploy the complete `frontend/dist/`, including `index.html`, shared chunks, source maps, and `.well-known/`. Serve existing static files before the SPA fallback, and retain older hashed chunks across releases. Source maps support debugging and publish frontend source; they are not normally downloaded during page loading.

After deploying the build generated by your checkout, verify it from `frontend/`:

```bash
npm run verify:deployment -- https://triumphchi.org
```

This read-only check compares the live entry and shared chunks with the local build, checks its source map, and verifies the public discovery files. It fails when a deployment serves different HTML or rewrites static resources to the SPA shell. For local verification, run `npm run preview` in another terminal and use `npm run verify:deployment -- http://localhost:4173`.

### Public Content and Discovery

Impact figures come from the backend. Valid zeros remain zero; unavailable or invalid figures use neutral placeholders. Loading, unavailable data, and descriptive program categories are distinct states. Illustrative examples are labeled separately from verified beneficiary stories.

Website discovery resources live in `frontend/public/`: `llms.txt` provides a public Markdown index, while the root and `.well-known` AI catalogs list only actual public AI capabilities. The catalogs are currently empty because no such service is published. These files are separate from the repository documentation index below. Page metadata is updated client-side; the frontend does not currently prerender public pages.

## Documentation

[LLM documentation index](llms.txt) provides a concise, source-linked entry point for repository assistants. It follows the `llms.txt` proposal and uses repository-relative links; web publication requires hosting the linked resources too.

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
- [API Authentication](docs/api-auth.md)
- [Frontend SEO and i18n](docs/frontend-seo-i18n.md)
- [GitHub Workflow](docs/github-workflow.md)
- [Branch Protection](docs/branch-protection.md)
