# Frontend dependency migration

The frontend uses React 18, TypeScript 5, React Router 7, Tailwind CSS 4, Vite 8, and ESLint 10. Use Node.js 24, matching the package engines and CI. Exact installed versions are recorded in `package-lock.json`; use `npm ci` for a reproducible installation.

## Compatibility and conventions

- React Router keeps the existing nested data-router architecture, locale recovery, and public/staff guards. Page components and the staff shell use dynamic imports; keep authentication and locale wrappers eager so they can redirect before protected page code loads.
- Tailwind's theme lives in `src/styles.css`, and PostCSS uses `@tailwindcss/postcss`. Put element resets in `@layer base` so they do not override utility classes. Tailwind 4 requires Safari 16.4+, Chrome 111+, or Firefox 128+; see the [official upgrade guide](https://tailwindcss.com/docs/upgrade-guide).
- ESLint uses a flat configuration. Follow existing hook dependencies and preserve editor initialization by record identity so background refetches do not overwrite unsaved changes.
- Builds generate source maps and a local `stats.html` bundle visualization. Neither generated output belongs in version control. Source maps publish frontend source when deployed.
- Backend impact data remains authoritative. Preserve valid zero values and distinguish loading, unavailable figures, and descriptive program categories. Reuse the shared impact formatters rather than duplicating validation rules.

## Validate changes

Run from `frontend/`:

```sh
npm ci
npm run lint
npx playwright install chromium
npm run test:browser
```

The build includes TypeScript checks. Browser tests use the production preview on desktop and mobile Chromium, covering locale navigation, protected redirects, OAuth exchange, on-demand chunks, impact-data fallbacks, public discovery responses, metadata, and source maps. API/provider responses are mocked where required; tests do not process real donations or authenticate with external providers. The frontend CI workflow installs dependencies and runs its configured security, lint, and browser checks.

## Release an upgraded frontend

Configure `VITE_API_BASE_URL` and public contact values before building; environment values are compiled into the bundle. Never place secrets in `VITE_*` variables.

Publish the entire `dist/` directory, including HTML, shared chunks, source maps, and `.well-known/`. Serve static files before the SPA fallback, keep HTML current, and retain old hashed chunks across releases. Verify the exact build after deployment:

```sh
npm run verify:deployment -- https://triumphchi.org
```

The verifier performs read-only requests and reports stale entry points, missing shared chunks/maps, or discovery resources served as HTML. See the [project README](../README.md#frontend-checks-and-deployment) for onboarding, local preview, and deployment steps. Performance claims require measurements against the deployed build; local bundle sizes alone do not establish production speed.
