import {
  BookOpen,
  Building2,
  ChartNoAxesCombined,
  FileText,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Mail,
  Megaphone,
  Newspaper,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { buildOrganizationSchema, buildWebSiteSchema, JsonLdGraph, localizedUrl } from '../lib/seo';
import { Locale } from '../lib/i18n';

export type PublicPageKey =
  | 'home'
  | 'about'
  | 'mission'
  | 'vision'
  | 'programs'
  | 'impact'
  | 'successStories'
  | 'blog'
  | 'news'
  | 'contact'
  | 'donate'
  | 'apply'
  | 'sponsor'
  | 'corporate';

export interface PublicPageSection {
  title: Record<Locale, string>;
  body: Record<Locale, string>;
}

export interface PublicPageDefinition {
  key: PublicPageKey;
  icon: typeof ShieldCheck;
  navGroup: 'primary' | 'secondary';
  path: Record<Locale, string>;
  label: Record<Locale, string>;
  eyebrow: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  cta?: {
    label: Record<Locale, string>;
    page: PublicPageKey;
  };
  schemaType: 'WebPage' | 'AboutPage' | 'ContactPage' | 'DonateAction' | 'Blog' | 'CollectionPage';
  sections: PublicPageSection[];
}

export const publicPages: PublicPageDefinition[] = [
  {
    key: 'home',
    icon: ShieldCheck,
    navGroup: 'primary',
    path: { en: '/', fr: '/' },
    label: { en: 'Home', fr: 'Accueil' },
    eyebrow: { en: 'Education sponsorship in Cameroon', fr: 'Parrainage scolaire au Cameroun' },
    title: {
      en: 'Giving from a covenant, not from leftovers.',
      fr: 'Un soutien scolaire transparent pour les enfants vulnérables.',
    },
    description: {
      en: 'TriumphChi Foundation supports orphans and vulnerable children in rural Cameroon through school needs, community care, and dignified assistance.',
      fr: "La Fondation TriumphChi coordonne les demandes, les parrainages, les paiements scolaires et les rapports d'impact avec la protection de l'enfant au centre.",
    },
    cta: { label: { en: 'Sponsor a child', fr: 'Parrainer un enfant' }, page: 'sponsor' },
    schemaType: 'WebPage',
    sections: [
      {
        title: { en: 'Application to graduation', fr: "De la demande à la réussite" },
        body: {
          en: 'The platform follows each child from application, verification, review, acceptance, sponsorship, active support, and completion.',
          fr: "La plateforme suit chaque enfant depuis la demande, la vérification, l'étude, l'acceptation, le parrainage, le soutien actif et l'achèvement.",
        },
      },
      {
        title: { en: 'Private by default', fr: 'Privé par défaut' },
        body: {
          en: 'Public pages use curated stories and aggregate impact. Sensitive beneficiary data remains behind authenticated workflows.',
          fr: "Les pages publiques utilisent des récits validés et des données agrégées. Les données sensibles restent protégées.",
        },
      },
      {
        title: { en: 'Faithful stewardship', fr: 'Financement traçable' },
        body: {
          en: 'Giving is handled with care so children, schools, families, and supporters can trust the work.',
          fr: "Les dons passent par les fonds, les allocations, les besoins scolaires et les paiements aux écoles afin de rester auditables.",
        },
      },
    ],
  },
  {
    key: 'about',
    icon: BookOpen,
    navGroup: 'primary',
    path: { en: '/about', fr: '/a-propos' },
    label: { en: 'About', fr: 'À propos' },
    eyebrow: { en: 'Who we are', fr: 'Qui nous sommes' },
    title: { en: 'An NGO focused on orphan education support.', fr: "Une ONG dédiée à l'éducation des orphelins." },
    description: {
      en: 'TriumphChi Foundation supports education pathways through school partnerships, sponsorship coordination, and responsible reporting.',
      fr: "La Fondation TriumphChi soutient les parcours scolaires grâce aux partenariats avec les écoles, au parrainage et aux rapports responsables.",
    },
    schemaType: 'AboutPage',
    sections: [
      {
        title: { en: 'Built for accountability', fr: 'Conçu pour la responsabilité' },
        body: {
          en: 'The system is designed to help staff document decisions, payments, needs, and outcomes with clear audit trails.',
          fr: "Le système aide l'équipe à documenter les décisions, les paiements, les besoins et les résultats avec des traces claires.",
        },
      },
    ],
  },
  {
    key: 'mission',
    icon: Target,
    navGroup: 'secondary',
    path: { en: '/mission', fr: '/mission' },
    label: { en: 'Mission', fr: 'Mission' },
    eyebrow: { en: 'Our mission', fr: 'Notre mission' },
    title: { en: 'Keep vulnerable children learning.', fr: 'Permettre aux enfants vulnérables de poursuivre leurs études.' },
    description: {
      en: 'We help children remain in school through verified needs, direct school support, and sustained sponsor communication.',
      fr: "Nous aidons les enfants à rester à l'école grâce à des besoins vérifiés, un soutien direct aux écoles et une communication continue avec les parrains.",
    },
    schemaType: 'WebPage',
    sections: [],
  },
  {
    key: 'vision',
    icon: GraduationCap,
    navGroup: 'secondary',
    path: { en: '/vision', fr: '/vision' },
    label: { en: 'Vision', fr: 'Vision' },
    eyebrow: { en: 'Our vision', fr: 'Notre vision' },
    title: { en: 'A future where education support is transparent and scalable.', fr: 'Un avenir où le soutien scolaire est transparent et durable.' },
    description: {
      en: 'The long-term platform is designed to grow from hundreds of beneficiaries to national-scale education support.',
      fr: "La plateforme est conçue pour passer de quelques centaines de bénéficiaires à un soutien scolaire à grande échelle.",
    },
    schemaType: 'WebPage',
    sections: [],
  },
  {
    key: 'programs',
    icon: HeartHandshake,
    navGroup: 'primary',
    path: { en: '/programs', fr: '/programmes' },
    label: { en: 'Programs', fr: 'Programmes' },
    eyebrow: { en: 'Education programs', fr: 'Programmes éducatifs' },
    title: { en: 'Support for school fees, books, uniforms, exams, and mentorship.', fr: 'Soutien pour les frais scolaires, livres, uniformes, examens et mentorat.' },
    description: {
      en: 'Programs are structured around educational needs that can be funded, allocated, paid, and reported independently.',
      fr: 'Les programmes sont structurés autour de besoins scolaires qui peuvent être financés, alloués, payés et suivis séparément.',
    },
    cta: { label: { en: 'Donate to a program', fr: 'Donner à un programme' }, page: 'donate' },
    schemaType: 'CollectionPage',
    sections: [],
  },
  {
    key: 'impact',
    icon: ChartNoAxesCombined,
    navGroup: 'primary',
    path: { en: '/impact', fr: '/impact' },
    label: { en: 'Impact', fr: 'Impact' },
    eyebrow: { en: 'Impact statistics', fr: "Statistiques d'impact" },
    title: { en: 'Measure outcomes without exposing private child records.', fr: 'Mesurer les résultats sans exposer les dossiers privés des enfants.' },
    description: {
      en: 'Impact pages will present aggregate metrics, school milestones, funded needs, and curated updates approved for public sharing.',
      fr: "Les pages d'impact présenteront des données agrégées, des étapes scolaires, des besoins financés et des nouvelles validées pour publication.",
    },
    schemaType: 'WebPage',
    sections: [],
  },
  {
    key: 'successStories',
    icon: Megaphone,
    navGroup: 'secondary',
    path: { en: '/success-stories', fr: '/histoires-de-reussite' },
    label: { en: 'Success Stories', fr: 'Histoires de réussite' },
    eyebrow: { en: 'Curated stories', fr: 'Récits validés' },
    title: { en: 'Share progress responsibly.', fr: 'Partager les progrès de manière responsable.' },
    description: {
      en: 'Success stories should use consented, reviewed content and avoid exposing sensitive beneficiary details.',
      fr: 'Les histoires de réussite doivent utiliser du contenu consenti, validé et sans détails sensibles.',
    },
    schemaType: 'CollectionPage',
    sections: [],
  },
  {
    key: 'blog',
    icon: FileText,
    navGroup: 'secondary',
    path: { en: '/blog', fr: '/blog' },
    label: { en: 'Blog', fr: 'Blog' },
    eyebrow: { en: 'Updates and insights', fr: 'Actualités et analyses' },
    title: { en: 'Field notes, education insights, and program updates.', fr: 'Notes de terrain, analyses éducatives et nouvelles des programmes.' },
    description: {
      en: 'The blog will support localized slugs, metadata, categories, tags, and structured article data.',
      fr: 'Le blog prendra en charge les slugs localisés, métadonnées, catégories, étiquettes et données structurées.',
    },
    schemaType: 'Blog',
    sections: [],
  },
  {
    key: 'news',
    icon: Newspaper,
    navGroup: 'secondary',
    path: { en: '/news', fr: '/actualites' },
    label: { en: 'News', fr: 'Actualités' },
    eyebrow: { en: 'Foundation news', fr: 'Actualités de la fondation' },
    title: { en: 'Announcements from the foundation.', fr: 'Annonces de la fondation.' },
    description: {
      en: 'News pages will publish organization updates, partnerships, program launches, and reporting milestones.',
      fr: 'Les pages actualités publieront les nouvelles, partenariats, lancements et rapports de la fondation.',
    },
    schemaType: 'CollectionPage',
    sections: [],
  },
  {
    key: 'contact',
    icon: Mail,
    navGroup: 'primary',
    path: { en: '/contact', fr: '/contact' },
    label: { en: 'Contact', fr: 'Contact' },
    eyebrow: { en: 'Contact us', fr: 'Nous contacter' },
    title: { en: 'Connect with the foundation team.', fr: "Contacter l'équipe de la fondation." },
    description: {
      en: 'Contact workflows will support donors, schools, volunteers, corporate partners, and families seeking application guidance.',
      fr: 'Les formulaires de contact soutiendront les donateurs, écoles, bénévoles, partenaires et familles.',
    },
    schemaType: 'ContactPage',
    sections: [],
  },
  {
    key: 'donate',
    icon: HandHeart,
    navGroup: 'primary',
    path: { en: '/donate', fr: '/donner' },
    label: { en: 'Donate', fr: 'Donner' },
    eyebrow: { en: 'Give transparently', fr: 'Donner avec transparence' },
    title: { en: 'Give toward real school needs.', fr: 'Financer les besoins scolaires par des dons traçables.' },
    description: {
      en: 'Donations can support school fees, books, uniforms, emergency needs, mentorship, and general education funds.',
      fr: "Les dons peuvent soutenir les frais scolaires, livres, uniformes, urgences, mentorat et fonds d'éducation.",
    },
    schemaType: 'DonateAction',
    sections: [],
  },
  {
    key: 'apply',
    icon: FileText,
    navGroup: 'primary',
    path: { en: '/apply', fr: '/postuler' },
    label: { en: 'Apply', fr: 'Postuler' },
    eyebrow: { en: 'Application intake', fr: 'Dépôt de demande' },
    title: { en: 'Start an education support application.', fr: 'Commencer une demande de soutien scolaire.' },
    description: {
      en: 'Applications may come from families, schools, field officers, or NGO staff and remain private throughout review.',
      fr: "Les demandes peuvent venir des familles, écoles, agents de terrain ou de l'équipe, et restent privées pendant l'étude.",
    },
    schemaType: 'WebPage',
    sections: [],
  },
  {
    key: 'sponsor',
    icon: HeartHandshake,
    navGroup: 'primary',
    path: { en: '/sponsor-a-child', fr: '/parrainer-un-enfant' },
    label: { en: 'Sponsor a Child', fr: 'Parrainer un enfant' },
    eyebrow: { en: 'Child sponsorship', fr: "Parrainage d'enfant" },
    title: { en: 'Support one or more education journeys.', fr: 'Soutenir un ou plusieurs parcours scolaires.' },
    description: {
      en: 'Sponsorship supports partial and full funding models while protecting beneficiary privacy.',
      fr: 'Le parrainage soutient des modèles partiels ou complets tout en protégeant la vie privée des bénéficiaires.',
    },
    schemaType: 'WebPage',
    sections: [],
  },
  {
    key: 'corporate',
    icon: Building2,
    navGroup: 'secondary',
    path: { en: '/corporate-partnerships', fr: '/partenariats-entreprises' },
    label: { en: 'Corporate Partnerships', fr: 'Partenariats entreprises' },
    eyebrow: { en: 'Partner with us', fr: 'Devenir partenaire' },
    title: { en: 'Create accountable education partnerships.', fr: 'Créer des partenariats éducatifs responsables.' },
    description: {
      en: 'Corporate partners can support program funds, school infrastructure, emergency needs, and transparent reporting.',
      fr: "Les entreprises peuvent soutenir les fonds de programme, l'infrastructure scolaire, les urgences et les rapports.",
    },
    schemaType: 'WebPage',
    sections: [],
  },
];

export const publicNavigation = publicPages.filter((page) =>
  ['home', 'about', 'programs', 'impact', 'donate', 'apply', 'sponsor', 'contact'].includes(page.key),
);

export function getPublicPage(locale: Locale, slug?: string): PublicPageDefinition | undefined {
  const normalizedPath = slug ? `/${slug}` : '/';
  return publicPages.find((page) => page.path[locale] === normalizedPath);
}

export function getPageByKey(key: PublicPageKey): PublicPageDefinition {
  const page = publicPages.find((candidate) => candidate.key === key);

  if (!page) {
    throw new Error(`Unknown public page key: ${key}`);
  }

  return page;
}

export function buildPublicPageSchema(page: PublicPageDefinition, locale: Locale): JsonLdGraph {
  const url = localizedUrl(locale, page.path[locale]);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationSchema(locale),
      buildWebSiteSchema(locale),
      {
        '@type': page.schemaType === 'DonateAction' ? 'WebPage' : page.schemaType,
        '@id': `${url}#webpage`,
        url,
        name: page.title[locale],
        description: page.description[locale],
        inLanguage: locale,
        isPartOf: { '@id': 'https://triumphchi.org/#website' },
        about: { '@id': 'https://triumphchi.org/#organization' },
      },
      ...(page.schemaType === 'DonateAction'
        ? [
            {
              '@type': 'DonateAction',
              target: url,
              recipient: { '@id': 'https://triumphchi.org/#organization' },
              name: page.title[locale],
            },
          ]
        : []),
    ],
  };
}

