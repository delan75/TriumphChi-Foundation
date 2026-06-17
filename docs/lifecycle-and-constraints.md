# Lifecycle and Constraint Specification

## Purpose

Lifecycle design protects historical truth. Status changes should be explicit, auditable, and reportable.

## Application Lifecycle

```text
draft
  -> submitted
  -> verification_pending
  -> verified
  -> review_pending
  -> accepted
  -> rejected
```

Rules:

- `accepted` can create or link one beneficiary.
- `rejected` remains a historical application.
- accepted and rejected applications should not be hard deleted.

Recommended history table:

### application_status_history

- `id`
- `application_id`
- `from_status`
- `to_status`
- `changed_by`
- `changed_at`
- `reason`
- `notes`
- `ip_address`

Indexes:

- `application_id, changed_at`
- `to_status, changed_at`
- `changed_by, changed_at`

## Beneficiary Lifecycle

```text
awaiting_sponsorship
  -> partially_funded
  -> fully_funded
  -> active_support
  -> graduated
  -> archived
```

Rules:

- `graduated` keeps all support and outcome history.
- `archived` removes the record from normal workflow lists but not from audit/reporting.
- A beneficiary with financial or academic records must not be hard deleted through the application.

Recommended history table:

### beneficiary_status_history

- `id`
- `beneficiary_id`
- `from_status`
- `to_status`
- `changed_by`
- `changed_at`
- `reason`
- `notes`
- `ip_address`

Indexes:

- `beneficiary_id, changed_at`
- `to_status, changed_at`
- `changed_by, changed_at`

## Deletion Approval

Soft deletion should be permissioned and approval-based for sensitive records.

Recommended table:

### deletion_requests

- `id`
- `entity_type`
- `entity_id`
- `classification`
- `requested_by`
- `approved_by`
- `status`
- `reason`
- `approved_at`
- `executed_at`
- timestamps

Indexes:

- `entity_type, entity_id`
- `status, created_at`
- `requested_by, created_at`
- `approved_by, approved_at`

Rules:

- Financial and Restricted records require approval before soft delete.
- Soft delete must record `deleted_at`.
- Deletion approval must write an audit event.
- Hard delete is reserved for retention purging outside normal user workflows.

## Referential Delete Rules

| Relationship | Delete Rule | Reason |
| --- | --- | --- |
| donor to donations | restrict | Donations must survive donor account changes |
| donation to allocations | restrict | Evidence chain must remain intact |
| fund to donations | restrict | Financial history requires fund context |
| educational_need to allocations | restrict | Allocation purpose must remain traceable |
| school to payments | restrict | Payment destination must remain traceable |
| beneficiary to payments | set null or restrict | Prefer restrict while child record is retained |
| beneficiary to academic_records | restrict | Outcome evidence must survive |
| application to beneficiary | set null only if required | Beneficiary should survive intake correction |
| user to audit_logs | set null | Audit event must survive user deactivation |
| document to document_links | cascade | Link rows depend on document identity |
| document to financial proof | restrict | Proof documents must not disappear silently |

## Audit File Strategy

Database audit logs support querying. Append-only text audit files support tamper resistance.

Recommended table:

### audit_event_files

- `id`
- `storage_path`
- `file_sha256`
- `previous_file_sha256`
- `opened_at`
- `closed_at`
- `event_count`
- `status`
- timestamps

Rules:

- Each audit event is written to the database and appended to a text file.
- Each file stores a hash of the previous file.
- Closed files are immutable.
- Audit files are replicated outside the application write account.
- A compromised user account should not be able to rewrite audit history.
