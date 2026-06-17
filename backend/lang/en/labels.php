<?php

return [
    'locales' => [
        'en' => 'English',
        'fr' => 'French',
    ],

    'application_sources' => [
        'public' => 'Public application',
        'school' => 'School referral',
        'field_officer' => 'Field officer referral',
        'staff' => 'Staff entry',
    ],

    'application_statuses' => [
        'draft' => 'Draft',
        'submitted' => 'Submitted',
        'verification_pending' => 'Verification pending',
        'verified' => 'Verified',
        'review_pending' => 'Review pending',
        'accepted' => 'Accepted',
        'rejected' => 'Rejected',
    ],

    'beneficiary_statuses' => [
        'awaiting_sponsorship' => 'Awaiting sponsorship',
        'partially_funded' => 'Partially funded',
        'fully_funded' => 'Fully funded',
        'active_support' => 'Active support',
        'graduated' => 'Graduated',
        'archived' => 'Archived',
    ],

    'need_statuses' => [
        'open' => 'Open',
        'partially_funded' => 'Partially funded',
        'funded' => 'Funded',
        'paid' => 'Paid',
        'cancelled' => 'Cancelled',
    ],

    'donation_statuses' => [
        'pending' => 'Pending',
        'confirmed' => 'Confirmed',
        'failed' => 'Failed',
        'refunded' => 'Refunded',
    ],

    'payment_statuses' => [
        'draft' => 'Draft',
        'pending' => 'Pending',
        'approved' => 'Approved',
        'paid' => 'Paid',
        'confirmed' => 'Confirmed',
        'failed' => 'Failed',
        'cancelled' => 'Cancelled',
        'void' => 'Void',
    ],

    'payment_methods' => [
        'cash' => 'Cash',
        'bank_transfer' => 'Bank transfer',
        'mobile_money' => 'Mobile money',
        'mtn_mobile_money' => 'MTN Mobile Money',
        'orange_money' => 'Orange Money',
        'card' => 'Card',
        'cheque' => 'Cheque',
        'stripe' => 'Stripe',
        'paypal' => 'PayPal',
    ],

    'school_verification_statuses' => [
        'pending' => 'Pending',
        'verified' => 'Verified',
        'rejected' => 'Rejected',
    ],

    'impact_visibility' => [
        'private' => 'Private',
        'sponsors' => 'Sponsors only',
        'public_curated' => 'Public curated',
    ],

    'donor_types' => [
        'individual' => 'Individual',
        'organization' => 'Organization',
        'corporate' => 'Corporate',
        'foundation' => 'Foundation',
        'anonymous' => 'Anonymous',
    ],

    'sponsorship_types' => [
        'full' => 'Full sponsorship',
        'partial' => 'Partial sponsorship',
        'recurring' => 'Recurring sponsorship',
        'one_time' => 'One-time sponsorship',
        'program' => 'Program sponsorship',
    ],

    'sponsorship_statuses' => [
        'draft' => 'Draft',
        'active' => 'Active',
        'paused' => 'Paused',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ],

    'permissions' => [
        'applications.view' => 'View applications',
        'applications.create' => 'Create applications',
        'applications.update' => 'Update applications',
        'applications.delete' => 'Delete applications',
        'applications.verify' => 'Verify applications',
        'beneficiaries.view' => 'View beneficiaries',
        'beneficiaries.create' => 'Create beneficiaries',
        'beneficiaries.update' => 'Update beneficiaries',
        'beneficiaries.delete' => 'Delete beneficiaries',
        'schools.view' => 'View schools',
        'schools.create' => 'Create schools',
        'schools.update' => 'Update schools',
        'schools.delete' => 'Delete schools',
        'donors.view' => 'View donors',
        'donors.create' => 'Create donors',
        'donors.update' => 'Update donors',
        'donors.delete' => 'Delete donors',
        'donations.view' => 'View donations',
        'donations.create' => 'Create donations',
        'donations.update' => 'Update donations',
        'donations.approve' => 'Approve donations',
        'funds.view' => 'View funds',
        'funds.create' => 'Create funds',
        'funds.update' => 'Update funds',
        'allocations.view' => 'View allocations',
        'allocations.create' => 'Create allocations',
        'allocations.update' => 'Update allocations',
        'payments.view' => 'View payments',
        'payments.create' => 'Create payments',
        'payments.approve' => 'Approve payments',
        'impact_updates.view' => 'View impact updates',
        'impact_updates.create' => 'Create impact updates',
        'impact_updates.publish' => 'Publish impact updates',
        'users.view' => 'View users',
        'users.create' => 'Create users',
        'users.update' => 'Update users',
        'users.delete' => 'Delete users',
        'roles.manage' => 'Manage roles',
        'permissions.manage' => 'Manage permissions',
        'audit_logs.view' => 'View audit logs',
    ],

    'reports' => [
        'beneficiary_lifecycle' => 'Beneficiary lifecycle',
        'funding_gap' => 'Funding gap',
        'donor_giving' => 'Donor giving',
        'school_payments' => 'School payments',
    ],
];
