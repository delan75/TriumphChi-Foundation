# Data Dictionary

## Purpose

This dictionary explains what each major table represents, who owns it, and how it should be protected.

Column-level implementation may evolve, but the business meaning should remain stable.

## Core Operations

| Table | Owner Domain | Classification | Purpose | Lifecycle |
| --- | --- | --- | --- | --- |
| `users` | Identity | Confidential | Authenticated staff, admins, donors, and portal users | Active, inactive, suspended |
| `staff_profiles` | Identity | Confidential | Staff employment and region assignment | Active, inactive |
| `regions` | Geography | Internal | Administrative program region | Active, inactive |
| `villages` | Geography | Internal | Village under a region | Active, inactive |
| `schools` | School | Internal | School identity and payment destination | Pending, verified, closed |
| `applications` | Beneficiary | Restricted | Intake and review record | Draft to accepted or rejected |
| `beneficiaries` | Beneficiary | Restricted | Accepted child support record | Awaiting sponsorship to graduated or archived |
| `educational_needs` | Beneficiary | Restricted | Specific support need and amount | Open to paid or cancelled |
| `academic_records` | Beneficiary | Restricted | Term or academic year outcome | Immutable after approval |
| `mentorship_sessions` | Beneficiary | Restricted | Mentorship interaction and outcomes | Recorded, reviewed |
| `impact_updates` | Beneficiary | Restricted | Narrative or media impact evidence | Private, sponsor-visible, public curated |

## Funding

| Table | Owner Domain | Classification | Purpose | Lifecycle |
| --- | --- | --- | --- | --- |
| `donors` | Funding | Confidential | Donor identity and communication preferences | Active, inactive, archived |
| `funds` | Funding | Internal | Restricted or unrestricted fund bucket | Active, inactive |
| `donations` | Funding | Confidential | Money received from donors | Pending, confirmed, failed, refunded |
| `allocations` | Funding | Restricted | Assignment of money to educational needs | Active, reversed through adjustment |
| `payments` | Funding | Restricted | Money paid to schools or vendors | Pending, approved, paid, cancelled |
| `allocation_payment` | Funding | Restricted | Links allocations to payments | Immutable after payment approval |
| `sponsorships` | Funding | Confidential | Donor commitment to a beneficiary | Active, paused, completed, cancelled |

## Evidence And Reporting

| Table | Owner Domain | Classification | Purpose | Lifecycle |
| --- | --- | --- | --- | --- |
| `documents` | Evidence | Varies | Uploaded proof and generated files | Draft, verified, archived |
| `document_links` | Evidence | Varies | Links documents to source records | Active while document is retained |
| `donation_receipts` | Evidence | Confidential | Proof that donation was received | Issued, voided |
| `tax_certificates` | Evidence | Confidential | Tax or exemption certificate | Issued, voided |
| `report_snapshots` | Evidence | Confidential or Restricted | Point-in-time report data | Immutable once issued |
| `evidence_packages` | Evidence | Confidential | Donor accountability package | Draft, approved, issued |
| `evidence_package_items` | Evidence | Confidential or Restricted | Supporting items inside an evidence package | Immutable after issue |

## Control And Audit

| Table | Owner Domain | Classification | Purpose | Lifecycle |
| --- | --- | --- | --- | --- |
| `audit_logs` | Audit | Restricted | Queryable change history | Append-only |
| `audit_event_files` | Audit | Restricted | Hash-chained text audit files | Open, closed, sealed |
| `application_status_history` | Lifecycle | Restricted | Application status transitions | Append-only |
| `beneficiary_status_history` | Lifecycle | Restricted | Beneficiary status transitions | Append-only |
| `deletion_requests` | Governance | Restricted | Approval workflow for sensitive deletes | Requested, approved, rejected, executed |

## Key Integrity Rules

- Financial records are not hard deleted by application users.
- Child safeguarding records are soft deleted only after approval.
- Generated reports keep snapshots.
- Audit records are append-only.
- Documents store file hashes.
- Evidence packages link to source entities and generated documents.
- Current operational totals can be calculated from source tables.
- Reporting projections must be rebuildable.
