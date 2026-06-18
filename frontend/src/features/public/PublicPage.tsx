import { ArrowRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { PageHeader } from '../../components/ui/PageHeader';
import { isLocale } from '../../lib/i18n';
import { buildPublicPageSchema, getPageByKey, getPublicPage, publicPages } from '../../content/publicPages';
import { LandingPage } from './landing/LandingPage';

export function PublicPage() {
  const { locale, pageSlug } = useParams();
  const activeLocale = isLocale(locale) ? locale : 'en';
  const page = getPublicPage(activeLocale, pageSlug);

  if (!page) {
    return <Navigate to={`/${activeLocale}`} replace />;
  }

  if (page.key === 'home') {
    return <LandingPage locale={activeLocale} page={page} />;
  }

  const ctaPage = page.cta ? getPageByKey(page.cta.page) : undefined;
  const Icon = page.icon;

  return (
    <section>
      <Seo
        meta={{
          title: page.title[activeLocale],
          description: page.description[activeLocale],
          path: page.path,
          locale: activeLocale,
        }}
        structuredData={buildPublicPageSchema(page, activeLocale)}
      />

      <PageHeader
        eyebrow={page.eyebrow[activeLocale]}
        title={page.title[activeLocale]}
        description={page.description[activeLocale]}
        action={
          ctaPage ? (
            <Link
              to={`/${activeLocale}${ctaPage.path[activeLocale]}`}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-foundation-600 px-4 text-sm font-semibold text-white transition hover:bg-foundation-900"
            >
              {page.cta?.label[activeLocale]}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null
        }
      />

      <div className="mb-6 rounded-md border border-foundation-100 bg-white p-5 shadow-sm">
        <Icon className="mb-4 h-7 w-7 text-foundation-600" aria-hidden="true" />
        <p className="max-w-3xl text-sm leading-6 text-ink-500">
          {activeLocale === 'fr'
            ? 'Cette page utilise des métadonnées localisées, des liens alternatifs et des données structurées réutilisables.'
            : 'This page uses localized metadata, alternate language links, and reusable structured data from a shared page definition.'}
        </p>
      </div>

      <PublicSectionGrid pageKey={page.key} />
    </section>
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

