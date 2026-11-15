import type { Locale } from '../../lib/i18n';

export interface StaffProfileCopy {
  title: string;
  description: string;
  loadingTitle: string;
  loadingDescription: string;
  errorTitle: string;
  errorDescription: string;
  tabs: {
    overview: string;
    activity: string;
    access: string;
    security: string;
    preferences: string;
  };
  actions: {
    editProfile: string;
    changePassword: string;
    manageSecurity: string;
    refresh: string;
  };
  labels: {
    active: string;
    memberSince: string;
    lastActive: string;
    timezone: string;
    language: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    employeeNumber: string;
    signInMethods: string;
    activeSessions: string;
    twoFactor: string;
    recoveryEmail: string;
    theme: string;
    dateFormat: string;
    notifications: string;
  };
  sections: {
    contact: string;
    quickStats: string;
    recentActivity: string;
    responsibilities: string;
    professionalProfile: string;
    permissions: string;
    connectedAccounts: string;
    sessions: string;
    preferences: string;
  };
  stats: {
    applicationsReviewed: string;
    beneficiariesManaged: string;
    paymentsApproved: string;
    reportsGenerated: string;
  };
  empty: {
    phone: string;
    department: string;
    position: string;
    activity: string;
    providers: string;
    sessions: string;
    permissions: string;
    profile: string;
  };
  values: {
    systemAdministrator: string;
    staffMember: string;
    english: string;
    french: string;
    enabled: string;
    disabled: string;
    lightTheme: string;
    browserNotifications: string;
    weeklySummary: string;
  };
}

export const staffProfileContent: Record<Locale, StaffProfileCopy> = {
  en: {
    title: 'Profile',
    description: 'Your professional profile, recent work, account security, and preferences.',
    loadingTitle: 'Loading profile',
    loadingDescription: 'Preparing your profile, activity, access, and security details.',
    errorTitle: 'Profile could not be loaded',
    errorDescription: 'We could not retrieve your profile details. Please refresh and try again.',
    tabs: {
      overview: 'Overview',
      activity: 'Activity',
      access: 'Access',
      security: 'Security',
      preferences: 'Preferences',
    },
    actions: {
      editProfile: 'Edit Profile',
      changePassword: 'Change Password',
      manageSecurity: 'Manage Security',
      refresh: 'Refresh',
    },
    labels: {
      active: 'Active',
      memberSince: 'Member since',
      lastActive: 'Last active',
      timezone: 'Timezone',
      language: 'Language',
      email: 'Email',
      phone: 'Phone',
      department: 'Department',
      position: 'Position',
      employeeNumber: 'Employee number',
      signInMethods: 'Sign-in methods',
      activeSessions: 'Active sessions',
      twoFactor: 'Two-factor authentication',
      recoveryEmail: 'Recovery email',
      theme: 'Theme',
      dateFormat: 'Date format',
      notifications: 'Notifications',
    },
    sections: {
      contact: 'Contact',
      quickStats: 'Quick Statistics',
      recentActivity: 'Recent Activity',
      responsibilities: 'Current Responsibilities',
      professionalProfile: 'Professional Profile',
      permissions: 'Permission Groups',
      connectedAccounts: 'Connected Accounts',
      sessions: 'Active Sessions',
      preferences: 'Workspace Preferences',
    },
    stats: {
      applicationsReviewed: 'Applications Reviewed',
      beneficiariesManaged: 'Beneficiaries Managed',
      paymentsApproved: 'Payments Approved',
      reportsGenerated: 'Reports Generated',
    },
    empty: {
      phone: 'No phone number on file',
      department: 'No department assigned',
      position: 'Staff member',
      activity: 'Recent work will appear here as you use the workspace.',
      providers: 'No connected accounts yet.',
      sessions: 'No active sessions found.',
      permissions: 'No permissions available.',
      profile: 'Add a short bio, skills, languages, and certifications later from profile editing.',
    },
    values: {
      systemAdministrator: 'System Administrator',
      staffMember: 'Staff Member',
      english: 'English',
      french: 'French',
      enabled: 'Enabled',
      disabled: 'Disabled',
      lightTheme: 'Light',
      browserNotifications: 'Browser notifications',
      weeklySummary: 'Weekly summary',
    },
  },
  fr: {
    title: 'Profil',
    description:
      'Votre profil professionnel, votre activite recente, la securite du compte et vos preferences.',
    loadingTitle: 'Chargement du profil',
    loadingDescription:
      'Preparation de votre profil, de votre activite, de vos acces et de vos informations de securite.',
    errorTitle: 'Impossible de charger le profil',
    errorDescription:
      'Nous ne pouvons pas recuperer les informations de votre profil. Veuillez actualiser et reessayer.',
    tabs: {
      overview: 'Apercu',
      activity: 'Activite',
      access: 'Acces',
      security: 'Securite',
      preferences: 'Preferences',
    },
    actions: {
      editProfile: 'Modifier le profil',
      changePassword: 'Changer le mot de passe',
      manageSecurity: 'Gerer la securite',
      refresh: 'Actualiser',
    },
    labels: {
      active: 'Actif',
      memberSince: 'Membre depuis',
      lastActive: 'Derniere activite',
      timezone: 'Fuseau horaire',
      language: 'Langue',
      email: 'Email',
      phone: 'Telephone',
      department: 'Departement',
      position: 'Poste',
      employeeNumber: 'Matricule',
      signInMethods: 'Methodes de connexion',
      activeSessions: 'Sessions actives',
      twoFactor: 'Authentification a deux facteurs',
      recoveryEmail: 'Email de recuperation',
      theme: 'Theme',
      dateFormat: 'Format de date',
      notifications: 'Notifications',
    },
    sections: {
      contact: 'Contact',
      quickStats: 'Statistiques rapides',
      recentActivity: 'Activite recente',
      responsibilities: 'Responsabilites actuelles',
      professionalProfile: 'Profil professionnel',
      permissions: 'Groupes de permissions',
      connectedAccounts: 'Comptes connectes',
      sessions: 'Sessions actives',
      preferences: 'Preferences du workspace',
    },
    stats: {
      applicationsReviewed: 'Demandes examinees',
      beneficiariesManaged: 'Beneficiaires suivis',
      paymentsApproved: 'Paiements approuves',
      reportsGenerated: 'Rapports generes',
    },
    empty: {
      phone: 'Aucun numero enregistre',
      department: 'Aucun departement assigne',
      position: 'Membre du personnel',
      activity: 'Votre activite recente apparaitra ici pendant le travail.',
      providers: 'Aucun compte connecte pour le moment.',
      sessions: 'Aucune session active trouvee.',
      permissions: 'Aucune permission disponible.',
      profile:
        'La biographie, les competences, les langues et les certifications pourront etre ajoutees depuis la modification du profil.',
    },
    values: {
      systemAdministrator: 'Administrateur systeme',
      staffMember: 'Membre du personnel',
      english: 'Anglais',
      french: 'Francais',
      enabled: 'Active',
      disabled: 'Desactive',
      lightTheme: 'Clair',
      browserNotifications: 'Notifications navigateur',
      weeklySummary: 'Resume hebdomadaire',
    },
  },
};
