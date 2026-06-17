# Architecture

## Application Shape

The platform uses a decoupled architecture:

- React SPA for public pages, donor portal, staff workflows, school workflows, and field workflows
- Laravel REST API for authentication, domain workflows, reporting, file storage, and audit logging
- Laravel Sanctum for SPA authentication
- API versioning under `/api/v1`
- MySQL 8 as the primary relational store

## Backend Layers

- Models represent the main aggregates and relationships.
- Form Requests validate API input and enforce workflow-specific rules.
- API Resources shape consistent JSON responses.
- Policies enforce role and permission based access.
- Controllers stay thin and delegate richer behavior to future services/actions.
- Migrations include lifecycle, funding, payment, and audit columns from the beginning.

## Frontend Layers

- `src/app` contains routing and app shell concerns.
- `src/features` groups domain screens by capability.
- `src/lib` contains shared API, auth, i18n, and formatting helpers.
- `src/components` holds reusable UI primitives.
- `src/types` mirrors API contracts.

## Privacy Boundary

Beneficiary child data must never be publicly exposed. Public website features should use curated impact stories and aggregate metrics, not raw beneficiary records.

## Growth Path

The schema starts relational and auditable. As the platform grows, heavy reporting and search can be moved to read models, queues, materialized metrics, and indexed search without changing the core domain language.

