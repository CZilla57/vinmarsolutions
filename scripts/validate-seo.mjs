#!/usr/bin/env node
/*
 * Validates robots.txt and sitemap.xml without external dependencies.
 *
 * robots.txt : must exist, contain at least one User-agent group, and if it
 *              declares a Sitemap it must be an absolute http(s) URL.
 * sitemap.xml: must be well-formed enough to parse, use the sitemaps.org
 *              namespace, and every <url> must have an absolute <loc>. Optional
 *              <changefreq>/<priority> must use valid values.
 *
 * Exits non-zero on any error.
 */
import { readFile } from 'node:fs/promises';

const errors = [];
const warnings = [];

const CHANGEFREQ = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);

async function readText(path) {
  try { return await readFile(path, 'utf8'); }
  catch { return null; }
}

/* ---------- robots.txt ---------- */
const robots = await readText('robots.txt');
if (robots === null) {
  errors.push('robots.txt: file is missing');
} else {
  if (!/^\s*user-agent\s*:/im.test(robots)) {
    errors.push('robots.txt: no "User-agent:" directive found');
  }
  const sitemapLines = robots.match(/^\s*sitemap\s*:\s*(.+)$/gim) || [];
  for (const line of sitemapLines) {
    const url = line.split(/:(.+)/)[1].trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      errors.push(`robots.txt: Sitemap value is not an absolute URL: "${url}"`);
    }
  }
  if (sitemapLines.length === 0) {
    warnings.push('robots.txt: no Sitemap directive (optional, but recommended)');
  }
}

/* ---------- sitemap.xml ---------- */
const sitemap = await readText('sitemap.xml');
if (sitemap === null) {
  errors.push('sitemap.xml: file is missing');
} else {
  if (!/<urlset[\s>]/i.test(sitemap)) {
    errors.push('sitemap.xml: missing <urlset> root element');
  }
  if (!/xmlns\s*=\s*"https?:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/i.test(sitemap)) {
    errors.push('sitemap.xml: missing or wrong sitemaps.org 0.9 namespace');
  }
  const urlBlocks = sitemap.match(/<url>[\s\S]*?<\/url>/gi) || [];
  if (urlBlocks.length === 0) {
    errors.push('sitemap.xml: no <url> entries found');
  }
  urlBlocks.forEach((block, i) => {
    const loc = (block.match(/<loc>\s*([\s\S]*?)\s*<\/loc>/i) || [])[1];
    if (!loc) {
      errors.push(`sitemap.xml: <url> #${i + 1} has no <loc>`);
    } else if (!/^https?:\/\/.+/i.test(loc.trim())) {
      errors.push(`sitemap.xml: <loc> is not an absolute URL: "${loc.trim()}"`);
    }
    const cf = (block.match(/<changefreq>\s*([\s\S]*?)\s*<\/changefreq>/i) || [])[1];
    if (cf && !CHANGEFREQ.has(cf.trim().toLowerCase())) {
      errors.push(`sitemap.xml: invalid <changefreq> "${cf.trim()}"`);
    }
    const pr = (block.match(/<priority>\s*([\s\S]*?)\s*<\/priority>/i) || [])[1];
    if (pr) {
      const n = Number(pr.trim());
      if (Number.isNaN(n) || n < 0 || n > 1) {
        errors.push(`sitemap.xml: invalid <priority> "${pr.trim()}" (must be 0.0–1.0)`);
      }
    }
  });
}

/* ---------- report ---------- */
for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  FAIL  ${e}`);
if (errors.length === 0) {
  console.log('SEO: robots.txt and sitemap.xml are valid.');
  process.exit(0);
} else {
  console.error(`\nSEO: ${errors.length} problem(s) found.`);
  process.exit(1);
}
