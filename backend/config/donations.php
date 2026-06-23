<?php

return [
    'default_currency' => 'USD',
    'default_frequency' => 'one_time',
    'default_purpose' => 'greatest_need',

    'frequencies' => [
        ['key' => 'one_time', 'label' => 'One-Time'],
        ['key' => 'monthly', 'label' => 'Monthly'],
    ],

    'currencies' => [
        'USD' => ['symbol' => '$', 'minimum_amount' => 2, 'suggested_amounts' => [10, 25, 50, 100, 250]],
        'GBP' => ['symbol' => '£', 'minimum_amount' => 1, 'suggested_amounts' => [10, 25, 50, 100, 250]],
        'EUR' => ['symbol' => '€', 'minimum_amount' => 2, 'suggested_amounts' => [10, 25, 50, 100, 250]],
        'ZAR' => ['symbol' => 'R', 'minimum_amount' => 10, 'suggested_amounts' => [100, 250, 500, 1000, 2500]],
        'XAF' => ['symbol' => 'FCFA', 'minimum_amount' => 100, 'suggested_amounts' => [1000, 5000, 10000, 25000, 50000, 100000]],
        'CAD' => ['symbol' => '$', 'minimum_amount' => 250, 'suggested_amounts' => [10, 25, 50, 100, 250]],
        'AUD' => ['symbol' => '$', 'minimum_amount' => 5, 'suggested_amounts' => [10, 25, 50, 100, 250]],
    ],

    'purposes' => [
        ['key' => 'greatest_need', 'fund_slug' => 'greatest-need', 'fund_name' => 'Greatest Need', 'label' => 'Greatest Need'],
        ['key' => 'general_education', 'fund_slug' => 'general-education', 'fund_name' => 'General Education Fund', 'label' => 'General Education Fund'],
        ['key' => 'school_fees', 'fund_slug' => 'school-fees', 'fund_name' => 'School Fees', 'label' => 'School Fees'],
        ['key' => 'learning_materials', 'fund_slug' => 'learning-materials', 'fund_name' => 'Learning Materials', 'label' => 'Learning Materials'],
        ['key' => 'examination_support', 'fund_slug' => 'examination-support', 'fund_name' => 'Examination Support', 'label' => 'Examination Support'],
        ['key' => 'uniform_support', 'fund_slug' => 'uniform-support', 'fund_name' => 'Uniform Support', 'label' => 'Uniform Support'],
        ['key' => 'emergency_education', 'fund_slug' => 'emergency-education', 'fund_name' => 'Emergency Educational Support', 'label' => 'Emergency Educational Support'],
    ],

    'providers' => [
        [
            'key' => 'cards',
            'name' => 'Cards',
            'method' => 'stripe',
            'category' => 'card',
            'enabled' => true,
            'currencies' => ['USD', 'GBP', 'EUR', 'ZAR', 'XAF', 'CAD', 'AUD'],
        ],
        [
            'key' => 'paypal',
            'name' => 'PayPal',
            'method' => 'paypal',
            'category' => 'wallet',
            'enabled' => true,
            'currencies' => ['USD', 'GBP', 'EUR', 'CAD', 'AUD'],
        ],
        [
            'key' => 'momo',
            'name' => 'MoMo',
            'method' => 'mtn_mobile_money',
            'category' => 'mobile_money',
            'enabled' => true,
            'currencies' => array_values(array_filter(array_map('trim', explode(',', env('MOMO_COLLECTIONS_CURRENCIES', 'XAF'))))),
        ],
        [
            'key' => 'bank_transfer',
            'name' => 'Bank Transfer',
            'method' => 'bank_transfer',
            'category' => 'bank',
            'enabled' => true,
            'currencies' => ['USD', 'GBP', 'EUR', 'ZAR', 'XAF', 'CAD', 'AUD'],
        ],
    ],
];
