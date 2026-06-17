# Reporting and Growth Strategy

## Purpose

The operational schema should answer daily workflow questions quickly. Reporting should remain accurate as the system grows from hundreds of beneficiaries to hundreds of thousands.

## Key Future Questions

The schema should be able to answer:

- How many beneficiaries in a region received book funding during an academic year?
- Which donations are not fully allocated?
- Which allocations have not been paid out?
- Which schools received payments by term?
- Which donors funded specific beneficiaries or support categories?
- Which beneficiaries graduated after receiving support?
- Which CSR donors need evidence packages this quarter?
- Which audit events occurred after a suspicious login?

## Expected Large Tables

| Table | Growth Driver | Three-Year Planning Estimate |
| --- | --- | --- |
| audit_logs | Every sensitive change | 50M+ rows |
| audit_event_files | Daily append-only exports | Thousands of files |
| donations | Recurring and campaign giving | 1M+ rows |
| allocations | One donation split across many needs | 5M+ rows |
| payments | School/vendor disbursements | 1M+ rows |
| impact_updates | Sponsor updates and evidence | 2M+ rows |
| documents | Proof, reports, images, certificates | 5M+ rows |
| report_snapshots | Generated evidence and reports | 1M+ rows |
| beneficiaries | Program growth | 200k+ rows |
| applications | Intake pipeline | 250k+ rows |

## Operational Reporting

Operational dashboards can query normalized tables directly when result sets are small and indexed.

Examples:

- current beneficiary counts by status
- open educational needs by region
- pending payments by school
- recent donations by donor

Recommended indexes:

- `beneficiaries.region_id, status`
- `educational_needs.status, academic_year`
- `payments.school_id, paid_at`
- `donations.donor_id, received_at`

## Analytical Reporting

As tables grow, create rebuildable read models.

Recommended projections:

- `beneficiary_statistics`
- `funding_gap_snapshots`
- `donor_giving_monthly`
- `school_payment_monthly`
- `csr_impact_snapshots`
- `audit_event_daily_counts`

These tables should be derived from source records, not manually edited.

## Partitioning Candidates

Partitioning should be considered only after query volume and table size justify it.

Likely candidates:

- `audit_logs` by `created_at`
- `audit_event_files` by `closed_at`
- `donations` by `received_at`
- `payments` by `paid_at`
- `report_snapshots` by `generated_at`

## Archiving Strategy

- Keep active workflow records in operational tables.
- Archive closed audit partitions to cheaper storage after retention thresholds.
- Keep generated documents addressable by immutable paths.
- Preserve report snapshots for issued documents.
- Never archive records in a way that breaks donor evidence chains.

## Backup Strategy

Database backups must be coordinated with document storage backups.

The database stores references and hashes. Document storage stores files. A restore is only valid if both are restored to a consistent point in time.

Minimum backup requirements:

- daily full database backup
- point-in-time recovery for financial tables
- document storage replication
- audit file replication to storage outside the application account
- periodic restore tests
