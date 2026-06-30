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
        'cancelled' => 'Cancelled',
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

    'allocation_statuses' => [
        'proposed' => 'Proposed',
        'approved' => 'Approved',
        'cancelled' => 'Cancelled',
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

    'donation_frequencies' => [
        'one_time' => 'One-Time',
        'monthly' => 'Monthly',
    ],

    'donation_purposes' => [
        'greatest_need' => 'Greatest Need',
        'general_education' => 'General Education Fund',
        'school_fees' => 'School Fees',
        'learning_materials' => 'Learning Materials',
        'examination_support' => 'Examination Support',
        'uniform_support' => 'Uniform Support',
        'emergency_education' => 'Emergency Educational Support',
    ],

    'payment_providers' => [
        'cards' => 'Cards',
        'paypal' => 'PayPal',
        'momo' => 'MoMo',
        'bank_transfer' => 'Bank Transfer',
        'manual' => 'Offline / Manual',
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

    'donor_statuses' => [
        'active' => 'Active',
        'inactive' => 'Inactive',
        'blocked' => 'Blocked',
    ],

    'user_statuses' => [
        'invited' => 'Invited',
        'pending' => 'Pending verification',
        'active' => 'Active',
        'suspended' => 'Suspended',
        'disabled' => 'Disabled',
        'archived' => 'Archived',
        'locked' => 'Locked',
    ],

    'contact_reasons' => [
        'general' => 'General',
        'sponsorship' => 'Sponsorship',
        'assistance' => 'Assistance',
        'school' => 'School',
        'volunteer' => 'Volunteer',
        'partnership' => 'Partnership',
        'church' => 'Church',
        'corporate' => 'Corporate',
    ],

    'contact_message_statuses' => [
        'new' => 'New',
        'reviewing' => 'Reviewing',
        'replied' => 'Replied',
        'archived' => 'Archived',
        'spam' => 'Spam',
    ],

    'payment_intent_statuses' => [
        'draft' => 'Draft',
        'pending' => 'Pending',
        'processing' => 'Processing',
        'completed' => 'Completed',
        'failed' => 'Failed',
        'cancelled' => 'Cancelled',
        'expired' => 'Expired',
    ],

    'payment_transaction_statuses' => [
        'pending' => 'Pending',
        'processing' => 'Processing',
        'completed' => 'Completed',
        'failed' => 'Failed',
        'cancelled' => 'Cancelled',
        'refunded' => 'Refunded',
    ],

    'payment_transaction_types' => [
        'payment' => 'Payment',
        'request_to_pay' => 'Request to pay',
        'status_check' => 'Status check',
        'callback' => 'Callback',
        'paypal_order' => 'PayPal order',
        'paypal_capture' => 'PayPal capture',
        'order_create' => 'Order create',
    ],

    'donation_document_types' => [
        'receipt' => 'Receipt',
        'invoice' => 'Invoice',
        'tax_certificate' => 'Tax certificate',
    ],

    'donation_document_statuses' => [
        'issued' => 'Issued',
        'voided' => 'Voided',
        'draft' => 'Draft',
    ],

    'report_request_statuses' => [
        'queued' => 'Queued',
        'processing' => 'Processing',
        'completed' => 'Ready',
        'failed' => 'Failed',
        'expired' => 'Expired',
    ],

    'report_categories' => [
        'applications' => 'Applications',
        'beneficiaries' => 'Beneficiaries',
        'schools' => 'Schools',
        'donations' => 'Donations',
        'funding' => 'Funding',
        'payments' => 'Payments',
        'impact' => 'Impact',
    ],

    'report_category_descriptions' => [
        'applications' => 'Application pipeline and review progress.',
        'beneficiaries' => 'Children receiving educational support.',
        'schools' => 'Schools, regions, and student support.',
        'donations' => 'Giving records and donor contributions.',
        'funding' => 'Funding gaps, allocations, and balances.',
        'payments' => 'School payments and payment audit trails.',
        'impact' => 'Impact updates and outcome summaries.',
    ],

    'report_funding_statuses' => [
        'funding_gap' => 'Funding Gap',
        'partially_funded' => 'Partially Funded',
        'fully_funded' => 'Fully Funded',
    ],

    'report_templates' => [
        'beneficiary_summary' => 'Beneficiary Summary',
        'funding_gap' => 'Funding Gap Report',
        'school_payments' => 'School Payments',
        'application_pipeline' => 'Application Pipeline',
        'donor_contributions' => 'Donor Contributions',
        'impact_summary' => 'Annual Impact Summary',
        'schools_by_region' => 'Schools by Region',
        'payment_audit' => 'Payment Audit',
    ],

    'quick_reports' => [
        'applications_awaiting_review' => 'Applications Awaiting Review',
        'children_awaiting_funding' => 'Children Awaiting Funding',
        'upcoming_school_payments' => 'Upcoming School Payments',
        'donations_this_month' => 'Donations Received This Month',
        'outstanding_needs' => 'Outstanding Educational Needs',
        'beneficiaries_by_school' => 'Beneficiaries by School',
    ],

    'quick_report_descriptions' => [
        'applications_awaiting_review' => 'Requests waiting for review decisions.',
        'children_awaiting_funding' => 'Approved needs not yet fully funded.',
        'upcoming_school_payments' => 'School payments due soon.',
        'donations_this_month' => 'Confirmed gifts grouped by channel and currency.',
        'outstanding_needs' => 'Open fees, exams, books, uniforms, and materials.',
        'beneficiaries_by_school' => 'Children receiving support grouped by school.',
    ],

    'report_insights' => [
        'review' => 'Applications awaiting review',
        'gaps' => 'Beneficiaries with funding gaps',
        'payments' => 'Payments due this week',
        'schools' => 'Schools awaiting payment',
        'donations' => 'Confirmed donations this month',
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
        'contact_messages.view' => 'View contact inquiries',
        'contact_messages.update' => 'Update contact inquiries',
        'contact_messages.archive' => 'Archive contact inquiries',
        'contact_messages.attachments.view' => 'View contact inquiry attachments',
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
        'reports.view' => 'View reports',
        'users.view' => 'View users',
        'users.create' => 'Create users',
        'users.update' => 'Update users',
        'users.delete' => 'Delete users',
        'users.access.manage' => 'Manage user access',
        'users.activate' => 'Activate users',
        'users.suspend' => 'Suspend users',
        'users.archive' => 'Archive users',
        'users.sessions.manage' => 'Terminate user sessions',
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
