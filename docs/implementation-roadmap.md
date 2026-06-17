# Implementation Roadmap

## Current Scaffold

This branch establishes the first working shape of the system:

- Laravel API structure for `/api/v1`
- Primary domain models and enums
- Migrations for users, roles, permissions, schools, applications, beneficiaries, donors, funds, donations, educational needs, allocations, sponsorships, payments, impact updates, and audit logs
- API controllers, requests, resources, and privacy policies
- Role and permission seeder
- React TypeScript Vite frontend shell
- Staff dashboard, lifecycle pipeline, application, beneficiary, funding, and reporting scaffold pages
- Bilingual route structure for English and French

## Next Feature Branches

Recommended order:

1. `authentication-ft`
   - Sanctum SPA login/logout
   - Role assignment
   - Permission middleware
   - First admin user seeding

2. `beneficiary-management-ft`
   - Application creation
   - Verification and review transitions
   - Beneficiary creation from accepted application
   - Status history and audit logging

3. `funding-flow-ft`
   - Donation intake
   - Fund balances
   - Allocation service
   - Educational need funding progress
   - Payment proof upload

4. `reports-gen-ft`
   - Operational filters
   - CSV export
   - Funding gap reports
   - Beneficiary lifecycle reports

## Build Rules

- Create or update an issue before each branch.
- Branch from `dev`.
- Open all pull requests against `dev`.
- Promote to `main` only with a release PR.

