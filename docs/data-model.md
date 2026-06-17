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

## Evidence Flow

```text
Donation -> Allocation -> Payment -> Beneficiary / School -> Impact Update -> Report Snapshot -> Evidence Package
```

Generated evidence is separate from source records. Receipts, tax certificates, CSR reports, and annual statements are documents linked back to the source chain.

## Audit Flow

```text
Source Change -> Audit Log -> Append-Only Audit File
```

Audit logs support querying. Audit files provide tamper-resistant evidence outside normal application editing workflows.
