<?php

return [
    'locales' => [
        'en' => 'Anglais',
        'fr' => 'Français',
    ],

    'application_sources' => [
        'public' => 'Demande publique',
        'school' => 'Référence de l\'école',
        'field_officer' => 'Référence de l\'agent de terrain',
        'staff' => 'Saisie par le personnel',
    ],

    'application_statuses' => [
        'draft' => 'Brouillon',
        'submitted' => 'Soumise',
        'verification_pending' => 'Vérification en attente',
        'verified' => 'Vérifiée',
        'review_pending' => 'Examen en attente',
        'accepted' => 'Acceptée',
        'rejected' => 'Rejetée',
    ],

    'beneficiary_statuses' => [
        'awaiting_sponsorship' => 'En attente de parrainage',
        'partially_funded' => 'Partiellement financé',
        'fully_funded' => 'Entièrement financé',
        'active_support' => 'Soutien actif',
        'graduated' => 'Diplômé',
        'archived' => 'Archivé',
    ],

    'need_statuses' => [
        'open' => 'Ouvert',
        'partially_funded' => 'Partiellement financé',
        'funded' => 'Financé',
        'paid' => 'Payé',
        'cancelled' => 'Annulé',
    ],

    'donation_statuses' => [
        'pending' => 'En attente',
        'confirmed' => 'Confirmé',
        'failed' => 'Échoué',
        'refunded' => 'Remboursé',
    ],

    'payment_statuses' => [
        'pending' => 'En attente',
        'approved' => 'Approuvé',
        'paid' => 'Payé',
        'failed' => 'Échoué',
        'cancelled' => 'Annulé',
    ],

    'payment_methods' => [
        'cash' => 'Espèces',
        'bank_transfer' => 'Virement bancaire',
        'mobile_money' => 'Mobile money',
        'card' => 'Carte',
        'cheque' => 'Chèque',
    ],

    'school_verification_statuses' => [
        'pending' => 'En attente',
        'verified' => 'Vérifiée',
        'rejected' => 'Rejetée',
    ],

    'impact_visibility' => [
        'private' => 'Privé',
        'sponsors' => 'Parrains uniquement',
        'public_curated' => 'Public validé',
    ],

    'donor_types' => [
        'individual' => 'Individuel',
        'organization' => 'Organisation',
        'corporate' => 'Entreprise',
        'foundation' => 'Fondation',
    ],

    'sponsorship_types' => [
        'full' => 'Parrainage complet',
        'partial' => 'Parrainage partiel',
        'recurring' => 'Parrainage récurrent',
        'one_time' => 'Parrainage ponctuel',
    ],

    'sponsorship_statuses' => [
        'active' => 'Actif',
        'paused' => 'Suspendu',
        'completed' => 'Terminé',
        'cancelled' => 'Annulé',
    ],

    'permissions' => [
        'applications.view' => 'Voir les demandes',
        'applications.create' => 'Créer des demandes',
        'applications.update' => 'Mettre à jour les demandes',
        'applications.delete' => 'Supprimer les demandes',
        'applications.verify' => 'Vérifier les demandes',
        'beneficiaries.view' => 'Voir les bénéficiaires',
        'beneficiaries.create' => 'Créer des bénéficiaires',
        'beneficiaries.update' => 'Mettre à jour les bénéficiaires',
        'beneficiaries.delete' => 'Supprimer les bénéficiaires',
        'schools.view' => 'Voir les écoles',
        'schools.create' => 'Créer des écoles',
        'schools.update' => 'Mettre à jour les écoles',
        'schools.delete' => 'Supprimer les écoles',
        'donors.view' => 'Voir les donateurs',
        'donors.create' => 'Créer des donateurs',
        'donors.update' => 'Mettre à jour les donateurs',
        'donors.delete' => 'Supprimer les donateurs',
        'donations.view' => 'Voir les dons',
        'donations.create' => 'Créer des dons',
        'donations.update' => 'Mettre à jour les dons',
        'donations.approve' => 'Approuver les dons',
        'funds.view' => 'Voir les fonds',
        'funds.create' => 'Créer des fonds',
        'funds.update' => 'Mettre à jour les fonds',
        'allocations.view' => 'Voir les allocations',
        'allocations.create' => 'Créer des allocations',
        'allocations.update' => 'Mettre à jour les allocations',
        'payments.view' => 'Voir les paiements',
        'payments.create' => 'Créer des paiements',
        'payments.approve' => 'Approuver les paiements',
        'impact_updates.view' => 'Voir les nouvelles d\'impact',
        'impact_updates.create' => 'Créer des nouvelles d\'impact',
        'impact_updates.publish' => 'Publier les nouvelles d\'impact',
        'users.view' => 'Voir les utilisateurs',
        'users.create' => 'Créer des utilisateurs',
        'users.update' => 'Mettre à jour les utilisateurs',
        'users.delete' => 'Supprimer les utilisateurs',
        'roles.manage' => 'Gérer les rôles',
        'permissions.manage' => 'Gérer les permissions',
        'audit_logs.view' => 'Voir les journaux d\'audit',
    ],

    'reports' => [
        'beneficiary_lifecycle' => 'Cycle de vie des bénéficiaires',
        'funding_gap' => 'Besoin de financement',
        'donor_giving' => 'Dons des donateurs',
        'school_payments' => 'Paiements aux écoles',
    ],
];
