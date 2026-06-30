import type { Locale } from '../../lib/i18n';

export type ReportCategoryKey =
  | 'all'
  | 'applications'
  | 'beneficiaries'
  | 'schools'
  | 'donations'
  | 'sponsorships'
  | 'funding'
  | 'payments'
  | 'impact'
  | 'operations';

export interface ReportCategory {
  key: ReportCategoryKey;
  label: string;
  available: number;
  description: string;
  permissions: string[];
}

export interface QuickReport {
  key: string;
  title: string;
  description: string;
  category: ReportCategoryKey;
  permission: string;
  severity: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export interface ReportTemplate {
  key: string;
  name: string;
  category: ReportCategoryKey;
  categoryLabel: string;
  lastGenerated: string;
  format: string;
  permissions: string[];
}

export interface OperationalInsight {
  key: string;
  label: string;
  value: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  path: string;
  permission: string;
}

export interface SavedReport {
  title: string;
  status: string;
  generatedAt: string;
  owner: string;
  format: string;
}

export interface ScheduledReport {
  title: string;
  cadence: string;
  recipient: string;
  nextRun: string;
}

export interface ReportsCopy {
  title: string;
  description: string;
  generateReport: string;
  savedReports: string;
  scheduleReport: string;
  accessDeniedTitle: string;
  accessDeniedBody: string;
  sections: {
    summary: string;
    summaryDescription: string;
    quick: string;
    quickDescription: string;
    insights: string;
    insightsDescription: string;
    library: string;
    libraryDescription: string;
    builder: string;
    builderDescription: string;
    saved: string;
    savedDescription: string;
    scheduled: string;
    scheduledDescription: string;
  };
  filters: {
    search: string;
    searchPlaceholder: string;
    category: string;
    all: string;
  };
  table: {
    report: string;
    category: string;
    lastGenerated: string;
    format: string;
    actions: string;
    empty: string;
  };
  actions: {
    generate: string;
    view: string;
    pdf: string;
    excel: string;
    csv: string;
    download: string;
    buildReport: string;
    clear: string;
  };
  builder: {
    dataset: string;
    fields: string;
    filters: string;
    sort: string;
    output: string;
    region: string;
    academicYear: string;
    supportStatus: string;
    fundingStatus: string;
    ascending: string;
    descending: string;
    selectedFields: string;
  };
  notice: {
    title: string;
    body: string;
  };
  categories: ReportCategory[];
  quickReports: QuickReport[];
  templates: ReportTemplate[];
  insights: OperationalInsight[];
  saved: SavedReport[];
  scheduled: ScheduledReport[];
  datasets: string[];
  fields: string[];
  formats: string[];
}

const enCategories: ReportCategory[] = [
  { key: 'applications', label: 'Applications', available: 42, description: 'Pipeline, review time, regions, and schools.', permissions: ['applications.view'] },
  { key: 'beneficiaries', label: 'Beneficiaries', available: 18, description: 'Active support, status, schools, and needs.', permissions: ['beneficiaries.view'] },
  { key: 'schools', label: 'Schools', available: 11, description: 'Supported schools, students, and payments.', permissions: ['schools.view'] },
  { key: 'donations', label: 'Donations', available: 21, description: 'Giving by period, currency, donor, and channel.', permissions: ['donations.view'] },
  { key: 'sponsorships', label: 'Sponsorships', available: 9, description: 'Shared support, sponsor activity, and retention.', permissions: ['donors.view'] },
  { key: 'funding', label: 'Funding', available: 16, description: 'Funding gaps, allocations, and fund balances.', permissions: ['funds.view', 'allocations.view'] },
  { key: 'payments', label: 'Payments', available: 14, description: 'Pending, completed, failed, and school payments.', permissions: ['payments.view'] },
  { key: 'impact', label: 'Impact', available: 12, description: 'Children supported, outcomes, and regions reached.', permissions: ['impact_updates.view', 'reports.view'] },
  { key: 'operations', label: 'Operations', available: 14, description: 'Follow-up queues, workload, and overdue actions.', permissions: ['reports.view'] },
];

const frCategories: ReportCategory[] = [
  { key: 'applications', label: 'Demandes', available: 42, description: 'Pipeline, delais de revue, regions et ecoles.', permissions: ['applications.view'] },
  { key: 'beneficiaries', label: 'Beneficiaires', available: 18, description: 'Soutien actif, statuts, ecoles et besoins.', permissions: ['beneficiaries.view'] },
  { key: 'schools', label: 'Ecoles', available: 11, description: 'Ecoles soutenues, eleves et paiements.', permissions: ['schools.view'] },
  { key: 'donations', label: 'Dons', available: 21, description: 'Dons par periode, devise, donateur et canal.', permissions: ['donations.view'] },
  { key: 'sponsorships', label: 'Parrainages', available: 9, description: 'Soutien partage, activite et retention.', permissions: ['donors.view'] },
  { key: 'funding', label: 'Financement', available: 16, description: 'Ecarts, allocations et soldes des fonds.', permissions: ['funds.view', 'allocations.view'] },
  { key: 'payments', label: 'Paiements', available: 14, description: 'Paiements en attente, termines, echoues et ecoles.', permissions: ['payments.view'] },
  { key: 'impact', label: 'Impact', available: 12, description: 'Enfants soutenus, resultats et regions atteintes.', permissions: ['impact_updates.view', 'reports.view'] },
  { key: 'operations', label: 'Operations', available: 14, description: 'Suivis, charge de travail et actions en retard.', permissions: ['reports.view'] },
];

export const reportsContent: Record<Locale, ReportsCopy> = {
  en: {
    title: 'Reports',
    description: 'Generate operational, financial and impact reports from across the foundation.',
    generateReport: 'Generate Report',
    savedReports: 'Saved Reports',
    scheduleReport: 'Schedule Report',
    accessDeniedTitle: 'Reports access required',
    accessDeniedBody: 'Your account does not currently have permission to view reports.',
    sections: {
      summary: 'Executive Summary',
      summaryDescription: 'Available reports by operational area.',
      quick: 'Quick Reports',
      quickDescription: 'Common reports staff generate during daily work.',
      insights: 'Operational Insights',
      insightsDescription: 'Live work signals that should guide the next action.',
      library: 'Report Library',
      libraryDescription: 'Search, filter, view, and export reporting templates.',
      builder: 'Custom Report Builder',
      builderDescription: 'Choose a dataset, fields, filters, sorting, and output format.',
      saved: 'Saved Reports',
      savedDescription: 'Reusable reports for board, donor, finance, and program review.',
      scheduled: 'Scheduled Reports',
      scheduledDescription: 'Recurring reports prepared for the right team at the right time.',
    },
    filters: {
      search: 'Search',
      searchPlaceholder: 'Search reports...',
      category: 'Category',
      all: 'All categories',
    },
    table: {
      report: 'Report',
      category: 'Category',
      lastGenerated: 'Last Generated',
      format: 'Format',
      actions: 'Actions',
      empty: 'No reports match the current filters.',
    },
    actions: {
      generate: 'Generate',
      view: 'View',
      pdf: 'PDF',
      excel: 'Excel',
      csv: 'CSV',
      download: 'Download',
      buildReport: 'Build Report',
      clear: 'Clear',
    },
    builder: {
      dataset: 'Dataset',
      fields: 'Fields',
      filters: 'Filters',
      sort: 'Sort',
      output: 'Output',
      region: 'Region',
      academicYear: 'Academic Year',
      supportStatus: 'Support Status',
      fundingStatus: 'Funding Status',
      ascending: 'Ascending',
      descending: 'Descending',
      selectedFields: 'Selected fields',
    },
    notice: {
      title: 'Report request queued',
      body: 'You can continue working while the report is prepared.',
    },
    categories: enCategories,
    quickReports: [
      { key: 'applications-awaiting-review', title: 'Applications Awaiting Review', description: 'Requests waiting for review decisions.', category: 'applications', permission: 'applications.view', severity: 'warning' },
      { key: 'children-awaiting-funding', title: 'Children Awaiting Funding', description: 'Approved needs not yet fully funded.', category: 'funding', permission: 'funds.view', severity: 'danger' },
      { key: 'upcoming-school-payments', title: 'Upcoming School Payments', description: 'School payments due within the next week.', category: 'payments', permission: 'payments.view', severity: 'warning' },
      { key: 'donations-this-month', title: 'Donations Received This Month', description: 'Confirmed gifts grouped by channel and currency.', category: 'donations', permission: 'donations.view', severity: 'success' },
      { key: 'outstanding-needs', title: 'Outstanding Educational Needs', description: 'Open fees, exams, books, uniforms, and materials.', category: 'beneficiaries', permission: 'beneficiaries.view', severity: 'info' },
      { key: 'beneficiaries-by-school', title: 'Beneficiaries by School', description: 'Children receiving support grouped by school.', category: 'schools', permission: 'schools.view', severity: 'neutral' },
    ],
    templates: [
      { key: 'beneficiary-summary', name: 'Beneficiary Summary', category: 'beneficiaries', categoryLabel: 'Beneficiaries', lastGenerated: 'Today', format: 'PDF', permissions: ['beneficiaries.view'] },
      { key: 'funding-gap', name: 'Funding Gap Report', category: 'funding', categoryLabel: 'Funding', lastGenerated: 'Yesterday', format: 'Excel', permissions: ['funds.view'] },
      { key: 'school-payments', name: 'School Payments', category: 'payments', categoryLabel: 'Payments', lastGenerated: '2 days ago', format: 'Excel', permissions: ['payments.view'] },
      { key: 'application-pipeline', name: 'Application Pipeline', category: 'applications', categoryLabel: 'Applications', lastGenerated: 'Never', format: 'PDF', permissions: ['applications.view'] },
      { key: 'donor-contributions', name: 'Donor Contributions', category: 'donations', categoryLabel: 'Donations', lastGenerated: 'Today', format: 'CSV', permissions: ['donations.view'] },
      { key: 'impact-summary', name: 'Annual Impact Summary', category: 'impact', categoryLabel: 'Impact', lastGenerated: 'Draft', format: 'PDF', permissions: ['impact_updates.view', 'reports.view'] },
      { key: 'schools-by-region', name: 'Schools by Region', category: 'schools', categoryLabel: 'Schools', lastGenerated: 'This week', format: 'Excel', permissions: ['schools.view'] },
      { key: 'payment-audit', name: 'Payment Audit', category: 'payments', categoryLabel: 'Payments', lastGenerated: 'Never', format: 'CSV', permissions: ['payments.view'] },
    ],
    insights: [
      { key: 'review', label: 'Applications awaiting review', value: '18', tone: 'warning', path: '/staff/applications', permission: 'applications.view' },
      { key: 'gaps', label: 'Beneficiaries with funding gaps', value: '9', tone: 'danger', path: '/staff/beneficiaries', permission: 'beneficiaries.view' },
      { key: 'payments', label: 'Payments due this week', value: '14', tone: 'warning', path: '/staff/funding', permission: 'payments.view' },
      { key: 'schools', label: 'Schools awaiting payment', value: '5', tone: 'info', path: '/staff/funding', permission: 'payments.view' },
      { key: 'sponsors', label: 'Expiring sponsorship commitments', value: '7', tone: 'neutral', path: '/staff/funding', permission: 'donors.view' },
    ],
    saved: [
      { title: 'Monthly Board Report', status: 'Ready', generatedAt: 'June 30', owner: 'Executive Director', format: 'PDF' },
      { title: 'Quarterly Donor Report', status: 'Ready', generatedAt: 'June 25', owner: 'Partnerships Team', format: 'PDF' },
      { title: 'Annual Impact Summary', status: 'Draft', generatedAt: 'In progress', owner: 'Programs Team', format: 'PDF' },
    ],
    scheduled: [
      { title: 'Monthly Finance Summary', cadence: 'Every month', recipient: 'Finance Manager', nextRun: 'July 1' },
      { title: 'Weekly Operations Report', cadence: 'Every Monday', recipient: 'Programs Team', nextRun: 'July 6' },
      { title: 'Quarterly Impact Report', cadence: 'Quarterly', recipient: 'Executive Director', nextRun: 'September 30' },
    ],
    datasets: ['Beneficiaries', 'Applications', 'Schools', 'Donations', 'Payments', 'Impact Updates'],
    fields: ['Name', 'Reference', 'School', 'Region', 'Funding Status', 'Sponsor Status', 'Current Needs', 'Last Update'],
    formats: ['PDF', 'Excel', 'CSV'],
  },
  fr: {
    title: 'Rapports',
    description: 'Generez des rapports operationnels, financiers et d impact pour toute la fondation.',
    generateReport: 'Generer un rapport',
    savedReports: 'Rapports enregistres',
    scheduleReport: 'Planifier un rapport',
    accessDeniedTitle: 'Acces rapports requis',
    accessDeniedBody: 'Votre compte ne dispose pas encore de la permission pour consulter les rapports.',
    sections: {
      summary: 'Resume executif',
      summaryDescription: 'Rapports disponibles par domaine operationnel.',
      quick: 'Rapports rapides',
      quickDescription: 'Rapports courants generes pendant le travail quotidien.',
      insights: 'Signaux operationnels',
      insightsDescription: 'Indicateurs de travail qui orientent la prochaine action.',
      library: 'Bibliotheque de rapports',
      libraryDescription: 'Recherchez, filtrez, consultez et exportez les modeles.',
      builder: 'Createur de rapport',
      builderDescription: 'Choisissez les donnees, champs, filtres, tri et format.',
      saved: 'Rapports enregistres',
      savedDescription: 'Rapports reutilisables pour la direction, les donateurs, la finance et les programmes.',
      scheduled: 'Rapports planifies',
      scheduledDescription: 'Rapports recurrents prepares pour la bonne equipe au bon moment.',
    },
    filters: {
      search: 'Recherche',
      searchPlaceholder: 'Rechercher des rapports...',
      category: 'Categorie',
      all: 'Toutes les categories',
    },
    table: {
      report: 'Rapport',
      category: 'Categorie',
      lastGenerated: 'Derniere generation',
      format: 'Format',
      actions: 'Actions',
      empty: 'Aucun rapport ne correspond aux filtres actuels.',
    },
    actions: {
      generate: 'Generer',
      view: 'Voir',
      pdf: 'PDF',
      excel: 'Excel',
      csv: 'CSV',
      download: 'Telecharger',
      buildReport: 'Creer le rapport',
      clear: 'Effacer',
    },
    builder: {
      dataset: 'Donnees',
      fields: 'Champs',
      filters: 'Filtres',
      sort: 'Tri',
      output: 'Sortie',
      region: 'Region',
      academicYear: 'Annee scolaire',
      supportStatus: 'Statut de soutien',
      fundingStatus: 'Statut de financement',
      ascending: 'Ascendant',
      descending: 'Descendant',
      selectedFields: 'Champs selectionnes',
    },
    notice: {
      title: 'Demande de rapport en file',
      body: 'Vous pouvez continuer pendant la preparation du rapport.',
    },
    categories: frCategories,
    quickReports: [
      { key: 'applications-awaiting-review', title: 'Demandes en attente de revue', description: 'Demandes attendant une decision.', category: 'applications', permission: 'applications.view', severity: 'warning' },
      { key: 'children-awaiting-funding', title: 'Enfants en attente de financement', description: 'Besoins approuves pas encore finances.', category: 'funding', permission: 'funds.view', severity: 'danger' },
      { key: 'upcoming-school-payments', title: 'Paiements scolaires a venir', description: 'Paiements dus dans la semaine.', category: 'payments', permission: 'payments.view', severity: 'warning' },
      { key: 'donations-this-month', title: 'Dons recus ce mois', description: 'Dons confirmes par canal et devise.', category: 'donations', permission: 'donations.view', severity: 'success' },
      { key: 'outstanding-needs', title: 'Besoins educatifs ouverts', description: 'Frais, examens, livres, uniformes et materiels.', category: 'beneficiaries', permission: 'beneficiaries.view', severity: 'info' },
      { key: 'beneficiaries-by-school', title: 'Beneficiaires par ecole', description: 'Enfants soutenus regroupes par ecole.', category: 'schools', permission: 'schools.view', severity: 'neutral' },
    ],
    templates: [
      { key: 'beneficiary-summary', name: 'Resume des beneficiaires', category: 'beneficiaries', categoryLabel: 'Beneficiaires', lastGenerated: 'Aujourdhui', format: 'PDF', permissions: ['beneficiaries.view'] },
      { key: 'funding-gap', name: 'Ecarts de financement', category: 'funding', categoryLabel: 'Financement', lastGenerated: 'Hier', format: 'Excel', permissions: ['funds.view'] },
      { key: 'school-payments', name: 'Paiements scolaires', category: 'payments', categoryLabel: 'Paiements', lastGenerated: 'Il y a 2 jours', format: 'Excel', permissions: ['payments.view'] },
      { key: 'application-pipeline', name: 'Pipeline des demandes', category: 'applications', categoryLabel: 'Demandes', lastGenerated: 'Jamais', format: 'PDF', permissions: ['applications.view'] },
      { key: 'donor-contributions', name: 'Contributions des donateurs', category: 'donations', categoryLabel: 'Dons', lastGenerated: 'Aujourdhui', format: 'CSV', permissions: ['donations.view'] },
      { key: 'impact-summary', name: 'Resume annuel de l impact', category: 'impact', categoryLabel: 'Impact', lastGenerated: 'Brouillon', format: 'PDF', permissions: ['impact_updates.view', 'reports.view'] },
      { key: 'schools-by-region', name: 'Ecoles par region', category: 'schools', categoryLabel: 'Ecoles', lastGenerated: 'Cette semaine', format: 'Excel', permissions: ['schools.view'] },
      { key: 'payment-audit', name: 'Audit des paiements', category: 'payments', categoryLabel: 'Paiements', lastGenerated: 'Jamais', format: 'CSV', permissions: ['payments.view'] },
    ],
    insights: [
      { key: 'review', label: 'Demandes en attente de revue', value: '18', tone: 'warning', path: '/staff/applications', permission: 'applications.view' },
      { key: 'gaps', label: 'Beneficiaires avec ecarts', value: '9', tone: 'danger', path: '/staff/beneficiaries', permission: 'beneficiaries.view' },
      { key: 'payments', label: 'Paiements dus cette semaine', value: '14', tone: 'warning', path: '/staff/funding', permission: 'payments.view' },
      { key: 'schools', label: 'Ecoles en attente de paiement', value: '5', tone: 'info', path: '/staff/funding', permission: 'payments.view' },
      { key: 'sponsors', label: 'Engagements de parrainage expirants', value: '7', tone: 'neutral', path: '/staff/funding', permission: 'donors.view' },
    ],
    saved: [
      { title: 'Rapport mensuel du conseil', status: 'Pret', generatedAt: '30 juin', owner: 'Direction executive', format: 'PDF' },
      { title: 'Rapport trimestriel donateurs', status: 'Pret', generatedAt: '25 juin', owner: 'Equipe partenariats', format: 'PDF' },
      { title: 'Resume annuel d impact', status: 'Brouillon', generatedAt: 'En cours', owner: 'Equipe programmes', format: 'PDF' },
    ],
    scheduled: [
      { title: 'Resume financier mensuel', cadence: 'Chaque mois', recipient: 'Responsable finance', nextRun: '1 juillet' },
      { title: 'Rapport operationnel hebdomadaire', cadence: 'Chaque lundi', recipient: 'Equipe programmes', nextRun: '6 juillet' },
      { title: 'Rapport impact trimestriel', cadence: 'Trimestriel', recipient: 'Direction executive', nextRun: '30 septembre' },
    ],
    datasets: ['Beneficiaires', 'Demandes', 'Ecoles', 'Dons', 'Paiements', 'Mises a jour impact'],
    fields: ['Nom', 'Reference', 'Ecole', 'Region', 'Statut financement', 'Statut parrainage', 'Besoins actuels', 'Derniere mise a jour'],
    formats: ['PDF', 'Excel', 'CSV'],
  },
};
