import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  FileText,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Landmark,
  LineChart,
  LockKeyhole,
  School,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/classroom-support.png';

interface LandingPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

const workflowIcons = [FileText, ShieldCheck, LineChart, CheckCircle2, HeartHandshake, HandHeart, GraduationCap];
const programIcons = [School, BookOpen, Landmark, Sparkles];

export function LandingPage({ locale, page }: LandingPageProps) {
  const copy = landingCopy[locale];
  const donatePage = getPageByKey('donate');
  const sponsorPage = getPageByKey('sponsor');
  const impactPage = getPageByKey('impact');

  return (
    <>
      <Seo
        meta={{
          title: page.title[locale],
          description: page.description[locale],
          path: page.path,
          locale,
          image: heroImage,
        }}
        structuredData={buildPublicPageSchema(page, locale)}
      />

      <section className="hero-visual relative isolate overflow-hidden bg-foundation-900 text-white">
        <img
          src={heroImage}
          alt={copy.heroImageAlt}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          width="1800"
          height="1125"
          fetchPriority="high"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,55,47,0.95)_0%,rgba(18,55,47,0.82)_42%,rgba(18,55,47,0.24)_100%)]" />

        <div className="mx-auto flex min-h-[82dvh] max-w-7xl flex-col justify-end px-4 pb-10 pt-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl animate-rise">
            <p className="mb-4 inline-flex min-h-8 items-center rounded-md border border-white/20 bg-white/10 px-3 text-sm font-bold text-foundation-50 backdrop-blur">
              {copy.eyebrow}
            </p>
            <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
              {copy.heading}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-foundation-50 sm:text-xl">{copy.lead}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/${locale}${donatePage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-foundation-900 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
              >
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={`/${locale}${sponsorPage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.18]"
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {copy.heroStats.map((item) => (
              <div key={item.label} className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-2xl font-black">{item.value}</p>
                <p className="mt-1 text-sm leading-5 text-foundation-50">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.workflowEyebrow} title={copy.workflowTitle} body={copy.workflowBody} />
          <div className="grid gap-3">
            {copy.workflow.map((step, index) => {
              const Icon = workflowIcons[index];

              return (
                <article
                  key={step.title}
                  className="grid gap-3 rounded-md border border-ink-100 bg-ink-50 p-4 shadow-sm sm:grid-cols-[3rem_1fr]"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-md bg-foundation-600 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-foundation-600">{String(index + 1).padStart(2, '0')}</p>
                    <h2 className="mt-1 text-lg font-black text-ink-900">{step.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-ink-500">{step.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.programEyebrow} title={copy.programTitle} body={copy.programBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.programs.map((program, index) => {
              const Icon = programIcons[index];

              return (
                <article key={program.title} className="rounded-md border border-foundation-100 bg-white p-5 shadow-sm">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-black text-ink-900">{program.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{program.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-16">
          <div>
            <SectionIntro eyebrow={copy.accountabilityEyebrow} title={copy.accountabilityTitle} body={copy.accountabilityBody} />
            <div className="mt-8 grid gap-3">
              {copy.evidence.map((item) => (
                <div key={item} className="flex min-h-12 items-center gap-3 rounded-md border border-ink-100 bg-ink-50 px-4 text-sm font-bold text-ink-700">
                  <CheckCircle2 className="h-5 w-5 text-foundation-600" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-foundation-100 bg-foundation-900 p-4 text-white shadow-xl">
            <div className="rounded-md bg-white p-4 text-ink-900">
              <div className="flex items-center justify-between gap-4 border-b border-ink-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase text-foundation-600">{copy.reportLabel}</p>
                  <h2 className="mt-1 text-xl font-black">{copy.reportTitle}</h2>
                </div>
                <span className="rounded-md bg-foundation-50 px-3 py-1 text-xs font-black text-foundation-900">
                  {copy.reportStatus}
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {copy.reportRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <span className="text-sm font-semibold text-ink-500">{row.label}</span>
                    <span className="text-sm font-black text-ink-900">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2" aria-hidden="true">
                <div className="loading-line w-11/12" />
                <div className="loading-line w-8/12" />
                <div className="loading-line w-10/12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16">
          <div className="overflow-hidden rounded-md border border-white/10 bg-white/5">
            <img src={heroImage} alt={copy.storyImageAlt} className="h-full min-h-80 w-full object-cover" loading="lazy" />
          </div>
          <div className="self-center">
            <p className="text-sm font-black uppercase text-foundation-100">{copy.storyEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{copy.storyTitle}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink-100">{copy.storyBody}</p>
            <Link
              to={`/${locale}${impactPage.path[locale]}`}
              className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-black text-ink-900 transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
            >
              {copy.storyCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 rounded-md border border-foundation-100 bg-foundation-50 p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-8">
            <div>
              <p className="text-sm font-black uppercase text-foundation-600">{copy.finalEyebrow}</p>
              <h2 className="mt-2 text-3xl font-black text-ink-900">{copy.finalTitle}</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-ink-600">{copy.finalBody}</p>
            </div>
            <Link
              to={`/${locale}${donatePage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white shadow-sm transition duration-200 hover:bg-foundation-900"
            >
              {copy.finalCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionIntro({ eyebrow, title, body, className }: { eyebrow: string; title: string; body: string; className?: string }) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <p className="text-sm font-black uppercase text-foundation-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-ink-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base leading-7 text-ink-500">{body}</p>
    </div>
  );
}

interface LandingCopy {
  eyebrow: string;
  heading: string;
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  heroImageAlt: string;
  heroStats: Array<{ value: string; label: string }>;
  workflowEyebrow: string;
  workflowTitle: string;
  workflowBody: string;
  workflow: Array<{ title: string; body: string }>;
  programEyebrow: string;
  programTitle: string;
  programBody: string;
  programs: Array<{ title: string; body: string }>;
  accountabilityEyebrow: string;
  accountabilityTitle: string;
  accountabilityBody: string;
  evidence: string[];
  reportLabel: string;
  reportTitle: string;
  reportStatus: string;
  reportRows: Array<{ label: string; value: string }>;
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  storyCta: string;
  storyImageAlt: string;
  finalEyebrow: string;
  finalTitle: string;
  finalBody: string;
  finalCta: string;
}

const landingCopy = {
  en: {
    eyebrow: 'Education sponsorship in Cameroon',
    heading: 'TriumphChi Foundation',
    lead: 'A focused public home for orphan education support: clear applications, traceable giving, school payments, and impact updates that protect every child.',
    primaryCta: 'Donate with confidence',
    secondaryCta: 'Sponsor a child',
    heroImageAlt: 'Illustrated classroom table with books, notebooks, a school bag, and a chalkboard.',
    heroStats: [
      { value: '7-step', label: 'beneficiary journey from application to completion' },
      { value: 'EN / FR', label: 'public experience prepared for Cameroon audiences' },
      { value: 'Traceable', label: 'donation, fund, allocation, payment, and impact trail' },
    ],
    workflowEyebrow: 'Beneficiary care path',
    workflowTitle: 'Every application moves through a clear support journey.',
    workflowBody: 'The landing page explains the process donors, schools, field officers, and families will see across the platform.',
    workflow: [
      { title: 'Application', body: 'Families, schools, or field teams submit education support requests.' },
      { title: 'Verification', body: 'Staff confirm identity, school context, and the real education need.' },
      { title: 'Review', body: 'Applications are assessed with privacy, fairness, and documented decisions.' },
      { title: 'Accepted', body: 'Approved children become eligible for verified education support.' },
      { title: 'Sponsored', body: 'Donors or program funds are connected to the right needs.' },
      { title: 'Active Support', body: 'School fees, books, uniforms, and exams can be paid and tracked.' },
      { title: 'Completed', body: 'Graduation or completion outcomes are preserved for reporting.' },
    ],
    programEyebrow: 'Support areas',
    programTitle: 'Give toward practical school needs, not vague promises.',
    programBody: 'The public site should help donors understand exactly what their support can unlock.',
    programs: [
      { title: 'School fees', body: 'Keep children enrolled with payments linked to schools and verified needs.' },
      { title: 'Books and supplies', body: 'Support learning materials that make daily attendance useful.' },
      { title: 'Uniforms and exams', body: 'Cover common barriers that interrupt school progress.' },
      { title: 'Mentorship', body: 'Prepare room for future updates, guidance, and student progress stories.' },
    ],
    accountabilityEyebrow: 'Donor accountability',
    accountabilityTitle: 'A donation should tell a complete story.',
    accountabilityBody: 'Corporate partners, churches, foundations, and individual donors need evidence beyond proof of payment. The system is designed around a full audit chain.',
    evidence: ['Donation receipt and tax certificate readiness', 'Allocation report by need, school, and fund', 'CSR and annual donor statement foundation', 'Impact updates approved for public sharing'],
    reportLabel: 'Sponsor report preview',
    reportTitle: 'Education Support Trail',
    reportStatus: 'Ready',
    reportRows: [
      { label: 'Donation', value: 'Recorded' },
      { label: 'Fund', value: 'Education' },
      { label: 'Allocation', value: 'Verified' },
      { label: 'Payment', value: 'School-linked' },
      { label: 'Impact update', value: 'Reviewed' },
    ],
    storyEyebrow: 'Privacy-first storytelling',
    storyTitle: 'Visual memory matters, but child safety matters more.',
    storyBody: 'The landing page uses hopeful education imagery and aggregate impact language. Personal beneficiary records stay inside authenticated workflows.',
    storyCta: 'View impact structure',
    storyImageAlt: 'Classroom illustration showing books and school materials without identifying a child.',
    finalEyebrow: 'Start with trust',
    finalTitle: 'Help build a transparent education sponsorship path.',
    finalBody: 'Every public interaction should make giving easier, reporting clearer, and child data safer.',
    finalCta: 'Donate now',
  },
  fr: {
    eyebrow: 'Parrainage scolaire au Cameroun',
    heading: 'Fondation TriumphChi',
    lead: "Un accueil public pour le soutien scolaire des orphelins : demandes claires, dons traçables, paiements aux écoles et nouvelles d'impact qui protègent chaque enfant.",
    primaryCta: 'Donner avec confiance',
    secondaryCta: 'Parrainer un enfant',
    heroImageAlt: "Illustration d'une table de classe avec livres, cahiers, sac scolaire et tableau.",
    heroStats: [
      { value: '7 étapes', label: "parcours du bénéficiaire de la demande à l'achèvement" },
      { value: 'EN / FR', label: 'expérience publique prévue pour les publics du Cameroun' },
      { value: 'Traçable', label: 'chaîne don, fonds, allocation, paiement et impact' },
    ],
    workflowEyebrow: 'Parcours du bénéficiaire',
    workflowTitle: 'Chaque demande suit un parcours de soutien clair.',
    workflowBody: 'La page explique le processus visible par les donateurs, écoles, agents de terrain et familles.',
    workflow: [
      { title: 'Demande', body: 'Les familles, écoles ou équipes terrain soumettent les demandes.' },
      { title: 'Vérification', body: "L'équipe confirme l'identité, le contexte scolaire et le besoin réel." },
      { title: 'Étude', body: 'Les demandes sont évaluées avec confidentialité, équité et décisions documentées.' },
      { title: 'Acceptée', body: 'Les enfants approuvés deviennent éligibles au soutien scolaire.' },
      { title: 'Parrainée', body: 'Les donateurs ou fonds de programme sont liés aux bons besoins.' },
      { title: 'Soutien actif', body: 'Frais, livres, uniformes et examens peuvent être payés et suivis.' },
      { title: 'Terminée', body: 'Les résultats de réussite ou fin de parcours sont conservés pour les rapports.' },
    ],
    programEyebrow: 'Domaines de soutien',
    programTitle: 'Donner pour des besoins scolaires concrets.',
    programBody: 'Le site public aide les donateurs à comprendre précisément ce que leur soutien peut rendre possible.',
    programs: [
      { title: 'Frais scolaires', body: "Maintenir les enfants inscrits avec des paiements liés aux écoles et besoins vérifiés." },
      { title: 'Livres et fournitures', body: "Soutenir le matériel qui rend la présence à l'école utile." },
      { title: 'Uniformes et examens', body: 'Couvrir les obstacles fréquents qui interrompent le progrès scolaire.' },
      { title: 'Mentorat', body: 'Préparer les futures nouvelles, conseils et récits de progrès.' },
    ],
    accountabilityEyebrow: 'Responsabilité donateur',
    accountabilityTitle: 'Un don doit raconter une histoire complète.',
    accountabilityBody: "Les entreprises, églises, fondations et donateurs individuels ont besoin de preuves au-delà du paiement. Le système suit une chaîne d'audit complète.",
    evidence: ['Reçu de don et certificat fiscal prêts', 'Rapport d’allocation par besoin, école et fonds', 'Base pour rapports RSE et relevés annuels', 'Nouvelles d’impact validées pour publication'],
    reportLabel: 'Aperçu du rapport',
    reportTitle: 'Chaîne du soutien scolaire',
    reportStatus: 'Prêt',
    reportRows: [
      { label: 'Don', value: 'Enregistré' },
      { label: 'Fonds', value: 'Éducation' },
      { label: 'Allocation', value: 'Vérifiée' },
      { label: 'Paiement', value: 'Lié à l’école' },
      { label: 'Impact', value: 'Revu' },
    ],
    storyEyebrow: 'Récits avec confidentialité',
    storyTitle: "La mémoire visuelle compte, la sécurité de l'enfant aussi.",
    storyBody: "La page utilise une imagerie éducative positive et des données d'impact agrégées. Les dossiers personnels restent dans les espaces authentifiés.",
    storyCta: "Voir la structure d'impact",
    storyImageAlt: "Illustration de classe avec livres et matériel scolaire sans identifier un enfant.",
    finalEyebrow: 'Commencer par la confiance',
    finalTitle: 'Construire un parrainage scolaire transparent.',
    finalBody: 'Chaque interaction publique doit rendre le don plus simple, le rapport plus clair et les données des enfants plus sûres.',
    finalCta: 'Donner maintenant',
  },
} satisfies Record<Locale, LandingCopy>;
