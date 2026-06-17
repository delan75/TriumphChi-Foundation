import { useEffect } from 'react';
import { buildAlternateLinks, localizedUrl, SeoMeta } from '../../lib/seo';
import { siteConfig } from '../../lib/site';

interface SeoProps {
  meta: SeoMeta;
  structuredData?: Record<string, unknown>;
}

export function Seo({ meta, structuredData }: SeoProps) {
  useEffect(() => {
    document.documentElement.lang = meta.locale;
    document.title = `${meta.title} | ${siteConfig.name}`;

    upsertMeta('name', 'description', meta.description);
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', localizedUrl(meta.locale, meta.path[meta.locale]));
    upsertMeta('property', 'og:image', meta.image ?? siteConfig.defaultImage);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertRobots(meta.noIndex);
    upsertCanonical(localizedUrl(meta.locale, meta.path[meta.locale]));
    upsertAlternateLinks(buildAlternateLinks(meta.path));
    upsertStructuredData(structuredData);
  }, [meta, structuredData]);

  return null;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`;
  const tag = document.head.querySelector<HTMLMetaElement>(selector) ?? document.createElement('meta');
  tag.setAttribute(attribute, key);
  tag.content = content;
  document.head.appendChild(tag);
}

function upsertRobots(noIndex: boolean | undefined) {
  upsertMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');
}

function upsertCanonical(href: string) {
  const tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement('link');
  tag.rel = 'canonical';
  tag.href = href;
  document.head.appendChild(tag);
}

function upsertAlternateLinks(links: Array<{ hrefLang: string; href: string }>) {
  document.head.querySelectorAll('link[data-managed-alternate="true"]').forEach((node) => node.remove());

  links.forEach((link) => {
    const tag = document.createElement('link');
    tag.rel = 'alternate';
    tag.hreflang = link.hrefLang;
    tag.href = link.href;
    tag.dataset.managedAlternate = 'true';
    document.head.appendChild(tag);
  });
}

function upsertStructuredData(data: Record<string, unknown> | undefined) {
  const id = 'structured-data';
  const existing = document.getElementById(id);

  if (!data) {
    existing?.remove();
    return;
  }

  const tag = (existing as HTMLScriptElement | null) ?? document.createElement('script');
  tag.id = id;
  tag.type = 'application/ld+json';
  tag.textContent = JSON.stringify(data);
  document.head.appendChild(tag);
}
