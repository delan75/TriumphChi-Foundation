import type { Locale } from '../../../lib/i18n';

export const publicBlogContent: Record<Locale, {
  heroEyebrow: string;
  searchLabel: string;
  searchPlaceholder: string;
  allCategories: string;
  allTags: string;
  featured: string;
  latest: string;
  read: string;
  minRead: string;
  emptyTitle: string;
  emptyBody: string;
  loading: string;
  backToBlog: string;
  published: string;
  writtenBy: string;
  relatedTitle: string;
}> = {
  en: {
    heroEyebrow: 'Stories from the work',
    searchLabel: 'Search stories',
    searchPlaceholder: 'Search education, school fees, mentorship...',
    allCategories: 'All stories',
    allTags: 'All themes',
    featured: 'Featured note',
    latest: 'Latest notes',
    read: 'Read note',
    minRead: 'min read',
    emptyTitle: 'No stories match this view yet.',
    emptyBody: 'Try another category or clear the search to see more field notes.',
    loading: 'Loading stories...',
    backToBlog: 'Back to blog',
    published: 'Published',
    writtenBy: 'Written by',
    relatedTitle: 'More field notes',
  },
  fr: {
    heroEyebrow: 'Recits du terrain',
    searchLabel: 'Rechercher',
    searchPlaceholder: 'Rechercher education, frais scolaires, mentorat...',
    allCategories: 'Tous les recits',
    allTags: 'Tous les themes',
    featured: 'Note en avant',
    latest: 'Dernieres notes',
    read: 'Lire la note',
    minRead: 'min de lecture',
    emptyTitle: 'Aucun recit ne correspond encore a cette vue.',
    emptyBody: 'Essayez une autre categorie ou effacez la recherche.',
    loading: 'Chargement des recits...',
    backToBlog: 'Retour au blog',
    published: 'Publie',
    writtenBy: 'Redige par',
    relatedTitle: 'Autres notes de terrain',
  },
};
