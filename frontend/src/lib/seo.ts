import { Locale, defaultLocale, locales } from './i18n';
import { siteConfig } from './site';

export interface SeoMeta {
  title: string;
  description: string;
  path: Record<Locale, string>;
  locale: Locale;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export function localizedUrl(locale: Locale, path: string): string {
  const cleanPath = canonicalPath(path);

  return `${siteConfig.url}/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

export function absoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${siteConfig.url}${value}`;
  }

  return `${siteConfig.url}/${value}`;
}

export function canonicalPath(path: string): string {
  const withoutHash = path.split('#')[0] ?? '/';
  const withoutQuery = withoutHash.split('?')[0] ?? '/';
  const normalized = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;

  if (normalized.length > 1 && normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

export function buildAlternateLinks(path: Record<Locale, string>) {
  return [
    ...locales.map((locale) => ({
      hrefLang: locale,
      href: localizedUrl(locale, path[locale]),
    })),
    {
      hrefLang: 'x-default',
      href: localizedUrl(defaultLocale, path[defaultLocale]),
    },
  ];
}

export function buildOrganizationSchema(locale: Locale): Record<string, unknown> {
  const imageUrl = absoluteUrl(siteConfig.defaultImage);

  return {
    '@type': 'NGO',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: localizedUrl(locale, '/'),
    areaServed: 'Cameroon',
    nonprofitStatus: 'NonprofitType',
    knowsAbout: ['Education sponsorship', 'Orphan education', 'Child safeguarding', 'School support'],
    logo: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: siteConfig.defaultImageWidth,
      height: siteConfig.defaultImageHeight,
    },
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      caption: siteConfig.defaultImageAlt,
      width: siteConfig.defaultImageWidth,
      height: siteConfig.defaultImageHeight,
    },
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

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqSchema(items: Array<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildJsonLdGraph(nodes: Array<Record<string, unknown> | undefined | false>): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean) as Array<Record<string, unknown>>,
  };
}
