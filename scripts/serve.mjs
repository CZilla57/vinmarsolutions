#!/usr/bin/env node
/*
 * Minimal static file server for local checks and previews.
 * Mirrors Cloudflare Pages behaviour closely enough for testing:
 *   - serves files from the repo root
 *   - "/" -> index.html
 *   - clean URLs: "/services" -> services.html when the extensionless file is absent
 *   - unknown paths -> 404.html with a 404 status
 * No dependencies. Not for production — Cloudflare Pages serves the real site.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = process.cwd();
const PORT = Number(process.env.PORT) || 8788;
const HOST = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

async function resolvePath(urlPath) {
  // Prevent path traversal.
  let rel = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  if (rel === '/' || rel === '') rel = '/index.html';
  const candidates = [join(ROOT, rel)];
  if (!extname(rel)) {
    candidates.push(join(ROOT, rel + '.html'));
    candidates.push(join(ROOT, rel, 'index.html'));
  }
  for (const p of candidates) {
    try {
      const s = await stat(p);
      if (s.isFile()) return p;
    } catch { /* try next */ }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const file = await resolvePath(req.url || '/');
  if (file) {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);
    return;
  }
  // Not found -> branded 404 with a 404 status (matches Pages behaviour).
  try {
    const notFound = await readFile(join(ROOT, '404.html'));
    res.writeHead(404, { 'Content-Type': MIME['.html'] });
    res.end(notFound);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT} at http://${HOST}:${PORT}/`);
});
