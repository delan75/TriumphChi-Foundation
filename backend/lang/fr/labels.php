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
        'cancelled' => 'Annulé',
        'refunded' => 'Remboursé',
    ],

    'payment_statuses' => [
        'draft' => 'Brouillon',
        'confirmed' => 'Confirme',
        'void' => 'Annule juridiquement',
        'pending' => 'En attente',
        'approved' => 'Approuvé',
        'paid' => 'Payé',
        'failed' => 'Échoué',
        'cancelled' => 'Annulé',
    ],

    'allocation_statuses' => [
        'proposed' => 'Proposee',
        'approved' => 'Approuvee',
        'cancelled' => 'Annulee',
    ],

    'payment_methods' => [
        'mtn_mobile_money' => 'MTN Mobile Money',
        'orange_money' => 'Orange Money',
        'stripe' => 'Stripe',
        'paypal' => 'PayPal',
        'cash' => 'Espèces',
        'bank_transfer' => 'Virement bancaire',
        'mobile_money' => 'Mobile money',
        'card' => 'Carte',
        'cheque' => 'Chèque',
    ],

    'donation_frequencies' => [
        'one_time' => 'Une fois',
        'monthly' => 'Mensuel',
    ],

    'donation_purposes' => [
        'greatest_need' => 'Besoin le plus urgent',
        'general_education' => 'Fonds general pour l education',
        'school_fees' => 'Frais scolaires',
        'learning_materials' => 'Materiel scolaire',
        'examination_support' => 'Soutien aux examens',
        'uniform_support' => 'Soutien aux uniformes',
        'emergency_education' => 'Urgence scolaire',
    ],

    'payment_providers' => [
        'cards' => 'Cartes',
        'paypal' => 'PayPal',
        'momo' => 'MoMo',
        'bank_transfer' => 'Virement bancaire',
        'manual' => 'Hors ligne / Manuel',
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
        'anonymous' => 'Anonyme',
        'individual' => 'Individuel',
        'organization' => 'Organisation',
        'corporate' => 'Entreprise',
        'foundation' => 'Fondation',
    ],

    'donor_statuses' => [
        'active' => 'Actif',
        'inactive' => 'Inactif',
        'blocked' => 'Bloqué',
    ],

    'user_statuses' => [
        'invited' => 'Invité',
        'pending' => 'Vérification en attente',
        'active' => 'Actif',
        'suspended' => 'Suspendu',
        'disabled' => 'Désactivé',
        'archived' => 'Archivé',
        'locked' => 'Verrouillé',
    ],

    'contact_reasons' => [
        'general' => 'Général',
        'sponsorship' => 'Parrainage',
        'assistance' => 'Assistance',
        'school' => 'École',
        'volunteer' => 'Bénévolat',
        'partnership' => 'Partenariat',
        'church' => 'Église',
        'corporate' => 'Organisation',
    ],

    'contact_message_statuses' => [
        'new' => 'Nouveau',
        'reviewing' => 'En revue',
        'replied' => 'Répondu',
        'archived' => 'Archivé',
        'spam' => 'Spam',
    ],

    'payment_intent_statuses' => [
        'draft' => 'Brouillon',
        'pending' => 'En attente',
        'processing' => 'En traitement',
        'completed' => 'Terminé',
        'failed' => 'Échoué',
        'cancelled' => 'Annulé',
        'expired' => 'Expiré',
    ],

    'payment_transaction_statuses' => [
        'pending' => 'En attente',
        'processing' => 'En traitement',
        'completed' => 'Terminé',
        'failed' => 'Échoué',
        'cancelled' => 'Annulé',
        'refunded' => 'Remboursé',
    ],

    'payment_transaction_types' => [
        'payment' => 'Paiement',
        'request_to_pay' => 'Demande de paiement',
        'status_check' => 'Vérification de statut',
        'callback' => 'Notification',
        'paypal_order' => 'Commande PayPal',
        'paypal_capture' => 'Capture PayPal',
        'order_create' => 'Création de commande',
    ],

    'donation_document_types' => [
        'receipt' => 'Reçu',
        'invoice' => 'Facture',
        'tax_certificate' => 'Certificat fiscal',
    ],

    'donation_document_statuses' => [
        'issued' => 'Émis',
        'voided' => 'Annulé',
        'draft' => 'Brouillon',
    ],

    'report_request_statuses' => [
        'queued' => 'En file',
        'processing' => 'En traitement',
        'completed' => 'Prêt',
        'failed' => 'Échoué',
        'expired' => 'Expiré',
    ],

    'report_categories' => [
        'applications' => 'Demandes',
        'beneficiaries' => 'Bénéficiaires',
        'schools' => 'Écoles',
        'donations' => 'Dons',
        'funding' => 'Financement',
        'payments' => 'Paiements',
        'impact' => 'Impact',
    ],

    'report_category_descriptions' => [
        'applications' => 'Pipeline des demandes et progression des revues.',
        'beneficiaries' => 'Enfants recevant un soutien éducatif.',
        'schools' => 'Écoles, régions et soutien aux élèves.',
        'donations' => 'Dons et contributions des donateurs.',
        'funding' => 'Écarts de financement, allocations et soldes.',
        'payments' => 'Paiements scolaires et audit des paiements.',
        'impact' => 'Mises à jour d impact et résumés des résultats.',
    ],

    'report_funding_statuses' => [
        'funding_gap' => 'Écart de financement',
        'partially_funded' => 'Partiellement financé',
        'fully_funded' => 'Entièrement financé',
    ],

    'report_templates' => [
        'beneficiary_summary' => 'Résumé des bénéficiaires',
        'funding_gap' => 'Rapport des écarts de financement',
        'school_payments' => 'Paiements scolaires',
        'application_pipeline' => 'Pipeline des demandes',
        'donor_contributions' => 'Contributions des donateurs',
        'impact_summary' => 'Résumé annuel de l impact',
        'schools_by_region' => 'Écoles par région',
        'payment_audit' => 'Audit des paiements',
    ],

    'quick_reports' => [
        'applications_awaiting_review' => 'Demandes en attente de revue',
        'children_awaiting_funding' => 'Enfants en attente de financement',
        'upcoming_school_payments' => 'Paiements scolaires à venir',
        'donations_this_month' => 'Dons reçus ce mois',
        'outstanding_needs' => 'Besoins éducatifs ouverts',
        'beneficiaries_by_school' => 'Bénéficiaires par école',
    ],

    'quick_report_descriptions' => [
        'applications_awaiting_review' => 'Demandes attendant une décision.',
        'children_awaiting_funding' => 'Besoins approuvés pas encore financés.',
        'upcoming_school_payments' => 'Paiements scolaires dus bientôt.',
        'donations_this_month' => 'Dons confirmés par canal et devise.',
        'outstanding_needs' => 'Frais, examens, livres, uniformes et matériels ouverts.',
        'beneficiaries_by_school' => 'Enfants soutenus regroupés par école.',
    ],

    'report_insights' => [
        'review' => 'Demandes en attente de revue',
        'gaps' => 'Bénéficiaires avec écarts',
        'payments' => 'Paiements dus cette semaine',
        'schools' => 'Écoles en attente de paiement',
        'donations' => 'Dons confirmés ce mois',
    ],

    'sponsorship_types' => [
        'program' => 'Parrainage de programme',
        'full' => 'Parrainage complet',
        'partial' => 'Parrainage partiel',
        'recurring' => 'Parrainage récurrent',
        'one_time' => 'Parrainage ponctuel',
    ],

    'sponsorship_statuses' => [
        'draft' => 'Brouillon',
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
        'contact_messages.view' => 'Voir les messages de contact',
        'contact_messages.update' => 'Mettre à jour les messages de contact',
        'contact_messages.archive' => 'Archiver les messages de contact',
        'contact_messages.attachments.view' => 'Voir les fichiers joints aux messages de contact',
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
        'reports.view' => 'Voir les rapports',
        'users.view' => 'Voir les utilisateurs',
        'users.create' => 'Créer des utilisateurs',
        'users.update' => 'Mettre à jour les utilisateurs',
        'users.delete' => 'Supprimer les utilisateurs',
        'users.access.manage' => 'Gérer l’accès utilisateur',
        'users.activate' => 'Activer les utilisateurs',
        'users.suspend' => 'Suspendre les utilisateurs',
        'users.archive' => 'Archiver les utilisateurs',
        'users.sessions.manage' => 'Terminer les sessions utilisateur',
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
