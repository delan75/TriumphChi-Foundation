# Indexes and Transactions

## Index Strategy

Indexes are designed around expected API access patterns.

List endpoints should filter by:

- status
- owner or parent ID
- date range
- region
- school
- academic year
- report period
- donor
- evidence package

Common index patterns:

- `status, created_at`
- `parent_id, status`
- `parent_id, created_at`
- `region_id, status`
- unique public references such as `application_number`, `internal_id`, `donations.reference`, and `payments.reference`
- unique localized content rows such as `content_page_id, locale`
- localized content lookup such as `locale, title`
- `donor_id, period_start, period_end` for evidence packages and donor reporting
- `entity_type, entity_id` for document links, status history, and audit trails
- `report_type, generated_at` for report snapshots
- `classification, created_at` for restricted audit and document review

Avoid indexing every column. Add indexes for query patterns that exist in API filters, reporting views, or integrity constraints.

## Evidence Query Patterns

Evidence management should support:

- all documents linked to a donation
- all payments funded by a corporate donor in a reporting period
- all beneficiaries impacted by a donation or evidence package
- all reports generated for a donor
- all certificates issued in a tax year
- all audit events for a sensitive entity

Indexes should favor these paths:

- `document_links.entity_type, document_links.entity_id`
- `donation_receipts.donation_id`
- `tax_certificates.tax_year, tax_certificates.issued_at`
- `report_snapshots.generated_for_type, report_snapshots.generated_for_id`
- `evidence_packages.donor_id, evidence_packages.period_start, evidence_packages.period_end`
- `evidence_package_items.evidence_package_id`

## Financial Transactions

Donation allocation and school payment flows must run in database transactions.

Example allocation transaction:

```php
DB::transaction(function () use ($donationId, $needId, $amount) {
    $donation = Donation::query()
        ->whereKey($donationId)
        ->lockForUpdate()
        ->firstOrFail();

    $need = EducationalNeed::query()
        ->whereKey($needId)
        ->lockForUpdate()
        ->firstOrFail();

    // Validate available donation balance and remaining need balance here.

    Allocation::create([
        'donation_id' => $donation->id,
        'fund_id' => $donation->fund_id,
        'educational_need_id' => $need->id,
        'amount' => $amount,
        'allocated_by' => auth()->id(),
        'allocated_at' => now(),
    ]);

    $need->increment('amount_funded', $amount);
});
```

## Avoiding Incoherent Balances

Do not trust client-provided balances.

For money operations:

- Lock source records.
- Recalculate available amounts inside the transaction.
- Validate against locked rows.
- Write allocation or payment records.
- Update cached totals after the write.
- Record an audit log entry.

## Idempotent Writes

Payment and donation confirmations should be idempotent.

Use unique references to prevent duplicates:

- donation provider reference
- bank transfer reference
- mobile money transaction ID
- payment reference

If a provider retries a callback, the API should return the existing record instead of creating a duplicate.

