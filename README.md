# Vinmar Solutions LLC — Website

Static marketing site for Vinmar Solutions LLC, a family owned & operated commercial and
residential lawn care company serving Saratoga County and the Capital Region (Ballston Spa, NY).

**Live site:** https://vinmar-solutions-llc.pages.dev

## Structure

```
index.html        Home
services.html     Services / lawn care program
lawn-talk.html    Lawn Talk (watering, mowing, overseeding, moss, moles)
products.html     Products & Labels (PDFs grouped by category)
css/style.css     Styles
js/main.js        Mobile nav + scroll animations
images/           Photography (see images/CREDITS.txt) + logo assets
pdfs/             Product label + watering info PDFs
```

## Local preview

```bash
python3 -m http.server 8765
# then open http://localhost:8765
```

## Deploy (Cloudflare Pages)

```bash
npx wrangler pages deploy . --project-name vinmar-solutions-llc --branch main --commit-dirty=true
```

## Contact

- Office: 518-691-5200 (call or text)
- Email: vinmarsolutions@nycap.rr.com
- Ballston Spa, NY 12020
