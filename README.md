# TriumphChi NGO Education Sponsorship Platform

Modern beneficiary management and educational sponsorship system for an NGO serving orphan-focused education programs in Cameroon.

This repository is scaffolded as a decoupled application:

- `backend/` Laravel 12 REST API, Sanctum-ready, versioned under `/api/v1`
- `frontend/` React + TypeScript + Vite SPA
- `docs/` architecture, lifecycle, data model, and implementation notes

The product is primarily a beneficiary management system, not a donation-only website. The core lifecycle is:

```text
Application
  -> Verification
  -> Review
  -> Accepted
  -> Sponsored
  -> Active Support
  -> Graduated / Completed
```

## Core Principles

- Child privacy and safeguarding by default
- Auditability for status changes, allocations, payments, and permissions
- Bilingual English/French experience
- Mobile-first UX for field and school users
- Low-cost deployment path, with future-ready storage, queues, and payment integrations
- Domain model built around beneficiaries, schools, donors, funds, needs, allocations, sponsorships, payments, and impact updates

## Suggested Local Setup

The current repository is a scaffold. Dependencies are intentionally not installed yet.

Backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan test
```

Use your local `.env` for machine-specific settings such as database host, port, username, and password.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Initial Build Phases

Phase 1:

- Authentication
- Roles and permissions
- Applications
- Beneficiaries
- Schools
- Donors
- Donations
- Funds
- Educational needs
- Allocations
- Payments
- Impact updates
- Audit logs

Phase 2:

- Sponsor portal
- Volunteer portal
- Mentorship
- Advanced reporting

Phase 3:

- Recurring donations
- Payment gateway integrations
- SMS notifications
- Mobile application
- AI-assisted reporting
