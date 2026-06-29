import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, HeartHandshake, Home, School, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { ImpactSummaryGrid, type ImpactSummaryItem } from '../../../components/public/ImpactSummaryGrid';
import { GivingChannels } from '../../../components/public/GivingChannels';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { apiPublicGet } from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/education_aid_project.jpg';
import sectionImage from '../../../assets/landing/kids_studying_tree.webp';
import supportImage from '../../../assets/landing/classroom-support.png';
import communityImage from '../../../assets/landing/rural-home-cameroon.jpg';

interface ProgramsPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

interface PublicImpactSummary {
  data: {
    children_supported: number | null;
    partner_schools: number | null;
    regions_reached: number | null;
    school_continuation_rate: number | null;
  };
}

const impactIcons = [School, BookOpen, UsersRound, GraduationCap];

export function ProgramsPage({ locale, page }: ProgramsPageProps) {
  const copy = programsCopy[locale];
  const homePage = getPageByKey('home');
  const donatePage = getPageByKey('donate');
  const applyPage = getPageByKey('apply');
  const sponsorPage = getPageByKey('sponsor');
  const impactPage = getPageByKey('impact');

  const impactSummary = useQuery({
    queryKey: ['public-impact-summary'],
    queryFn: () => apiPublicGet<PublicImpactSummary>('/public/impact-summary'),
    staleTime: 1000 * 60 * 10,
  });

  const impactStats = buildImpactStats(copy, locale, impactSummary.data?.data);

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
        backgroundAlt={copy.heroAlt}
        breadcrumbs={[
          { label: homePage.label[locale], to: `/${locale}${homePage.path[locale]}` },
          { label: page.label[locale] },
        ]}
        actions={
          <>
            <Link
              to={`/${locale}${sponsorPage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-foundation-900 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
            >
              {copy.supportCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to={`/${locale}${applyPage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.18]"
            >
              {copy.applyCta}
            </Link>
          </>
        }
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:px-8 lg:py-16">
          <OverlayImage src={sectionImage} alt={copy.sectionOneImageAlt} className="min-h-[280px] lg:min-h-[520px]" />
          <div>
            <SectionIntro eyebrow={copy.sectionOneEyebrow} title={copy.sectionOneTitle} body={copy.sectionOneBody} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {copy.sectionOnePoints.map((point) => (
                <div key={point} className="flex min-h-12 items-start gap-3 rounded-md border border-ink-100 bg-ink-50 px-4 py-3 text-sm leading-6 text-ink-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.supportEyebrow} title={copy.supportTitle} body={copy.supportBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.supportCards.map((card, index) => {
              const Icon = supportIcons[index] ?? HeartHandshake;
              return (
                <article key={card.title} className="rounded-md border border-white/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black text-ink-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{card.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ImpactSummaryGrid
        eyebrow={copy.impactEyebrow}
        title={copy.impactTitle}
        body={copy.impactBody}
        items={impactStats.items}
        icons={impactIcons}
        usesFallback={impactStats.usesFallback}
        fallbackNote={copy.impactFallbackNote}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.journeyEyebrow} title={copy.journeyTitle} body={copy.journeyBody} />
          <div className="mt-8 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {copy.journeySteps.map((step, index) => (
              <article key={step.title} className="rounded-md border border-ink-100 bg-ink-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-foundation-600 text-sm font-black text-white">{String(index + 1).padStart(2, '0')}</span>
                  <step.icon className="h-5 w-5 text-foundation-600" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-black text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <div className="order-2 lg:order-1">
            <SectionIntro eyebrow={copy.storiesEyebrow} title={copy.storiesTitle} body={copy.storiesBody} dark />
            <div className="mt-8 grid gap-4">
              {copy.storiesCards.map((story) => (
                <article key={story.title} className="rounded-md border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-black uppercase text-foundation-100">{story.caption}</p>
                  <h3 className="mt-3 text-xl font-black text-white">{story.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-100">{story.body}</p>
                </article>
              ))}
            </div>
            <Link
              to={`/${locale}${impactPage.path[locale]}`}
              className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-black text-ink-900 transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
            >
              {copy.storiesCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <OverlayImage src={supportImage} alt={copy.storiesImageAlt} className="order-1 min-h-[280px] lg:order-2 lg:min-h-[520px]" />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-16">
          <OverlayImage src={communityImage} alt={copy.communityImageAlt} className="min-h-[280px] lg:min-h-[520px]" />
          <div>
            <SectionIntro eyebrow={copy.communityEyebrow} title={copy.communityTitle} body={copy.communityBody} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {copy.communityPoints.map((point) => (
                <div key={point} className="flex min-h-12 items-start gap-3 rounded-md border border-ink-100 bg-ink-50 px-4 py-3 text-sm leading-6 text-ink-700">
                  <UsersRound className="mt-0.5 h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-foundation-600">{copy.finalEyebrow}</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight text-ink-900 sm:text-4xl">{copy.finalTitle}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-600">{copy.finalBody}</p>
          </div>
          <div className="grid gap-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/${locale}${sponsorPage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white shadow-sm transition duration-200 hover:bg-foundation-900"
              >
                {copy.finalPrimaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={`/${locale}${donatePage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-foundation-200 bg-white px-5 text-sm font-black text-foundation-900 transition duration-200 hover:bg-foundation-100"
              >
                {copy.finalSecondaryCta}
              </Link>
              <Link
                to={`/${locale}${applyPage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-foundation-200 bg-white px-5 text-sm font-black text-foundation-900 transition duration-200 hover:bg-foundation-100"
              >
                {copy.finalTertiaryCta}
              </Link>
            </div>
            <GivingChannels locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}

function OverlayImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-md bg-foundation-900', className)}>
      <img src={src} alt={alt} className="h-full w-full object-cover opacity-80 saturate-[0.72]" loading="lazy" />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(18,55,47,0.84),rgba(18,55,47,0.54)_44%,rgba(18,55,47,0.86))] mix-blend-multiply"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(255,255,255,0.2),transparent_28%),linear-gradient(0deg,rgba(18,55,47,0.46),transparent_48%)]"
        aria-hidden="true"
      />
    </div>
  );
}

function SectionIntro({ eyebrow, title, body, dark = false }: { eyebrow: string; title: string; body: string; dark?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={cn('text-sm font-black uppercase', dark ? 'text-foundation-100' : 'text-foundation-600')}>{eyebrow}</p>
      <h2 className={cn('mt-2 text-3xl font-black leading-tight sm:text-4xl', dark ? 'text-white' : 'text-ink-900')}>{title}</h2>
      <p className={cn('mt-3 text-base leading-7', dark ? 'text-ink-100' : 'text-ink-500')}>{body}</p>
    </div>
  );
}

const supportIcons = [HeartHandshake, BookOpen, School, GraduationCap, Sparkles, UsersRound];

interface ProgramsCopy {
  heroAlt: string;
  supportCta: string;
  applyCta: string;
  sectionOneEyebrow: string;
  sectionOneTitle: string;
  sectionOneBody: string;
  sectionOneImageAlt: string;
  sectionOnePoints: string[];
  supportEyebrow: string;
  supportTitle: string;
  supportBody: string;
  supportCards: Array<{ title: string; body: string }>;
  impactEyebrow: string;
  impactTitle: string;
  impactBody: string;
  impactFallbackNote: string;
  impactLabels: {
    childrenSupported: string;
    partnerSchools: string;
    regionsReached: string;
    schoolContinuationRate: string;
  };
  impactFallbacks: {
    childrenSupported: string;
    partnerSchools: string;
    regionsReached: string;
    schoolContinuationRate: string;
  };
  journeyEyebrow: string;
  journeyTitle: string;
  journeyBody: string;
  journeySteps: Array<{ title: string; body: string; icon: typeof School }>;
  storiesEyebrow: string;
  storiesTitle: string;
  storiesBody: string;
  storiesImageAlt: string;
  storiesCards: Array<{ caption: string; title: string; body: string }>;
  storiesCta: string;
  communityEyebrow: string;
  communityTitle: string;
  communityBody: string;
  communityImageAlt: string;
  communityPoints: string[];
  finalEyebrow: string;
  finalTitle: string;
  finalBody: string;
  finalPrimaryCta: string;
  finalSecondaryCta: string;
  finalTertiaryCta: string;
}

const programsCopy = {
  en: {
    heroAlt: 'Children in a rural Cameroon classroom.',
    supportCta: 'Support a child',
    applyCta: 'Apply for assistance',
    sectionOneEyebrow: 'Education addresses more than one need',
    sectionOneTitle: 'A child rarely leaves school because of one problem.',
    sectionOneBody:
      'Education can be interrupted by unpaid fees, missing learning materials, examination costs, distance, family hardship, or the loss of a parent. Our work responds to these challenges through practical support, community relationships, and continued encouragement.',
    sectionOneImageAlt: 'Children studying together in a rural setting.',
    sectionOnePoints: [
      'School support is tailored to the need in front of the child.',
      'Families, schools, and churches help identify needs early.',
      'Care continues after the first request is received.',
      'Help is delivered with dignity and privacy.',
    ],
    supportEyebrow: 'How we support children',
    supportTitle: 'What support actually looks like.',
    supportBody:
      'The foundation meets real educational barriers with practical help that keeps children learning and moving forward.',
    supportCards: [
      { title: 'School Fee Support', body: 'Helping children remain enrolled when families are unable to meet school fee requirements.' },
      { title: 'Books & Learning Materials', body: 'Providing notebooks, textbooks, writing materials, school bags, and classroom essentials.' },
      { title: 'Uniform Support', body: 'Helping children attend school confidently with required uniforms and basic school clothing.' },
      { title: 'Examination Support', body: 'Assisting with examination registration and related costs that often determine whether a child can progress academically.' },
      { title: 'Mentorship & Encouragement', body: 'Walking alongside children through guidance, encouragement, and positive community relationships.' },
      { title: 'Community Outreach', body: 'Working with schools, families, churches, and local leaders to identify educational needs early.' },
    ],
    impactEyebrow: 'Where support makes a difference',
    impactTitle: 'What difference does it make?',
    impactBody: 'Support becomes visible when children stay in school, partner schools stay connected, and families are not left alone in the hardest moments.',
    impactFallbackNote: 'Growing impact across rural communities.',
    impactLabels: {
      childrenSupported: 'Children Supported',
      partnerSchools: 'Partner Schools',
      regionsReached: 'Regions Reached',
      schoolContinuationRate: 'School Continuation Rate',
    },
    impactFallbacks: {
      childrenSupported: '300+',
      partnerSchools: '12+',
      regionsReached: '4+',
      schoolContinuationRate: '95%',
    },
    journeyEyebrow: "A child's journey",
    journeyTitle: 'How support moves from need to progress.',
    journeyBody: 'The journey is simple to understand and gentle to follow.',
    journeySteps: [
      { title: 'Need Identified', body: 'A child, school, guardian, or community leader reaches out.', icon: Home },
      { title: 'Application Received', body: 'The request is captured and prepared for review.', icon: BookOpen },
      { title: 'Review & Verification', body: 'The details are checked with care and respect.', icon: ShieldCheck },
      { title: 'Support Provided', body: 'Fees, materials, mentorship, or practical help are arranged.', icon: HeartHandshake },
      { title: 'Continued Follow-up', body: 'We stay connected with schools, families, and the child.', icon: UsersRound },
      { title: 'Educational Progress', body: 'Children keep learning with dignity and hope.', icon: GraduationCap },
    ],
    storiesEyebrow: 'Stories of progress',
    storiesTitle: 'Curated stories that show what changes.',
    storiesBody: 'These are impact stories, not private beneficiary records.',
    storiesImageAlt: 'A classroom scene with children studying.',
    storiesCards: [
      {
        caption: 'Returning to the classroom',
        title: 'A child who had left school due to unpaid fees was able to resume classes and complete the academic year.',
        body: 'The right support arrived in time to remove the barrier that had forced the interruption.',
      },
      {
        caption: 'Exam registration support',
        title: 'Timely support helped students sit for examinations that would otherwise have been missed.',
        body: 'A small intervention kept a larger academic opportunity within reach.',
      },
      {
        caption: 'Learning materials distribution',
        title: 'School supplies helped children participate more confidently throughout the term.',
        body: 'Practical items can change how a child shows up in class every day.',
      },
    ],
    storiesCta: 'View impact stories',
    communityEyebrow: 'Community matters',
    communityTitle: 'The foundation does not work alone.',
    communityBody:
      'Teachers, schools, families, churches, volunteers, and local leaders often help identify needs, verify information, and encourage children throughout their educational journey. Real change happens when communities work together.',
    communityImageAlt: 'A rural home and community setting in Cameroon.',
    communityPoints: [
      'Schools help identify children at risk of leaving class.',
      'Families and guardians help explain the situation clearly.',
      'Churches and local leaders help the message travel with trust.',
      'Volunteers help carry encouragement into the community.',
    ],
    finalEyebrow: 'Help keep children learning',
    finalTitle: 'Every contribution helps remove barriers standing between a child and education.',
    finalBody:
      'Together, we can help children remain in school, prepare for examinations, access learning materials, and move toward a brighter future.',
    finalPrimaryCta: 'Support a child',
    finalSecondaryCta: 'Donate',
    finalTertiaryCta: 'Apply for assistance',
  },
  fr: {
    heroAlt: "Des enfants dans une salle de classe rurale au Cameroun.",
    supportCta: 'Soutenir un enfant',
    applyCta: "Demander de l'aide",
    sectionOneEyebrow: "L'éducation dépasse un seul besoin",
    sectionOneTitle: 'Un enfant quitte rarement l’école à cause d’un seul problème.',
    sectionOneBody:
      "L'éducation peut être interrompue par des frais impayés, l'absence de matériel, les coûts d'examen, l'éloignement, des difficultés familiales ou la perte d'un parent. Notre travail répond à ces réalités par un soutien concret, des relations de confiance et un encouragement continu.",
    sectionOneImageAlt: 'Des enfants étudient ensemble dans un cadre rural.',
    sectionOnePoints: [
      "Le soutien scolaire s'adapte au besoin réel de l'enfant.",
      'Les familles, les écoles et les églises aident à identifier les besoins tôt.',
      'L’accompagnement se poursuit après la première demande.',
      'L’aide est donnée avec dignité et discrétion.',
    ],
    supportEyebrow: 'Comment nous aidons les enfants',
    supportTitle: "À quoi ressemble concrètement l'aide.",
    supportBody:
      "La fondation répond aux obstacles réels de l'éducation par une aide pratique qui permet aux enfants de poursuivre leur apprentissage.",
    supportCards: [
      { title: 'Soutien aux frais scolaires', body: "Aider les enfants à rester inscrits lorsque les familles ne peuvent pas payer les frais scolaires." },
      { title: 'Livres et matériel', body: "Fournir cahiers, manuels, fournitures d'écriture, sacs scolaires et essentiels de classe." },
      { title: 'Soutien aux uniformes', body: "Permettre aux enfants de fréquenter l'école avec les uniformes requis et des vêtements de base." },
      { title: "Soutien aux examens", body: "Aider avec l'inscription aux examens et les coûts liés qui déterminent souvent la progression scolaire." },
      { title: 'Mentorat et encouragement', body: "Marcher aux côtés des enfants avec guidance, encouragement et relations positives." },
      { title: 'Sensibilisation communautaire', body: 'Travailler avec les écoles, familles, églises et leaders locaux pour identifier tôt les besoins.' },
    ],
    impactEyebrow: 'Là où le soutien fait une différence',
    impactTitle: "Quel impact cela produit-il ?",
    impactBody: "Le soutien devient visible lorsque les enfants restent à l'école, que les partenaires restent connectés et que les familles ne sont pas seules.",
    impactFallbackNote: 'Impact en croissance dans les communautés rurales.',
    impactLabels: {
      childrenSupported: 'Enfants soutenus',
      partnerSchools: 'Écoles partenaires',
      regionsReached: 'Régions atteintes',
      schoolContinuationRate: 'Taux de maintien scolaire',
    },
    impactFallbacks: {
      childrenSupported: '300+',
      partnerSchools: '12+',
      regionsReached: '4+',
      schoolContinuationRate: '95%',
    },
    journeyEyebrow: "Le parcours d'un enfant",
    journeyTitle: "Comment l'aide passe du besoin au progrès.",
    journeyBody: 'Le parcours est simple à comprendre et doux à suivre.',
    journeySteps: [
      { title: 'Besoin identifié', body: 'Un enfant, une école, un parent ou un leader communautaire se manifeste.', icon: Home },
      { title: 'Demande reçue', body: 'La demande est enregistrée et préparée pour examen.', icon: BookOpen },
      { title: 'Vérification', body: 'Les détails sont vérifiés avec soin et respect.', icon: ShieldCheck },
      { title: 'Aide fournie', body: 'Frais, matériel, mentorat ou aide pratique sont organisés.', icon: HeartHandshake },
      { title: 'Suivi continu', body: 'Nous restons en contact avec les écoles, les familles et l’enfant.', icon: UsersRound },
      { title: 'Progrès scolaire', body: "Les enfants continuent d'apprendre avec dignité et espérance.", icon: GraduationCap },
    ],
    storiesEyebrow: 'Récits de progrès',
    storiesTitle: 'Des récits validés qui montrent ce qui change.',
    storiesBody: 'Ce sont des récits d’impact, pas des dossiers privés.',
    storiesImageAlt: 'Une scène de salle de classe avec des enfants qui étudient.',
    storiesCards: [
      {
        caption: 'Retour en classe',
        title: 'Un enfant qui avait quitté l’école à cause de frais impayés a pu reprendre les cours et terminer l’année scolaire.',
        body: "L'aide est arrivée à temps pour lever l'obstacle qui avait forcé l'interruption.",
      },
      {
        caption: 'Soutien à l’examen',
        title: 'Un soutien opportun a permis à des élèves de passer des examens qu’ils auraient autrement manqués.',
        body: 'Une petite intervention a gardé une grande opportunité scolaire à portée de main.',
      },
      {
        caption: 'Matériel scolaire',
        title: 'Des fournitures ont aidé les enfants à participer avec plus de confiance pendant le trimestre.',
        body: "Des éléments pratiques peuvent changer la manière dont un enfant vit sa journée de classe.",
      },
    ],
    storiesCta: 'Voir les récits d’impact',
    communityEyebrow: 'La communauté compte',
    communityTitle: "La fondation ne travaille pas seule.",
    communityBody:
      "Les enseignants, écoles, familles, églises, volontaires et leaders locaux aident souvent à identifier les besoins, vérifier les informations et encourager les enfants tout au long de leur parcours scolaire. Le changement réel naît du travail commun.",
    communityImageAlt: 'Une maison rurale et un cadre communautaire au Cameroun.',
    communityPoints: [
      'Les écoles aident à repérer les enfants à risque de quitter la classe.',
      'Les familles et tuteurs expliquent la situation avec clarté.',
      'Les églises et leaders locaux transmettent le message avec confiance.',
      'Les volontaires encouragent la communauté au quotidien.',
    ],
    finalEyebrow: 'Aider les enfants à continuer d’apprendre',
    finalTitle: "Chaque contribution aide à lever les obstacles entre un enfant et l'école.",
    finalBody:
      "Ensemble, nous pouvons aider les enfants à rester à l'école, préparer leurs examens, accéder au matériel d'apprentissage et avancer vers un avenir meilleur.",
    finalPrimaryCta: 'Soutenir un enfant',
    finalSecondaryCta: 'Donner',
    finalTertiaryCta: "Demander de l'aide",
  },
} satisfies Record<Locale, ProgramsCopy>;

function buildImpactStats(
  copy: ProgramsCopy,
  locale: Locale,
  summary?: PublicImpactSummary['data'],
): { items: ImpactSummaryItem[]; usesFallback: boolean } {
  const childrenSupported = formatWholeNumber(summary?.children_supported, copy.impactFallbacks.childrenSupported, locale);
  const partnerSchools = formatWholeNumber(summary?.partner_schools, copy.impactFallbacks.partnerSchools, locale);
  const regionsReached = formatWholeNumber(summary?.regions_reached, copy.impactFallbacks.regionsReached, locale);
  const schoolContinuationRate = formatPercentage(summary?.school_continuation_rate, copy.impactFallbacks.schoolContinuationRate);

  return {
    items: [
      { value: childrenSupported.value, label: copy.impactLabels.childrenSupported },
      { value: partnerSchools.value, label: copy.impactLabels.partnerSchools },
      { value: regionsReached.value, label: copy.impactLabels.regionsReached },
      { value: schoolContinuationRate.value, label: copy.impactLabels.schoolContinuationRate },
    ],
    usesFallback:
      childrenSupported.usedFallback ||
      partnerSchools.usedFallback ||
      regionsReached.usedFallback ||
      schoolContinuationRate.usedFallback,
  };
}

function formatWholeNumber(value: number | null | undefined, fallback: string, locale: Locale) {
  if (typeof value !== 'number' || value < 1) {
    return { value: fallback, usedFallback: true };
  }

  return { value: new Intl.NumberFormat(locale).format(value), usedFallback: false };
}

function formatPercentage(value: number | null | undefined, fallback: string) {
  if (typeof value !== 'number' || value < 1) {
    return { value: fallback, usedFallback: true };
  }

  return { value: `${Math.round(value)}%`, usedFallback: false };
}
