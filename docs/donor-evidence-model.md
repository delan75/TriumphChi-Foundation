# Donor Evidence Model

## Purpose

Payment receipts prove that money was received. Donor accountability proves how the money was used and what changed because of it.

The system should support donors, companies, churches, foundations, embassies, and CSR departments that need evidence for tax, compliance, governance, or internal reporting.

## Evidence Chain

```text
Donor
  -> Donation
  -> Fund
  -> Allocation
  -> Educational Need
  -> Payment
  -> School
  -> Beneficiary
  -> Academic Record / Impact Update
  -> Generated Report / Certificate
```

This chain should answer:

- How much was donated?
- Which fund received it?
- What needs were funded?
- Which schools or vendors were paid?
- Which beneficiaries were supported?
- What outcomes were recorded?
- Which documents prove the work?

## Generated Documents

Generated documents are stored artifacts, not source facts.

| Document Type | Purpose | Primary Source Tables |
| --- | --- | --- |
| Donation receipt | Proof that money was received | donations, donors |
| Tax certificate | Tax or exemption documentation | donations, donors, organization profile |
| Allocation report | How a donation was assigned | donations, allocations, educational_needs |
| School payment statement | Payments made to a school | schools, payments, beneficiaries |
| Sponsorship progress report | Child support progress for a sponsor | beneficiaries, sponsorships, academic_records, impact_updates |
| CSR impact report | Periodic corporate impact evidence | donations, allocations, payments, beneficiaries, schools, impact_updates |
| Annual donor statement | Yearly donor giving summary | donors, donations, report_snapshots |

## Evidence Tables

### documents

Stores generated files and uploaded proof.

Recommended fields:

- `id`
- `type`
- `title`
- `storage_path`
- `mime_type`
- `file_size`
- `file_sha256`
- `classification`
- `generated_at`
- `created_by`
- `retention_until`
- timestamps

Indexes:

- `type, generated_at`
- `classification`
- `file_sha256`
- `created_by, generated_at`

### document_links

Links one document to one or more source entities.

Recommended fields:

- `id`
- `document_id`
- `entity_type`
- `entity_id`
- `link_role`
- timestamps

Indexes:

- `document_id`
- `entity_type, entity_id`
- `entity_type, entity_id, link_role`

### donation_receipts

Receipts are separate from tax certificates.

Recommended fields:

- `id`
- `donation_id`
- `receipt_number`
- `document_id`
- `issued_at`
- `status`
- timestamps

Constraints:

- unique `receipt_number`
- unique nullable `donation_id, status` for issued active receipts

### tax_certificates

Tax certificates may have different rules from receipts.

Recommended fields:

- `id`
- `donation_id`
- `certificate_number`
- `tax_year`
- `document_id`
- `issued_at`
- `status`
- timestamps

Constraints:

- unique `certificate_number`
- `donation_id` references `donations.id`
- `document_id` references `documents.id`

### report_snapshots

Stores point-in-time report data used to generate documents.

Recommended fields:

- `id`
- `report_type`
- `generated_for_type`
- `generated_for_id`
- `period_start`
- `period_end`
- `snapshot_json`
- `source_hash`
- `document_id`
- `generated_by`
- `generated_at`

Indexes:

- `report_type, generated_at`
- `generated_for_type, generated_for_id`
- `period_start, period_end`
- `source_hash`

### evidence_packages

Groups reports, documents, payments, and impact evidence for a donor or organization.

Recommended fields:

- `id`
- `donor_id`
- `title`
- `period_start`
- `period_end`
- `status`
- `summary_snapshot_json`
- `approved_by`
- `approved_at`
- `generated_at`
- timestamps

Indexes:

- `donor_id, period_start, period_end`
- `status, generated_at`

### evidence_package_items

Links an evidence package to its supporting records.

Recommended fields:

- `id`
- `evidence_package_id`
- `item_type`
- `entity_type`
- `entity_id`
- `document_id`
- timestamps

Indexes:

- `evidence_package_id`
- `entity_type, entity_id`
- `document_id`

## Snapshot Rule

Generated reports should store a snapshot.

If a donor name, school name, beneficiary status, or payment correction changes later, the generated report remains historically accurate because the issued report data is preserved in `report_snapshots.snapshot_json`.

Source tables remain authoritative for current operations. Snapshots are historical artifacts.

## Example CSR Snapshot

```json
{
  "donor": "ABC Telecom",
  "period": "2027-01-01 to 2027-06-30",
  "total_contributed": 50000,
  "beneficiaries_supported": 125,
  "schools_supported": 14,
  "books_funded": 870,
  "exam_fees_paid": 125,
  "graduates": 17
}
```
