import { Locale, locales } from './i18n';
import { siteConfig } from './site';

export interface SeoMeta {
  title: string;
  description: string;
  path: Record<Locale, string>;
  locale: Locale;
  image?: string;
  noIndex?: boolean;
}

export interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export function localizedUrl(locale: Locale, path: string): string {
  return `${siteConfig.url}/${locale}${path === '/' ? '' : path}`;
}

export function buildAlternateLinks(path: Record<Locale, string>) {
  return locales.map((locale) => ({
    hrefLang: locale,
    href: localizedUrl(locale, path[locale]),
  }));
}

export function buildOrganizationSchema(locale: Locale): Record<string, unknown> {
  return {
    '@type': 'NGO',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: localizedUrl(locale, '/'),
    areaServed: 'Cameroon',
    nonprofitStatus: 'NonprofitType',
    knowsAbout: ['Education sponsorship', 'Orphan education', 'Child safeguarding', 'School support'],
    sameAs: siteConfig.sameAs,
  };
}

export function buildWebSiteSchema(locale: Locale): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: localizedUrl(locale, '/'),
    inLanguage: locale,
    publisher: { '@id': `${siteConfig.url}/#organization` },
  };
}
