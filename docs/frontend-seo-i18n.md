# Frontend SEO and Multilingual Plan

## Principles

- Public pages are SEO-ready from day one.
- English and French content must share the same page model.
- Page title, description, canonical URL, alternate URLs, and JSON-LD schema are declared once per page.
- Public SEO pages must never expose private beneficiary records.
- Authenticated app pages should generally be `noindex` once auth SEO handling is added.

## Current Scaffold

The public site uses:

- `frontend/src/content/publicPages.ts` for localized page definitions
- `frontend/src/components/seo/Seo.tsx` for document metadata, canonical links, alternate language links, Open Graph tags, Twitter card tags, robots tags, and JSON-LD
- `frontend/src/features/public/PublicPage.tsx` as the shared page renderer
- `frontend/src/lib/seo.ts` for schema and URL helpers
- `frontend/src/lib/i18n.ts` for supported locales and UI messages

## Localized Routes

Examples:

- English home: `/en`
- French home: `/fr`
- English about: `/en/about`
- French about: `/fr/a-propos`
- English sponsor page: `/en/sponsor-a-child`
- French sponsor page: `/fr/parrainer-un-enfant`

## Public Page Inventory

- Home
- About
- Mission
- Vision
- Programs
- Impact
- Success Stories
- Blog
- News
- Contact
- Donate
- Apply
- Sponsor a Child
- Corporate Partnerships

## Future Improvements

- Add server-side rendering or static prerendering for stronger SEO indexing.
- Generate `sitemap.xml` and `robots.txt` from the public page registry.
- Add article-level schema for blog and news entries.
- Add consent-aware media metadata for public success stories.
- Add `noindex` metadata for private portal and staff routes.

