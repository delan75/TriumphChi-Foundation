import type { Locale } from '../../lib/i18n';

export interface FundingCopy {
  title: string;
  description: string;
  refresh: string;
  searchPlaceholder: string;
  status: string;
  provider: string;
  currency: string;
  allStatuses: string;
  allProviders: string;
  allCurrencies: string;
  clear: string;
  filters: string;
  summary: {
    total: string;
    confirmed: string;
    pending: string;
    failed: string;
    allocated: string;
  };
  tableTitle: string;
  tableDescription: string;
  donor: string;
  amount: string;
  method: string;
  fund: string;
  date: string;
  allocated: string;
  actions: string;
  open: string;
  previous: string;
  next: string;
  loading: string;
  empty: string;
  accessDeniedTitle: string;
  accessDeniedBody: string;
  detailTitle: string;
  close: string;
  providerReference: string;
  receipt: string;
  receiptAvailable: string;
  receiptMissing: string;
  allocationTrace: string;
  transactionTrace: string;
  documentTrace: string;
  download: string;
  noAllocations: string;
  noTransactions: string;
  noDocuments: string;
  latestIntent: string;
  refreshPaymentStatus: string;
  refreshingPaymentStatus: string;
  paymentReviewTitle: string;
  paymentReviewBody: string;
  permissions: string;
  canCreate: string;
  canUpdate: string;
  canApprove: string;
}

export const fundingContent = {
  en: {
    title: 'Donation Management',
    description: 'Review giving records, provider status, allocation progress, and payment traceability from one workspace.',
    refresh: 'Refresh',
    searchPlaceholder: 'Search reference, donor, or provider reference',
    status: 'Status',
    provider: 'Provider',
    currency: 'Currency',
    allStatuses: 'All statuses',
    allProviders: 'All providers',
    allCurrencies: 'All currencies',
    clear: 'Clear',
    filters: 'Filters',
    summary: {
      total: 'Matching donations',
      confirmed: 'Confirmed',
      pending: 'Pending',
      failed: 'Failed',
      allocated: 'Allocation coverage',
    },
    tableTitle: 'Donation records',
    tableDescription: 'Open a record to inspect donor, fund, allocation, and provider transaction details.',
    donor: 'Donor',
    amount: 'Amount',
    method: 'Method',
    fund: 'Fund',
    date: 'Date',
    allocated: 'Allocated',
    actions: 'Actions',
    open: 'Open',
    previous: 'Prev',
    next: 'Next',
    loading: 'Loading donations...',
    empty: 'No donations match the current filters.',
    accessDeniedTitle: 'Donation access is not available',
    accessDeniedBody: 'Your account needs the donations.view permission to review donation records.',
    detailTitle: 'Donation details',
    close: 'Close',
    providerReference: 'Provider reference',
    receipt: 'Receipt',
    receiptAvailable: 'Available',
    receiptMissing: 'Not attached',
    allocationTrace: 'Allocation trace',
    transactionTrace: 'Provider transactions',
    documentTrace: 'Receipts and invoices',
    download: 'Download',
    noAllocations: 'No allocations have been attached to this donation yet.',
    noTransactions: 'No provider transactions are linked yet.',
    noDocuments: 'No receipt or invoice has been issued yet.',
    latestIntent: 'Latest intent',
    refreshPaymentStatus: 'Check PayPal Status',
    refreshingPaymentStatus: 'Checking PayPal...',
    paymentReviewTitle: 'PayPal review in progress',
    paymentReviewBody: 'PayPal may hold donations for security review. Use this action later to check whether PayPal has released or declined the payment.',
    permissions: 'Allowed actions',
    canCreate: 'Create',
    canUpdate: 'Update',
    canApprove: 'Approve',
  },
  fr: {
    title: 'Gestion des dons',
    description: 'Consultez les dons, le statut des prestataires, les allocations et la traçabilité des paiements depuis un seul espace.',
    refresh: 'Actualiser',
    searchPlaceholder: 'Rechercher référence, donateur ou référence prestataire',
    status: 'Statut',
    provider: 'Prestataire',
    currency: 'Devise',
    allStatuses: 'Tous les statuts',
    allProviders: 'Tous les prestataires',
    allCurrencies: 'Toutes les devises',
    clear: 'Effacer',
    filters: 'Filtres',
    summary: {
      total: 'Dons correspondants',
      confirmed: 'Confirmés',
      pending: 'En attente',
      failed: 'Échoués',
      allocated: 'Couverture allocation',
    },
    tableTitle: 'Dossiers de dons',
    tableDescription: 'Ouvrez un dossier pour voir donateur, fonds, allocation et transaction prestataire.',
    donor: 'Donateur',
    amount: 'Montant',
    method: 'Methode',
    fund: 'Fonds',
    date: 'Date',
    allocated: 'Alloué',
    actions: 'Actions',
    open: 'Ouvrir',
    previous: 'Préc.',
    next: 'Suiv.',
    loading: 'Chargement des dons...',
    empty: 'Aucun don ne correspond aux filtres actuels.',
    accessDeniedTitle: 'Accès aux dons indisponible',
    accessDeniedBody: 'Votre compte a besoin de la permission donations.view pour consulter les dons.',
    detailTitle: 'Détails du don',
    close: 'Fermer',
    providerReference: 'Référence prestataire',
    receipt: 'Reçu',
    receiptAvailable: 'Disponible',
    receiptMissing: 'Non joint',
    allocationTrace: 'Trace des allocations',
    transactionTrace: 'Transactions prestataire',
    documentTrace: 'Reçus et factures',
    download: 'Télécharger',
    noAllocations: 'Aucune allocation n’est encore liée à ce don.',
    noTransactions: 'Aucune transaction prestataire n’est encore liée.',
    noDocuments: 'Aucun reçu ou facture n’est encore émis.',
    latestIntent: 'Dernière intention',
    refreshPaymentStatus: 'Verifier PayPal',
    refreshingPaymentStatus: 'Verification PayPal...',
    paymentReviewTitle: 'Verification PayPal en cours',
    paymentReviewBody: 'PayPal peut retenir certains dons pour verification de securite. Utilisez cette action plus tard pour verifier si PayPal a libere ou refuse le paiement.',
    permissions: 'Actions autorisées',
    canCreate: 'Créer',
    canUpdate: 'Modifier',
    canApprove: 'Approuver',
  },
} satisfies Record<Locale, FundingCopy>;
