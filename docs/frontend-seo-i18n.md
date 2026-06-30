# Frontend SEO and Multilingual Plan

## Principles

- Public pages are SEO-ready from day one.
- English and French content must share the same page model.
- Page title, description, canonical URL, alternate URLs, and JSON-LD schema are declared once per page.
- Public SEO pages must never expose private beneficiary records.
- Authenticated app pages should generally be `noindex` once auth SEO handling is added.

## Current Structure

The public site uses:

- `frontend/src/content/publicPages.ts` for localized page definitions
- `frontend/src/components/public/PublicPageTitle.tsx` for shared non-home public page heroes with breadcrumbs, H1, description, image overlays, and accessible image text
- `frontend/src/components/seo/Seo.tsx` for document metadata, canonical links, alternate language links, Open Graph tags, Twitter card tags, robots tags, and JSON-LD
- `frontend/src/features/public/PublicPage.tsx` as the shared page renderer
- `frontend/src/features/public/about/AboutPage.tsx` for the custom About page content structure
- `frontend/src/features/public/sponsor/SponsorPage.tsx` for the custom Sponsor a Child page, including ethical shared sponsorship messaging and privacy-first accountability copy
- `frontend/src/features/public/contact/ContactPage.tsx` for the custom Contact page, including a mobile-first public form, safeguarding notice, and internal links to related public pages
- `frontend/src/lib/seo.ts` for schema and URL helpers
- `frontend/src/lib/i18n.ts` for supported locales and UI messages
- `frontend/public/robots.txt` for crawl directives that keep authenticated, auth, and API-style paths out of search
- `frontend/public/sitemap.xml` for the current localized public route inventory with `hreflang` alternates
- `frontend/public/og/triumphchi-foundation.jpg` as the default Open Graph and Twitter preview image

The SEO component now emits richer social metadata, including `og:site_name`, `og:locale`, alternate Open Graph locales, image dimensions, image alt text, Twitter image metadata, theme color, and application name. Public JSON-LD uses a graph that can include Organization, WebSite, WebPage, BreadcrumbList, FAQPage, and DonateAction where appropriate.

## Localized Routes

Examples:

- English home: `/en`
- French home: `/fr`
- English about: `/en/about`
- French about: `/fr/a-propos`
- English sponsor page: `/en/sponsor-a-child`
- French sponsor page: `/fr/parrainer-un-enfant`
- English contact page: `/en/contact`
- French contact page: `/fr/contact`

## Locale Recovery and 404 Handling

Routes are locale-aware at the application boundary. If a visitor enters a known route without a locale prefix, the router resolves the best locale and redirects before rendering the page.

Examples:

- `/contact` redirects to `/en/contact` or `/fr/contact`
- `/about?ref=church` preserves the query string during recovery
- `/nonexistent-page` redirects to the resolved localized URL, then renders the shared 404 page if no localized route exists

Locale recovery uses this order:

1. Authenticated user preference from the stored user profile
2. Stored application locale preference
3. Locale cookie
4. Session locale preference
5. Browser language
6. Application fallback locale

Unknown routes with a valid locale prefix render the shared 404 experience instead of redirecting to the home page. The 404 page is localized, marked `noindex`, and uses contextual navigation for public visitors and authenticated users.

This is currently a client-rendered Vite app. The frontend sets noindex metadata for missing pages, but a true HTTP 404 status for direct URL requests requires server, CDN, or future SSR/static-prerender handling.

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

## Public Content Tone

The public website is mission-led. It should explain orphan education support, rural Cameroon, dignity, community partnership, and covenant-driven generosity. It should not read like a software product, platform feature list, or ecommerce donation page.

The Home, About, Sponsor a Child, and Contact pages have custom public layouts. Other public pages use the shared public page title component before their page-specific content.

The Sponsor a Child page should explain sponsorship as covenant-driven education support, not child ownership. It should clearly communicate that children may be supported through full sponsorship, shared sponsorship, educational needs sponsorship, and a general education fund so support can be allocated fairly across beneficiaries.

The Contact page should guide donors, families, schools, churches, volunteers, and partners toward the right next step while avoiding sensitive beneficiary details in public form submissions.

## Current SPA Limitations

This remains a client-rendered Vite SPA. The app updates metadata after React mounts, which is acceptable for many modern crawlers but is weaker than SSR or prerendering for first-response HTML. The base `index.html` includes a conservative default metadata set so social crawlers and simple bots receive meaningful tags before the route-specific metadata is applied.

Authenticated staff routes set `noindex,nofollow` at the shell level so private workspace screens do not inherit public page metadata during navigation.

## Future Improvements

- Add server-side rendering or static prerendering for stronger SEO indexing.
- Generate `sitemap.xml` and `robots.txt` from the public page registry instead of maintaining the static public files by hand.
- Add article-level schema for blog and news entries.
- Add consent-aware media metadata for public success stories.
- Consider `react-helmet-async` when prerendering, SSR, or nested route metadata become a priority. The current manual SEO layer is kept small and dependency-free, but Helmet would reduce DOM reconciliation code and make SSR migration cleaner.

