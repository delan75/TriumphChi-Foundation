# Conceptual Data Model

## Purpose

The database must represent the work of the organization accurately before it represents screens, APIs, or framework code.

The core question is:

```text
Who needed support, who funded it, how was the support delivered, and what evidence proves the outcome?
```

## Core Business Flows

### Beneficiary Support Flow

```text
Application
  -> Beneficiary
  -> Educational Need
  -> Allocation
  -> Payment
  -> School
  -> Academic Record / Impact Update
```

Meaning:

- An application is an intake record.
- A beneficiary is the accepted child support record.
- An educational need defines what support is required.
- An allocation reserves donated money for a need.
- A payment records money leaving the organization.
- Academic records and impact updates prove support outcomes.

### Funding Flow

```text
Donor
  -> Donation
  -> Fund
  -> Allocation
  -> Educational Need
```

Meaning:

- A donor gives money.
- A donation records money received.
- A fund represents the holding or restriction category.
- An allocation explains how money is assigned.
- The educational need shows why the money was used.

### Donor Accountability Flow

```text
Donor
  -> Donation
  -> Allocation
  -> Payment
  -> Beneficiary / School
  -> Impact Evidence
  -> Generated Report / Certificate
```

Meaning:

- A payment receipt proves money was received.
- Accountability evidence proves what happened after the donation.
- Reports and certificates are generated artifacts with snapshots.

## Primary Entities

| Entity | Business Meaning | Source Of Truth For |
| --- | --- | --- |
| Application | A request or referral for support | Intake and review history |
| Beneficiary | A child accepted into support | Child support identity and lifecycle |
| School | Institution delivering education | School identity, verification, payment destination |
| Educational Need | Specific cost or support need | Required amount, academic year, support category |
| Donor | Individual or organization funding support | Donor identity and communication |
| Donation | Money received | Incoming funds |
| Fund | Holding or restricted fund bucket | Fund purpose and restriction |
| Allocation | Money assigned to a need | Use-of-funds decision |
| Payment | Money paid out | Disbursement to schools or vendors |
| Sponsorship | Donor-to-beneficiary support relationship | Commitment and duration |
| Academic Record | Education outcome | Term/year performance |
| Impact Update | Narrative or media update | Support outcome evidence |
| Document | Stored proof or generated artifact | Receipts, proof, certificates, reports |
| Report Snapshot | Historical generated report data | Point-in-time report truth |
| Audit Event | Change trail | Who did what and when |

## Cardinality Rules

| Relationship | Cardinality | Notes |
| --- | --- | --- |
| Application to Beneficiary | 0 or 1 to 0 or 1 | Only accepted applications become beneficiaries |
| School to Beneficiary | 1 to many | A beneficiary should have one active school at a time |
| Beneficiary to Educational Need | 1 to many | Needs change by year, term, and category |
| Donor to Donation | 1 to many | A donor can give many times |
| Donation to Allocation | 1 to many | One donation can fund many needs |
| Educational Need to Allocation | 1 to many | One need can be funded by many donations |
| Allocation to Payment | many to many | Payments may combine allocations; allocations may be paid in parts |
| Donor to Sponsorship | 1 to many | Sponsorship can be full, partial, recurring, or one-time |
| Beneficiary to Sponsorship | 1 to many | A beneficiary can have multiple sponsors |
| Entity to Document | many to many | One document may support multiple entities |
| Donor to Evidence Package | 1 to many | Corporate donors may need periodic evidence packs |

## Normalization Rules

Store each fact once.

Do not duplicate:

- beneficiary name on payments
- school address on payments
- donor details on donations beyond immutable receipt snapshots
- allocation totals on beneficiaries
- report totals as manually edited source records

Use references:

- `payments.school_id`
- `payments.beneficiary_id`
- `allocations.educational_need_id`
- `donations.donor_id`
- `documents` plus `document_links`

Derived totals can be calculated from source tables. If performance later requires summaries, create reporting projections that can be rebuilt from source records.
