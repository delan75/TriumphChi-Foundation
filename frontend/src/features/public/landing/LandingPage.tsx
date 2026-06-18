import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Landmark,
  LineChart,
  School,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PaymentMethods } from '../../../components/public/PaymentMethods';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/classroom-support.png';

interface LandingPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

const workflowIcons = [HandHeart, ShieldCheck, Landmark, CheckCircle2, LineChart, FileText, GraduationCap];
const programIcons = [School, BookOpen, Landmark, Sparkles];
const highPriorityImageProps = { fetchpriority: 'high' } as Record<string, string>;

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
          {...highPriorityImageProps}
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

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:pb-16">
          <SectionIntro eyebrow={copy.paymentEyebrow} title={copy.paymentTitle} body={copy.paymentBody} />
          <PaymentMethods locale={locale} />
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
  paymentEyebrow: string;
  paymentTitle: string;
  paymentBody: string;
}

const landingCopy = {
  en: {
    eyebrow: 'Orphan education support in Cameroon',
    heading: 'Help an orphan stay in school.',
    lead: 'Across rural Cameroon, a child can miss class because of school fees, books, uniforms, exam charges, transport, or a family crisis. Your gift helps turn a real education need into verified support, paid responsibly and reported with care.',
    primaryCta: 'Donate to education',
    secondaryCta: 'Sponsor a child',
    heroImageAlt: 'Illustrated classroom table with books, notebooks, a school bag, and a chalkboard.',
    heroStats: [
      { value: 'Fees', label: 'help keep a child enrolled when school bills become a barrier' },
      { value: 'Books', label: 'support supplies, uniforms, exams, and daily learning needs' },
      { value: 'Care', label: 'share impact responsibly without exposing private child records' },
    ],
    workflowEyebrow: 'How support reaches a child',
    workflowTitle: 'Giving should be compassionate, careful, and traceable.',
    workflowBody: 'A donation is more than a payment. It is a promise that a child will be seen, the need will be checked, and the support will reach the right place.',
    workflow: [
      { title: 'A need is shared', body: 'Families, schools, or field teams identify a child at risk of losing access to education.' },
      { title: 'The situation is verified', body: 'Staff review the school context, family situation, and immediate education need.' },
      { title: 'Support is matched', body: 'Donations are connected to school fees, books, uniforms, exams, or wider education funds.' },
      { title: 'Schools are paid responsibly', body: 'Where possible, support moves through documented school-linked payments instead of informal promises.' },
      { title: 'Progress is followed', body: 'Attendance, promotion, completion, and urgent changes can be captured over time.' },
      { title: 'Stories are protected', body: 'Public updates use consented, reviewed, and aggregate information to keep children safe.' },
      { title: 'Impact is remembered', body: 'Donors can receive evidence of what was supported and why it mattered.' },
    ],
    programEyebrow: 'What giving can cover',
    programTitle: 'Small school needs can decide whether a child continues learning.',
    programBody: 'For many vulnerable children, education is interrupted by ordinary costs that arrive all at once. Giving should meet those needs clearly.',
    programs: [
      { title: 'School fees', body: 'Help a child remain enrolled when unpaid fees threaten attendance or exam access.' },
      { title: 'Books and supplies', body: 'Provide notebooks, textbooks, pens, bags, and other basics needed for daily learning.' },
      { title: 'Uniforms and exams', body: 'Remove common barriers that can isolate a child or stop progress at the end of term.' },
      { title: 'Mentorship and care', body: 'Support follow-up, encouragement, and progress updates that help a child keep going.' },
    ],
    accountabilityEyebrow: 'Donor accountability',
    accountabilityTitle: 'A donation should tell a complete story.',
    accountabilityBody: 'Companies, churches, foundations, families, and individual donors often need more than a receipt. They need to understand what happened after giving.',
    evidence: ['Donation receipts and tax certificate readiness', 'Allocation reports by need, school, and fund', 'CSR and annual donor statement foundation', 'Impact updates approved for public sharing'],
    reportLabel: 'Giving evidence preview',
    reportTitle: 'From donation to classroom',
    reportStatus: 'Clear',
    reportRows: [
      { label: 'Gift received', value: 'Recorded' },
      { label: 'Need supported', value: 'Verified' },
      { label: 'School payment', value: 'Linked' },
      { label: 'Child privacy', value: 'Protected' },
      { label: 'Impact update', value: 'Reviewed' },
    ],
    storyEyebrow: 'Privacy-first storytelling',
    storyTitle: 'Tell the story of hope without exposing the child.',
    storyBody: 'Photos, names, locations, and family details can put children at risk when handled carelessly. Public storytelling should use hopeful education imagery, approved updates, and aggregate impact language while personal records stay private.',
    storyCta: 'View impact structure',
    storyImageAlt: 'Classroom illustration showing books and school materials without identifying a child.',
    finalEyebrow: 'Start with trust',
    finalTitle: 'Give toward a school need today.',
    finalBody: 'Your support can help pay a fee, buy a book, prepare for an exam, or keep a child connected to school when life becomes fragile.',
    finalCta: 'Donate now',
    paymentEyebrow: 'Ways to give',
    paymentTitle: 'Simple payment options for local and international donors.',
    paymentBody: 'Donors should be able to give through familiar channels, with receipts and follow-up reporting prepared around the donation record.',
  },
  fr: {
    eyebrow: 'Soutien scolaire aux orphelins au Cameroun',
    heading: 'Aider un orphelin à rester à l’école.',
    lead: "Dans les zones rurales du Cameroun, un enfant peut manquer l'école à cause des frais scolaires, des livres, de l'uniforme, des frais d'examen, du transport ou d'une crise familiale. Votre don transforme un besoin réel en soutien vérifié, payé avec responsabilité et expliqué avec soin.",
    primaryCta: 'Donner pour l’éducation',
    secondaryCta: 'Parrainer un enfant',
    heroImageAlt: "Illustration d'une table de classe avec livres, cahiers, sac scolaire et tableau.",
    heroStats: [
      { value: 'Frais', label: "aider un enfant à rester inscrit quand les factures deviennent un obstacle" },
      { value: 'Livres', label: "soutenir les fournitures, uniformes, examens et besoins d'apprentissage" },
      { value: 'Protection', label: "partager l'impact sans exposer les dossiers privés des enfants" },
    ],
    workflowEyebrow: "Comment l'aide arrive à l'enfant",
    workflowTitle: 'Donner doit rester humain, prudent et traçable.',
    workflowBody: "Un don n'est pas seulement un paiement. C'est une promesse qu'un enfant sera vu, que le besoin sera vérifié et que le soutien arrivera au bon endroit.",
    workflow: [
      { title: 'Un besoin est signalé', body: "Les familles, écoles ou équipes de terrain identifient un enfant qui risque de perdre l'accès à l'éducation." },
      { title: 'La situation est vérifiée', body: "L'équipe examine le contexte scolaire, la situation familiale et le besoin éducatif immédiat." },
      { title: 'Le soutien est orienté', body: "Les dons sont liés aux frais scolaires, livres, uniformes, examens ou fonds d'éducation." },
      { title: 'Les écoles sont payées avec soin', body: 'Quand cela est possible, le soutien passe par des paiements documentés liés aux écoles.' },
      { title: 'Le progrès est suivi', body: "La présence, la promotion, la fin de parcours et les urgences peuvent être suivies dans le temps." },
      { title: 'Les histoires sont protégées', body: "Les nouvelles publiques utilisent des informations consenties, relues et agrégées pour protéger les enfants." },
      { title: "L'impact est conservé", body: 'Les donateurs peuvent recevoir des preuves de ce qui a été soutenu et de son importance.' },
    ],
    programEyebrow: 'Ce que le don peut couvrir',
    programTitle: "De petits besoins scolaires peuvent décider si un enfant continue d'apprendre.",
    programBody: "Pour beaucoup d'enfants vulnérables, l'école est interrompue par des coûts ordinaires qui arrivent au même moment. Le don doit répondre clairement à ces besoins.",
    programs: [
      { title: 'Frais scolaires', body: "Aider un enfant à rester inscrit quand les frais impayés menacent la présence ou l'accès aux examens." },
      { title: 'Livres et fournitures', body: "Fournir cahiers, manuels, stylos, sacs et autres bases nécessaires à l'apprentissage quotidien." },
      { title: 'Uniformes et examens', body: "Lever des obstacles fréquents qui peuvent isoler l'enfant ou bloquer sa progression en fin de trimestre." },
      { title: 'Mentorat et suivi', body: "Soutenir l'encouragement, l'accompagnement et les nouvelles de progrès qui aident l'enfant à continuer." },
    ],
    accountabilityEyebrow: 'Responsabilité envers les donateurs',
    accountabilityTitle: 'Un don doit raconter une histoire complète.',
    accountabilityBody: "Les entreprises, églises, fondations, familles et donateurs individuels ont souvent besoin de plus qu'un reçu. Ils doivent comprendre ce qui s'est passé après le don.",
    evidence: ['Reçus de don et certificats fiscaux prêts', "Rapports d'allocation par besoin, école et fonds", 'Base pour rapports RSE et relevés annuels', "Nouvelles d'impact validées pour publication"],
    reportLabel: 'Aperçu des preuves',
    reportTitle: 'Du don à la salle de classe',
    reportStatus: 'Clair',
    reportRows: [
      { label: 'Don reçu', value: 'Enregistré' },
      { label: 'Besoin soutenu', value: 'Vérifié' },
      { label: 'Paiement école', value: 'Lié' },
      { label: "Vie privée de l'enfant", value: 'Protégée' },
      { label: 'Nouvelle impact', value: 'Relue' },
    ],
    storyEyebrow: 'Récits avec confidentialité',
    storyTitle: "Raconter l'espérance sans exposer l'enfant.",
    storyBody: "Les photos, noms, lieux et détails familiaux peuvent mettre les enfants en danger quand ils sont mal gérés. Les récits publics doivent utiliser une imagerie éducative positive, des nouvelles approuvées et des données d'impact agrégées, tandis que les dossiers personnels restent privés.",
    storyCta: "Voir la structure d'impact",
    storyImageAlt: 'Illustration de classe avec livres et matériel scolaire sans identifier un enfant.',
    finalEyebrow: 'Commencer par la confiance',
    finalTitle: "Donner aujourd'hui pour un besoin scolaire.",
    finalBody: "Votre soutien peut aider à payer des frais, acheter un livre, préparer un examen ou garder un enfant connecté à l'école quand la vie devient fragile.",
    finalCta: 'Donner maintenant',
    paymentEyebrow: 'Façons de donner',
    paymentTitle: 'Des moyens de paiement simples pour les donateurs locaux et internationaux.',
    paymentBody: 'Les donateurs doivent pouvoir donner par des canaux familiers, avec des reçus et un suivi préparés autour du dossier de don.',
  },
} satisfies Record<Locale, LandingCopy>;
