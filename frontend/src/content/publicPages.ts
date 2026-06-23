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
  | 'corporate'
  | 'privacy';

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
  seoTitle?: Record<Locale, string>;
  seoDescription?: Record<Locale, string>;
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
      en: 'TriumphChi Foundation',
      fr: 'Fondation TriumphChi',
    },
    description: {
      en: 'TriumphChi Foundation supports orphans and vulnerable children in rural Cameroon through school needs, community care, and dignified assistance.',
      fr: 'La Fondation TriumphChi soutient les orphelins et enfants vulnérables du Cameroun rural par les besoins scolaires, le soin communautaire et une aide digne.',
    },
    cta: { label: { en: 'Sponsor a child', fr: 'Parrainer un enfant' }, page: 'sponsor' },
    schemaType: 'WebPage',
    sections: [
      {
        title: { en: 'Children stay in school', fr: "Les enfants restent à l'école" },
        body: {
          en: 'Education barriers are removed before they become reasons to leave.',
          fr: "Les obstacles scolaires sont levés avant qu'ils ne deviennent des raisons d'abandonner.",
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
          fr: "Les dons sont traités avec soin afin que les enfants, écoles, familles et soutiens puissent faire confiance à l'œuvre.",
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
    title: { en: 'About TriumphChi Foundation', fr: 'À propos de la Fondation TriumphChi' },
    description: {
      en: 'Walking alongside orphaned and vulnerable children in rural Cameroon through education support, community partnership, and covenant-driven generosity.',
      fr: 'Marcher avec les orphelins et enfants vulnérables du Cameroun rural par le soutien scolaire, le partenariat communautaire et la générosité d’alliance.',
    },
    seoTitle: {
      en: 'About TriumphChi Foundation | Orphan Education Support in Cameroon',
      fr: 'À propos de la Fondation TriumphChi | Soutien scolaire aux orphelins au Cameroun',
    },
    seoDescription: {
      en: 'Learn about TriumphChi Foundation, our mission, values, and commitment to supporting orphaned and vulnerable children through education in rural Cameroon.',
      fr: 'Découvrez la Fondation TriumphChi, sa mission, ses valeurs et son engagement envers les orphelins et enfants vulnérables par l’éducation au Cameroun rural.',
    },
    schemaType: 'AboutPage',
    sections: [],
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
    title: { en: "A future where hardship does not end a child's education.", fr: "Un avenir où la difficulté n'arrête pas l'éducation d'un enfant." },
    description: {
      en: 'We envision rural communities where orphaned and vulnerable children remain in school, grow in confidence, and move toward adulthood with hope.',
      fr: "Nous imaginons des communautés rurales où les orphelins et enfants vulnérables restent à l'école, grandissent en confiance et avancent vers l'âge adulte avec espérance.",
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
    eyebrow: { en: 'What we do', fr: 'Ce que nous faisons' },
    title: {
      en: 'Programs That Keep Children Learning',
      fr: 'Des programmes qui aident les enfants à poursuivre leur scolarité',
    },
    description: {
      en: 'TriumphChi Foundation responds to the barriers that keep children out of school with practical support, encouragement, and community care.',
      fr: "La Fondation TriumphChi répond aux obstacles qui empêchent les enfants d'aller à l'école par un soutien concret, de l'encouragement et l'appui de la communauté.",
    },
    seoTitle: {
      en: 'Programs | TriumphChi Foundation',
      fr: 'Programmes | Fondation TriumphChi',
    },
    seoDescription: {
      en: 'See how TriumphChi Foundation helps children stay in school through fees support, books, uniforms, exam help, mentorship, and community partnership.',
      fr: "Découvrez comment la Fondation TriumphChi aide les enfants à rester à l'école grâce aux frais scolaires, livres, uniformes, soutien aux examens, mentorat et partenariat communautaire.",
    },
    cta: { label: { en: 'Support a child', fr: 'Soutenir un enfant' }, page: 'sponsor' },
    schemaType: 'CollectionPage',
    sections: [],
  },
  {
    key: 'impact',
    icon: ChartNoAxesCombined,
    navGroup: 'primary',
    path: { en: '/impact', fr: '/impact' },
    label: { en: 'Impact', fr: 'Impact' },
    eyebrow: { en: 'Evidence of hope', fr: "Preuves d'esperance" },
    title: { en: 'Education Changes Futures', fr: "L'education change l'avenir" },
    description: {
      en: 'See how education support helps children stay in school, families regain hope, and communities work together for lasting progress.',
      fr: "Decouvrez comment le soutien scolaire aide les enfants a rester a l'ecole, les familles a retrouver l'espoir et les communautes a avancer ensemble.",
    },
    seoTitle: {
      en: 'Impact | TriumphChi Foundation',
      fr: 'Impact | Fondation TriumphChi',
    },
    seoDescription: {
      en: 'Explore the impact of TriumphChi Foundation education support in rural Cameroon, including children supported, partner schools, stories of progress, and responsible stewardship.',
      fr: "Explorez l'impact du soutien scolaire de la Fondation TriumphChi au Cameroun rural : enfants soutenus, ecoles partenaires, histoires de progres et responsabilite.",
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
    title: { en: 'Contact TriumphChi Foundation', fr: 'Contacter la Fondation TriumphChi' },
    description: {
      en: 'Whether you would like to support a child, ask about educational assistance, explore a partnership, volunteer your time, or simply learn more about our work, we would be glad to hear from you.',
      fr: "Contactez-nous pour le parrainage, l'aide scolaire, la coordination avec les écoles, le bénévolat, les partenariats d'église, le soutien d'entreprise ou les questions générales.",
    },
    seoTitle: {
      en: 'Contact TriumphChi Foundation | Education Support in Cameroon',
      fr: 'Contacter la Fondation TriumphChi | Soutien scolaire au Cameroun',
    },
    seoDescription: {
      en: 'Contact TriumphChi Foundation about supporting a child, requesting education assistance, school partnerships, volunteering, or community support in rural Cameroon.',
      fr: "Contactez la Fondation TriumphChi pour parrainer un enfant, demander une aide scolaire, coordonner avec une école, faire du bénévolat, créer un partenariat ou soutenir les besoins scolaires au Cameroun rural.",
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
    title: {
      en: 'Request educational support for a child.',
      fr: 'Demander un soutien éducatif pour un enfant.',
    },
    description: {
      en: "Share the child's situation, school context, and the person who can help us verify the request so we can begin review.",
      fr: "Partagez la situation de l'enfant, le contexte scolaire et la personne qui peut aider à vérifier la demande pour lancer l'examen.",
    },
    seoTitle: {
      en: 'Apply for Education Support | TriumphChi Foundation',
      fr: 'Demander un soutien éducatif | Fondation TriumphChi',
    },
    seoDescription: {
      en: 'Use the public education application to request help for a child in rural Cameroon. Share the child, the need, and a responsible contact so the review can begin.',
      fr: "Utilisez la demande publique de soutien éducatif pour signaler un besoin d'aide pour un enfant au Cameroun rural. Partagez l'enfant, le besoin et un contact responsable afin de lancer l'examen.",
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
    title: { en: 'Sponsor a Child', fr: 'Parrainer un enfant' },
    description: {
      en: "Help a child remain in school through education support, mentorship, and community care. Your sponsorship becomes part of a larger commitment to helping children in rural Cameroon continue learning with dignity.",
      fr: "Aider un enfant à rester à l'école grâce au soutien scolaire, au mentorat et au soin communautaire. Votre parrainage rejoint un engagement plus large pour aider les enfants du Cameroun rural à continuer d'apprendre avec dignité.",
    },
    seoTitle: {
      en: 'Sponsor a Child | Education Support in Rural Cameroon',
      fr: 'Parrainer un enfant | Soutien scolaire au Cameroun rural',
    },
    seoDescription: {
      en: 'Sponsor a child through TriumphChi Foundation and help provide school fees, learning materials, exam support, mentorship, and community care in rural Cameroon.',
      fr: "Parrainez un enfant avec la Fondation TriumphChi et aidez à fournir frais scolaires, fournitures, soutien aux examens, mentorat et soin communautaire au Cameroun rural.",
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
  {
    key: 'privacy',
    icon: ShieldCheck,
    navGroup: 'secondary',
    path: { en: '/privacy-policy', fr: '/politique-de-confidentialite' },
    label: { en: 'Privacy Policy', fr: 'Confidentialite' },
    eyebrow: { en: 'Privacy and child protection', fr: 'Confidentialite et protection des enfants' },
    title: { en: 'Privacy Policy', fr: 'Politique de confidentialite' },
    description: {
      en: 'How TriumphChi Foundation collects, uses, protects, and shares personal information connected to visitors, donors, applicants, children, guardians, schools, volunteers, and partners.',
      fr: 'Comment la Fondation TriumphChi collecte, utilise, protege et partage les informations personnelles des visiteurs, donateurs, demandeurs, enfants, tuteurs, ecoles, benevoles et partenaires.',
    },
    seoTitle: {
      en: 'Privacy Policy | TriumphChi Foundation',
      fr: 'Politique de confidentialite | Fondation TriumphChi',
    },
    seoDescription: {
      en: 'Read the TriumphChi Foundation privacy policy, including how we protect child data, donor information, contact messages, applications, attachments, cookies, and privacy rights.',
      fr: 'Lisez la politique de confidentialite de la Fondation TriumphChi concernant la protection des donnees des enfants, donateurs, messages, demandes, pieces jointes, cookies et droits.',
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

