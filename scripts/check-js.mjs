#!/usr/bin/env node
/*
 * JavaScript syntax check. Runs `node --check` on every project script
 * (excludes node_modules). Exits non-zero if any file fails to parse.
 */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const DIRS = ['js', 'scripts'];
let failed = 0;
let checked = 0;

for (const dir of DIRS) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    continue;
  }
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!/\.(m?js|cjs)$/.test(e.name)) continue;
    const file = join(dir, e.name);
    try {
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
      checked++;
      console.log(`  ok   ${file}`);
    } catch (err) {
      failed++;
      console.error(`  FAIL ${file}`);
      console.error(String(err.stderr || err.message));
    }
  }
}

console.log(`\nJS syntax: ${checked} file(s) ok, ${failed} failed.`);
process.exit(failed ? 1 : 0);
