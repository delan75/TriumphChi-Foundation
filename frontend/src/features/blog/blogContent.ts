import type { Locale } from '../../lib/i18n';

export interface BlogCopy {
  title: string;
  description: string;
  create: string;
  refresh: string;
  save: string;
  saving: string;
  cancel: string;
  edit: string;
  publish: string;
  archive: string;
  sendToReview: string;
  accessDeniedTitle: string;
  accessDeniedBody: string;
  summary: {
    total: string;
    draft: string;
    review: string;
    published: string;
    archived: string;
  };
  filters: {
    search: string;
    searchPlaceholder: string;
    status: string;
    allStatuses: string;
    featured: string;
    reset: string;
  };
  table: {
    title: string;
    description: string;
    story: string;
    status: string;
    category: string;
    author: string;
    published: string;
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
    preview: string;
    metadata: string;
    tags: string;
    noTags: string;
  };
  form: {
    titleCreate: string;
    titleEdit: string;
    english: string;
    french: string;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    category: string;
    tags: string;
    status: string;
    featured: string;
    imagePath: string;
    imageAlt: string;
    seoTitle: string;
    seoDescription: string;
  };
  statuses: Record<string, string>;
}

export const blogContent: Record<Locale, BlogCopy> = {
  en: {
    title: 'Blog',
    description: 'Publish field notes, education insights, and foundation updates for the public site.',
    create: 'New Post',
    refresh: 'Refresh',
    save: 'Save Post',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    publish: 'Publish',
    archive: 'Archive',
    sendToReview: 'Send to Review',
    accessDeniedTitle: 'Access unavailable',
    accessDeniedBody: 'Your account does not have permission to manage blog content.',
    summary: {
      total: 'Total Posts',
      draft: 'Drafts',
      review: 'In Review',
      published: 'Published',
      archived: 'Archived',
    },
    filters: {
      search: 'Search posts',
      searchPlaceholder: 'Title, reference, excerpt...',
      status: 'Status',
      allStatuses: 'All statuses',
      featured: 'Featured only',
      reset: 'Reset',
    },
    table: {
      title: 'Editorial Desk',
      description: 'Review article status, public readiness, and publishing actions.',
      story: 'Story',
      status: 'Status',
      category: 'Category',
      author: 'Author',
      published: 'Published',
      actions: 'Actions',
      open: 'Open',
      empty: 'No posts match these filters.',
      loading: 'Loading posts...',
      previous: 'Previous',
      next: 'Next',
    },
    detail: {
      title: 'Post details',
      emptyTitle: 'Select a post',
      emptyBody: 'Open a post to preview the article, metadata, and publishing state.',
      loading: 'Loading post...',
      close: 'Close',
      preview: 'Reader preview',
      metadata: 'Publication details',
      tags: 'Themes',
      noTags: 'No themes attached',
    },
    form: {
      titleCreate: 'Create Post',
      titleEdit: 'Edit Post',
      english: 'English',
      french: 'French',
      title: 'Title',
      slug: 'Slug',
      excerpt: 'Excerpt',
      body: 'Body',
      category: 'Category',
      tags: 'Themes',
      status: 'Status',
      featured: 'Feature on blog page',
      imagePath: 'Featured image path',
      imageAlt: 'Image description',
      seoTitle: 'SEO title',
      seoDescription: 'SEO description',
    },
    statuses: {
      draft: 'Draft',
      review: 'In Review',
      published: 'Published',
      archived: 'Archived',
    },
  },
  fr: {
    title: 'Blog',
    description: 'Publiez les notes de terrain, les analyses educatives et les nouvelles de la fondation.',
    create: 'Nouvelle note',
    refresh: 'Actualiser',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    cancel: 'Annuler',
    edit: 'Modifier',
    publish: 'Publier',
    archive: 'Archiver',
    sendToReview: 'Envoyer en revue',
    accessDeniedTitle: 'Acces indisponible',
    accessDeniedBody: "Votre compte n'a pas la permission de gerer le blog.",
    summary: {
      total: 'Articles',
      draft: 'Brouillons',
      review: 'En revue',
      published: 'Publies',
      archived: 'Archives',
    },
    filters: {
      search: 'Rechercher',
      searchPlaceholder: 'Titre, reference, extrait...',
      status: 'Statut',
      allStatuses: 'Tous les statuts',
      featured: 'Mis en avant',
      reset: 'Reinitialiser',
    },
    table: {
      title: 'Bureau editorial',
      description: 'Suivez les statuts, la preparation publique et les actions de publication.',
      story: 'Article',
      status: 'Statut',
      category: 'Categorie',
      author: 'Auteur',
      published: 'Publie',
      actions: 'Actions',
      open: 'Ouvrir',
      empty: 'Aucun article ne correspond a ces filtres.',
      loading: 'Chargement...',
      previous: 'Precedent',
      next: 'Suivant',
    },
    detail: {
      title: 'Details',
      emptyTitle: 'Selectionnez un article',
      emptyBody: 'Ouvrez un article pour verifier le contenu, les metadonnees et le statut.',
      loading: 'Chargement...',
      close: 'Fermer',
      preview: 'Apercu lecteur',
      metadata: 'Publication',
      tags: 'Themes',
      noTags: 'Aucun theme',
    },
    form: {
      titleCreate: 'Creer un article',
      titleEdit: 'Modifier article',
      english: 'Anglais',
      french: 'Francais',
      title: 'Titre',
      slug: 'Slug',
      excerpt: 'Extrait',
      body: 'Corps',
      category: 'Categorie',
      tags: 'Themes',
      status: 'Statut',
      featured: 'Mettre en avant',
      imagePath: 'Chemin de l image',
      imageAlt: 'Description de l image',
      seoTitle: 'Titre SEO',
      seoDescription: 'Description SEO',
    },
    statuses: {
      draft: 'Brouillon',
      review: 'En revue',
      published: 'Publie',
      archived: 'Archive',
    },
  },
};
