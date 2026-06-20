import type { Locale } from '../lib/i18n';

export interface DashboardWorkspaceCopy {
  key: 'applications' | 'beneficiaries' | 'funding' | 'reports';
  title: string;
  description: string;
  footer: string;
}

export interface DashboardListItemCopy {
  title: string;
  description: string;
}

export interface StaffDashboardCopy {
  eyebrow: string;
  title: string;
  description: string;
  liveBadge: string;
  search: {
    title: string;
    description: string;
    placeholder: string;
    helperText: string;
    emptyText: string;
    shortQueryText: string;
    permissionsHint: string;
    visibleScopesLabel: string;
    openWorkspaceLabel: string;
    clearLabel: string;
    resultSingular: string;
    resultPlural: string;
    noVisibleScopes: string;
  };
  access: {
    title: string;
    description: string;
      metrics: {
        user: string;
        locale: string;
        permissions: string;
        workspaces: string;
      };
      fallbackUser: string;
      privateBadge: string;
      noteTitle: string;
      noteBody: string;
    };
  workspace: {
    available: string;
    locked: string;
    cards: DashboardWorkspaceCopy[];
  };
  rhythm: {
    title: string;
    description: string;
    items: DashboardListItemCopy[];
  };
  privacy: {
    title: string;
    description: string;
    items: DashboardListItemCopy[];
  };
  lifecycle: {
    title: string;
    description: string;
    steps: DashboardListItemCopy[];
  };
}

export const staffDashboardContent: Record<Locale, StaffDashboardCopy> = {
  en: {
    eyebrow: 'Staff operations',
    title: 'Operations dashboard',
    description:
      'Start from the work that protects children, keeps decisions moving, and keeps donors, schools, and staff aligned around the same records.',
    liveBadge: 'Authenticated workspace',
    search: {
      title: 'Global search',
      description:
        'Search across the parts of the system you are allowed to see. Results narrow automatically to the workspaces your account can access.',
      placeholder: 'Search by child name, application number, school, donor, fund, payment, or sponsorship',
      helperText: 'Search begins after two characters and stays inside your current access level.',
      emptyText: 'No matching records were found in the workspaces you can access.',
      shortQueryText: 'Type at least two characters to begin searching.',
      permissionsHint: 'Results are filtered by permissions and account status.',
      visibleScopesLabel: 'Visible scopes',
      openWorkspaceLabel: 'Open workspace',
      clearLabel: 'Clear search',
      resultSingular: 'result',
      resultPlural: 'results',
      noVisibleScopes: 'No search scopes yet',
    },
    access: {
      title: 'Your access at a glance',
      description:
        'This summary reflects the account currently signed in, so each staff member lands in a workspace that matches their responsibility.',
      metrics: {
        user: 'Signed-in user',
        locale: 'Current language',
        permissions: 'Direct permissions',
        workspaces: 'Accessible workspaces',
      },
      fallbackUser: 'Staff user',
      privateBadge: 'Private data',
      noteTitle: 'Private records require deliberate handling',
      noteBody:
        'Search, navigation, and action surfaces should always respect the current user context. Child data should never appear outside authenticated and authorized workflows.',
    },
    workspace: {
      available: 'Available',
      locked: 'Restricted',
      cards: [
        {
          key: 'applications',
          title: 'Applications',
          description:
            'Review new requests, verification notes, and decisions before a child drifts out of school for reasons that could have been addressed.',
          footer: 'Intake and review queue',
        },
        {
          key: 'beneficiaries',
          title: 'Beneficiaries',
          description:
            'Follow children already admitted into support, track school relationships, and keep educational needs coherent over time.',
          footer: 'Private child records',
        },
        {
          key: 'funding',
          title: 'Funding',
          description:
            'Keep donations, allocations, sponsorships, and school payments connected so every support decision can be explained later.',
          footer: 'Financial accountability',
        },
        {
          key: 'reports',
          title: 'Reports',
          description:
            'Prepare impact summaries, accountability packs, and internal review materials without exposing more information than a report should contain.',
          footer: 'Reporting and evidence',
        },
      ],
    },
    rhythm: {
      title: 'Where to start today',
      description: 'A calm dashboard still needs a clear operating rhythm. These are the first queues worth checking during a working session.',
      items: [
        {
          title: 'Verification first',
          description: 'Check incoming applications and verification notes before they age into avoidable delays.',
        },
        {
          title: 'Funding gaps next',
          description: 'Review open educational needs and allocations that could leave a child unsupported.',
        },
        {
          title: 'School payment follow-up',
          description: 'Confirm upcoming or pending disbursements before deadlines create pressure for schools or guardians.',
        },
        {
          title: 'Close the loop with reports',
          description: 'Keep reporting current enough that donor accountability does not become a scramble later.',
        },
      ],
    },
    privacy: {
      title: 'Safeguarding reminders',
      description: 'Good operations protect dignity as much as they protect data.',
      items: [
        {
          title: 'Share the least necessary detail',
          description: 'Only open, export, or discuss the child records required for the task in front of you.',
        },
        {
          title: 'Keep actions traceable',
          description: 'Status changes, financial actions, and sensitive edits should always leave a clean audit trail.',
        },
        {
          title: 'Move public stories elsewhere',
          description: 'Public storytelling belongs in curated content, not inside raw beneficiary or case-management records.',
        },
      ],
    },
    lifecycle: {
      title: 'Beneficiary lifecycle',
      description: 'Every child-facing workflow should be easy to place in the larger education support journey.',
      steps: [
        { title: 'Application', description: 'Initial request, intake context, and supporting notes.' },
        { title: 'Verification', description: 'Field checks, school confirmation, and factual review.' },
        { title: 'Review', description: 'Internal decision-making before support is approved.' },
        { title: 'Accepted', description: 'Child is ready for funding setup and support planning.' },
        { title: 'Sponsored', description: 'One or more support commitments are linked to real needs.' },
        { title: 'Active support', description: 'Payments, follow-up, and educational support are underway.' },
        { title: 'Graduated', description: 'Support is completed, closed well, and retained for history.' },
      ],
    },
  },
  fr: {
    eyebrow: 'Operations du personnel',
    title: 'Tableau de bord des operations',
    description:
      "Commencez par le travail qui protege les enfants, fait avancer les decisions et garde les donateurs, les ecoles et l'equipe aligns sur les memes dossiers.",
    liveBadge: 'Espace authentifie',
    search: {
      title: 'Recherche globale',
      description:
        "Recherchez dans les espaces que votre compte est autorise a consulter. Les resultats se limitent automatiquement aux zones auxquelles vous avez acces.",
      placeholder: "Rechercher par nom d'enfant, numero de demande, ecole, donateur, fonds, paiement ou parrainage",
      helperText: 'La recherche commence apres deux caracteres et respecte toujours votre niveau d acces.',
      emptyText: "Aucun dossier correspondant n'a ete trouve dans les espaces auxquels vous avez acces.",
      shortQueryText: 'Saisissez au moins deux caracteres pour lancer la recherche.',
      permissionsHint: 'Les resultats sont filtres par permissions et par statut du compte.',
      visibleScopesLabel: 'Espaces visibles',
      openWorkspaceLabel: "Ouvrir l'espace",
      clearLabel: 'Effacer la recherche',
      resultSingular: 'resultat',
      resultPlural: 'resultats',
      noVisibleScopes: 'Aucun espace de recherche pour le moment',
    },
    access: {
      title: "Vue d'ensemble de votre acces",
      description:
        "Ce resume reflète le compte actuellement connecte, afin que chaque membre du personnel arrive dans un espace adapte a sa responsabilite.",
      metrics: {
        user: 'Utilisateur connecte',
        locale: 'Langue active',
        permissions: 'Permissions directes',
        workspaces: 'Espaces accessibles',
      },
      fallbackUser: 'Utilisateur',
      privateBadge: 'Donnees privees',
      noteTitle: 'Les dossiers prives exigent une manipulation deliberee',
      noteBody:
        "La recherche, la navigation et les actions doivent toujours respecter le contexte de l'utilisateur. Les donnees des enfants ne doivent jamais sortir des workflows authentifies et autorises.",
    },
    workspace: {
      available: 'Disponible',
      locked: 'Restreint',
      cards: [
        {
          key: 'applications',
          title: 'Demandes',
          description:
            "Examinez les nouvelles demandes, les notes de verification et les decisions avant qu'un enfant ne quitte l'ecole pour une raison qui aurait pu etre resolue.",
          footer: 'File d entree et de revue',
        },
        {
          key: 'beneficiaries',
          title: 'Beneficiaires',
          description:
            "Suivez les enfants deja admis au soutien, gardez les relations scolaires claires et maintenez les besoins educatifs coherents dans le temps.",
          footer: 'Dossiers prives des enfants',
        },
        {
          key: 'funding',
          title: 'Financement',
          description:
            'Gardez relies les dons, les allocations, les parrainages et les paiements scolaires afin que chaque decision de soutien puisse etre expliquee plus tard.',
          footer: 'Responsabilite financiere',
        },
        {
          key: 'reports',
          title: 'Rapports',
          description:
            "Preparez les syntheses d'impact, les dossiers de redevabilite et les supports de revue interne sans exposer plus d'information qu'un rapport ne devrait contenir.",
          footer: 'Rapports et preuves',
        },
      ],
    },
    rhythm: {
      title: 'Par ou commencer aujourd hui',
      description: 'Un tableau de bord calme doit quand meme donner un rythme clair. Voici les premieres files a verifier.',
      items: [
        {
          title: 'Verification en premier',
          description: 'Controlez les demandes entrantes et les notes de verification avant que des retards evitables ne s installent.',
        },
        {
          title: 'Puis les ecarts de financement',
          description: 'Revoyez les besoins educatifs ouverts et les allocations qui pourraient laisser un enfant sans soutien.',
        },
        {
          title: 'Suivi des paiements scolaires',
          description: 'Confirmez les decaissements prevus ou en attente avant que les echeances ne mettent la pression sur les ecoles ou les tuteurs.',
        },
        {
          title: 'Fermer la boucle par les rapports',
          description: 'Gardez les rapports suffisamment a jour pour que la redevabilite donor ne devienne pas une course de derniere minute.',
        },
      ],
    },
    privacy: {
      title: 'Rappels de sauvegarde',
      description: 'De bonnes operations protegent la dignite autant que les donnees.',
      items: [
        {
          title: 'Partager le strict necessaire',
          description: 'N ouvrez, n exportez et ne discutez que les dossiers indispensables a la tache en cours.',
        },
        {
          title: 'Garder les actions tracables',
          description: 'Les changements de statut, les actions financieres et les modifications sensibles doivent toujours laisser une piste claire.',
        },
        {
          title: 'Deplacer les recits publics ailleurs',
          description: 'Le recit public appartient au contenu curation, pas aux dossiers bruts des beneficiaires.',
        },
      ],
    },
    lifecycle: {
      title: 'Cycle de vie du beneficiaire',
      description: 'Chaque workflow concernant un enfant doit etre facile a replacer dans l ensemble du parcours de soutien educatif.',
      steps: [
        { title: 'Demande', description: 'Demande initiale, contexte d entree et notes utiles.' },
        { title: 'Verification', description: 'Controle de terrain, confirmation scolaire et revue factuelle.' },
        { title: 'Revue', description: 'Decision interne avant approbation du soutien.' },
        { title: 'Accepte', description: "L'enfant est pret pour la mise en place du financement et du soutien." },
        { title: 'Parraine', description: 'Un ou plusieurs engagements de soutien sont lies a des besoins reels.' },
        { title: 'Soutien actif', description: 'Paiements, suivi et accompagnement educatif sont en cours.' },
        { title: 'Diplome', description: 'Le soutien est bien cloture et conserve pour l historique.' },
      ],
    },
  },
};
