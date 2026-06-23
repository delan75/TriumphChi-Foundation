import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Cookie,
  Database,
  FileLock2,
  HeartHandshake,
  Mail,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { Seo } from '../../../components/seo/Seo';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { Locale } from '../../../lib/i18n';
import { publicContact } from '../../../lib/publicContact';
import heroImage from '../../../assets/landing/rural-home-cameroon.jpg';
import careImage from '../../../assets/landing/education_aid_project.jpg';

interface PrivacyPolicyPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

interface PolicySection {
  id: string;
  icon: LucideIcon;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  bullets?: Record<Locale, string[]>;
}

const updatedAt: Record<Locale, string> = {
  en: 'Last updated: 23 June 2026',
  fr: 'Derniere mise a jour : 23 juin 2026',
};

const policySections: PolicySection[] = [
  {
    id: 'applies-to',
    icon: BookOpenCheck,
    title: { en: 'Who this policy is for', fr: 'A qui cette politique s applique' },
    body: {
      en: 'This policy applies to people who visit our website, contact us, apply for educational assistance, donate, volunteer, partner with us, or receive support through our work.',
      fr: 'Cette politique concerne les personnes qui visitent notre site, nous contactent, demandent une aide scolaire, donnent, font du benevolat, collaborent avec nous ou recoivent un soutien.',
    },
    bullets: {
      en: ['Visitors and donors', 'Children, parents, guardians, and caregivers', 'Schools, churches, volunteers, community leaders, and partners'],
      fr: ['Visiteurs et donateurs', 'Enfants, parents, tuteurs et responsables', 'Ecoles, eglises, benevoles, responsables communautaires et partenaires'],
    },
  },
  {
    id: 'information',
    icon: Database,
    title: { en: 'Information we may collect', fr: 'Informations que nous pouvons collecter' },
    body: {
      en: 'We collect only what is reasonably needed to respond, review a request, support a child safely, process a gift, keep records, or communicate with people involved in the work.',
      fr: 'Nous collectons uniquement ce qui est raisonnablement necessaire pour repondre, examiner une demande, soutenir un enfant en securite, traiter un don, garder des traces ou communiquer.',
    },
    bullets: {
      en: [
        'Contact details such as name, email address, phone number, and message content',
        'Education support details such as school, region, village, need, guardian contact, and verification context',
        'Donation and giving records, including references, amounts, dates, and channels used',
        'Uploaded documents or images sent to support a request or conversation',
        'Website and device information needed for security, analytics, and basic website operation',
      ],
      fr: [
        'Coordonnees comme le nom, l adresse email, le numero de telephone et le contenu du message',
        'Details de soutien scolaire comme l ecole, la region, le village, le besoin, le contact du tuteur et le contexte de verification',
        'Informations liees aux dons, comme les references, montants, dates et canaux utilises',
        'Documents ou images envoyes pour appuyer une demande ou une conversation',
        'Informations du site et de l appareil utiles pour la securite, les statistiques et le fonctionnement du site',
      ],
    },
  },
  {
    id: 'children',
    icon: UsersRound,
    title: { en: 'Children and sensitive information', fr: 'Enfants et informations sensibles' },
    body: {
      en: 'Because our work involves orphaned and vulnerable children, child privacy is treated with extra care. Public stories should protect dignity, avoid unnecessary personal details, and use reviewed information.',
      fr: 'Comme notre travail concerne des orphelins et enfants vulnerables, la vie privee des enfants est protegee avec une attention particuliere. Les recits publics doivent proteger la dignite et eviter les details inutiles.',
    },
    bullets: {
      en: [
        'Personal child records are kept inside protected workflows',
        'Public impact language should use approved, respectful, and limited information',
        'Images, school details, family hardship, and case notes are handled carefully',
        'We may verify information with a guardian, school, church, community leader, or responsible adult',
      ],
      fr: [
        'Les dossiers personnels des enfants restent dans des espaces proteges',
        'Les informations publiques doivent etre approuvees, respectueuses et limitees',
        'Les images, details scolaires, difficultes familiales et notes de dossier sont traites avec soin',
        'Nous pouvons verifier les informations avec un tuteur, une ecole, une eglise, un responsable communautaire ou un adulte responsable',
      ],
    },
  },
  {
    id: 'use',
    icon: HeartHandshake,
    title: { en: 'How we use information', fr: 'Comment nous utilisons les informations' },
    body: {
      en: 'We use information to serve the purpose for which it was shared and to protect the integrity of the foundation work.',
      fr: 'Nous utilisons les informations pour le but pour lequel elles ont ete partagees et pour proteger l integrite du travail de la fondation.',
    },
    bullets: {
      en: [
        'Respond to messages, assistance requests, volunteer interest, and partnership inquiries',
        'Review and verify education support applications',
        'Coordinate school fees, learning materials, examination support, mentorship, and follow-up',
        'Prepare receipts, donor updates, accountability records, and lawful reports',
        'Keep the website, forms, uploads, and authenticated areas secure',
      ],
      fr: [
        'Repondre aux messages, demandes d aide, propositions de benevolat et partenariats',
        'Examiner et verifier les demandes de soutien scolaire',
        'Coordonner les frais scolaires, fournitures, examens, mentorat et suivi',
        'Preparer les recus, nouvelles aux donateurs, traces de redevabilite et rapports requis',
        'Maintenir la securite du site, des formulaires, des fichiers et des espaces authentifies',
      ],
    },
  },
  {
    id: 'sharing',
    icon: UserCheck,
    title: { en: 'When information may be shared', fr: 'Quand les informations peuvent etre partagees' },
    body: {
      en: 'We do not sell personal information. We only share information when it helps us carry out the work responsibly, protect someone, comply with law, or use trusted service providers.',
      fr: 'Nous ne vendons pas les informations personnelles. Nous les partageons seulement lorsque cela aide le travail, protege une personne, respecte la loi ou permet d utiliser des prestataires de confiance.',
    },
    bullets: {
      en: [
        'Schools, guardians, churches, community leaders, or partners involved in verification and support',
        'Payment, hosting, email, storage, analytics, and security providers',
        'Professional advisers, auditors, regulators, or authorities where required',
        'Internal team members who need access to perform their responsibilities',
      ],
      fr: [
        'Ecoles, tuteurs, eglises, responsables communautaires ou partenaires impliques dans la verification et le soutien',
        'Prestataires de paiement, hebergement, email, stockage, statistiques et securite',
        'Conseillers professionnels, auditeurs, regulateurs ou autorites lorsque requis',
        'Membres internes qui ont besoin d acces pour remplir leurs responsabilites',
      ],
    },
  },
  {
    id: 'security',
    icon: FileLock2,
    title: { en: 'How we protect information', fr: 'Comment nous protegeons les informations' },
    body: {
      en: 'We use practical safeguards so information is not casually exposed. Access is limited, sensitive records stay protected, and uploaded files are stored away from public website access.',
      fr: 'Nous utilisons des mesures pratiques pour eviter l exposition inutile des informations. L acces est limite, les dossiers sensibles sont proteges et les fichiers envoyes ne sont pas publics.',
    },
    bullets: {
      en: [
        'Permission-based access for authenticated staff workflows',
        'Private storage for uploaded documents and supporting files',
        'Audit trails and records for sensitive operational actions',
        'Review before public stories, images, or child-related updates are shared',
      ],
      fr: [
        'Acces base sur les permissions pour les espaces internes authentifies',
        'Stockage prive pour les documents et fichiers envoyes',
        'Traces d audit pour les actions sensibles',
        'Verification avant la publication d histoires, images ou nouvelles liees aux enfants',
      ],
    },
  },
  {
    id: 'retention',
    icon: ShieldCheck,
    title: { en: 'How long information is kept', fr: 'Duree de conservation' },
    body: {
      en: 'We keep information only for as long as it is needed for the reason it was collected, for safeguarding, accountability, legal, financial, audit, or reporting needs.',
      fr: 'Nous gardons les informations seulement le temps necessaire pour le but de collecte, la protection, la redevabilite, les obligations legales, financieres, d audit ou de rapport.',
    },
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: { en: 'Cookies and website information', fr: 'Cookies et informations du site' },
    body: {
      en: 'Our website may use cookies or similar technologies to remember preferences, support security, understand basic website use, and improve the visitor experience.',
      fr: 'Notre site peut utiliser des cookies ou technologies similaires pour retenir des preferences, soutenir la securite, comprendre l usage du site et ameliorer l experience.',
    },
  },
  {
    id: 'rights',
    icon: Mail,
    title: { en: 'Your choices and rights', fr: 'Vos choix et droits' },
    body: {
      en: 'You may contact us to ask about the information we hold, request a correction, withdraw consent where consent applies, object to certain uses, or ask that information be deleted where appropriate.',
      fr: 'Vous pouvez nous contacter pour demander quelles informations nous avons, demander une correction, retirer un consentement lorsque cela s applique, vous opposer a certains usages ou demander une suppression lorsque possible.',
    },
    bullets: {
      en: [
        'We may need to confirm your identity before acting on a request',
        'Some records may need to be kept for safeguarding, audit, legal, or financial reasons',
        'You can opt out of general updates, but we may still send important service or donation-related messages',
      ],
      fr: [
        'Nous pouvons devoir confirmer votre identite avant de traiter une demande',
        'Certains dossiers peuvent etre conserves pour la protection, l audit, la loi ou les finances',
        'Vous pouvez refuser les nouvelles generales, mais certains messages importants peuvent rester necessaires',
      ],
    },
  },
  {
    id: 'changes',
    icon: ShieldCheck,
    title: { en: 'Changes to this policy', fr: 'Modifications de cette politique' },
    body: {
      en: 'We may update this policy as the foundation grows, as services change, or as privacy requirements develop. The latest version will be shown on this page.',
      fr: 'Nous pouvons mettre a jour cette politique lorsque la fondation grandit, lorsque les services changent ou lorsque les exigences de confidentialite evoluent. La derniere version sera affichee ici.',
    },
  },
];

export function PrivacyPolicyPage({ locale, page }: PrivacyPolicyPageProps) {
  const homePage = getPageByKey('home');
  const contactPage = getPageByKey('contact');
  const applyPage = getPageByKey('apply');
  const copy = privacyCopy[locale];

  return (
    <>
      <Seo
        meta={{
          title: page.seoTitle?.[locale] ?? page.title[locale],
          description: page.seoDescription?.[locale] ?? page.description[locale],
          path: page.path,
          locale,
          image: heroImage,
        }}
        structuredData={buildPublicPageSchema(page, locale)}
      />

      <PublicPageTitle
        locale={locale}
        title={page.title[locale]}
        description={page.description[locale]}
        backgroundImage={heroImage}
        backgroundAlt={
          locale === 'fr'
            ? 'Une maison rurale au Cameroun entouree de verdure.'
            : 'A rural home in Cameroon surrounded by green landscape.'
        }
        breadcrumbs={[
          { label: homePage.label[locale], to: `/${locale}${homePage.path[locale]}` },
          { label: page.label[locale] },
        ]}
        actions={
          <Link
            to={`/${locale}${contactPage.path[locale]}`}
            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-black text-foundation-900 transition hover:bg-foundation-50"
          >
            {copy.contactAction}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <main className="bg-ink-50">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8 lg:py-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-foundation-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase text-foundation-700">{updatedAt[locale]}</p>
              <h2 className="mt-3 text-xl font-black text-ink-900">{copy.tocTitle}</h2>
              <nav className="mt-5 grid gap-1" aria-label={copy.tocTitle}>
                {policySections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="focus-ring rounded-md px-3 py-2 text-sm font-bold text-ink-600 transition hover:bg-foundation-50 hover:text-foundation-900"
                  >
                    {section.title[locale]}
                  </a>
                ))}
              </nav>
            </div>

            <div className="relative mt-5 overflow-hidden rounded-md border border-foundation-800 bg-foundation-950 p-5 text-white shadow-sm">
              <img src={careImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 saturate-75" loading="lazy" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,55,47,0.98),rgba(18,55,47,0.76))]" aria-hidden="true" />
              <div className="relative">
                <ShieldCheck className="h-7 w-7 text-foundation-100" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-black">{copy.sideTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-foundation-50">{copy.sideBody}</p>
                <a
                  href={publicContact.emailHref}
                  className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-black text-foundation-900 transition hover:bg-foundation-50"
                >
                  {publicContact.email}
                </a>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <section className="rounded-md border border-foundation-100 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-black uppercase text-foundation-700">{copy.summaryEyebrow}</p>
              <h2 className="mt-3 text-2xl font-black text-ink-900 sm:text-3xl">{copy.summaryTitle}</h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-ink-600">{copy.summaryBody}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {copy.summaryCards.map((card) => (
                  <article key={card.title} className="rounded-md border border-ink-100 bg-ink-50 p-4">
                    <p className="text-sm font-black text-ink-900">{card.title}</p>
                    <p className="mt-2 text-sm leading-6 text-ink-600">{card.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <div className="mt-6 grid gap-5">
              {policySections.map((section) => {
                const Icon = section.icon;

                return (
                  <section key={section.id} id={section.id} className="scroll-mt-24 rounded-md border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-foundation-50 text-foundation-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-xl font-black text-ink-900">{section.title[locale]}</h2>
                        <p className="mt-3 text-base leading-7 text-ink-600">{section.body[locale]}</p>
                        {section.bullets ? (
                          <ul className="mt-4 grid gap-2 text-sm leading-6 text-ink-700">
                            {section.bullets[locale].map((item) => (
                              <li key={item} className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foundation-600" aria-hidden="true" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            <section className="mt-6 rounded-md bg-foundation-900 p-5 text-white shadow-sm sm:p-6">
              <p className="text-sm font-black uppercase text-foundation-100">{copy.closingEyebrow}</p>
              <h2 className="mt-3 text-2xl font-black">{copy.closingTitle}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-foundation-50">{copy.closingBody}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/${locale}${contactPage.path[locale]}`}
                  className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-black text-foundation-900 transition hover:bg-foundation-50"
                >
                  {copy.contactAction}
                </Link>
                <Link
                  to={`/${locale}${applyPage.path[locale]}`}
                  className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/25 px-5 text-sm font-black text-white transition hover:bg-white/10"
                >
                  {copy.applyAction}
                </Link>
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}

const privacyCopy: Record<
  Locale,
  {
    tocTitle: string;
    sideTitle: string;
    sideBody: string;
    summaryEyebrow: string;
    summaryTitle: string;
    summaryBody: string;
    summaryCards: Array<{ title: string; body: string }>;
    closingEyebrow: string;
    closingTitle: string;
    closingBody: string;
    contactAction: string;
    applyAction: string;
  }
> = {
  en: {
    tocTitle: 'On this page',
    sideTitle: 'Privacy is part of child protection.',
    sideBody: 'If you have a concern about information shared with us, please contact the foundation so we can respond carefully.',
    summaryEyebrow: 'Plain language summary',
    summaryTitle: 'We collect information to care, respond, verify, and account responsibly.',
    summaryBody:
      'TriumphChi Foundation supports children through relationships with families, schools, churches, donors, volunteers, and partners. That work requires trust. This policy explains what we collect, why we collect it, and how we protect it.',
    summaryCards: [
      {
        title: 'Child dignity comes first',
        body: 'Sensitive child records are protected and public stories should be reviewed, respectful, and limited.',
      },
      {
        title: 'We collect with purpose',
        body: 'Information is gathered to respond, verify, support, communicate, report, and protect the work.',
      },
      {
        title: 'We do not sell personal information',
        body: 'Information is shared only when needed for support, accountability, service providers, safety, or legal reasons.',
      },
    ],
    closingEyebrow: 'Questions or concerns',
    closingTitle: 'We welcome privacy questions.',
    closingBody:
      'If you want to ask about your information, correct something, withdraw consent where applicable, or raise a concern, please contact us. We may need enough information to confirm who you are before making changes.',
    contactAction: 'Contact us',
    applyAction: 'Request assistance',
  },
  fr: {
    tocTitle: 'Sur cette page',
    sideTitle: 'La confidentialite fait partie de la protection des enfants.',
    sideBody: 'Si vous avez une inquietude concernant des informations partagees avec nous, contactez la fondation afin que nous puissions repondre avec soin.',
    summaryEyebrow: 'Resume simple',
    summaryTitle: 'Nous collectons des informations pour aider, repondre, verifier et rendre compte avec responsabilite.',
    summaryBody:
      'La Fondation TriumphChi soutient les enfants avec les familles, ecoles, eglises, donateurs, benevoles et partenaires. Ce travail demande de la confiance. Cette politique explique ce que nous collectons, pourquoi et comment nous le protegeons.',
    summaryCards: [
      {
        title: 'La dignite de l enfant passe d abord',
        body: 'Les dossiers sensibles des enfants sont proteges et les recits publics doivent etre verifies, respectueux et limites.',
      },
      {
        title: 'Nous collectons avec un but',
        body: 'Les informations servent a repondre, verifier, soutenir, communiquer, rendre compte et proteger le travail.',
      },
      {
        title: 'Nous ne vendons pas les informations personnelles',
        body: 'Les informations sont partagees seulement si necessaire pour le soutien, la redevabilite, les prestataires, la securite ou la loi.',
      },
    ],
    closingEyebrow: 'Questions ou inquietudes',
    closingTitle: 'Vous pouvez nous poser vos questions.',
    closingBody:
      'Si vous voulez demander quelles informations nous avons, corriger quelque chose, retirer un consentement lorsque possible ou signaler une inquietude, contactez-nous. Nous pouvons devoir confirmer votre identite avant de faire des changements.',
    contactAction: 'Nous contacter',
    applyAction: 'Demander une aide',
  },
};
