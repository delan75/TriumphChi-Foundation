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

