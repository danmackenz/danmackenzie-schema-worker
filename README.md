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