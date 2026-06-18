<?php

return [
    'auth' => [
        'failed' => 'The provided credentials are incorrect.',
        'registered' => 'Registration successful.',
        'logged_in' => 'Login successful.',
        'logged_out' => 'Current access token revoked.',
        'logged_out_all' => 'All access tokens revoked.',
    ],

    'locale' => [
        'unsupported' => 'The selected language is not supported.',
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
