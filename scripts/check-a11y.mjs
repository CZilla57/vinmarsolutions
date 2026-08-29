#!/usr/bin/env node
/*
 * Accessibility check using axe-core (via Playwright).
 * Loads each page from the local server and asserts zero WCAG 2.1 A/AA
 * violations. Exits non-zero if any page has violations.
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8788';
const PAGES = ['/index.html', '/services.html', '/lawn-talk.html', '/products.html', '/404.html'];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const browser = await chromium.launch();
const context = await browser.newContext();
let total = 0;

for (const path of PAGES) {
  const page = await context.newPage();
  const url = BASE + path;
  await page.goto(url, { waitUntil: 'networkidle' });
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  await page.close();

  if (results.violations.length === 0) {
    console.log(`  ok   ${path} — no violations`);
  } else {
    console.error(`  FAIL ${path} — ${results.violations.length} violation type(s):`);
    for (const v of results.violations) {
      total += v.nodes.length;
      console.error(`        [${v.impact}] ${v.id}: ${v.help}`);
      for (const n of v.nodes) {
        console.error(`          → ${n.target.join(' ')}`);
      }
      console.error(`          ${v.helpUrl}`);
    }
  }
}

await browser.close();

console.log(`\nAccessibility (axe, WCAG 2.1 AA): ${total} violation(s) across ${PAGES.length} pages.`);
process.exit(total ? 1 : 0);
