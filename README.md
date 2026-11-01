# Brik Systems

Marketing website, booking integration, and client portal.

## Open the website

- Open `index.html` for the local source website.
- Navigation opens actual files such as `pages/contact/index.html` and `pages/services/web-design/index.html`.
- Open `dist/index.html` to inspect the production build locally.
- Hosted navigation uses clean URLs such as `/contact/` and `/services/web-design/`.
- Old `#/contact` links redirect to the corresponding page.

## Commands

`npm install` installs dependencies.

`npm run dev` regenerates pages and starts the Vite development server.

`npm run build` regenerates pages, checks TypeScript, and creates a clean production build in `dist/`. Files are written sequentially for Windows compatibility.

`npm run check:pages` verifies local and production navigation, nested asset paths, hosted URLs, and legacy hash-link redirects.

`npm run preview` previews the production build.

`npm run server` starts the separate Express booking backend. Configure its environment variables before use; see `.env.example`.

## Project layout

| Location | Purpose |
| --- | --- |
| `index.html` | Main application/template: page views, shared styling, animation, and components |
| `pages/` | Generated public, service, portal, and administration HTML documents |
| `public/` | Canonical static assets, videos, logos, icons, sitemap, and robots.txt |
| `scripts/pages.js` | Shared page manifest: paths, routes, titles, and descriptions |
| `scripts/generate-pages.js` | Generates page documents from the main template |
| `scripts/build.js` | Validates and builds the production website |
| `scripts/check-pages.js` | Verifies document navigation and asset resolution |
| `api/` | Vercel booking and availability handlers |
| `server/` | Express backend and SMS Reminder integration |
| `database/` | Supabase SQL definitions |
| `n8n/` | Automation workflow definitions and setup documentation |
| `src/` | TypeScript data helpers, shared types, and seed configuration |
| `dist/` | Generated production output; deploy this folder |

## Editing

Edit `index.html` for shared design or component changes, then run `npm run build`. Generated files under `pages/` are overwritten during generation.

To add or rename a page, edit `scripts/pages.js`. Its entries drive both generation and Vite's build inputs. Use `siteHref('#/contact')` to obtain the correct local or hosted URL, and `navigateTo('#/contact')` for programmatic navigation. The route strings are internal page identifiers; visitor-facing links use actual documents, without hash routing.

The homepage logo strip is configured in `HomeBrandMarquee`. Its 20 original wordmarks live in `public/assets/brand-strip/` and are labeled as portfolio names and brand concepts.

Historical patch scripts, screenshot experiments, and exact duplicate root assets were removed from the active project and retained in an external recovery backup. Runtime source, dependencies, database files, and active public assets remain in the folders above.
