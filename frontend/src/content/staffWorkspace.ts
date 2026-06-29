import type { Locale } from '../lib/i18n';

export interface StaffWorkspaceCopy {
  shell: {
    workspaceLabel: string;
    searchPlaceholder: string;
    searchEmpty: string;
    searchTooShort: string;
    searchRecent: string;
    searchRecentEmpty: string;
    searchOpenWorkspace: string;
    searchClear: string;
    searchResults: { one: string; many: string };
    notifications: string;
    notificationsEmpty: string;
    notificationsOpenDashboard: string;
    userMenu: {
      profile: string;
      settings: string;
      logout: string;
      logoutAll: string;
      roleFallback: string;
    };
    nav: {
      overview: string;
      operations: string;
      account: string;
      dashboard: string;
      applications: string;
      beneficiaries: string;
      funding: string;
      contacts: string;
      reports: string;
      users: string;
      profile: string;
      settings: string;
    };
  };
  dashboard: {
    greeting: string;
    title: string;
    subtitle: string;
    roleLabel: string;
    lastLoginLabel: string;
    workspaceLabel: string;
    metricLabels: Record<string, string>;
    metricsSectionTitle: string;
    metricsSectionDescription: string;
    queuesTitle: string;
    queuesDescription: string;
    queueLabels: Record<string, string>;
    queueAction: string;
    queueEmpty: string;
    activityTitle: string;
    activityDescription: string;
    activityEmpty: string;
    quickActionsTitle: string;
    quickActionsDescription: string;
    quickActionLabels: Record<string, { title: string; description: string }>;
    overviewTitle: string;
    overviewDescription: string;
    overviewLabels: {
      accessibleModules: string;
      directPermissions: string;
      snapshotUpdated: string;
    };
    loading: string;
  };
    profile: {
      title: string;
      description: string;
      identityTitle: string;
      identityDescription: string;
      accessNote: string;
      noPermissions: string;
      labels: {
        name: string;
      email: string;
      phone: string;
      locale: string;
      roles: string;
      permissions: string;
      lastLogin: string;
      status: string;
    };
    emptyPhone: string;
  };
  settings: {
    title: string;
    description: string;
    sessionTitle: string;
    sessionDescription: string;
    logoutCurrent: string;
    logoutAll: string;
    inProgress: string;
    done: string;
    workspaceTitle: string;
    workspaceDescription: string;
    localeNote: string;
  };
}

export const staffWorkspaceContent: Record<Locale, StaffWorkspaceCopy> = {
  en: {
    shell: {
      workspaceLabel: 'Operations',
      searchPlaceholder: 'Search applications, beneficiaries, schools, donors, funds, payments...',
      searchEmpty: 'No matching records were found in the workspaces you can access.',
      searchTooShort: 'Type at least two characters to search.',
      searchRecent: 'Recent searches',
      searchRecentEmpty: 'No recent searches yet.',
      searchOpenWorkspace: 'Open workspace',
      searchClear: 'Clear search',
      searchResults: { one: 'result', many: 'results' },
      notifications: 'Notifications',
      notificationsEmpty: 'No urgent items right now.',
      notificationsOpenDashboard: 'Open dashboard',
      userMenu: {
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout',
        logoutAll: 'Logout all devices',
        roleFallback: 'Staff account',
      },
      nav: {
        overview: 'Overview',
        operations: 'Operations',
        account: 'Account',
        dashboard: 'Dashboard',
        applications: 'Applications',
        beneficiaries: 'Beneficiaries',
        funding: 'Funding',
        contacts: 'Contact Inquiries',
        reports: 'Reports',
        users: 'Users',
        profile: 'Profile',
        settings: 'Settings',
      },
    },
    dashboard: {
      greeting: 'Good day',
      title: 'Manage applications, beneficiaries, funding, and reporting from one place.',
      subtitle: 'Surface the work that needs attention, move decisions forward, and keep records coherent across the organization.',
      roleLabel: 'Current role',
      lastLoginLabel: 'Last login',
      workspaceLabel: 'Current workspace',
      metricLabels: {
        applications_pending_review: 'Applications pending review',
        beneficiaries_supported: 'Beneficiaries supported',
        schools_connected: 'Schools connected',
        active_sponsorships: 'Active sponsorships',
        funding_awaiting_allocation: 'Funding awaiting allocation',
        reports_due: 'Reports due',
      },
      metricsSectionTitle: 'Key metrics',
      metricsSectionDescription: 'A quick reading of the queues and records that shape today’s work.',
      queuesTitle: 'Priority work queue',
      queuesDescription: 'Start with the records that need movement now.',
      queueLabels: {
        applications_verification: 'Applications awaiting verification',
        applications_review: 'Applications awaiting review',
        beneficiaries_awaiting_sponsorship: 'Beneficiaries awaiting sponsorship',
        allocations_pending: 'Allocations pending approval',
        payments_pending_approval: 'Payments requiring approval',
      },
      queueAction: 'Open queue',
      queueEmpty: 'Nothing is waiting in this queue.',
      activityTitle: 'Recent activity',
      activityDescription: 'The most recent updates across the records you can access.',
      activityEmpty: 'No recent activity is available yet.',
      quickActionsTitle: 'Quick actions',
      quickActionsDescription: 'Move directly into the workspaces you use most.',
      quickActionLabels: {
        applications_review: {
          title: 'Review applications',
          description: 'Open intake and review queues.',
        },
        beneficiaries_open: {
          title: 'Open beneficiaries',
          description: 'Go to active child records.',
        },
        funding_open: {
          title: 'Open funding',
          description: 'Review donations, allocations, and payments.',
        },
        reports_open: {
          title: 'Open reports',
          description: 'Check impact and accountability work.',
        },
      },
      overviewTitle: 'Access overview',
      overviewDescription: 'A short read on the workspace available to the signed-in user.',
      overviewLabels: {
        accessibleModules: 'Accessible modules',
        directPermissions: 'Direct permissions',
        snapshotUpdated: 'Snapshot updated',
      },
      loading: 'Loading dashboard data...',
    },
    profile: {
      title: 'Profile',
      description: 'Review the account details currently shaping this workspace.',
      identityTitle: 'Identity',
      identityDescription: 'Keep your account details visible and easy to confirm while you work.',
      accessNote: 'Current access is derived from role and permission assignments.',
      noPermissions: 'No direct permissions available.',
      labels: {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        locale: 'Language',
        roles: 'Roles',
        permissions: 'Permissions',
        lastLogin: 'Last login',
        status: 'Status',
      },
      emptyPhone: 'No phone number on file',
    },
    settings: {
      title: 'Settings',
      description: 'Handle session and workspace controls without leaving the authenticated area.',
      sessionTitle: 'Session controls',
      sessionDescription: 'End the current session or revoke access across all devices when needed.',
      logoutCurrent: 'Logout current session',
      logoutAll: 'Logout all devices',
      inProgress: 'Working...',
      done: 'Done.',
      workspaceTitle: 'Workspace notes',
      workspaceDescription: 'Language selection is shared with the rest of the site for a coherent experience.',
      localeNote: 'Use the locale selector in the top bar to switch the workspace language.',
    },
  },
  fr: {
    shell: {
      workspaceLabel: 'Operations',
      searchPlaceholder: 'Rechercher des demandes, beneficiaires, ecoles, donateurs, fonds, paiements...',
      searchEmpty: "Aucun dossier correspondant n'a ete trouve dans les espaces auxquels vous avez acces.",
      searchTooShort: 'Saisissez au moins deux caracteres pour lancer la recherche.',
      searchRecent: 'Recherches recentes',
      searchRecentEmpty: 'Aucune recherche recente pour le moment.',
      searchOpenWorkspace: "Ouvrir l'espace",
      searchClear: 'Effacer la recherche',
      searchResults: { one: 'resultat', many: 'resultats' },
      notifications: 'Notifications',
      notificationsEmpty: "Aucun element urgent pour le moment.",
      notificationsOpenDashboard: 'Ouvrir le tableau de bord',
      userMenu: {
        profile: 'Profil',
        settings: 'Parametres',
        logout: 'Deconnexion',
        logoutAll: 'Deconnexion de tous les appareils',
        roleFallback: 'Compte du personnel',
      },
      nav: {
        overview: 'Vue generale',
        operations: 'Operations',
        account: 'Compte',
        dashboard: 'Tableau de bord',
        applications: 'Demandes',
        beneficiaries: 'Beneficiaires',
        funding: 'Financement',
        contacts: 'Messages de contact',
        reports: 'Rapports',
        users: 'Utilisateurs',
        profile: 'Profil',
        settings: 'Parametres',
      },
    },
    dashboard: {
      greeting: 'Bonjour',
      title: 'Gerez les demandes, les beneficiaires, le financement et les rapports depuis un seul espace.',
      subtitle: "Faites remonter le travail qui demande de l'attention, avancez les decisions et gardez les dossiers coherents dans toute l'organisation.",
      roleLabel: 'Role actuel',
      lastLoginLabel: 'Derniere connexion',
      workspaceLabel: 'Espace actuel',
      metricLabels: {
        applications_pending_review: 'Demandes en attente de revue',
        beneficiaries_supported: 'Beneficiaires suivis',
        schools_connected: 'Ecoles connectees',
        active_sponsorships: 'Parrainages actifs',
        funding_awaiting_allocation: 'Financement en attente d allocation',
        reports_due: 'Rapports attendus',
      },
      metricsSectionTitle: 'Indicateurs cles',
      metricsSectionDescription: "Lecture rapide des files et des dossiers qui structurent le travail d'aujourd'hui.",
      queuesTitle: 'File de travail prioritaire',
      queuesDescription: 'Commencez par les dossiers qui ont besoin de mouvement maintenant.',
      queueLabels: {
        applications_verification: 'Demandes en attente de verification',
        applications_review: 'Demandes en attente de revue',
        beneficiaries_awaiting_sponsorship: 'Beneficiaires en attente de parrainage',
        allocations_pending: 'Allocations en attente d approbation',
        payments_pending_approval: 'Paiements en attente d approbation',
      },
      queueAction: 'Ouvrir la file',
      queueEmpty: "Aucun element n'attend dans cette file.",
      activityTitle: 'Activite recente',
      activityDescription: 'Les mises a jour les plus recentes parmi les dossiers que vous pouvez consulter.',
      activityEmpty: "Aucune activite recente n'est disponible pour le moment.",
      quickActionsTitle: 'Actions rapides',
      quickActionsDescription: 'Entrez directement dans les espaces de travail que vous utilisez le plus.',
      quickActionLabels: {
        applications_review: {
          title: 'Revoir les demandes',
          description: "Ouvrir les files d'entree et de revue.",
        },
        beneficiaries_open: {
          title: 'Ouvrir les beneficiaires',
          description: 'Aller vers les dossiers actifs des enfants.',
        },
        funding_open: {
          title: 'Ouvrir le financement',
          description: 'Examiner les dons, allocations et paiements.',
        },
        reports_open: {
          title: 'Ouvrir les rapports',
          description: "Verifier le travail d'impact et de redevabilite.",
        },
      },
      overviewTitle: "Vue d'ensemble de l'acces",
      overviewDescription: "Lecture courte de l'espace disponible pour l'utilisateur connecte.",
      overviewLabels: {
        accessibleModules: 'Modules accessibles',
        directPermissions: 'Permissions directes',
        snapshotUpdated: 'Snapshot mis a jour',
      },
      loading: 'Chargement des donnees du tableau de bord...',
    },
    profile: {
      title: 'Profil',
      description: 'Consultez les informations de compte qui structurent cet espace de travail.',
      identityTitle: 'Identite',
      identityDescription: 'Gardez vos informations de compte visibles et faciles a verifier pendant le travail.',
      accessNote: "L'acces actuel provient des roles et des permissions attribues.",
      noPermissions: 'Aucune permission directe disponible.',
      labels: {
        name: 'Nom',
        email: 'Email',
        phone: 'Telephone',
        locale: 'Langue',
        roles: 'Roles',
        permissions: 'Permissions',
        lastLogin: 'Derniere connexion',
        status: 'Statut',
      },
      emptyPhone: 'Aucun numero enregistre',
    },
    settings: {
      title: 'Parametres',
      description: 'Gerez la session et les controles de workspace sans quitter la zone authentifiee.',
      sessionTitle: 'Controles de session',
      sessionDescription: "Terminez la session actuelle ou revoquez l'acces sur tous les appareils si necessaire.",
      logoutCurrent: 'Deconnecter la session actuelle',
      logoutAll: 'Deconnecter tous les appareils',
      inProgress: 'Traitement...',
      done: 'Termine.',
      workspaceTitle: "Notes sur l'espace de travail",
      workspaceDescription: "La selection de langue est partagee avec le reste du site pour garder une experience coherente.",
      localeNote: 'Utilisez le selecteur de langue dans la barre superieure pour changer la langue du workspace.',
    },
  },
};
