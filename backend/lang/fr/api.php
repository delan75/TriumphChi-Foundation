<?php

return [
    'auth' => [
        'failed' => 'Les identifiants fournis sont incorrects.',
        'logged_in' => 'Connexion reussie.',
        'logged_out' => 'Le jeton d acces actuel a ete revoque.',
        'logged_out_all' => 'Tous les jetons d acces ont ete revoques.',
    ],

    'locale' => [
        'unsupported' => 'La langue sélectionnée n\'est pas prise en charge.',
    ],

    'errors' => [
        'allocation_currency_mismatch' => 'La devise de l allocation doit correspondre a celle du don.',
        'allocation_fund_mismatch' => 'Le fonds de l allocation doit correspondre au fonds du don.',
        'allocation_over_paid' => 'Le paiement depasserait le montant restant de l allocation.',
        'donation_must_be_confirmed' => 'Seuls les dons confirmes peuvent etre alloues.',
        'donation_over_allocated' => 'L allocation depasserait le montant restant du don.',
        'donation_reference_exists' => 'Un don avec cette reference existe deja.',
        'need_over_allocated' => 'L allocation depasserait le besoin educatif restant.',
        'payment_allocation_missing' => 'Une ou plusieurs allocations sont introuvables.',
        'payment_allocation_not_approved' => 'Les paiements ne peuvent etre lies qu aux allocations approuvees.',
        'payment_allocation_total_mismatch' => 'Les montants alloues doivent etre egaux au montant du paiement.',
        'payment_fund_mismatch' => 'Le fonds du paiement doit correspondre au fonds de chaque allocation liee.',
        'payment_reference_exists' => 'Un paiement avec cette reference existe deja.',
    ],
];
