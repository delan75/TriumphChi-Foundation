import { formatImpactCount as formatWholeNumber, formatImpactPercentage as formatPercentage } from '../../../lib/impactSummary';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  MapPin,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PublicPageTitle } from '../../../components/public/PublicPageTitle';
import { ImpactSummaryGrid, type ImpactSummaryItem } from '../../../components/public/ImpactSummaryGrid';
import { PublicArticlePreviewGrid, type PublicArticlePreview } from '../../../components/public/PublicArticlePreviewGrid';
import { GivingChannels } from '../../../components/public/GivingChannels';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { apiPublicGet } from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/education_system_cameroon.jpg';
import numbersImage from '../../../assets/landing/kids_studying_tree.webp';
import communityImage from '../../../assets/landing/rural-home-cameroon.jpg';
import storyImage from '../../../assets/landing/classroom-support.png';
import updateImage from '../../../assets/landing/cameroon-children-educationjpg.jpg';
import schoolImage from '../../../assets/landing/school_kids_in_cameroon.jpg';

interface ImpactPageProps {
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

const impactIcons = [UsersRound, School, MapPin, GraduationCap, BookOpen, HeartHandshake];
const supportIcons = [School, BookOpen, GraduationCap, Sparkles, UsersRound, HeartHandshake];
const stewardshipIcons = [HandHeart, CheckCircle2, ShieldCheck, UsersRound];

export function ImpactPage({ locale, page }: ImpactPageProps) {
  const copy = impactCopy[locale];
  const homePage = getPageByKey('home');
  const programsPage = getPageByKey('programs');
  const sponsorPage = getPageByKey('sponsor');
  const donatePage = getPageByKey('donate');
  const applyPage = getPageByKey('apply');

  const impactSummary = useQuery({
    queryKey: ['public-impact-summary', locale],
    queryFn: () => apiPublicGet<PublicImpactSummary>('/public/impact-summary', locale),
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
        title={copy.heroTitle}
        description={copy.heroDescription}
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
              to={`/${locale}${programsPage.path[locale]}`}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/18"
            >
              {copy.programsCta}
            </Link>
          </>
        }
      />

      <ImpactSummaryGrid
        eyebrow={copy.glanceEyebrow}
        title={copy.glanceTitle}
        body={copy.glanceBody}
        items={impactStats.items}
        icons={impactIcons}
        locale={locale}
        hasPlaceholderMetrics
        isImpactDataUnavailable={impactStats.isImpactDataUnavailable}
        isLoading={impactSummary.isLoading}
      />

      <section className="bg-foundation-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-16">
          <OverlayImage src={numbersImage} alt={copy.numbersImageAlt} className="min-h-[280px] lg:min-h-[520px]" />
          <div>
            <SectionIntro eyebrow={copy.numbersEyebrow} title={copy.numbersTitle} body={copy.numbersBody} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {copy.numbersPoints.map((point) => (
                <div key={point} className="flex min-h-12 items-start gap-3 rounded-md border border-white bg-white px-4 py-3 text-sm leading-6 text-ink-700 shadow-xs">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.areasEyebrow} title={copy.areasTitle} body={copy.areasBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.impactAreas.map((area, index) => {
              const Icon = supportIcons[index] ?? HeartHandshake;

              return (
                <article key={area.title} className="rounded-md border border-ink-100 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black text-ink-900">{area.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{area.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <SectionIntro eyebrow={copy.timelineEyebrow} title={copy.timelineTitle} body={copy.timelineBody} dark />
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.timelineItems.map((item) => (
                <article key={item.title} className="rounded-md border border-white/10 bg-white/6 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-md bg-foundation-100 px-3 py-1 text-xs font-black uppercase text-foundation-900">{item.period}</span>
                    <CalendarDays className="h-5 w-5 text-foundation-100" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-100">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicArticlePreviewGrid
        eyebrow={copy.storiesEyebrow}
        title={copy.storiesTitle}
        body={copy.storiesBody}
        items={copy.storyCards.map((story, index) => ({
          ...story,
          image: [storyImage, schoolImage, updateImage][index] ?? storyImage,
        }))}
        variant="tinted"
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-16">
          <div>
            <SectionIntro eyebrow={copy.communityEyebrow} title={copy.communityTitle} body={copy.communityBody} />
            <div className="mt-6 flex flex-wrap gap-2">
              {copy.communityPartners.map((partner) => (
                <span key={partner} className="rounded-md border border-foundation-100 bg-foundation-50 px-4 py-2 text-sm font-black text-foundation-900">
                  {partner}
                </span>
              ))}
            </div>
          </div>
          <OverlayImage src={communityImage} alt={copy.communityImageAlt} className="min-h-[280px] lg:min-h-[480px]" />
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.stewardshipEyebrow} title={copy.stewardshipTitle} body={copy.stewardshipBody} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {copy.stewardshipCards.map((card, index) => {
              const Icon = stewardshipIcons[index] ?? ShieldCheck;

              return (
                <article key={card.title} className="rounded-md border border-white bg-white p-5 shadow-xs">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black text-ink-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{card.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <PublicArticlePreviewGrid
        eyebrow={copy.updatesEyebrow}
        title={copy.updatesTitle}
        body={copy.updatesBody}
        items={copy.updateCards.map((update, index) => ({
          ...update,
          image: [updateImage, numbersImage, communityImage][index] ?? updateImage,
        }))}
      />

      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-foundation-100">{copy.finalEyebrow}</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">{copy.finalTitle}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-100">{copy.finalBody}</p>
          </div>
          <div className="grid gap-5">
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                to={`/${locale}${sponsorPage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black text-ink-900 transition duration-200 hover:-translate-y-0.5 hover:bg-foundation-50"
              >
                {copy.finalPrimaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={`/${locale}${donatePage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 bg-white/10 px-5 text-sm font-black text-white transition duration-200 hover:bg-white/18"
              >
                {copy.finalSecondaryCta}
              </Link>
              <Link
                to={`/${locale}${applyPage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 bg-white/10 px-5 text-sm font-black text-white transition duration-200 hover:bg-white/18"
              >
                {copy.finalTertiaryCta}
              </Link>
            </div>
            <GivingChannels locale={locale} variant="dark" />
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
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(18,55,47,0.88),rgba(18,55,47,0.5)_46%,rgba(18,55,47,0.88))] mix-blend-multiply"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(0deg,rgba(18,55,47,0.46),transparent_48%)]"
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

interface ImpactCopy {
  heroTitle: string;
  heroDescription: string;
  heroAlt: string;
  supportCta: string;
  programsCta: string;
  glanceEyebrow: string;
  glanceTitle: string;
  glanceBody: string;
  glanceFallbackNote: string;
  impactLabels: {
    childrenSupported: string;
    partnerSchools: string;
    regionsReached: string;
    schoolContinuationRate: string;
    educationalNeeds: string;
    learningMaterials: string;
  };
  impactFallbacks: {
    childrenSupported: string;
    partnerSchools: string;
    regionsReached: string;
    schoolContinuationRate: string;
    educationalNeeds: string;
    learningMaterials: string;
  };
  numbersEyebrow: string;
  numbersTitle: string;
  numbersBody: string;
  numbersImageAlt: string;
  numbersPoints: string[];
  areasEyebrow: string;
  areasTitle: string;
  areasBody: string;
  impactAreas: Array<{ title: string; body: string }>;
  timelineEyebrow: string;
  timelineTitle: string;
  timelineBody: string;
  timelineItems: Array<{ period: string; title: string; body: string }>;
  storiesEyebrow: string;
  storiesTitle: string;
  storiesBody: string;
  storyCards: Array<Omit<PublicArticlePreview, 'image'>>;
  communityEyebrow: string;
  communityTitle: string;
  communityBody: string;
  communityImageAlt: string;
  communityPartners: string[];
  stewardshipEyebrow: string;
  stewardshipTitle: string;
  stewardshipBody: string;
  stewardshipCards: Array<{ title: string; body: string }>;
  updatesEyebrow: string;
  updatesTitle: string;
  updatesBody: string;
  updateCards: Array<Omit<PublicArticlePreview, 'image'>>;
  finalEyebrow: string;
  finalTitle: string;
  finalBody: string;
  finalPrimaryCta: string;
  finalSecondaryCta: string;
  finalTertiaryCta: string;
}

const impactCopy = {
  en: {
    heroTitle: 'Education Changes Futures',
    heroDescription:
      'Every school fee paid, every notebook provided, every examination supported, and every child encouraged represents an opportunity protected. Impact is measured not only by numbers, but by children who continue learning, families who regain hope, and communities that invest in education together.',
    heroAlt: 'Children learning together in Cameroon.',
    supportCta: 'Support a Child',
    programsCta: 'View Programs',
    glanceEyebrow: 'Impact at a glance',
    glanceTitle: 'What support is helping make possible.',
    glanceBody:
      'These figures help tell the story of children kept close to school, schools walking with us, and communities choosing hope through education.',
    glanceFallbackNote: 'Our public impact picture is growing as field work is verified and shared.',
    impactLabels: {
      childrenSupported: 'Children Supported',
      partnerSchools: 'Partner Schools',
      regionsReached: 'Regions Reached',
      schoolContinuationRate: 'School Continuation Rate',
      educationalNeeds: 'Educational Needs Supported',
      learningMaterials: 'Learning Materials Shared',
    },
    impactFallbacks: {
      childrenSupported: '—',
      partnerSchools: '—',
      regionsReached: '—',
      schoolContinuationRate: '—',
      educationalNeeds: 'Growing',
      learningMaterials: 'Growing',
    },
    numbersEyebrow: 'Why numbers matter',
    numbersTitle: 'Behind every number is a child continuing to learn.',
    numbersBody:
      'A statistic can never carry the full weight of a child’s story. Still, numbers help families, donors, churches, schools, and partners see whether support is reaching real needs and creating meaningful progress.',
    numbersImageAlt: 'Children studying under a tree in a rural community.',
    numbersPoints: [
      'A paid fee can keep a child enrolled.',
      'An exam registration can protect a full school year.',
      'A notebook or uniform can restore confidence in class.',
      'A school partnership can reveal needs before a child leaves.',
    ],
    areasEyebrow: 'Areas of impact',
    areasTitle: 'Where support changes the school journey.',
    areasBody:
      'Educational barriers look different from child to child. The work responds through practical support, encouragement, and community partnership.',
    impactAreas: [
      { title: 'School Fee Support', body: 'Helping children remain enrolled when fees threaten to interrupt learning.' },
      { title: 'Learning Materials', body: 'Providing notebooks, textbooks, bags, and classroom essentials that help children participate.' },
      { title: 'Examination Support', body: 'Helping students sit for examinations that shape their academic progress.' },
      { title: 'Mentorship', body: 'Encouraging children to keep going when hardship makes school feel distant.' },
      { title: 'Community Partnerships', body: 'Working with families, churches, schools, and local leaders who know the children best.' },
      { title: 'Educational Continuity', body: 'Responding early so temporary hardship does not become permanent withdrawal.' },
    ],
    timelineEyebrow: 'Progress over time',
    timelineTitle: 'Impact grows through faithful, steady work.',
    timelineBody:
      'The foundation is building a clearer public picture of support over time: children reached, needs met, schools connected, and communities encouraged.',
    timelineItems: [
      { period: 'Children', title: 'More children remain connected to school.', body: 'Support helps prevent school interruption when fees, materials, or family hardship become urgent.' },
      { period: 'Schools', title: 'Partner schools help identify needs early.', body: 'Teachers and school leaders often see the warning signs before a child stops attending.' },
      { period: 'Families', title: 'Families receive support with dignity.', body: 'Educational assistance is strongest when it respects the child, the guardian, and the wider community.' },
      { period: 'Communities', title: 'Local relationships strengthen the work.', body: 'Churches, volunteers, and local leaders help encouragement reach beyond a single donation.' },
    ],
    storiesEyebrow: 'Stories of progress',
    storiesTitle: 'Hope is easier to trust when progress can be seen.',
    storiesBody:
      'These are illustrative examples of possible support, not verified beneficiary stories. They describe intended outcomes while protecting children’s privacy and dignity.',
    storyCards: [
      {
        eyebrow: 'Returning to school',
        title: 'Back in the classroom',
        summary: 'Help with unpaid school fees can enable a child to return to class and continue learning with classmates.',
        imageAlt: 'Children in a classroom receiving education support.',
      },
      {
        eyebrow: 'Examination support',
        title: 'Protecting an examination opportunity',
        summary: 'Timely help with examination costs can enable students to sit for exams they might otherwise miss.',
        imageAlt: 'Students outside a school in Cameroon.',
      },
      {
        eyebrow: 'Learning materials',
        title: 'Small supplies, visible confidence',
        summary: 'Notebooks, writing materials, and school essentials can help children participate more confidently throughout the term.',
        imageAlt: 'Children gathered during an education support activity.',
      },
    ],
    communityEyebrow: 'Built together',
    communityTitle: 'Impact is built with communities, not around them.',
    communityBody:
      'Families, teachers, schools, churches, volunteers, and local leaders each carry part of the work. Their presence helps needs become visible, support become responsible, and children feel surrounded rather than singled out.',
    communityImageAlt: 'A rural community setting in Cameroon.',
    communityPartners: ['Families', 'Schools', 'Churches', 'Volunteers', 'Local Leaders', 'Donors'],
    stewardshipEyebrow: 'Stewardship and accountability',
    stewardshipTitle: 'Every contribution carries responsibility.',
    stewardshipBody:
      'Trust is earned through careful listening, responsible giving, and clear communication. Support should carry a story of what changed after a gift was given.',
    stewardshipCards: [
      { title: 'Donation Care', body: 'Giving is received and handled with attention to the educational purpose behind it.' },
      { title: 'Support Follow-Up', body: 'The work does not end when a need is met; schools and families remain part of the conversation.' },
      { title: 'Community Verification', body: 'Local relationships help confirm needs respectfully before support is arranged.' },
      { title: 'Responsible Governance', body: 'Children’s dignity, donor trust, and community accountability guide how the work is carried.' },
    ],
    updatesEyebrow: 'Latest impact updates',
    updatesTitle: 'Field notes from the work.',
    updatesBody:
      'As programs grow, public updates will share milestones, community activities, and education support progress.',
    updateCards: [
      {
        eyebrow: 'Community',
        meta: 'Education support',
        title: 'School needs identified before the term begins',
        summary: 'Early conversations with schools and families help reveal the children most at risk before the school year becomes difficult.',
        imageAlt: 'Children in a rural Cameroon education setting.',
      },
      {
        eyebrow: 'Programs',
        meta: 'Learning materials',
        title: 'Practical support that helps children show up ready',
        summary: 'Books, notebooks, and school essentials can make daily attendance more confident and less stressful.',
        imageAlt: 'Children studying together outdoors.',
      },
      {
        eyebrow: 'Partnership',
        meta: 'Community care',
        title: 'Local relationships strengthen education support',
        summary: 'Schools, churches, and community leaders help ensure support is rooted in real needs and shared responsibility.',
        imageAlt: 'A rural community setting in Cameroon.',
      },
    ],
    finalEyebrow: 'Help write the next chapter',
    finalTitle: 'The next story of progress can begin with a child staying in school.',
    finalBody:
      'Your support can help remove a barrier, encourage a family, strengthen a school connection, and protect a child’s opportunity to keep learning.',
    finalPrimaryCta: 'Support a Child',
    finalSecondaryCta: 'Donate',
    finalTertiaryCta: 'Apply for Assistance',
  },
  fr: {
    heroTitle: "L'education change l'avenir",
    heroDescription:
      "Chaque frais scolaire paye, chaque cahier fourni, chaque examen soutenu et chaque enfant encourage represente une opportunite protegee. L'impact se mesure par les chiffres, mais aussi par les enfants qui continuent d'apprendre, les familles qui retrouvent l'espoir et les communautes qui investissent ensemble dans l'education.",
    heroAlt: 'Des enfants apprennent ensemble au Cameroun.',
    supportCta: 'Soutenir un enfant',
    programsCta: 'Voir les programmes',
    glanceEyebrow: "L'impact en bref",
    glanceTitle: "Ce que le soutien aide a rendre possible.",
    glanceBody:
      "Ces chiffres racontent l'histoire d'enfants gardes pres de l'ecole, d'etablissements qui marchent avec nous et de communautes qui choisissent l'espoir par l'education.",
    glanceFallbackNote: 'Les donnees publiques grandissent au fur et a mesure que le travail de terrain est verifie et publie.',
    impactLabels: {
      childrenSupported: 'Enfants soutenus',
      partnerSchools: 'Ecoles partenaires',
      regionsReached: 'Regions atteintes',
      schoolContinuationRate: 'Taux de maintien scolaire',
      educationalNeeds: 'Besoins scolaires soutenus',
      learningMaterials: 'Materiel scolaire partage',
    },
    impactFallbacks: {
      childrenSupported: '—',
      partnerSchools: '—',
      regionsReached: '—',
      schoolContinuationRate: '—',
      educationalNeeds: 'En croissance',
      learningMaterials: 'En croissance',
    },
    numbersEyebrow: 'Pourquoi les chiffres comptent',
    numbersTitle: 'Derriere chaque chiffre, il y a un enfant qui continue d’apprendre.',
    numbersBody:
      "Un chiffre ne peut jamais porter toute l'histoire d'un enfant. Mais les donnees aident les familles, donateurs, eglises, ecoles et partenaires a voir si le soutien atteint de vrais besoins et produit un progres concret.",
    numbersImageAlt: 'Des enfants etudient sous un arbre dans une communaute rurale.',
    numbersPoints: [
      'Des frais payes peuvent garder un enfant inscrit.',
      "Une inscription a l'examen peut proteger toute une annee scolaire.",
      'Un cahier ou un uniforme peut restaurer la confiance en classe.',
      "Une ecole partenaire peut signaler un besoin avant qu'un enfant ne parte.",
    ],
    areasEyebrow: "Domaines d'impact",
    areasTitle: 'La ou le soutien change le parcours scolaire.',
    areasBody:
      "Les obstacles scolaires varient d'un enfant a l'autre. Le travail repond par une aide pratique, de l'encouragement et un partenariat communautaire.",
    impactAreas: [
      { title: 'Frais scolaires', body: "Aider les enfants a rester inscrits lorsque les frais menacent d'interrompre l'apprentissage." },
      { title: 'Materiel scolaire', body: 'Fournir cahiers, manuels, sacs et essentiels de classe pour participer pleinement.' },
      { title: 'Soutien aux examens', body: 'Aider les eleves a passer les examens qui influencent leur progression scolaire.' },
      { title: 'Mentorat', body: "Encourager les enfants a continuer lorsque les difficultes rendent l'ecole lointaine." },
      { title: 'Partenariats communautaires', body: 'Travailler avec familles, eglises, ecoles et leaders locaux qui connaissent les enfants.' },
      { title: 'Continuite scolaire', body: 'Repondre tot afin qu’une difficulte temporaire ne devienne pas un abandon durable.' },
    ],
    timelineEyebrow: 'Progres dans le temps',
    timelineTitle: "L'impact grandit par un travail fidele et constant.",
    timelineBody:
      "La fondation construit une image publique plus claire du soutien au fil du temps : enfants rejoints, besoins couverts, ecoles connectees et communautes encouragees.",
    timelineItems: [
      { period: 'Enfants', title: "Plus d'enfants restent proches de l'ecole.", body: "Le soutien aide a eviter l'interruption quand les frais, le materiel ou les difficultes familiales deviennent urgents." },
      { period: 'Ecoles', title: 'Les ecoles partenaires signalent les besoins tot.', body: "Les enseignants et responsables voient souvent les signes avant qu'un enfant cesse de venir." },
      { period: 'Familles', title: 'Les familles sont soutenues avec dignite.', body: "L'aide scolaire est plus forte lorsqu'elle respecte l'enfant, le tuteur et la communaute." },
      { period: 'Communautes', title: 'Les relations locales renforcent le travail.', body: "Eglises, benevoles et leaders locaux aident l'encouragement a depasser un simple don." },
    ],
    storiesEyebrow: 'Histoires de progres',
    storiesTitle: 'L’espoir inspire confiance quand le progres se voit.',
    storiesBody:
      "Ces exemples illustrent des aides possibles, pas des histoires de beneficiaires verifiees. Ils decrivent les objectifs du soutien tout en protegeant la vie privee et la dignite des enfants.",
    storyCards: [
      {
        eyebrow: 'Retour a l’ecole',
        title: 'De retour en classe',
        summary: "Une aide pour les frais scolaires impayes peut permettre a un enfant de reprendre les cours et de continuer d'apprendre avec ses camarades.",
        imageAlt: "Des enfants dans une salle de classe recevant un soutien educatif.",
      },
      {
        eyebrow: 'Soutien aux examens',
        title: "Proteger une opportunite d'examen",
        summary: "Une aide a temps pour les frais d'examen peut permettre a des eleves de composer au lieu de manquer l'epreuve.",
        imageAlt: 'Des eleves devant une ecole au Cameroun.',
      },
      {
        eyebrow: 'Materiel scolaire',
        title: 'De petites fournitures, une confiance visible',
        summary: "Cahiers, fournitures et essentiels scolaires peuvent aider des enfants a participer avec plus d'assurance pendant le trimestre.",
        imageAlt: "Des enfants rassembles pendant une activite de soutien educatif.",
      },
    ],
    communityEyebrow: 'Construit ensemble',
    communityTitle: "L'impact se construit avec les communautes, pas autour d'elles.",
    communityBody:
      "Familles, enseignants, ecoles, eglises, benevoles et leaders locaux portent chacun une partie du travail. Leur presence rend les besoins visibles, le soutien responsable et les enfants entoures.",
    communityImageAlt: 'Un cadre communautaire rural au Cameroun.',
    communityPartners: ['Familles', 'Ecoles', 'Eglises', 'Benevoles', 'Leaders locaux', 'Donateurs'],
    stewardshipEyebrow: 'Responsabilite et confiance',
    stewardshipTitle: 'Chaque contribution porte une responsabilite.',
    stewardshipBody:
      "La confiance se gagne par l'ecoute, la generosite responsable et une communication claire. Le soutien doit raconter ce qui a change apres un don.",
    stewardshipCards: [
      { title: 'Soin des dons', body: "La generosite est recue et geree avec attention au but educatif qu'elle porte." },
      { title: 'Suivi du soutien', body: "Le travail ne s'arrete pas quand un besoin est couvert; ecoles et familles restent dans la conversation." },
      { title: 'Verification communautaire', body: "Les relations locales aident a confirmer les besoins avec respect avant d'organiser l'aide." },
      { title: 'Gouvernance responsable', body: "La dignite des enfants, la confiance des donateurs et la responsabilite communautaire guident le travail." },
    ],
    updatesEyebrow: "Dernieres nouvelles d'impact",
    updatesTitle: 'Notes de terrain sur le travail.',
    updatesBody:
      'Au fur et a mesure que les programmes grandissent, les nouvelles publiques partageront les etapes, activites communautaires et progres du soutien scolaire.',
    updateCards: [
      {
        eyebrow: 'Communaute',
        meta: 'Soutien scolaire',
        title: 'Des besoins scolaires identifies avant la rentree',
        summary: "Les premieres conversations avec les ecoles et les familles aident a reperer les enfants les plus exposes avant que l'annee scolaire ne devienne difficile.",
        imageAlt: 'Des enfants dans un contexte educatif rural au Cameroun.',
      },
      {
        eyebrow: 'Programmes',
        meta: 'Materiel scolaire',
        title: 'Une aide pratique pour arriver pret a apprendre',
        summary: "Livres, cahiers et essentiels scolaires peuvent rendre la presence quotidienne plus confiante et moins difficile.",
        imageAlt: 'Des enfants etudient ensemble dehors.',
      },
      {
        eyebrow: 'Partenariat',
        meta: 'Soin communautaire',
        title: 'Les relations locales renforcent le soutien scolaire',
        summary: "Ecoles, eglises et leaders communautaires aident a ancrer le soutien dans de vrais besoins et une responsabilite partagee.",
        imageAlt: 'Un cadre communautaire rural au Cameroun.',
      },
    ],
    finalEyebrow: 'Aider a ecrire le prochain chapitre',
    finalTitle: "La prochaine histoire de progres peut commencer par un enfant qui reste a l'ecole.",
    finalBody:
      "Votre soutien peut lever un obstacle, encourager une famille, renforcer un lien avec une ecole et proteger l'opportunite d'un enfant de continuer a apprendre.",
    finalPrimaryCta: 'Soutenir un enfant',
    finalSecondaryCta: 'Donner',
    finalTertiaryCta: "Demander de l'aide",
  },
} satisfies Record<Locale, ImpactCopy>;

function buildImpactStats(
  copy: ImpactCopy,
  locale: Locale,
  summary?: PublicImpactSummary['data'],
): { items: ImpactSummaryItem[]; isImpactDataUnavailable: boolean } {
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
      { value: copy.impactFallbacks.educationalNeeds, label: copy.impactLabels.educationalNeeds },
      { value: copy.impactFallbacks.learningMaterials, label: copy.impactLabels.learningMaterials },
    ],
    isImpactDataUnavailable:
      childrenSupported.usedFallback ||
      partnerSchools.usedFallback ||
      regionsReached.usedFallback ||
      schoolContinuationRate.usedFallback,
  };
}
