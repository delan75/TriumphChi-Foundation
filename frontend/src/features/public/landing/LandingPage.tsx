import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Home,
  MapPin,
  School,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { GivingChannels } from '../../../components/public/GivingChannels';
import { Seo } from '../../../components/seo/Seo';
import { cn } from '../../../components/ui/cn';
import { buildPublicPageSchema, getPageByKey, PublicPageDefinition } from '../../../content/publicPages';
import { apiGet } from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import heroImage from '../../../assets/landing/cameroon.jpg';
import ruralHomeHeroImage from '../../../assets/landing/rural-home-cameroon.jpg';
import classroomImage from '../../../assets/landing/cameroon-children-educationjpg.jpg';
import ruralImage from '../../../assets/landing/rural_kids.jpg';
import outdoorClassImage from '../../../assets/landing/kids_studying_tree.webp';
import groupClassImage from '../../../assets/landing/education_aid_project.jpg';
import studyImage from '../../../assets/landing/education_system_cameroon.jpg';

interface LandingPageProps {
  locale: Locale;
  page: PublicPageDefinition;
}

const needIcons = [School, BookOpen, GraduationCap, HeartHandshake];
const communityIcons = [MapPin, Home, UsersRound, Sparkles];
const assistanceIcons = [HandHeart, School, ShieldCheck, UsersRound];
const workIcons = [HeartHandshake, BookOpen, UsersRound, GraduationCap];
const impactIcons = [School, BookOpen, UsersRound, GraduationCap];
const supportStepIcons = [HandHeart, ShieldCheck, BookOpen, HeartHandshake];
const highPriorityImageProps = { fetchpriority: 'high' } as Record<string, string>;

interface PublicImpactSummary {
  data: {
    children_supported: number | null;
    partner_schools: number | null;
    regions_reached: number | null;
    school_continuation_rate: number | null;
  };
}

export function LandingPage({ locale, page }: LandingPageProps) {
  const copy = landingCopy[locale];
  const [activeStatement, setActiveStatement] = useState<'mission' | 'vision'>('mission');
  const impactSummary = useQuery({
    queryKey: ['public-impact-summary'],
    queryFn: () => apiGet<PublicImpactSummary>('/public/impact-summary'),
    staleTime: 1000 * 60 * 10,
  });
  const donatePage = getPageByKey('donate');
  const applyPage = getPageByKey('apply');
  const impactPage = getPageByKey('impact');
  const visionPage = getPageByKey('vision');
  const impactStats = buildImpactStats(copy, locale, impactSummary.data?.data);
  const activeStatementCopy = copy[activeStatement];
  const heroSlides = [
    { image: heroImage, alt: copy.heroImageAlt, className: 'hero-slide-one object-center' },
    { image: ruralHomeHeroImage, alt: copy.heroSecondImageAlt, className: 'hero-slide-two object-[center_54%]' },
  ];

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
        <div className="absolute inset-0 -z-20">
          {heroSlides.map((slide, index) => (
            <img
              key={slide.image}
              src={slide.image}
              alt={slide.alt}
              className={cn('hero-slide absolute inset-0 h-full w-full object-cover', slide.className)}
              width={index === 0 ? '2400' : '1200'}
              height={index === 0 ? '1200' : '900'}
              {...(index === 0 ? highPriorityImageProps : { loading: 'lazy' })}
            />
          ))}
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,55,47,0.98)_0%,rgba(18,55,47,0.88)_42%,rgba(18,55,47,0.5)_72%,rgba(18,55,47,0.74)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(215,243,234,0.2),transparent_24%),linear-gradient(0deg,rgba(18,55,47,0.84),transparent_46%)]" />

        <div className="mx-auto flex min-h-[84dvh] max-w-7xl flex-col justify-end px-4 pb-10 pt-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="hero-copy hero-copy-kicker mb-4 inline-flex min-h-8 items-center rounded-md border border-white/20 bg-white/10 px-3 text-sm font-bold text-foundation-50 backdrop-blur">
              {copy.eyebrow}
            </p>
            <h1 className="hero-copy hero-copy-title max-w-4xl text-balance text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
              {copy.heading}
            </h1>
            <p className="hero-copy hero-copy-lead mt-5 max-w-2xl text-lg leading-8 text-foundation-50 sm:text-xl">{copy.lead}</p>
            <div className="hero-copy hero-copy-actions mt-7 flex flex-col gap-3 sm:flex-row">
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
            {copy.heroNotes.map((item) => (
              <div key={item.title} className="hero-note-card rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-base font-black">{item.title}</p>
                <p className="mt-1 text-sm leading-5 text-foundation-50">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 flex items-center gap-2" aria-hidden="true">
            <span className="hero-slide-indicator hero-slide-indicator-one" />
            <span className="hero-slide-indicator hero-slide-indicator-two" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <ImagePanel image={groupClassImage} alt={copy.missionVisionImageAlt} caption={copy.missionVisionCaption} className="lg:pr-8" />
          <div className="relative z-10 self-center lg:-ml-14 lg:rounded-md lg:border lg:border-white/70 lg:bg-white/[0.92] lg:p-6 lg:shadow-xl lg:shadow-foundation-900/10 lg:backdrop-blur">
            <p className="text-sm font-black uppercase text-foundation-600">{copy.missionVisionEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink-900 sm:text-4xl">{copy.missionVisionTitle}</h2>
            <div className="mt-6 inline-flex rounded-md border border-foundation-100 bg-foundation-50 p-1">
              {(['mission', 'vision'] as const).map((statement) => (
                <button
                  key={statement}
                  type="button"
                  onClick={() => setActiveStatement(statement)}
                  className={cn(
                    'min-h-10 rounded px-4 text-sm font-black transition duration-200',
                    activeStatement === statement
                      ? 'bg-foundation-600 text-white shadow-sm'
                      : 'text-foundation-900 hover:bg-white',
                  )}
                >
                  {copy[statement].tab}
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-md border border-ink-100 bg-ink-50 p-5">
              <p className="text-sm font-black uppercase text-foundation-600">{activeStatementCopy.label}</p>
              <h3 className="mt-2 text-2xl font-black text-ink-900">{activeStatementCopy.title}</h3>
              <p className="mt-3 text-base leading-7 text-ink-600">{activeStatementCopy.body}</p>
            </div>
            <Link
              to={`/${locale}${visionPage.path[locale]}`}
              className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-black text-foundation-700 transition hover:text-foundation-900"
            >
              {copy.missionVisionCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <div className="relative z-10 lg:-mr-14 lg:rounded-md lg:border lg:border-white/70 lg:bg-white/[0.93] lg:p-6 lg:shadow-xl lg:shadow-foundation-900/10 lg:backdrop-blur">
            <SectionIntro eyebrow={copy.whyEyebrow} title={copy.whyTitle} body={copy.whyBody} />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
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
          <ImagePanel image={classroomImage} alt={copy.whyImageAlt} caption={copy.whyCaption} className="lg:pl-8" />
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <ImagePanel image={ruralImage} alt={copy.ruralImageAlt} caption={copy.ruralCaption} className="lg:pr-8" />
          <div className="relative z-10 self-center lg:-ml-14 lg:rounded-md lg:border lg:border-white/70 lg:bg-foundation-50/[0.94] lg:p-6 lg:shadow-xl lg:shadow-foundation-900/10 lg:backdrop-blur">
            <SectionIntro eyebrow={copy.ruralEyebrow} title={copy.ruralTitle} body={copy.ruralBody} />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {copy.ruralPoints.map((point, index) => {
                const Icon = communityIcons[index];

                return (
                  <div key={point} className="flex min-h-12 items-center gap-3 rounded-md border border-foundation-100 bg-white px-4 py-3 text-sm font-bold text-ink-700 shadow-sm">
                    <Icon className="h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                    {point}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-foundation-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-foundation-100">{copy.workEyebrow}</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">{copy.workTitle}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-foundation-50">{copy.workBody}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {copy.work.map((item, index) => {
                const Icon = workIcons[index];

                return (
                  <article key={item.title} className="rounded-md border border-white/10 bg-white/5 p-5">
                    <Icon className="h-6 w-6 text-foundation-100" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-foundation-50">{item.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4">
            <OverlayImage src={outdoorClassImage} alt={copy.workImageAlt} className="min-h-64 shadow-xl" />
            <OverlayImage src={groupClassImage} alt={copy.workSecondImageAlt} className="hidden shadow-xl sm:block" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.supportPathEyebrow} title={copy.supportPathTitle} body={copy.supportPathBody} />
          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {copy.supportPath.map((step, index) => {
              const Icon = supportStepIcons[index];

              return (
                <article key={step.title} className="rounded-md border border-ink-100 bg-ink-50 p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-foundation-600 text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-black uppercase text-foundation-600">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h2 className="mt-4 text-lg font-black text-ink-900">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{step.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-16">
          <SectionIntro eyebrow={copy.assistanceEyebrow} title={copy.assistanceTitle} body={copy.assistanceBody} />
          <div className="grid gap-3">
            {copy.assistance.map((item, index) => {
              const Icon = assistanceIcons[index];

              return (
                <article key={item.title} className="grid gap-3 rounded-md border border-ink-100 bg-ink-50 p-4 shadow-sm sm:grid-cols-[3rem_1fr]">
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
          <SectionIntro eyebrow={copy.impactEyebrow} title={copy.impactTitle} body={copy.impactBody} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.items.map((item, index) => {
              const Icon = impactIcons[index];

              return (
                <article key={item.label} className="rounded-md border border-foundation-100 bg-foundation-50 p-5">
                  <Icon className="h-6 w-6 text-foundation-600" aria-hidden="true" />
                  <p className="mt-4 text-3xl font-black text-ink-900">{item.value}</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-ink-500">{item.label}</p>
                </article>
              );
            })}
          </div>
          {impactStats.usesFallback ? <p className="mt-4 text-sm font-bold text-ink-500">{copy.impactFallbackNote}</p> : null}
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16">
          <ImagePanel image={studyImage} alt={copy.storyImageAlt} caption={copy.storyCaption} dark className="md:pr-8" />
          <div className="relative z-10 self-center md:-ml-14 md:rounded-md md:border md:border-white/10 md:bg-ink-900/[0.86] md:p-6 md:shadow-xl md:shadow-black/20 md:backdrop-blur">
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
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-foundation-600">{copy.trustEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-ink-900 sm:text-4xl">{copy.trustTitle}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-500">{copy.trustBody}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {copy.trustPoints.map((point) => (
              <div key={point} className="flex min-h-12 items-center gap-3 rounded-md border border-ink-100 bg-ink-50 px-4 py-3 text-sm font-bold text-ink-700">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-foundation-600" aria-hidden="true" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foundation-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-foundation-600">{copy.finalEyebrow}</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black text-ink-900 sm:text-4xl">{copy.finalTitle}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-600">{copy.finalBody}</p>
          </div>
          <div className="grid gap-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/${locale}${donatePage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white shadow-sm transition duration-200 hover:bg-foundation-900"
              >
                {copy.finalPrimaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to={`/${locale}${applyPage.path[locale]}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md border border-foundation-200 bg-white px-5 text-sm font-black text-foundation-900 transition duration-200 hover:bg-foundation-100"
              >
                {copy.finalSecondaryCta}
              </Link>
            </div>
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

function ImagePanel({
  image,
  alt,
  caption,
  dark = false,
  className,
}: {
  image: string;
  alt: string;
  caption: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        'overflow-hidden rounded-md border shadow-sm',
        dark ? 'border-white/10 bg-white/5' : 'border-ink-100 bg-white',
        className,
      )}
    >
      <div className="relative isolate overflow-hidden">
        <img src={image} alt={alt} className="aspect-[4/3] w-full object-cover saturate-[0.82]" loading="lazy" />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(18,55,47,0.74)_0%,rgba(18,55,47,0.46)_46%,rgba(18,55,47,0.72)_100%)] mix-blend-multiply"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(90deg,rgba(18,55,47,0.2),rgba(18,55,47,0.58))]"
          aria-hidden="true"
        />
      </div>
      <figcaption className={cn('px-4 py-3 text-sm leading-6', dark ? 'text-ink-100' : 'text-ink-500')}>{caption}</figcaption>
    </figure>
  );
}

function OverlayImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-md bg-foundation-900', className)}>
      <img src={src} alt={alt} className="h-full w-full rounded-md object-cover saturate-[0.78]" loading="lazy" />
      <div
        className="pointer-events-none absolute inset-0 rounded-md bg-[linear-gradient(135deg,rgba(18,55,47,0.76),rgba(18,55,47,0.42)_44%,rgba(18,55,47,0.82))] mix-blend-multiply"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-md bg-[radial-gradient(circle_at_78%_16%,rgba(255,255,255,0.2),transparent_28%),linear-gradient(0deg,rgba(18,55,47,0.46),transparent_48%)]"
        aria-hidden="true"
      />
    </div>
  );
}

interface ImpactStatItem {
  value: string;
  label: string;
}

interface ImpactStatsDisplay {
  items: ImpactStatItem[];
  usesFallback: boolean;
}

function buildImpactStats(copy: LandingCopy, locale: Locale, summary?: PublicImpactSummary['data']): ImpactStatsDisplay {
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

interface LandingCopy {
  eyebrow: string;
  heading: string;
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  heroImageAlt: string;
  heroSecondImageAlt: string;
  heroNotes: Array<{ title: string; body: string }>;
  missionVisionEyebrow: string;
  missionVisionTitle: string;
  missionVisionImageAlt: string;
  missionVisionCaption: string;
  missionVisionCta: string;
  mission: { tab: string; label: string; title: string; body: string };
  vision: { tab: string; label: string; title: string; body: string };
  whyEyebrow: string;
  whyTitle: string;
  whyBody: string;
  whyImageAlt: string;
  whyCaption: string;
  needs: Array<{ title: string; body: string }>;
  ruralEyebrow: string;
  ruralTitle: string;
  ruralBody: string;
  ruralImageAlt: string;
  ruralCaption: string;
  ruralPoints: string[];
  assistanceEyebrow: string;
  assistanceTitle: string;
  assistanceBody: string;
  assistance: Array<{ title: string; body: string }>;
  assistanceCta: string;
  workEyebrow: string;
  workTitle: string;
  workBody: string;
  workImageAlt: string;
  workSecondImageAlt: string;
  work: Array<{ title: string; body: string }>;
  supportPathEyebrow: string;
  supportPathTitle: string;
  supportPathBody: string;
  supportPath: Array<{ title: string; body: string }>;
  impactEyebrow: string;
  impactTitle: string;
  impactBody: string;
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
  impactFallbackNote: string;
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  storyCta: string;
  storyImageAlt: string;
  storyCaption: string;
  trustEyebrow: string;
  trustTitle: string;
  trustBody: string;
  trustPoints: string[];
  finalEyebrow: string;
  finalTitle: string;
  finalBody: string;
  finalPrimaryCta: string;
  finalSecondaryCta: string;
}

const landingCopy = {
  en: {
    eyebrow: 'Giving from a covenant, not from leftovers.',
    heading: 'TriumphChi Foundation',
    lead: 'In rural Cameroon, many children are only one school fee, one uniform, or one exam registration away from leaving school. We exist to help them stay, learn, and move forward with dignity.',
    primaryCta: 'Support a child',
    secondaryCta: 'Apply for assistance',
    heroImageAlt: 'A smiling school child in a classroom in Cameroon.',
    heroSecondImageAlt: 'Children and family members outside a rural home in Cameroon.',
    heroNotes: [
      { title: 'Children stay in school', body: 'Education barriers are removed before they become reasons to leave.' },
      { title: 'Practical support', body: 'School fees, learning materials, uniforms, and examination costs.' },
      { title: 'Community partnership', body: 'Families, schools, churches, and local leaders help identify real needs.' },
    ],
    missionVisionEyebrow: 'Mission and vision',
    missionVisionTitle: 'A commitment to children whose education is at risk.',
    missionVisionImageAlt: 'Children receiving education support from community volunteers.',
    missionVisionCaption: 'The foundation works through compassion, local relationships, and careful attention to real educational needs.',
    missionVisionCta: 'Read more about our vision',
    mission: {
      tab: 'Mission',
      label: 'Our mission',
      title: 'Keep vulnerable children learning with dignity.',
      body: 'TriumphChi Foundation supports orphaned and vulnerable children in Cameroon by helping remove practical school barriers and surrounding each child with care, encouragement, and community support.',
    },
    vision: {
      tab: 'Vision',
      label: 'Our vision',
      title: "A Cameroon where hardship does not end a child's education.",
      body: 'We envision rural communities where children affected by loss, poverty, or family crisis can remain in school, grow in confidence, and step into adulthood with hope.',
    },
    whyEyebrow: 'Why this work matters',
    whyTitle: 'A small barrier can close a classroom door.',
    whyBody: 'A child may work hard all year, pass every class, and still miss an examination because the registration fee cannot be paid. A missing notebook, a worn uniform, or the loss of a parent should not determine whether a child receives an education. That is where community support becomes meaningful.',
    whyImageAlt: 'Children writing in notebooks in a classroom.',
    whyCaption: 'A school day is built from simple things: a seat in class, a notebook, a uniform, an exam fee, and someone who believes the child should continue.',
    needs: [
      { title: 'School fees', body: 'A child may be sent home or miss exams when fees remain unpaid.' },
      { title: 'Learning materials', body: 'Books, notebooks, pens, and bags make attendance meaningful.' },
      { title: 'Examination costs', body: 'Registration and exam charges often arrive when families are already stretched.' },
      { title: 'Mentorship and encouragement', body: 'Children need adults who notice, listen, and keep walking with them.' },
    ],
    ruralEyebrow: 'Where we serve',
    ruralTitle: 'Many rural communities carry struggles that are rarely seen beyond their villages.',
    ruralBody: 'Long distances to school, limited educational resources, economic hardship, and children growing up without parental support can make learning fragile. Yet these communities are rich in resilience, faith, family, and determination.',
    ruralImageAlt: 'Children gathered along a rural red-earth road in Cameroon.',
    ruralCaption: 'Rural Cameroon is not only a place of need. It is a place of resilience, community memory, and children who still want to learn.',
    ruralPoints: ['Long distances to school', 'Limited learning resources', 'Economic hardship', 'Resilient families and communities'],
    assistanceEyebrow: 'Need educational assistance?',
    assistanceTitle: 'No child should feel invisible.',
    assistanceBody: 'The foundation receives education support requests from children and from trusted people around them. Every request should be handled carefully, respectfully, and without public shame.',
    assistance: [
      { title: 'Children seeking support', body: 'A child may need help with fees, supplies, exams, or returning to school after hardship.' },
      { title: 'Guardians, relatives, and schools', body: 'Adults close to the child can help explain the situation and begin the request.' },
      { title: 'Churches and local organizations', body: 'Community groups can identify needs and help connect children to assistance.' },
      { title: 'Careful review', body: 'Requests are reviewed with dignity so support can meet real educational needs.' },
    ],
    assistanceCta: 'Request assistance',
    workEyebrow: 'Our work',
    workTitle: 'We walk with children, families, schools, and communities.',
    workBody: 'The work is not only receiving gifts. It is showing up, listening, providing practical school support, and following the child with care.',
    workImageAlt: 'Children learning outdoors under a tree.',
    workSecondImageAlt: 'A classroom of children smiling and raising their hands.',
    work: [
      { title: 'Educational sponsorship', body: 'Helping children remain in school through direct education support.' },
      { title: 'Books and learning materials', body: 'Providing supplies that make school participation possible.' },
      { title: 'Community outreach', body: 'Working with families, schools, churches, and local leaders.' },
      { title: 'Mentorship and encouragement', body: 'Supporting children with presence, prayerful care, and progress follow-up.' },
    ],
    supportPathEyebrow: 'How support reaches a child',
    supportPathTitle: 'Help is handled with care from the first request to continued follow-up.',
    supportPathBody: 'When a need is raised, the response should be practical, respectful, and connected to the people who know the child best.',
    supportPath: [
      { title: 'Need identified', body: 'A child, school, guardian, or community leader reaches out.' },
      { title: 'Review and verification', body: 'The request is reviewed carefully and respectfully.' },
      { title: 'Support provided', body: 'Fees, materials, mentorship, or educational assistance is arranged.' },
      { title: 'Continued follow-up', body: 'We stay connected with schools, families, and the child.' },
    ],
    impactEyebrow: 'Impact with a human face',
    impactTitle: 'The measure is a child continuing school.',
    impactBody: 'Impact is seen in children supported, schools reached, fees covered, materials provided, and students continuing their education with hope.',
    impactLabels: {
      childrenSupported: 'Children supported',
      partnerSchools: 'Partner schools',
      regionsReached: 'Regions reached',
      schoolContinuationRate: 'School continuation rate',
    },
    impactFallbacks: {
      childrenSupported: '300+',
      partnerSchools: '12',
      regionsReached: '4',
      schoolContinuationRate: '95%',
    },
    impactFallbackNote: 'Our impact dashboard is growing as programs expand.',
    storyEyebrow: 'Stories with dignity',
    storyTitle: "The goal is never to display a child's hardship.",
    storyBody: 'The goal is to celebrate growth, courage, learning, and hope while protecting privacy and dignity. Public stories should honor the child, not expose them.',
    storyCta: 'View impact stories',
    storyImageAlt: 'Children studying in a classroom in Cameroon.',
    storyCaption: 'A story should point to hope, courage, learning, and community, not to spectacle.',
    trustEyebrow: 'Stewardship matters',
    trustTitle: 'Every gift entrusted to the foundation is handled with care.',
    trustBody: 'Transparency belongs here as a support to trust, not as the main story. We work to ensure support reaches educational needs while maintaining responsible records and oversight.',
    trustPoints: ['Donation receipts', 'Impact reporting', 'School support records', 'Responsible governance'],
    finalEyebrow: 'Covenant giving',
    finalTitle: 'Giving from a covenant, not from leftovers.',
    finalBody: "We believe generosity begins with responsibility toward one another. When a child's education is threatened by circumstances beyond their control, we respond not out of excess, but out of commitment, compassion, and shared purpose.",
    finalPrimaryCta: 'Support a child',
    finalSecondaryCta: 'Apply for assistance',
  },
  fr: {
    eyebrow: 'Donner par alliance, pas avec les restes.',
    heading: 'Fondation TriumphChi',
    lead: "Dans le Cameroun rural, beaucoup d'enfants ne sont qu'à un frais scolaire, un uniforme ou une inscription à l'examen de quitter l'école. Nous existons pour les aider à rester, apprendre et avancer avec dignité.",
    primaryCta: 'Soutenir un enfant',
    secondaryCta: 'Demander une aide',
    heroImageAlt: 'Une enfant souriante dans une salle de classe au Cameroun.',
    heroSecondImageAlt: 'Des enfants et membres de famille devant une maison rurale au Cameroun.',
    heroNotes: [
      { title: "Les enfants restent à l'école", body: "Les obstacles scolaires sont levés avant qu'ils ne deviennent des raisons d'abandonner." },
      { title: 'Soutien pratique', body: 'Frais scolaires, fournitures, uniformes et frais d’examen.' },
      { title: 'Partenariat communautaire', body: 'Familles, écoles, églises et leaders locaux aident à identifier les vrais besoins.' },
    ],
    missionVisionEyebrow: 'Mission et vision',
    missionVisionTitle: "Un engagement envers les enfants dont l'éducation est menacée.",
    missionVisionImageAlt: 'Des enfants recevant un soutien éducatif avec des bénévoles communautaires.',
    missionVisionCaption: "La fondation agit avec compassion, relations locales et attention aux vrais besoins scolaires.",
    missionVisionCta: 'Lire davantage sur notre vision',
    mission: {
      tab: 'Mission',
      label: 'Notre mission',
      title: "Garder les enfants vulnérables à l'école avec dignité.",
      body: "La Fondation TriumphChi soutient les orphelins et enfants vulnérables au Cameroun en aidant à lever les obstacles scolaires pratiques, tout en entourant chaque enfant de soin, d'encouragement et de soutien communautaire.",
    },
    vision: {
      tab: 'Vision',
      label: 'Notre vision',
      title: "Un Cameroun où la difficulté n'arrête pas l'éducation d'un enfant.",
      body: "Nous imaginons des communautés rurales où les enfants touchés par la perte, la pauvreté ou une crise familiale peuvent rester à l'école, grandir en confiance et entrer dans l'âge adulte avec espérance.",
    },
    whyEyebrow: 'Pourquoi cette œuvre compte',
    whyTitle: 'Un petit obstacle peut fermer la porte de la classe.',
    whyBody: "Un enfant peut travailler dur toute l'année, réussir chaque classe, puis manquer un examen parce que les frais d'inscription ne peuvent pas être payés. Un cahier manquant, un uniforme usé ou la perte d'un parent ne devrait pas décider si un enfant reçoit une éducation. C'est là que le soutien communautaire devient précieux.",
    whyImageAlt: 'Des enfants écrivent dans leurs cahiers en classe.',
    whyCaption: "Une journée d'école tient parfois à des choses simples : une place en classe, un cahier, un uniforme, un frais d'examen et quelqu'un qui croit que l'enfant doit continuer.",
    needs: [
      { title: 'Frais scolaires', body: "Un enfant peut être renvoyé ou manquer les examens quand les frais ne sont pas payés." },
      { title: "Matériel d'apprentissage", body: 'Livres, cahiers, stylos et sacs rendent la présence en classe utile.' },
      { title: "Frais d'examen", body: "Les inscriptions et examens arrivent souvent quand les familles sont déjà sous pression." },
      { title: 'Mentorat et encouragement', body: 'Les enfants ont besoin d’adultes qui remarquent, écoutent et continuent avec eux.' },
    ],
    ruralEyebrow: 'Où nous servons',
    ruralTitle: 'Beaucoup de communautés rurales portent des luttes rarement visibles au-delà du village.',
    ruralBody: "La longue distance vers l'école, les ressources limitées, la difficulté économique et l'absence de soutien parental peuvent rendre l'apprentissage fragile. Pourtant ces communautés sont riches en résilience, foi, famille et détermination.",
    ruralImageAlt: "Des enfants rassemblés sur une route rouge d'un village au Cameroun.",
    ruralCaption: "Le Cameroun rural n'est pas seulement un lieu de besoin. C'est un lieu de résilience, de mémoire communautaire et d'enfants qui veulent encore apprendre.",
    ruralPoints: ["Longues distances vers l'école", "Ressources d'apprentissage limitées", 'Difficultés économiques', 'Familles et communautés résilientes'],
    assistanceEyebrow: "Besoin d'une aide scolaire ?",
    assistanceTitle: 'Aucun enfant ne devrait se sentir invisible.',
    assistanceBody: "La fondation reçoit des demandes de soutien scolaire venant des enfants et des personnes de confiance autour d'eux. Chaque demande doit être traitée avec soin, respect et sans honte publique.",
    assistance: [
      { title: 'Enfants cherchant du soutien', body: "Un enfant peut avoir besoin d'aide pour les frais, fournitures, examens ou le retour à l'école après une difficulté." },
      { title: 'Tuteurs, proches et écoles', body: "Les adultes proches de l'enfant peuvent expliquer la situation et commencer la demande." },
      { title: 'Églises et organisations locales', body: 'Les communautés peuvent identifier les besoins et aider les enfants à trouver une assistance.' },
      { title: 'Étude respectueuse', body: 'Les demandes sont examinées avec dignité afin de répondre aux vrais besoins scolaires.' },
    ],
    assistanceCta: 'Demander une aide',
    workEyebrow: 'Notre œuvre',
    workTitle: 'Nous marchons avec les enfants, familles, écoles et communautés.',
    workBody: "Le travail ne consiste pas seulement à recevoir des dons. Il faut être présent, écouter, apporter une aide scolaire pratique et suivre l'enfant avec soin.",
    workImageAlt: 'Des enfants apprennent dehors sous un arbre.',
    workSecondImageAlt: 'Une classe d’enfants souriants levant les mains.',
    work: [
      { title: 'Parrainage éducatif', body: "Aider les enfants à rester à l'école grâce à un soutien scolaire direct." },
      { title: "Livres et matériel d'apprentissage", body: 'Fournir les outils qui rendent la participation scolaire possible.' },
      { title: 'Présence communautaire', body: 'Travailler avec les familles, écoles, églises et leaders locaux.' },
      { title: 'Mentorat et encouragement', body: 'Soutenir les enfants par la présence, la prière et le suivi de leurs progrès.' },
    ],
    supportPathEyebrow: "Comment l'aide atteint un enfant",
    supportPathTitle: 'Chaque demande est accompagnée avec soin, du premier signalement au suivi.',
    supportPathBody: "Lorsqu'un besoin est signalé, la réponse doit être pratique, respectueuse et reliée aux personnes qui connaissent le mieux l'enfant.",
    supportPath: [
      { title: 'Besoin identifié', body: 'Un enfant, une école, un tuteur ou un leader communautaire prend contact.' },
      { title: 'Étude et vérification', body: 'La demande est examinée avec soin et respect.' },
      { title: 'Soutien apporté', body: "Les frais, fournitures, mentorat ou aide éducative sont organisés." },
      { title: 'Suivi continu', body: "Nous restons en lien avec les écoles, les familles et l'enfant." },
    ],
    impactEyebrow: 'Impact à visage humain',
    impactTitle: "La mesure, c'est un enfant qui continue l'école.",
    impactBody: "L'impact se voit dans les enfants soutenus, les écoles rejointes, les frais couverts, le matériel donné et les élèves qui continuent avec espérance.",
    impactLabels: {
      childrenSupported: 'Enfants soutenus',
      partnerSchools: 'Écoles partenaires',
      regionsReached: 'Régions rejointes',
      schoolContinuationRate: 'Taux de continuité scolaire',
    },
    impactFallbacks: {
      childrenSupported: '300+',
      partnerSchools: '12',
      regionsReached: '4',
      schoolContinuationRate: '95%',
    },
    impactFallbackNote: "Notre tableau d'impact grandit avec l'expansion des programmes.",
    storyEyebrow: 'Récits avec dignité',
    storyTitle: "Le but n'est jamais d'exposer la difficulté d'un enfant.",
    storyBody: "Le but est de célébrer la croissance, le courage, l'apprentissage et l'espérance tout en protégeant la vie privée et la dignité. Les récits publics doivent honorer l'enfant, pas l'exposer.",
    storyCta: "Voir les récits d'impact",
    storyImageAlt: 'Des enfants étudient dans une classe au Cameroun.',
    storyCaption: "Un récit doit parler d'espérance, de courage, d'apprentissage et de communauté, jamais de spectacle.",
    trustEyebrow: 'La gestion compte',
    trustTitle: 'Chaque don confié à la fondation est traité avec soin.',
    trustBody: "La transparence soutient la confiance, mais elle n'est pas l'histoire principale. Nous veillons à ce que l'aide rejoigne les besoins scolaires avec des dossiers et une surveillance responsables.",
    trustPoints: ['Reçus de don', "Rapports d'impact", 'Suivi du soutien scolaire', 'Gouvernance responsable'],
    finalEyebrow: "Don d'alliance",
    finalTitle: 'Donner par alliance, pas avec les restes.',
    finalBody: "Nous croyons que la générosité commence par la responsabilité les uns envers les autres. Quand l'éducation d'un enfant est menacée par des circonstances hors de son contrôle, nous répondons non par excès, mais par engagement, compassion et objectif partagé.",
    finalPrimaryCta: 'Soutenir un enfant',
    finalSecondaryCta: 'Demander une aide',
  },
} satisfies Record<Locale, LandingCopy>;
