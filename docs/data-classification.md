# Data Classification

## Purpose

The platform handles child records, donor records, financial records, and public content. Each class of data needs different retention, visibility, deletion, and audit rules.

## Classification Levels

| Level | Meaning | Examples | Default Handling |
| --- | --- | --- | --- |
| Public | Safe for public website | Published pages, approved program summaries | Indexed, cached, reusable |
| Internal | Staff-only operational data | School lists, fund categories, report dashboards | Authenticated access |
| Confidential | Sensitive organization or donor data | Donor contacts, receipts, tax certificates | Restricted access and audit |
| Restricted | Child-safeguarding and financial-control data | Beneficiary identity, guardian details, payments, allocations | Strict access, soft delete, audit, limited export |

## Entity Classification

| Entity | Classification | Notes |
| --- | --- | --- |
| Beneficiaries | Restricted | Child safeguarding record |
| Applications | Restricted | May contain child and guardian information |
| Educational needs | Restricted | Links child to financial need |
| Academic records | Restricted | Child education outcome |
| Impact updates | Restricted by default | Public only after curation and approval |
| Donors | Confidential | Contact and giving history |
| Donations | Confidential | Financial and tax evidence |
| Allocations | Restricted | Use-of-funds decision |
| Payments | Restricted | Disbursement and proof records |
| Schools | Internal | Public only if intentionally published |
| Funds | Internal | Public summaries may be published |
| Audit logs | Restricted | Security and accountability evidence |
| Report snapshots | Confidential or Restricted | Depends on included data |
| Tax certificates | Confidential | Donor and tax record |
| CSR reports | Confidential | Donor-specific evidence package |

## Retention Rules

- Financial records should be retained for statutory and audit periods.
- Child support records should be retained while support is active and for a defined safeguarding retention period after completion.
- Audit records should be retained longer than operational records.
- Generated reports should remain immutable once issued.
- Public content can be unpublished without deleting the underlying record.

## Deletion Rules

Application users should not hard-delete Restricted or financial records.

Deletion flow:

```text
Deletion Request
  -> Review
  -> Approval
  -> Soft Delete
  -> Audit Event
  -> Audit File Append
```

The source row remains recoverable unless a separate retention process permanently purges records outside normal application workflows.
