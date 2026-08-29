/*
 * Vinmar Solutions LLC — privacy-friendly analytics.
 *
 * Two independent, fail-safe layers:
 *   1. Cloudflare Web Analytics pageview beacon (loads only if a token is set in
 *      js/site-config.js → analytics.cloudflareToken).
 *   2. Lightweight custom-event tracking for a few high-signal interactions.
 *
 * Design rules:
 *   - Never block or alter navigation. No preventDefault, no synchronous work on
 *     the click path. Everything is wrapped in try/catch.
 *   - No PII and no form content is ever collected — only an event name plus a
 *     coarse, non-identifying label (e.g. a PDF filename or a nav destination).
 *   - If nothing is configured, every function degrades to a silent no-op.
 */
(function () {
  'use strict';

  var cfg = (window.VinmarSite && window.VinmarSite.analytics) || {};

  /* ---- 1. Cloudflare Web Analytics pageview beacon ---- */
  try {
    if (cfg.cloudflareToken) {
      var beacon = document.createElement('script');
      beacon.defer = true;
      beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: cfg.cloudflareToken }));
      document.head.appendChild(beacon);
    }
  } catch (e) { /* analytics must never break the page */ }

  /* ---- 2. Lightweight custom events ---- */
  function track(name, data) {
    try {
      if (!name) return;
      var payload = { event: name, path: location.pathname };
      if (data) {
        for (var k in data) {
          if (Object.prototype.hasOwnProperty.call(data, k)) payload[k] = data[k];
        }
      }
      // Route to a collector only if the owner has configured one. Cloudflare Web
      // Analytics does not ingest custom events, so without an endpoint this is a
      // no-op by design (the instrumentation is ready for a future collector).
      if (cfg.eventEndpoint && navigator.sendBeacon) {
        navigator.sendBeacon(cfg.eventEndpoint, JSON.stringify(payload));
      }
      // Expose to any tag manager / consumer that opts in later.
      if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    } catch (e) { /* swallow — tracking is best-effort */ }
  }
  // Make the tracker reusable elsewhere if needed.
  window.vinmarTrack = track;

  function fileName(href) {
    try { return decodeURIComponent(href.split('/').pop().split('?')[0]); }
    catch (e) { return ''; }
  }

  // One delegated listener covers every current and future matching link.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a, [data-track]') : null;
    if (!el) return;
    try {
      // Explicit opt-in wins.
      var explicit = el.getAttribute('data-track');
      if (explicit) { track(explicit); return; }

      var href = el.getAttribute('href') || '';
      if (/^tel:/i.test(href)) {
        track('phone_click');
      } else if (/^mailto:/i.test(href)) {
        track('email_click');
      } else if (/\.pdf(\?|#|$)/i.test(href)) {
        track('pdf_view', { file: fileName(href) });
      } else if (/(^|\/)services\.html(\?|#|$)/i.test(href)) {
        track('services_nav');
      }
    } catch (err) { /* ignore */ }
  }, true);
})();
