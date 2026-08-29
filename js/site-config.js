window.VinmarSite = Object.freeze({
  businessName: 'Vinmar Solutions LLC',
  phoneDisplay: '518-691-5200',
  phoneHref: 'tel:15186915200',
  email: 'vinmarsolutions@nycap.rr.com',
  location: 'Ballston Spa, NY 12020',
  serviceArea: 'Saratoga County and the Capital Region',
  availability: 'Currently booked for the 2026 season · Future-season inquiries welcome',
  copyrightYear: new Date().getFullYear(),
  analytics: {
    // Cloudflare Web Analytics beacon token. Leave empty to disable analytics.
    // Get it from: Cloudflare dashboard → Web Analytics → (site) → "JS snippet"
    // (copy only the value of data-cf-beacon's "token"). No token = no beacon loads.
    cloudflareToken: '',
    // Optional endpoint for the lightweight custom-event beacons (phone/email/PDF/
    // CTA/nav clicks). Cloudflare Web Analytics is pageview-only, so events no-op
    // unless you point this at a collector you control (e.g. a Cloudflare Worker).
    eventEndpoint: ''
  },
  navigation: [
    { key: 'home', label: 'Home', href: 'index.html' },
    { key: 'services', label: 'Services', href: 'services.html' },
    { key: 'lawn-talk', label: 'Lawn Talk', href: 'lawn-talk.html' },
    { key: 'products', label: 'Product Labels', href: 'products.html' }
  ]
});
