# Dan Mackenzie Schema Injector Worker

Cloudflare Worker that injects per-page JSON-LD structured data into Pixieset-served HTML using `HTMLRewriter`, so search engines can access page-level schema without editing Pixieset templates directly.

## Purpose

This project adds structured data to the live HTML response for selected pages on `www.danmackenzie.co.uk`. It is designed to output:

- Sitewide `Organization`
- Sitewide `WebSite`
- Route-level `WebPage` plus subtype where relevant
- `BreadcrumbList` based on the public URL structure

## Project structure

```text
src/worker.js
wrangler.jsonc
package.json
.gitignore
README.md
```

## Requirements

- Node.js installed
- Cloudflare account with Workers enabled
- Wrangler CLI installed through project dependencies
- Domain managed in Cloudflare

## Install

```bash
npm install
```

## Local development

```bash
npm run dev
```

## Validate config

```bash
npm run check
```

## Deploy

```bash
npm run deploy
```

## Cloudflare route

Attach this Worker to:

```text
www.danmackenzie.co.uk/*
```

If needed, also attach it to:

```text
danmackenzie.co.uk/*
```

## Notes

- Update the `logo` URL in `src/worker.js` to a real public asset.
- Update `sameAs` social profile URLs in `src/worker.js`.
- Confirm every mapped route matches the live public Pixieset URL exactly.
- Test key pages in Google Rich Results Test after deployment.

## Deployment workflow

1. Edit files locally.
2. Test with `npm run dev`.
3. Validate with `npm run check`.
4. Commit changes to Git.
5. Push to the connected GitHub repository.
6. Let Cloudflare deploy from Git integration.

## Why this exists

Pixieset does not allow clean native insertion of JSON-LD into the page head on all pages. This Worker solves that by injecting schema at the edge before the HTML is delivered to browsers and crawlers.

---

## Deployment notes (summary)

Two deployment options are supported:

- Cloudflare dashboard / Git integration — safe for production as account_id is not stored in the repo.
- Wrangler CLI / CI — set account_id and routes in wrangler.jsonc or pass as secrets in CI. See the commented examples in wrangler.jsonc.

Before production:

- Update `src/worker.js` logo and `sameAs` values to final public URLs.
- Verify routeMap entries match live Pixieset paths exactly.
- Run `npm run check` (wrangler --dry-run) and `npm run dev` for a preview.
- Deploy to staging and validate pages with Google's Rich Results Test.

Notes on security: do not commit account_id or API tokens to source control; use CI secrets or environment variables.

## Production configuration

- Production logo URL is now configured in src/worker.js as: https://assets.danmackenzie.co.uk/Logos/DM_Logo_FB.png
- sameAs social links are present (Instagram, LinkedIn). If additional profiles are required, update src/worker.js before deploy.

## Pre-production checklist

- Verify the production logo URL is live and crawlable: https://assets.danmackenzie.co.uk/Logos/DM_Logo_FB.png
- Confirm every sameAs URL in src/worker.js is accurate and intended for production
- Confirm live paths (Pixieset origin) return 2xx HTML responses for each mapped route
- Run: npm run check (wrangler --dry-run)
- Preview with: npm run dev and inspect injected <script type="application/ld+json"> in <head>
- Deploy to staging and test representative pages with Google Rich Results Test
- After staging validation, deploy to production and re-run Rich Results Test on key pages

