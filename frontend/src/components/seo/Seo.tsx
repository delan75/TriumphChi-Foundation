import { useEffect } from 'react';
import { absoluteUrl, buildAlternateLinks, localizedUrl, SeoMeta } from '../../lib/seo';
import { siteConfig } from '../../lib/site';
import { locales } from '../../lib/i18n';

interface SeoProps {
  meta: SeoMeta;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function Seo({ meta, structuredData }: SeoProps) {
  useEffect(() => {
    const pageUrl = localizedUrl(meta.locale, meta.path[meta.locale]);
    const image = absoluteUrl(meta.image ?? siteConfig.defaultImage);
    const imageAlt = meta.imageAlt ?? siteConfig.defaultImageAlt;
    const title = formatTitle(meta.title, meta.locale);

    document.documentElement.lang = meta.locale;
    document.title = title;

    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'application-name', siteConfig.name);
    upsertMeta('name', 'theme-color', siteConfig.themeColor);
    upsertMeta('property', 'og:site_name', siteConfig.name);
    upsertMeta('property', 'og:locale', siteConfig.localeNames[meta.locale]);
    document.head
      .querySelectorAll<HTMLMetaElement>('meta[property="og:locale:alternate"][data-managed-seo="true"]')
      .forEach((tag) => tag.remove());
    locales
      .filter((locale) => locale !== meta.locale)
      .forEach((locale) => upsertMeta('property', 'og:locale:alternate', siteConfig.localeNames[locale], locale));
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:type', meta.type ?? 'website');
    upsertMeta('property', 'og:url', pageUrl);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:image:secure_url', image);
    upsertMeta('property', 'og:image:alt', imageAlt);
    upsertMeta('property', 'og:image:width', String(siteConfig.defaultImageWidth));
    upsertMeta('property', 'og:image:height', String(siteConfig.defaultImageHeight));
    upsertArticleMeta(meta);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', image);
    upsertMeta('name', 'twitter:image:alt', imageAlt);
    maybeUpsertMeta('name', 'twitter:site', siteConfig.twitterSite);
    maybeUpsertMeta('name', 'twitter:creator', siteConfig.twitterCreator);
    upsertRobots(meta.noIndex);
    upsertCanonical(pageUrl);
    upsertAlternateLinks(buildAlternateLinks(meta.path));
    upsertStructuredData(structuredData);
  }, [meta, structuredData]);

  return null;
}

function formatTitle(title: string, locale: 'en' | 'fr'): string {
  const brand = locale === 'fr' ? 'Fondation TriumphChi' : siteConfig.name;
  return title.includes(siteConfig.name) || title.includes('Fondation TriumphChi') ? title : `${title} | ${brand}`;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string, instance?: string) {
  const selector = instance
    ? `meta[${attribute}="${key}"][data-managed-seo-instance="${instance}"]`
    : `meta[${attribute}="${key}"]:not([data-managed-seo-instance])`;
  const tag = document.head.querySelector<HTMLMetaElement>(selector) ?? document.createElement('meta');
  tag.setAttribute(attribute, key);
  tag.dataset.managedSeo = 'true';

  if (instance) {
    tag.dataset.managedSeoInstance = instance;
  }

  tag.content = content;
  document.head.appendChild(tag);
}

function maybeUpsertMeta(attribute: 'name' | 'property', key: string, content: string | undefined) {
  if (!content) {
    document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"][data-managed-seo="true"]`)?.remove();
    return;
  }

  upsertMeta(attribute, key, content);
}

function upsertRobots(noIndex: boolean | undefined) {
  upsertMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');
}

function upsertArticleMeta(meta: SeoMeta) {
  if (meta.type !== 'article') {
    document.head
      .querySelectorAll<HTMLMetaElement>('meta[property^="article:"][data-managed-seo="true"]')
      .forEach((tag) => tag.remove());
    return;
  }

  maybeUpsertMeta('property', 'article:published_time', meta.publishedTime);
  maybeUpsertMeta('property', 'article:modified_time', meta.modifiedTime);
  maybeUpsertMeta('property', 'article:section', meta.section);

  document.head
    .querySelectorAll<HTMLMetaElement>('meta[property="article:tag"][data-managed-seo="true"]')
    .forEach((tag) => tag.remove());

  meta.tags?.forEach((tag, index) => upsertMeta('property', 'article:tag', tag, String(index)));
}

function upsertCanonical(href: string) {
  const tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement('link');
  tag.rel = 'canonical';
  tag.href = href;
  document.head.appendChild(tag);
}

function upsertAlternateLinks(links: Array<{ hrefLang: string; href: string }>) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());

  links.forEach((link) => {
    const tag = document.createElement('link');
    tag.rel = 'alternate';
    tag.hreflang = link.hrefLang;
    tag.href = link.href;
    tag.dataset.managedAlternate = 'true';
    document.head.appendChild(tag);
  });
}

function upsertStructuredData(data: Record<string, unknown> | Array<Record<string, unknown>> | undefined) {
  document.head
    .querySelectorAll<HTMLScriptElement>('script[data-managed-structured-data="true"]')
    .forEach((tag) => tag.remove());

  document.getElementById('structured-data')?.remove();

  if (!data) {
    return;
  }

  const items = Array.isArray(data) ? data : [data];

  items.forEach((item, index) => {
    const tag = document.createElement('script');
    tag.id = index === 0 ? 'structured-data' : `structured-data-${index + 1}`;
    tag.type = 'application/ld+json';
    tag.dataset.managedStructuredData = 'true';
    tag.textContent = JSON.stringify(item);
    document.head.appendChild(tag);
  });
}
