import { ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PublicPageTitle } from '../../components/public/PublicPageTitle';
import { Seo } from '../../components/seo/Seo';
import { isLocale } from '../../lib/i18n';
import { buildPublicPageSchema, getPageByKey, getPublicPage, publicPages } from '../../content/publicPages';
import { LandingPage } from './landing/LandingPage';
import { AboutPage } from './about/AboutPage';
import { ApplyPage } from './apply/ApplyPage';
import { ProgramsPage } from './programs/ProgramsPage';
import { SponsorPage } from './sponsor/SponsorPage';
import { ContactPage } from './contact/ContactPage';
import { PrivacyPolicyPage } from './privacy/PrivacyPolicyPage';
import { ImpactPage } from './impact/ImpactPage';
import { NotFoundPage } from '../errors/NotFoundPage';
import defaultPageHeroImage from '../../assets/landing/rural_kids.jpg';

export function PublicPage() {
  const { locale, pageSlug } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const page = getPublicPage(activeLocale, pageSlug);

  if (!page) {
    return <NotFoundPage locale={activeLocale} />;
  }

  if (page.key === 'home') {
    return <LandingPage locale={activeLocale} page={page} />;
  }

  if (page.key === 'about') {
    return <AboutPage locale={activeLocale} page={page} />;
  }

  if (page.key === 'programs') {
    return <ProgramsPage locale={activeLocale} page={page} />;
  }

  if (page.key === 'impact') {
    return <ImpactPage locale={activeLocale} page={page} />;
  }

  if (page.key === 'sponsor') {
    return <SponsorPage locale={activeLocale} page={page} />;
  }

  if (page.key === 'contact') {
    return <ContactPage locale={activeLocale} page={page} />;
  }

  if (page.key === 'apply') {
    return <ApplyPage locale={activeLocale} page={page} />;
  }

  if (page.key === 'privacy') {
    return <PrivacyPolicyPage locale={activeLocale} page={page} />;
  }

  const ctaPage = page.cta ? getPageByKey(page.cta.page) : undefined;
  const Icon = page.icon;
  const homePage = getPageByKey('home');

  return (
    <>
      <Seo
        meta={{
          title: page.seoTitle?.[activeLocale] ?? page.title[activeLocale],
          description: page.seoDescription?.[activeLocale] ?? page.description[activeLocale],
          path: page.path,
          locale: activeLocale,
          image: defaultPageHeroImage,
        }}
        structuredData={buildPublicPageSchema(page, activeLocale)}
      />

      <PublicPageTitle
        locale={activeLocale}
        title={page.title[activeLocale]}
        description={page.description[activeLocale]}
        backgroundImage={defaultPageHeroImage}
        backgroundAlt={
          activeLocale === 'fr'
            ? 'Des enfants dans une communauté rurale du Cameroun.'
            : 'Children in a rural community in Cameroon.'
        }
        breadcrumbs={[
          { label: homePage.label[activeLocale], to: `/${activeLocale}${homePage.path[activeLocale]}` },
          { label: page.label[activeLocale] },
        ]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-6 rounded-md border border-foundation-100 bg-foundation-50 p-5">
            <Icon className="mb-4 h-7 w-7 text-foundation-600" aria-hidden="true" />
            <p className="max-w-3xl text-sm leading-6 text-ink-600">
              {activeLocale === 'fr'
                ? 'Cette page est en préparation avec le même modèle public, bilingue et respectueux de la vie privée.'
                : 'This page is being prepared with the same public, bilingual, privacy-conscious page model.'}
            </p>
          </div>

          <PublicSectionGrid pageKey={page.key} />

          {ctaPage ? (
            <Link
              to={`/${activeLocale}${ctaPage.path[activeLocale]}`}
              className="focus-ring mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-foundation-600 px-5 text-sm font-black text-white transition hover:bg-foundation-900"
            >
              {page.cta?.label[activeLocale]}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </section>
    </>
  );
}

function PublicSectionGrid({ pageKey }: { pageKey: string }) {
  const { locale } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const currentPage = publicPages.find((page) => page.key === pageKey);
  const sections = currentPage?.sections.length ? currentPage.sections : fallbackSections(activeLocale);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sections.map((section) => (
        <article key={section.title[activeLocale]} className="rounded-md border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink-900">{section.title[activeLocale]}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">{section.body[activeLocale]}</p>
        </article>
      ))}
    </div>
  );
}

function fallbackSections(locale: 'en' | 'fr') {
  return [
    {
      title: { en: 'SEO-ready structure', fr: 'Structure prête pour le SEO' },
      body: {
        en: 'Titles, descriptions, canonical URLs, alternate links, and schema data are declared once in the content registry.',
        fr: 'Les titres, descriptions, URL canoniques, liens alternatifs et schémas sont déclarés une seule fois.',
      },
    },
    {
      title: { en: 'Bilingual by default', fr: 'Bilingue par défaut' },
      body: {
        en: 'Every public page owns English and French labels, slugs, metadata, and page copy.',
        fr: 'Chaque page publique possède ses libellés, slugs, métadonnées et contenus en anglais et en français.',
      },
    },
    {
      title: { en: 'Privacy boundary', fr: 'Limite de confidentialité' },
      body: {
        en: 'Public pages are designed for curated content and aggregate reporting, not private beneficiary records.',
        fr: 'Les pages publiques sont conçues pour le contenu validé et les données agrégées, pas les dossiers privés.',
      },
    },
  ].map((section) => ({
    title: { en: section.title.en, fr: section.title.fr },
    body: { en: section.body.en, fr: section.body.fr },
  }));
}

