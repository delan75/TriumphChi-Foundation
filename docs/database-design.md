# Database Design

## Goal

The database is designed around a single source of truth, not a central table that everything mutates directly.

Each major entity has one owner. Related modules reference that owner through foreign keys. This keeps data connected without making modules tightly coupled.

## Storage Engine

Use MySQL InnoDB.

Recommended defaults:

- `utf8mb4`
- `utf8mb4_unicode_ci`
- Foreign keys enabled
- Strict mode enabled
- Decimal values for money
- UTC timestamps

## Ownership Rules

### Beneficiary

The beneficiary is the source of truth for child support records.

Related records:

- Educational needs
- Academic records
- Mentorship sessions
- Impact updates
- Documents
- Sponsorships
- Payments

Do not duplicate beneficiary personal details in payments, donations, allocations, or reports.

### Application

Applications are historical records.

An approved application creates or links to a beneficiary through `beneficiaries.application_id`. The application itself remains an intake and review record.

### Donor

Donors are separate from users because many donors may never sign in.

If a donor creates an account later, `donors.user_id` can link the donor record to a user.

### Documents

Documents are centralized through a polymorphic table:

```text
documents
  documentable_type
  documentable_id
```

Documents can belong to applications, beneficiaries, schools, payments, educational needs, and impact updates.

## Core Tables

### users

- `id`
- `name`
- `email`
- `phone`
- `status`
- `last_login_at`
- `preferred_locale`
- timestamps

Indexes:

- unique `email`
- `status`

### staff_profiles

- `id`
- `user_id`
- `region_id`
- `employee_number`
- timestamps

Indexes:

- unique `user_id`
- unique `employee_number`
- `region_id`

### regions

- `id`
- `name`
- timestamps

Indexes:

- unique `name`

### villages

- `id`
- `region_id`
- `name`
- timestamps

Indexes:

- unique `region_id, name`
- `region_id`

### schools

- `id`
- `name`
- `code`
- `principal_name`
- `phone`
- `email`
- `region_id`
- `village_id`
- `status`
- soft deletes
- timestamps

Indexes:

- unique `code`
- `region_id, status`
- `village_id`
- `status`

### applications

- `id`
- `application_number`
- `school_id`
- `submitted_by`
- `status`
- `submitted_at`
- `verified_at`
- `reviewed_at`
- soft deletes
- timestamps

Indexes:

- unique `application_number`
- `status, submitted_at`
- `school_id, status`
- `submitted_by`

### beneficiaries

- `id`
- `application_id`
- `school_id`
- `region_id`
- `village_id`
- `internal_id`
- `first_name`
- `last_name`
- `gender`
- `date_of_birth`
- `guardian_name`
- `guardian_phone`
- `status`
- `admission_date`
- `graduation_date`
- soft deletes
- timestamps

Indexes:

- unique `internal_id`
- unique nullable `application_id`
- `school_id, status`
- `region_id, status`
- `status`
- `last_name, first_name`

### educational_needs

- `id`
- `beneficiary_id`
- `type`
- `title`
- `amount_required`
- `amount_funded`
- `status`
- `academic_year`
- `start_date`
- `end_date`
- timestamps

Indexes:

- `beneficiary_id, status`
- `status, academic_year`
- `type, status`

### donors

- `id`
- `user_id`
- `name`
- `email`
- `phone`
- `type`
- `status`
- soft deletes
- timestamps

Indexes:

- `user_id`
- `email`
- `type, status`
- `status`

### funds

- `id`
- `name`
- `slug`
- `description`
- `is_restricted`
- `status`
- timestamps

Indexes:

- unique `slug`
- `status`
- `is_restricted, status`

### donations

- `id`
- `donor_id`
- `fund_id`
- `reference`
- `amount`
- `currency`
- `payment_method`
- `status`
- `received_at`
- soft deletes
- timestamps

Indexes:

- unique `reference`
- `donor_id, received_at`
- `fund_id, status`
- `status, received_at`

### allocations

- `id`
- `donation_id`
- `fund_id`
- `educational_need_id`
- `amount`
- `allocated_by`
- `allocated_at`
- timestamps

Indexes:

- `donation_id`
- `fund_id, allocated_at`
- `educational_need_id`
- `allocated_by, allocated_at`

### payments

- `id`
- `school_id`
- `beneficiary_id`
- `educational_need_id`
- `amount`
- `reference`
- `proof_document_id`
- `status`
- `paid_at`
- soft deletes
- timestamps

Indexes:

- unique `reference`
- `school_id, paid_at`
- `beneficiary_id, paid_at`
- `educational_need_id`
- `status, paid_at`

### allocation_payment

- `allocation_id`
- `payment_id`
- `amount_applied`

Indexes:

- primary `allocation_id, payment_id`
- `payment_id`

### sponsorships

- `id`
- `donor_id`
- `beneficiary_id`
- `amount_committed`
- `start_date`
- `end_date`
- `status`
- timestamps

Indexes:

- `donor_id, status`
- `beneficiary_id, status`
- `status, start_date`

### academic_records

- `id`
- `beneficiary_id`
- `school_id`
- `term`
- `academic_year`
- `average_score`
- `rank`
- `remarks`
- timestamps

Indexes:

- unique `beneficiary_id, academic_year, term`
- `school_id, academic_year, term`

### mentorship_sessions

- `id`
- `beneficiary_id`
- `mentor_user_id`
- `session_date`
- `notes`
- `outcomes`
- timestamps

Indexes:

- `beneficiary_id, session_date`
- `mentor_user_id, session_date`

### impact_updates

- `id`
- `beneficiary_id`
- `title`
- `content`
- `visibility`
- `published_at`
- `created_by`
- timestamps

Indexes:

- `beneficiary_id, visibility`
- `visibility, published_at`
- `created_by`

### documents

- `id`
- `documentable_type`
- `documentable_id`
- `type`
- `file_name`
- `path`
- `mime_type`
- `uploaded_by`
- `verified_by`
- timestamps

Indexes:

- `documentable_type, documentable_id`
- `type`
- `uploaded_by`
- `verified_by`

### audit_logs

Use Spatie Activity Log or a compatible structure.

- `id`
- `user_id`
- `entity_type`
- `entity_id`
- `action`
- `old_values`
- `new_values`
- `ip_address`
- `created_at`

Indexes:

- `user_id, created_at`
- `entity_type, entity_id`
- `action, created_at`

## Money Flow

Money enters through donations.

```text
Donation -> Fund -> Allocation -> Educational Need -> Payment -> School
```

Donations and allocations are separate. A donation can fund many needs. A need can receive many allocations.

Payments are separate from allocations because payment is the moment money leaves the NGO.

## Concurrency Rules

Financial writes must use database transactions.

Recommended allocation flow:

1. Start transaction.
2. Lock donation or fund balance rows.
3. Lock educational need row.
4. Validate available balance and remaining need amount.
5. Insert allocation.
6. Update funded totals.
7. Insert audit log.
8. Commit.

Use `lockForUpdate()` for affected money rows.

Avoid updating totals from stale API payloads. Recalculate critical totals from locked rows inside the transaction.

## Idempotency

External payment callbacks and donation confirmations should use an idempotency key or unique reference.

Recommended unique references:

- `donations.reference`
- `payments.reference`
- future `payment_events.provider_reference`

This prevents duplicate records when a payment provider retries a webhook.

## Deletion Strategy

Use soft deletes for:

- Beneficiaries
- Schools
- Donors
- Donations
- Payments
- Applications

Avoid hard deletes for financial records, child records, and application history.

Use hard deletes only for temporary drafts or records that do not affect audit, finance, or safeguarding.

## Reporting Strategy

Operational APIs should query indexed normalized tables.

Heavy reporting should later use read models or materialized summary tables, for example:

- beneficiary lifecycle counts by region
- funding gaps by academic year
- donor giving totals by month
- school payment totals by term

These summaries should be derived from source tables, not manually edited.

