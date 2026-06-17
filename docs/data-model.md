# Data Model Notes

## Primary Aggregates

- Beneficiary
- Application
- School
- Donor
- Donation
- Fund
- Educational Need
- Allocation
- Payment
- Sponsorship
- Impact Update
- Audit Log

## Funding Flow

```text
Donation -> Fund -> Allocation -> Educational Need -> Payment -> School
```

Donations and allocations are intentionally separate. This preserves traceability from incoming money to internal fund balances, then to beneficiary needs and school payments.

## Sponsorship Model

Sponsorship is many-to-many:

- One donor may sponsor many beneficiaries.
- One beneficiary may have many donors.
- Sponsorship may be partial or full.

The system must not assume a one-to-one child sponsorship relationship.

