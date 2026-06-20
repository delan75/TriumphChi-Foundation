<?php

return [
    'auth' => [
        'failed' => 'The provided credentials are incorrect.',
        'registered' => 'Registration successful.',
        'registered_verify_email' => 'Registration successful. Please verify your email address before signing in.',
        'logged_in' => 'Login successful.',
        'logged_out' => 'Current access token revoked.',
        'logged_out_all' => 'All access tokens revoked.',
        'email_not_verified' => 'Please verify your email address before signing in.',
        'email_verified' => 'Email address verified successfully.',
        'account_inactive' => 'This account is not active. Please contact support if you believe this is a mistake.',
        'oauth_code_invalid' => 'This sign-in session has expired. Please try signing in again.',
    ],

    'locale' => [
        'unsupported' => 'The selected language is not supported.',
    ],

    'contact' => [
        'received' => 'Thank you for contacting us. We will respond as soon as possible.',
        'blocked_attachment' => 'The attached file cannot be accepted for safety reasons. Please remove it and send your message again.',
        'invalid_image_attachment' => 'The attached image could not be read. Please attach a valid image or send your message without it.',
        'suspicious_attachment' => 'The attached file name looks unsafe. Please rename or remove the file and try again.',
        'unsafe_attachment' => 'The attached file looks unsafe. Please remove it and send your message again.',
        'unreadable_attachment' => 'The attached file could not be read. Please remove it and try again.',
        'unsupported_attachment' => 'The attached file type is not supported. Please remove it and send your message again.',
        'attachment_too_large' => 'The attached file is too large. Please attach a smaller file.',
        'too_many_attachments' => 'Please attach fewer files.',
        'consent_required' => 'Please confirm that we may respond to your message.',
    ],

    'errors' => [
        'allocation_currency_mismatch' => 'The allocation currency must match the donation currency.',
        'allocation_fund_mismatch' => 'The allocation fund must match the donation fund.',
        'allocation_over_paid' => 'The payment would exceed the remaining allocation amount.',
        'donation_must_be_confirmed' => 'Only confirmed donations can be allocated.',
        'donation_over_allocated' => 'The allocation would exceed the remaining donation amount.',
        'donation_reference_exists' => 'A donation with this reference already exists.',
        'need_over_allocated' => 'The allocation would exceed the remaining educational need amount.',
        'payment_allocation_missing' => 'One or more allocations could not be found.',
        'payment_allocation_not_approved' => 'Payments can only be linked to approved allocations.',
        'payment_allocation_total_mismatch' => 'The allocation amounts must equal the payment amount.',
        'payment_fund_mismatch' => 'The payment fund must match every linked allocation fund.',
        'payment_reference_exists' => 'A payment with this reference already exists.',
    ],
];
