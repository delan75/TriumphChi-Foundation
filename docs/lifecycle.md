# Beneficiary Lifecycle

The platform tracks application and beneficiary status transitions as explicit workflow events.

## Application Statuses

- `draft`
- `submitted`
- `verification_pending`
- `verified`
- `review_pending`
- `accepted`
- `rejected`

## Beneficiary Statuses

- `awaiting_sponsorship`
- `partially_funded`
- `fully_funded`
- `active_support`
- `graduated`
- `archived`

## Required Transition Data

Each transition should capture:

- Previous status
- New status
- Actor
- Timestamp
- Notes
- Source IP where applicable

Status history belongs in dedicated history tables for important lifecycle records.

Recommended tables:

- `application_status_history`
- `beneficiary_status_history`

These tables preserve the sequence of changes even when the current status changes again later.

## First Workflow

```text
Draft Application
  -> Submitted
  -> Verification Pending
  -> Verified
  -> Review Pending
  -> Accepted
  -> Awaiting Sponsorship
  -> Partially Funded / Fully Funded
  -> Active Support
  -> Graduated / Archived
```

## Soft Delete Direction

Rejected applications, graduated beneficiaries, inactive donors, closed schools, donations, allocations, and payments remain part of organizational history.

Use soft deletes for normal application deletion. Hard deletion is reserved for controlled retention purging outside daily workflows.

Sensitive or financial records should require a deletion request and approval before soft deletion.
