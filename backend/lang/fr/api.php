<?php

return [
    'auth' => [
        'failed' => 'Les identifiants fournis sont incorrects.',
        'registered' => 'Inscription réussie.',
        'registered_verify_email' => 'Inscription réussie. Veuillez vérifier votre adresse email avant de vous connecter.',
        'logged_in' => 'Connexion réussie.',
        'logged_out' => 'Le jeton d\'accès actuel a été révoqué.',
        'logged_out_all' => 'Tous les jetons d accès ont été révoqués.',
        'email_not_verified' => 'Veuillez vérifier votre adresse email avant de vous connecter.',
        'email_verified' => 'Adresse email vérifiée avec succès.',
        'account_inactive' => 'Ce compte n est pas actif. Veuillez contacter le support si vous pensez qu il s agit d une erreur.',
        'oauth_code_invalid' => 'Cette session de connexion a expiré. Veuillez recommencer.',
        'otp_sent' => 'Code de vérification envoyé.',
        'otp_invalid' => 'Le code de vérification est invalide ou a expiré.',
        'otp_too_many_attempts' => 'Trop de tentatives de vérification. Veuillez demander un nouveau code.',
        'otp_phone_required' => 'Un numéro de téléphone est requis pour la vérification par SMS ou WhatsApp.',
        'otp_channel_unavailable' => 'Ce canal de vérification n est pas disponible pour le moment. Veuillez utiliser la vérification par email.',
        'contact_updated' => 'Vos informations de vérification ont été mises à jour. Un nouveau code a été envoyé.',
        'contact_update_not_allowed' => 'Ces informations de vérification ne peuvent plus être modifiées.',
    ],

    'locale' => [
        'unsupported' => 'La langue sélectionnée n\'est pas prise en charge.',
    ],

    'contact' => [
        'received' => 'Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.',
        'blocked_attachment' => 'Le fichier joint ne peut pas être accepté pour des raisons de sécurité. Veuillez le retirer et renvoyer votre message.',
        'invalid_image_attachment' => 'L’image jointe ne peut pas être lue. Veuillez joindre une image valide ou envoyer votre message sans ce fichier.',
        'suspicious_attachment' => 'Le nom du fichier joint semble risqué. Veuillez renommer ou retirer le fichier et réessayer.',
        'unsafe_attachment' => 'Le fichier joint semble risqué. Veuillez le retirer et renvoyer votre message.',
        'unreadable_attachment' => 'Le fichier joint ne peut pas être lu. Veuillez le retirer et réessayer.',
        'unsupported_attachment' => 'Ce type de fichier joint n’est pas pris en charge. Veuillez le retirer et renvoyer votre message.',
        'attachment_too_large' => 'Le fichier joint est trop volumineux. Veuillez joindre un fichier plus léger.',
        'too_many_attachments' => 'Veuillez joindre moins de fichiers.',
        'consent_required' => 'Veuillez confirmer que nous pouvons répondre à votre message.',
    ],

    'search' => [
        'retrieved' => 'RÃ©sultats de recherche rÃ©cupÃ©rÃ©s avec succÃ¨s.',
        'fallbacks' => [
            'donation' => 'Enregistrement de don',
        ],
        'groups' => [
            'applications' => 'Demandes',
            'beneficiaries' => 'BÃ©nÃ©ficiaires',
            'schools' => 'Ã‰coles',
            'donors' => 'Donateurs',
            'donations' => 'Dons',
            'funds' => 'Fonds',
            'payments' => 'Paiements',
            'sponsorships' => 'Parrainages',
        ],
    ],

    'dashboard' => [
        'retrieved' => 'RÃ©sumÃ© du tableau de bord rÃ©cupÃ©rÃ© avec succÃ¨s.',
    ],

    'errors' => [
        'allocation_currency_mismatch' => 'La devise de l allocation doit correspondre à celle du don.',
        'allocation_fund_mismatch' => 'Le fonds de l allocation doit correspondre au fonds du don.',
        'allocation_over_paid' => 'Le paiement dépasserait le montant restant de l allocation.',
        'donation_must_be_confirmed' => 'Seuls les dons confirmés peuvent être alloués.',
        'donation_over_allocated' => 'L allocation dépasserait le montant restant du don.',
        'donation_reference_exists' => 'Un don avec cette référence existe déjà.',
        'need_over_allocated' => 'L allocation dépasserait le besoin éducatif restant.',
        'payment_allocation_missing' => 'Une ou plusieurs allocations sont introuvables.',
        'payment_allocation_not_approved' => 'Les paiements ne peuvent être liés qu aux allocations approuvées.',
        'payment_allocation_total_mismatch' => 'Les montants alloués doivent être égaux au montant du paiement.',
        'payment_fund_mismatch' => 'Le fonds du paiement doit correspondre au fonds de chaque allocation liée.',
        'payment_reference_exists' => 'Un paiement avec cette référence existe déjà.',
    ],
];
