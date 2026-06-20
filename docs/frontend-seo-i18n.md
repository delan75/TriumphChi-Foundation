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

## Future Improvements

- Add server-side rendering or static prerendering for stronger SEO indexing.
- Generate `sitemap.xml` and `robots.txt` from the public page registry.
- Add article-level schema for blog and news entries.
- Add consent-aware media metadata for public success stories.
- Add `noindex` metadata for private portal and staff routes.

