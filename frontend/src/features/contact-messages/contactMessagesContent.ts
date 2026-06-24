import type { Locale } from '../../lib/i18n';

export interface ContactMessagesCopy {
  title: string;
  description: string;
  refresh: string;
  accessDeniedTitle: string;
  accessDeniedBody: string;
  summary: {
    total: string;
    new: string;
    reviewing: string;
    replied: string;
    attachments: string;
  };
  filters: {
    search: string;
    searchPlaceholder: string;
    status: string;
    reason: string;
    attachments: string;
    all: string;
    withAttachments: string;
    reset: string;
  };
  tableTitle: string;
  tableDescription: string;
  empty: string;
  loading: string;
  open: string;
  previous: string;
  next: string;
  received: string;
  contact: string;
  reason: string;
  assignedTo: string;
  attachments: string;
  status: string;
  actions: string;
  detailTitle: string;
  close: string;
  noSelection: string;
  message: string;
  contactDetails: string;
  management: string;
  assignment: string;
  assign: string;
  unassigned: string;
  saveStatus: string;
  notes: string;
  notesPlaceholder: string;
  forward: string;
  forwardEmail: string;
  forwardNote: string;
  forwardNotePlaceholder: string;
  sendEntry: string;
  archive: string;
  markReplied: string;
  attachmentsTitle: string;
  download: string;
  noAttachments: string;
  activity: string;
  working: string;
  saved: string;
  sent: string;
  failed: string;
  statuses: Record<string, string>;
  reasons: Record<string, string>;
}

export const contactMessagesContent: Record<Locale, ContactMessagesCopy> = {
  en: {
    title: 'Contact Inquiries',
    description: 'Review public messages, assign ownership, forward inquiries, and keep follow-up moving.',
    refresh: 'Refresh',
    accessDeniedTitle: 'Contact access required',
    accessDeniedBody: 'Your account does not currently have permission to view contact inquiries.',
    summary: {
      total: 'Total inquiries',
      new: 'New',
      reviewing: 'In review',
      replied: 'Replied',
      attachments: 'With files',
    },
    filters: {
      search: 'Search',
      searchPlaceholder: 'Name, email, phone, subject, message...',
      status: 'Status',
      reason: 'Reason',
      attachments: 'Files',
      all: 'All',
      withAttachments: 'With files',
      reset: 'Reset',
    },
    tableTitle: 'Inbox',
    tableDescription: 'Newest contact inquiries and follow-up status.',
    empty: 'No contact inquiries match the current filters.',
    loading: 'Loading contact inquiries...',
    open: 'Open',
    previous: 'Previous',
    next: 'Next',
    received: 'Received',
    contact: 'Contact',
    reason: 'Reason',
    assignedTo: 'Assigned to',
    attachments: 'Files',
    status: 'Status',
    actions: 'Actions',
    detailTitle: 'Inquiry details',
    close: 'Close details',
    noSelection: 'Select an inquiry to review the message, assign ownership, or forward it.',
    message: 'Message',
    contactDetails: 'Contact details',
    management: 'Management',
    assignment: 'Assignment',
    assign: 'Assign',
    unassigned: 'Unassigned',
    saveStatus: 'Save status',
    notes: 'Staff notes',
    notesPlaceholder: 'Add follow-up notes for staff...',
    forward: 'Forward entry',
    forwardEmail: 'Email address',
    forwardNote: 'Note',
    forwardNotePlaceholder: 'Add a short note for the recipient...',
    sendEntry: 'Send entry',
    archive: 'Archive',
    markReplied: 'Mark as replied',
    attachmentsTitle: 'Attachments',
    download: 'Download',
    noAttachments: 'No files attached.',
    activity: 'Activity',
    working: 'Working...',
    saved: 'Saved.',
    sent: 'Sent.',
    failed: 'Something went wrong. Please try again.',
    statuses: {
      new: 'New',
      reviewing: 'Reviewing',
      replied: 'Replied',
      archived: 'Archived',
      spam: 'Spam',
    },
    reasons: {
      general: 'General',
      sponsorship: 'Sponsorship',
      assistance: 'Assistance',
      school: 'School',
      volunteer: 'Volunteer',
      partnership: 'Partnership',
      church: 'Church',
      corporate: 'Corporate',
    },
  },
  fr: {
    title: 'Messages de contact',
    description: 'Consultez les messages publics, assignez les suivis, transferez les demandes et avancez les reponses.',
    refresh: 'Actualiser',
    accessDeniedTitle: 'Acces contact requis',
    accessDeniedBody: 'Votre compte ne dispose pas encore de la permission pour consulter les messages de contact.',
    summary: {
      total: 'Demandes totales',
      new: 'Nouvelles',
      reviewing: 'En revue',
      replied: 'Repondues',
      attachments: 'Avec fichiers',
    },
    filters: {
      search: 'Recherche',
      searchPlaceholder: 'Nom, email, telephone, sujet, message...',
      status: 'Statut',
      reason: 'Motif',
      attachments: 'Fichiers',
      all: 'Tous',
      withAttachments: 'Avec fichiers',
      reset: 'Reinitialiser',
    },
    tableTitle: 'Boite de reception',
    tableDescription: 'Demandes recentes et etat du suivi.',
    empty: 'Aucune demande de contact ne correspond aux filtres actuels.',
    loading: 'Chargement des messages de contact...',
    open: 'Ouvrir',
    previous: 'Precedent',
    next: 'Suivant',
    received: 'Recu',
    contact: 'Contact',
    reason: 'Motif',
    assignedTo: 'Assigne a',
    attachments: 'Fichiers',
    status: 'Statut',
    actions: 'Actions',
    detailTitle: 'Details de la demande',
    close: 'Fermer les details',
    noSelection: 'Selectionnez une demande pour lire le message, assigner le suivi ou le transferer.',
    message: 'Message',
    contactDetails: 'Coordonnees',
    management: 'Gestion',
    assignment: 'Assignation',
    assign: 'Assigner',
    unassigned: 'Non assigne',
    saveStatus: 'Enregistrer',
    notes: 'Notes internes',
    notesPlaceholder: 'Ajoutez des notes de suivi pour le personnel...',
    forward: 'Transferer la demande',
    forwardEmail: 'Adresse email',
    forwardNote: 'Note',
    forwardNotePlaceholder: 'Ajoutez une courte note pour le destinataire...',
    sendEntry: 'Envoyer',
    archive: 'Archiver',
    markReplied: 'Marquer repondu',
    attachmentsTitle: 'Fichiers joints',
    download: 'Telecharger',
    noAttachments: 'Aucun fichier joint.',
    activity: 'Activite',
    working: 'Traitement...',
    saved: 'Enregistre.',
    sent: 'Envoye.',
    failed: 'Une erreur est survenue. Veuillez reessayer.',
    statuses: {
      new: 'Nouvelle',
      reviewing: 'En revue',
      replied: 'Repondue',
      archived: 'Archivee',
      spam: 'Spam',
    },
    reasons: {
      general: 'General',
      sponsorship: 'Parrainage',
      assistance: 'Assistance',
      school: 'Ecole',
      volunteer: 'Benevolat',
      partnership: 'Partenariat',
      church: 'Eglise',
      corporate: 'Organisation',
    },
  },
};
