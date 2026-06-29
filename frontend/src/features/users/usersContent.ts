import type { Locale } from '../../lib/i18n';

export interface UsersCopy {
  title: string;
  description: string;
  refresh: string;
  create: string;
  cancel: string;
  save: string;
  saving: string;
  edit: string;
  accessDeniedTitle: string;
  accessDeniedBody: string;
  summary: {
    total: string;
    active: string;
    invited: string;
    suspended: string;
    locked: string;
  };
  filters: {
    search: string;
    searchPlaceholder: string;
    status: string;
    role: string;
    department: string;
    position: string;
    allStatuses: string;
    allRoles: string;
    reset: string;
  };
  table: {
    title: string;
    description: string;
    user: string;
    access: string;
    organization: string;
    status: string;
    lastLogin: string;
    actions: string;
    open: string;
    empty: string;
    loading: string;
    previous: string;
    next: string;
  };
  detail: {
    title: string;
    emptyTitle: string;
    emptyBody: string;
    loading: string;
    close: string;
    overview: string;
    access: string;
    sessions: string;
    activity: string;
    identity: string;
    organization: string;
    authentication: string;
    roles: string;
    directPermissions: string;
    inheritedPermissions: string;
    noRoles: string;
    noPermissions: string;
    providers: string;
    noProviders: string;
    noSessions: string;
    noActivity: string;
    terminateSessions: string;
    activate: string;
    suspend: string;
    archive: string;
    actionUnavailable: string;
  };
  form: {
    title: string;
    editTitle: string;
    name: string;
    email: string;
    phone: string;
    employeeNumber: string;
    locale: string;
    department: string;
    position: string;
    employmentType: string;
    officeLocation: string;
    bio: string;
    roles: string;
    directPermissions: string;
  };
  labels: {
    employeeNumber: string;
    phone: string;
    email: string;
    locale: string;
    department: string;
    position: string;
    employmentType: string;
    location: string;
    joined: string;
    registeredVia: string;
    lastLogin: string;
    sessions: string;
    created: string;
  };
  statuses: Record<string, string>;
}

export const usersContent: Record<Locale, UsersCopy> = {
  en: {
    title: 'Users',
    description: 'Manage staff identity, access, sessions, and organization details.',
    refresh: 'Refresh',
    create: 'Add User',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    edit: 'Edit',
    accessDeniedTitle: 'Access unavailable',
    accessDeniedBody: 'Your account does not have permission to view user management.',
    summary: {
      total: 'Total Users',
      active: 'Active',
      invited: 'Invited',
      suspended: 'Suspended',
      locked: 'Locked',
    },
    filters: {
      search: 'Search users',
      searchPlaceholder: 'Name, email, phone, employee number, department...',
      status: 'Status',
      role: 'Role',
      department: 'Department',
      position: 'Position',
      allStatuses: 'All statuses',
      allRoles: 'All roles',
      reset: 'Reset',
    },
    table: {
      title: 'User Records',
      description: 'Review staff accounts, access state, and the people responsible for operations.',
      user: 'User',
      access: 'Access',
      organization: 'Organization',
      status: 'Status',
      lastLogin: 'Last login',
      actions: 'Actions',
      open: 'Open',
      empty: 'No users match these filters.',
      loading: 'Loading users...',
      previous: 'Previous',
      next: 'Next',
    },
    detail: {
      title: 'User details',
      emptyTitle: 'Select a user',
      emptyBody: 'Open a record to review profile, access, sessions, and activity.',
      loading: 'Loading user...',
      close: 'Close',
      overview: 'Overview',
      access: 'Access',
      sessions: 'Sessions',
      activity: 'Activity',
      identity: 'Identity',
      organization: 'Organization',
      authentication: 'Authentication',
      roles: 'Roles',
      directPermissions: 'Direct permissions',
      inheritedPermissions: 'Effective permissions',
      noRoles: 'No roles assigned',
      noPermissions: 'No permissions assigned',
      providers: 'Sign-in methods',
      noProviders: 'No providers linked',
      noSessions: 'No active sessions',
      noActivity: 'No recent activity',
      terminateSessions: 'Terminate sessions',
      activate: 'Activate',
      suspend: 'Suspend',
      archive: 'Archive',
      actionUnavailable: 'Action unavailable for this record',
    },
    form: {
      title: 'Add User',
      editTitle: 'Edit User',
      name: 'Full name',
      email: 'Email address',
      phone: 'Phone number',
      employeeNumber: 'Employee number',
      locale: 'Language',
      department: 'Department',
      position: 'Position',
      employmentType: 'Employment type',
      officeLocation: 'Office location',
      bio: 'Profile note',
      roles: 'Roles',
      directPermissions: 'Direct permissions',
    },
    labels: {
      employeeNumber: 'Employee number',
      phone: 'Phone',
      email: 'Email',
      locale: 'Language',
      department: 'Department',
      position: 'Position',
      employmentType: 'Employment type',
      location: 'Location',
      joined: 'Joined',
      registeredVia: 'Registered via',
      lastLogin: 'Last login',
      sessions: 'Sessions',
      created: 'Created',
    },
    statuses: {
      invited: 'Invited',
      pending: 'Pending',
      active: 'Active',
      suspended: 'Suspended',
      disabled: 'Disabled',
      archived: 'Archived',
      locked: 'Locked',
    },
  },
  fr: {
    title: 'Utilisateurs',
    description: 'Gerez les identites, les acces, les sessions et les details organisationnels du personnel.',
    refresh: 'Actualiser',
    create: 'Ajouter',
    cancel: 'Annuler',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    edit: 'Modifier',
    accessDeniedTitle: 'Acces indisponible',
    accessDeniedBody: "Votre compte n'a pas la permission de consulter la gestion des utilisateurs.",
    summary: {
      total: 'Utilisateurs',
      active: 'Actifs',
      invited: 'Invites',
      suspended: 'Suspendus',
      locked: 'Verrouilles',
    },
    filters: {
      search: 'Rechercher',
      searchPlaceholder: 'Nom, email, telephone, matricule, departement...',
      status: 'Statut',
      role: 'Role',
      department: 'Departement',
      position: 'Poste',
      allStatuses: 'Tous les statuts',
      allRoles: 'Tous les roles',
      reset: 'Reinitialiser',
    },
    table: {
      title: 'Comptes utilisateurs',
      description: 'Consultez les comptes du personnel, leur acces et leur rattachement operationnel.',
      user: 'Utilisateur',
      access: 'Acces',
      organization: 'Organisation',
      status: 'Statut',
      lastLogin: 'Derniere connexion',
      actions: 'Actions',
      open: 'Ouvrir',
      empty: 'Aucun utilisateur ne correspond a ces filtres.',
      loading: 'Chargement des utilisateurs...',
      previous: 'Precedent',
      next: 'Suivant',
    },
    detail: {
      title: 'Details utilisateur',
      emptyTitle: 'Selectionnez un utilisateur',
      emptyBody: 'Ouvrez un compte pour verifier le profil, les acces, les sessions et l activite.',
      loading: 'Chargement...',
      close: 'Fermer',
      overview: 'Apercu',
      access: 'Acces',
      sessions: 'Sessions',
      activity: 'Activite',
      identity: 'Identite',
      organization: 'Organisation',
      authentication: 'Authentification',
      roles: 'Roles',
      directPermissions: 'Permissions directes',
      inheritedPermissions: 'Permissions effectives',
      noRoles: 'Aucun role attribue',
      noPermissions: 'Aucune permission attribuee',
      providers: 'Methodes de connexion',
      noProviders: 'Aucune methode liee',
      noSessions: 'Aucune session active',
      noActivity: 'Aucune activite recente',
      terminateSessions: 'Terminer les sessions',
      activate: 'Activer',
      suspend: 'Suspendre',
      archive: 'Archiver',
      actionUnavailable: 'Action indisponible pour ce compte',
    },
    form: {
      title: 'Ajouter un utilisateur',
      editTitle: 'Modifier utilisateur',
      name: 'Nom complet',
      email: 'Adresse email',
      phone: 'Telephone',
      employeeNumber: 'Matricule',
      locale: 'Langue',
      department: 'Departement',
      position: 'Poste',
      employmentType: 'Type d emploi',
      officeLocation: 'Localisation',
      bio: 'Note de profil',
      roles: 'Roles',
      directPermissions: 'Permissions directes',
    },
    labels: {
      employeeNumber: 'Matricule',
      phone: 'Telephone',
      email: 'Email',
      locale: 'Langue',
      department: 'Departement',
      position: 'Poste',
      employmentType: 'Type d emploi',
      location: 'Localisation',
      joined: 'Date d entree',
      registeredVia: 'Enregistre via',
      lastLogin: 'Derniere connexion',
      sessions: 'Sessions',
      created: 'Cree',
    },
    statuses: {
      invited: 'Invite',
      pending: 'En attente',
      active: 'Actif',
      suspended: 'Suspendu',
      disabled: 'Desactive',
      archived: 'Archive',
      locked: 'Verrouille',
    },
  },
};
