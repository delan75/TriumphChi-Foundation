import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  School,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { GivingChannels } from '../../../components/public/GivingChannels';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/classroom-support.png';

interface LandingPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

const needIcons = [School, BookOpen, GraduationCap, HandHeart];
const activityIcons = [HeartHandshake, ShieldCheck, FileText, Sparkles];
const assistanceIcons = [HandHeart, School, ShieldCheck];
const highPriorityImageProps = { fetchpriority: 'high' } as Record<string, string>;

export function LandingPage({ locale, page }: LandingPageProps) {
  const copy = landingCopy[locale];
  const donatePage = getPageByKey('donate');
  const applyPage = getPageByKey('apply');
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
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,55,47,0.96)_0%,rgba(18,55,47,0.82)_44%,rgba(18,55,47,0.26)_100%)]" />

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
                to={`/${locale}${applyPage.path[locale]}`}
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
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.needsEyebrow} title={copy.needsTitle} body={copy.needsBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.needs.map((need, index) => {
              const Icon = needIcons[index];

              return (
                <article key={need.title} className="rounded-md border border-ink-100 bg-ink-50 p-5 shadow-sm">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-black text-ink-900">{need.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{need.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.assistanceEyebrow} title={copy.assistanceTitle} body={copy.assistanceBody} />
          <div className="grid gap-3">
            {copy.assistance.map((item, index) => {
              const Icon = assistanceIcons[index];

              return (
                <article key={item.title} className="grid gap-3 rounded-md border border-foundation-100 bg-white p-4 shadow-sm sm:grid-cols-[3rem_1fr]">
                  <div className="grid h-12 w-12 place-items-center rounded-md bg-foundation-600 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-ink-900">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-ink-500">{item.body}</p>
                  </div>
                </article>
              );
            })}
            <Link
              to={`/${locale}${applyPage.path[locale]}`}
              className="focus-ring mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white shadow-sm transition duration-200 hover:bg-foundation-900 sm:justify-self-start"
            >
              {copy.assistanceCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.activitiesEyebrow} title={copy.activitiesTitle} body={copy.activitiesBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.activities.map((activity, index) => {
              const Icon = activityIcons[index];

              return (
                <article key={activity.title} className="rounded-md border border-foundation-100 bg-white p-5 shadow-sm">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-black text-ink-900">{activity.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{activity.body}</p>
                </article>
              );
            })}
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
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-foundation-600">{copy.finalEyebrow}</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black text-ink-900 sm:text-4xl">{copy.finalTitle}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-600">{copy.finalBody}</p>
          </div>
          <div className="grid gap-5">
            <Link
              to={`/${locale}${donatePage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white shadow-sm transition duration-200 hover:bg-foundation-900"
            >
              {copy.finalCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <GivingChannels locale={locale} />
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
  needsEyebrow: string;
  needsTitle: string;
  needsBody: string;
  needs: Array<{ title: string; body: string }>;
  assistanceEyebrow: string;
  assistanceTitle: string;
  assistanceBody: string;
  assistance: Array<{ title: string; body: string }>;
  assistanceCta: string;
  activitiesEyebrow: string;
  activitiesTitle: string;
  activitiesBody: string;
  activities: Array<{ title: string; body: string }>;
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
    eyebrow: 'TriumphChi Foundation',
    heading: 'Giving from a covenant, not from leftovers.',
    lead: 'We stand with orphans and vulnerable children in rural Cameroon whose schooling is threatened by fees, books, uniforms, exam costs, distance, and family hardship.',
    primaryCta: 'Give with purpose',
    secondaryCta: 'Apply for assistance',
    heroImageAlt: 'Illustrated classroom table with books, notebooks, a school bag, and a chalkboard.',
    heroStats: [
      { value: 'School fees', label: 'help keep children enrolled when families cannot carry the cost alone' },
      { value: 'Supplies', label: 'books, uniforms, bags, pens, and practical classroom needs' },
      { value: 'Dignity', label: 'support that protects children while honoring their stories' },
    ],
    needsEyebrow: 'The need around us',
    needsTitle: 'In rural communities, education can be lost through ordinary costs.',
    needsBody: 'Many children want to learn but face barriers that quietly push them out of school. The work begins by seeing those needs clearly.',
    needs: [
      { title: 'Unpaid fees', body: 'A child may be sent home, miss exams, or lose a place in class when fees remain unpaid.' },
      { title: 'No learning materials', body: 'Books, notebooks, pens, and bags can decide whether attending school is useful or frustrating.' },
      { title: 'Uniforms and exams', body: 'Uniforms, registration, and exam charges often arrive at the hardest moment for a family.' },
      { title: 'Distance and hardship', body: 'Rural children may also face transport difficulty, food insecurity, grief, or unstable care at home.' },
    ],
    assistanceEyebrow: 'Children can reach out',
    assistanceTitle: 'A child, guardian, school, or community leader can ask for help.',
    assistanceBody: 'The assistance path is for real education needs. It should be clear, respectful, and safe for children who need support.',
    assistance: [
      { title: 'A child needs school support', body: 'The request may involve school fees, books, uniforms, exam fees, or a situation affecting attendance.' },
      { title: 'A trusted adult can speak for them', body: 'Guardians, relatives, teachers, pastors, and community leaders can help explain the need.' },
      { title: 'The child is treated with dignity', body: 'Assistance requests should never turn a child into a public display of poverty.' },
    ],
    assistanceCta: 'Start an assistance request',
    activitiesEyebrow: 'What the foundation does',
    activitiesTitle: 'We support education through care, presence, and practical help.',
    activitiesBody: 'The work is not only receiving gifts. It is finding children, listening to families, working with schools, and staying close enough to know what changed.',
    activities: [
      { title: 'School support', body: 'Helping with fees, materials, uniforms, exams, and other education barriers.' },
      { title: 'Community visits', body: 'Learning from families, schools, churches, and local leaders before assistance is shared publicly.' },
      { title: 'Application care', body: 'Receiving requests for help and guiding children or guardians through the next step.' },
      { title: 'Progress stories', body: 'Sharing updates about classes, attendance, promotion, graduation, and encouragement with care.' },
    ],
    storyEyebrow: 'Stories with dignity',
    storyTitle: 'Hope can be shown without exposing a child.',
    storyBody: 'Children are not fundraising objects. Public stories should focus on education, courage, community, and progress while private details stay protected.',
    storyCta: 'View our impact',
    storyImageAlt: 'Classroom illustration showing books and school materials without identifying a child.',
    finalEyebrow: 'Covenant giving',
    finalTitle: 'Give because education is part of the promise we carry together.',
    finalBody: 'Your support can help a child stay in class, return to school, sit for an exam, or continue learning with dignity.',
    finalCta: 'Give now',
  },
  fr: {
    eyebrow: 'Fondation TriumphChi',
    heading: 'Donner par alliance, pas avec les restes.',
    lead: "Nous marchons avec les orphelins et enfants vulnérables des zones rurales du Cameroun dont la scolarité est menacée par les frais, les livres, l'uniforme, les examens, la distance et les difficultés familiales.",
    primaryCta: 'Donner avec intention',
    secondaryCta: 'Demander une aide',
    heroImageAlt: "Illustration d'une table de classe avec livres, cahiers, sac scolaire et tableau.",
    heroStats: [
      { value: 'Frais scolaires', label: 'aider les enfants à rester inscrits quand la famille ne peut pas porter seule le coût' },
      { value: 'Fournitures', label: 'livres, uniformes, sacs, stylos et besoins pratiques pour la classe' },
      { value: 'Dignité', label: 'un soutien qui protège les enfants tout en honorant leur histoire' },
    ],
    needsEyebrow: 'Le besoin autour de nous',
    needsTitle: "Dans les villages, l'école peut se perdre à cause de coûts ordinaires.",
    needsBody: "Beaucoup d'enfants veulent apprendre, mais rencontrent des obstacles qui les éloignent silencieusement de l'école. Le travail commence par voir ces besoins clairement.",
    needs: [
      { title: 'Frais impayés', body: "Un enfant peut être renvoyé, manquer les examens ou perdre sa place quand les frais ne sont pas payés." },
      { title: 'Manque de matériel', body: "Livres, cahiers, stylos et sacs peuvent décider si la présence à l'école aide vraiment l'enfant." },
      { title: 'Uniformes et examens', body: "L'uniforme, l'inscription et les frais d'examen arrivent souvent au moment le plus difficile." },
      { title: 'Distance et difficultés', body: "Les enfants ruraux peuvent aussi faire face au transport, à la faim, au deuil ou à une prise en charge instable." },
    ],
    assistanceEyebrow: 'Les enfants peuvent demander de l’aide',
    assistanceTitle: 'Un enfant, un tuteur, une école ou un leader local peut demander de l’aide.',
    assistanceBody: "Le parcours d'assistance est destiné aux vrais besoins scolaires. Il doit rester clair, respectueux et sûr pour les enfants qui ont besoin de soutien.",
    assistance: [
      { title: 'Un enfant a besoin de soutien scolaire', body: "La demande peut concerner les frais, livres, uniformes, examens ou une situation qui affecte la présence à l'école." },
      { title: 'Un adulte de confiance peut parler pour lui', body: "Tuteurs, proches, enseignants, pasteurs et leaders communautaires peuvent aider à expliquer le besoin." },
      { title: "L'enfant est traité avec dignité", body: "Une demande d'aide ne doit jamais transformer un enfant en exposition publique de la pauvreté." },
    ],
    assistanceCta: 'Commencer une demande d’aide',
    activitiesEyebrow: 'Ce que fait la fondation',
    activitiesTitle: "Nous soutenons l'éducation par la présence, l'écoute et l'aide pratique.",
    activitiesBody: "Le travail ne consiste pas seulement à recevoir des dons. Il faut trouver les enfants, écouter les familles, travailler avec les écoles et rester assez proche pour savoir ce qui a changé.",
    activities: [
      { title: 'Soutien scolaire', body: "Aider avec les frais, fournitures, uniformes, examens et autres barrières à l'éducation." },
      { title: 'Visites communautaires', body: "Apprendre auprès des familles, écoles, églises et leaders locaux avant de partager l'assistance publiquement." },
      { title: 'Accueil des demandes', body: "Recevoir les demandes d'aide et guider les enfants ou tuteurs vers la prochaine étape." },
      { title: 'Récits de progrès', body: "Partager avec soin les nouvelles sur les classes, la présence, la promotion, la réussite et l'encouragement." },
    ],
    storyEyebrow: 'Récits avec dignité',
    storyTitle: "Montrer l'espérance sans exposer l'enfant.",
    storyBody: "Les enfants ne sont pas des objets de collecte. Les récits publics doivent parler d'éducation, de courage, de communauté et de progrès, pendant que les détails privés restent protégés.",
    storyCta: 'Voir notre impact',
    storyImageAlt: 'Illustration de classe avec livres et matériel scolaire sans identifier un enfant.',
    finalEyebrow: "Don d'alliance",
    finalTitle: "Donner parce que l'éducation fait partie de la promesse que nous portons ensemble.",
    finalBody: "Votre soutien peut aider un enfant à rester en classe, retourner à l'école, passer un examen ou continuer à apprendre avec dignité.",
    finalCta: 'Donner maintenant',
  },
} satisfies Record<Locale, LandingCopy>;
