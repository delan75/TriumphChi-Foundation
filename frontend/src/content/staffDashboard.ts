import type { Locale } from '../lib/i18n';

export interface StaffDashboardText {
  title: string;
  subtitle: string;
  liveLabel: string;
  greeting: string;
  roleLabel: string;
  lastLoginLabel: string;
  workspaceLabel: string;
  generatedLabel: string;
  openLabel: string;
  searchLabel: string;
  retryLabel: string;
  openReportsLabel: string;
  recordLabel: string;
  recordsLabel: string;
  staffFallback: string;
  metricsSectionTitle: string;
  queuesSectionTitle: string;
  activitySectionTitle: string;
  actionsSectionTitle: string;
  overviewSectionTitle: string;
  analyticsSectionTitle: string;
  analyticsSectionDescription: string;
  chartLabels: {
    fundsRaised: string;
    applications: string;
    gifts: string;
    peakMonth: string;
    empty: string;
  };
  metricLabels: Record<string, string>;
  queueLabels: Record<string, string>;
  queueAction: string;
  queueEmpty: string;
  activityEmpty: string;
  quickActionLabels: Record<string, { title: string; description: string }>;
  overviewLabels: {
    accessibleModules: string;
    directPermissions: string;
    updatedAt: string;
  };
  statusLabels: {
    loading: string;
    noData: string;
  };
  errorTitle: string;
  errorDescription: string;
}

export const staffDashboardText: Record<Locale, StaffDashboardText> = {
  en: {
    title: 'Operations dashboard',
    subtitle: 'Work queues, activity, and actions across your accessible modules.',
    liveLabel: 'Live workspace',
    greeting: 'Good day',
    roleLabel: 'Role',
    lastLoginLabel: 'Last login',
    workspaceLabel: 'Workspace',
    generatedLabel: 'Updated',
    openLabel: 'Open',
    searchLabel: 'Search work',
    retryLabel: 'Retry',
    openReportsLabel: 'Open reports',
    recordLabel: 'record',
    recordsLabel: 'records',
    staffFallback: 'Staff',
    metricsSectionTitle: 'Key metrics',
    queuesSectionTitle: 'Priority queues',
    activitySectionTitle: 'Recent activity',
    actionsSectionTitle: 'Quick actions',
    overviewSectionTitle: 'Access overview',
    analyticsSectionTitle: 'Monthly operational trends',
    analyticsSectionDescription: 'Compare funding and application activity across recent months.',
    chartLabels: {
      fundsRaised: 'Funds raised',
      applications: 'Applications',
      gifts: 'Gifts',
      peakMonth: 'Peak month',
      empty: 'No monthly trend data is available yet.',
    },
    metricLabels: {
      applications_pending_review: 'Applications pending review',
      beneficiaries_supported: 'Beneficiaries supported',
      schools_connected: 'Schools connected',
      active_sponsorships: 'Active sponsorships',
      funding_awaiting_allocation: 'Funding awaiting allocation',
      reports_due: 'Reports due',
    },
    queueLabels: {
      applications_verification: 'Applications awaiting verification',
      applications_review: 'Applications awaiting review',
      beneficiaries_awaiting_sponsorship: 'Beneficiaries awaiting sponsorship',
      allocations_pending: 'Allocations pending approval',
      payments_pending_approval: 'Payments requiring approval',
    },
    queueAction: 'Open queue',
    queueEmpty: 'Nothing is waiting in this queue.',
    activityEmpty: 'No recent activity yet.',
    quickActionLabels: {
      applications_review: { title: 'Review applications', description: 'Open intake and review queues.' },
      beneficiaries_open: { title: 'Open beneficiaries', description: 'Go to active child records.' },
      funding_open: { title: 'Open funding', description: 'Review donations, allocations, and payments.' },
      reports_open: { title: 'Open reports', description: 'Check impact and accountability work.' },
    },
    overviewLabels: {
      accessibleModules: 'Accessible modules',
      directPermissions: 'Direct permissions',
      updatedAt: 'Snapshot updated',
    },
    statusLabels: {
      loading: 'Loading dashboard data...',
      noData: 'No data available yet.',
    },
    errorTitle: 'Dashboard data could not load.',
    errorDescription: 'The workspace will refresh once the API responds again.',
  },
  fr: {
    title: 'Tableau de bord des operations',
    subtitle: 'Files de travail, activite et actions dans les espaces accessibles.',
    liveLabel: 'Espace actif',
    greeting: 'Bonjour',
    roleLabel: 'Role',
    lastLoginLabel: 'Derniere connexion',
    workspaceLabel: 'Espace',
    generatedLabel: 'Mise a jour',
    openLabel: 'Ouvrir',
    searchLabel: 'Rechercher le travail',
    retryLabel: 'Reessayer',
    openReportsLabel: 'Ouvrir les rapports',
    recordLabel: 'dossier',
    recordsLabel: 'dossiers',
    staffFallback: 'Personnel',
    metricsSectionTitle: 'Indicateurs cles',
    queuesSectionTitle: 'Files prioritaires',
    activitySectionTitle: 'Activite recente',
    actionsSectionTitle: 'Actions rapides',
    overviewSectionTitle: 'Vue d acces',
    analyticsSectionTitle: 'Tendances operationnelles mensuelles',
    analyticsSectionDescription: 'Comparez financement et demandes sur les mois recents.',
    chartLabels: {
      fundsRaised: 'Fonds collectes',
      applications: 'Demandes',
      gifts: 'Dons',
      peakMonth: 'Mois le plus fort',
      empty: 'Aucune tendance mensuelle disponible pour le moment.',
    },
    metricLabels: {
      applications_pending_review: 'Demandes en attente de revue',
      beneficiaries_supported: 'Beneficiaires suivis',
      schools_connected: 'Ecoles connectees',
      active_sponsorships: 'Parrainages actifs',
      funding_awaiting_allocation: 'Financement en attente d allocation',
      reports_due: 'Rapports attendus',
    },
    queueLabels: {
      applications_verification: 'Demandes en attente de verification',
      applications_review: 'Demandes en attente de revue',
      beneficiaries_awaiting_sponsorship: 'Beneficiaires en attente de parrainage',
      allocations_pending: 'Allocations en attente d approbation',
      payments_pending_approval: 'Paiements en attente d approbation',
    },
    queueAction: 'Ouvrir la file',
    queueEmpty: 'Aucun element n attend dans cette file.',
    activityEmpty: 'Aucune activite recente pour le moment.',
    quickActionLabels: {
      applications_review: { title: 'Revoir les demandes', description: "Ouvrir les files d entree et de revue." },
      beneficiaries_open: { title: 'Ouvrir les beneficiaires', description: 'Acceder aux dossiers actifs.' },
      funding_open: { title: 'Ouvrir le financement', description: 'Revoir dons, allocations et paiements.' },
      reports_open: { title: 'Ouvrir les rapports', description: "Verifier impact et redevabilite." },
    },
    overviewLabels: {
      accessibleModules: 'Modules accessibles',
      directPermissions: 'Permissions directes',
      updatedAt: 'Snapshot mis a jour',
    },
    statusLabels: {
      loading: 'Chargement des donnees du tableau de bord...',
      noData: 'Aucune donnee disponible pour le moment.',
    },
    errorTitle: 'Les donnees du tableau de bord n ont pas pu se charger.',
    errorDescription: "L espace de travail se rafraichira des que l API repondra de nouveau.",
  },
};
