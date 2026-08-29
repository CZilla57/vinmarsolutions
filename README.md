# Vinmar Solutions LLC — Website

Static marketing site for Vinmar Solutions LLC, a family owned & operated commercial and
residential lawn care company serving Saratoga County and the Capital Region (Ballston Spa, NY).

**Live site:** https://vinmar-solutions-llc.pages.dev
Hosted on **Cloudflare Pages** (project `vinmar-solutions-llc`). No framework, no build step —
plain HTML, CSS, and progressively-enhanced JavaScript.

## Structure

```
index.html          Home
services.html       Services / lawn care program
lawn-talk.html      Lawn Talk (watering, mowing, overseeding, moss, moles)
products.html       Products & Labels (PDFs grouped by category)
404.html            Branded not-found page
css/style.css       Styles + @font-face for the self-hosted fonts
js/site-config.js   Shared navigation, contact, availability, analytics, copyright settings
js/main.js          Mobile nav + scroll animations
js/analytics.js     Cloudflare Web Analytics beacon + lightweight event tracking (fail-safe)
fonts/              Self-hosted Poppins + Inter (WOFF2, latin subset)
images/             Photography (see images/CREDITS.txt) + AVIF/JPG assets
pdfs/               Product label + watering info PDFs
_headers            Cloudflare Pages security headers + cache policy
sitemap.xml         XML sitemap    robots.txt   Crawl directives
scripts/            Local static server + quality-check scripts
.github/workflows/  CI (validation) + production deploy
```

## Requirements

- Node.js 20+ (for the automated checks and local tooling)
- The site itself needs no dependencies to run — any static server works.

## Local preview

Any static server works for a quick look:

```bash
python3 -m http.server 8765
# then open http://localhost:8765
```

Or use the bundled Node server (adds clean-URL routing like `/services` and a real 404):

```bash
npm run serve        # http://127.0.0.1:8788
```

To preview **with the real Cloudflare headers and cache policy** applied (recommended before a
deploy), use Wrangler's local Pages emulator:

```bash
npx wrangler pages dev . --port 8790
curl -sI http://127.0.0.1:8790/            # inspect security headers + Cache-Control
```

## Shared site settings

Edit `js/site-config.js` when the phone number, email, seasonal **availability**, navigation,
service area, analytics token, or copyright year changes. Each page keeps readable HTML as a
fallback, while the shared settings keep the live experience consistent.

## Fonts (self-hosted)

Poppins (600/700/800) and Inter (variable, 400–700) are self-hosted from `fonts/` as WOFF2
(latin subset) and declared with `@font-face` + `font-display: swap` at the top of
`css/style.css`. There are **no Google Fonts requests** — the previous `fonts.googleapis.com`
links and `preconnect` tags were removed and replaced with local `<link rel="preload">` hints.
System-font fallbacks are defined in the `--font` / `--display` CSS variables.

## Automated quality checks

Install dev dependencies once, then install the browser used by the accessibility check:

```bash
npm install
npx playwright install chromium
```

Run everything:

```bash
npm run check
```

Or run individually:

| Command | What it checks | Tool |
| --- | --- | --- |
| `npm run check:html` | HTML validity | `html-validate` |
| `npm run check:js` | JavaScript syntax (`node --check`) | Node built-in |
| `npm run check:seo` | `sitemap.xml` + `robots.txt` validity | custom script |
| `npm run check:links` | Broken internal links & missing assets | `linkinator` |
| `npm run check:a11y` | Accessibility, WCAG 2.1 AA | axe-core (via Playwright) |
| `npm run check:lighthouse` | Performance, accessibility, best-practices, SEO | Lighthouse CI |

### Thresholds and intentional exceptions

- **Accessibility, best-practices, SEO** are hard gates (Lighthouse `minScore` 0.95) and axe
  must report **zero** WCAG 2.1 AA violations.
- **Performance** is a **non-blocking warning** (target 0.90). Lighthouse performance scores
  vary widely on shared CI runners and are unreliable to fail a build on; the score is still
  reported every run. Local scores are ~87–94.
- **404 page SEO is not gated.** `404.html` is intentionally `noindex`, which Lighthouse's SEO
  category penalizes — expected for a not-found page. Its accessibility/best-practices are still
  gated.
- **External links are not crawled** by the link checker (only internal links and assets), to
  keep CI stable and independent of third-party sites.
- `html-validate` disables `void-style` and `tel-non-breaking` (see `.htmlvalidate.json`): the
  site consistently uses XHTML-style self-closing void tags and plain hyphens in phone numbers,
  both valid — these are style preferences, not defects.

## Analytics (Cloudflare Web Analytics — privacy-friendly)

No cookies, no cross-site tracking, no PII, and **no form content** is ever collected. Analytics
is entirely optional and fails safe — if it errors or is unconfigured, navigation and page
behavior are unaffected.

**To turn it on (site owner, one step):**

1. In the Cloudflare dashboard, go to **Web Analytics** → add this site → open the JS snippet.
2. Copy the value of `data-cf-beacon`'s `"token"` (a hex string).
3. Paste it into `js/site-config.js` → `analytics.cloudflareToken`. Commit & deploy.

When a token is set, `js/analytics.js` loads the official Cloudflare beacon
(`static.cloudflareinsights.com/beacon.min.js`) for **pageviews** only. Leaving the token empty
means no beacon loads. The Content-Security-Policy in `_headers` already allows this beacon.

**Custom events.** `js/analytics.js` also instruments a few high-signal interactions —
the “Ask About Next Season” CTA, telephone links, email links, Services-page navigation, and
product-label PDF links. Cloudflare Web Analytics is **pageview-only** and does not ingest custom
events, so these currently no-op unless you set `analytics.eventEndpoint` in `js/site-config.js`
to a collector you control (e.g. a Cloudflare Worker). The instrumentation only ever sends an
event name plus a coarse label (a PDF filename or nav destination) — never personal data.

## Security headers

Defined in `_headers` and applied by Cloudflare Pages to every response:

- **Content-Security-Policy** — restricts to same-origin CSS/JS/fonts/images, a `data:` favicon,
  and the Cloudflare Analytics beacon; `style-src` allows `'unsafe-inline'` for the pages' inline
  `style=""` attributes (no inline/eval JavaScript is used).
- **X-Content-Type-Options:** `nosniff`
- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **Permissions-Policy:** disables geolocation, camera, microphone, payment, USB, browsing-topics
- **X-Frame-Options:** `DENY` (plus CSP `frame-ancestors 'none'`) — clickjacking protection
- **Strict-Transport-Security:** 2-year HSTS with `includeSubDomains`

Telephone/email links, PDFs (opened as top-level navigations), and existing scripts/images are
unaffected. Verify locally with `npx wrangler pages dev .` then `curl -sI`.

## Caching

Set per-path in `_headers`. Cloudflare Pages *concatenates* headers from every matching rule, so
`Cache-Control` is set only on disjoint paths (security headers live on `/*`).

| Path | Cache-Control | Rationale |
| --- | --- | --- |
| HTML pages, clean URLs, `404.html` | `max-age=300, must-revalidate` | Content & seasonal availability update promptly |
| `js/site-config.js` | `max-age=300, must-revalidate` | Carries the availability message — must never be stale |
| `css/*`, `js/main.js`, `js/analytics.js` | `max-age=86400, stale-while-revalidate` | Not content-hashed → 1-day cache, not immutable |
| `fonts/*`, `images/*`, `pdfs/*` | `max-age=31536000, immutable` | Stable binary assets |
| `sitemap.xml`, `robots.txt` | `max-age=3600` | SEO/config files |

> If you later add content hashing to CSS/JS filenames, bump those to `immutable`.

## Deployment (Cloudflare Pages via GitHub Actions)

`.github/workflows/ci.yml` runs the quality checks on **every pull request** and on **pushes to
`main`**. Pull requests **validate only** — they never publish to production. On a push to `main`,
after checks pass, the `deploy` job publishes to production with Wrangler.

**Required repository secrets** (Settings → Secrets and variables → Actions). Never commit these:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | An API token with the **Cloudflare Pages → Edit** permission (My Profile → API Tokens → Create Token). |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (Workers & Pages → right sidebar, or `Overview`). |

> **If this project is instead connected through Cloudflare's built-in Git integration** (auto-build
> on push), disable the `deploy` job in `ci.yml` (or the dashboard auto-build) so you don't deploy
> twice. This repo is set up for Wrangler direct-upload.

### Manual / preview deploys

```bash
# Production (from a clean main):
npx wrangler pages deploy . --project-name vinmar-solutions-llc --branch main

# Preview (any other branch name → a unique preview URL, not production):
npx wrangler pages deploy . --project-name vinmar-solutions-llc --branch preview
```

### Deployment status

```bash
npx wrangler pages deployment list --project-name vinmar-solutions-llc
```

Or the Cloudflare dashboard → **Workers & Pages** → `vinmar-solutions-llc` → **Deployments**.
GitHub Actions runs are under the repo's **Actions** tab.

### Rollback

- **Dashboard (fastest):** Workers & Pages → `vinmar-solutions-llc` → Deployments → pick a
  previous successful deployment → **⋯ → Rollback to this deployment**.
- **Git:** revert the offending commit on `main` (`git revert <sha>` then push). CI re-runs and
  redeploys the previous good state.

## Contact

- Office: 518-691-5200 (call or text)
- Email: vinmarsolutions@nycap.rr.com
- Ballston Spa, NY 12020
