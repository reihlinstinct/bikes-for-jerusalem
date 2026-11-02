import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, normalizeBase, loadData } from '../../src/build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const data = loadData(root);
const PAGES = ['', 'rider/', 'events/', 'articles/', 'act/', 'about/', 'contact/'];
let out;
const read = (p) => readFileSync(join(out, p, 'index.html'), 'utf8');

before(() => {
  out = mkdtempSync(join(tmpdir(), 'bfj-'));
  build({ root, out, base: '/bikes-for-jerusalem' });
});

test('normalizeBase handles empty, slashes and missing leading slash', () => {
  assert.equal(normalizeBase(''), '');
  assert.equal(normalizeBase('/x/'), '/x');
  assert.equal(normalizeBase('x'), '/x');
});

test('all seven pages are generated', () => {
  for (const p of PAGES) assert.ok(existsSync(join(out, p, 'index.html')), p);
  assert.ok(existsSync(join(out, '404.html')));
});

test('every page is Hebrew RTL, has a CSP and a single h1', () => {
  for (const p of PAGES) {
    const h = read(p);
    assert.match(h, /<html lang="he" dir="rtl">/);
    assert.match(h, /Content-Security-Policy/);
    assert.equal((h.match(/<h1[ >]/g) || []).length, 1, `h1 count on ${p || 'home'}`);
  }
});

test('every page has the 7 nav links with the base path and marks the current page', () => {
  for (const p of PAGES) {
    const h = read(p);
    const nav = h.match(/<ul id="site-nav"[\s\S]*?<\/ul>/)[0];
    assert.equal((nav.match(/<a /g) || []).length, 7);
    assert.equal((nav.match(/aria-current="page"/g) || []).length, 1);
    assert.ok(nav.includes('href="/bikes-for-jerusalem/rider/"'));
  }
});

test('internal links and assets resolve to generated files', () => {
  for (const p of PAGES) {
    for (const m of read(p).matchAll(/(?:href|src)="(\/bikes-for-jerusalem\/[^"#]*)"/g)) {
      const rel = m[1].replace('/bikes-for-jerusalem/', '');
      const target = join(out, rel);
      const ok = existsSync(target) && (rel === '' || !readdirSafe(target) || existsSync(join(target, 'index.html')));
      assert.ok(ok, `broken link ${m[1]} on ${p || 'home'}`);
    }
  }
});

function readdirSafe(p) { try { return readdirSync(p); } catch { return null; } }

test('an .ics file exists for every event', () => {
  for (const e of data.events) assert.ok(existsSync(join(out, 'events', `${e.id}.ics`)));
});

test('404 page keeps its link markup (not escaped)', () => {
  assert.match(readFileSync(join(out, '404.html'), 'utf8'), /<a href="\/bikes-for-jerusalem\/">/);
});

test('content stays on public placeholder text only (no emails or phones)', () => {
  const blob = JSON.stringify(data);
  assert.doesNotMatch(blob, /[\w.+-]+@[\w-]+\.[\w.]+/);
  assert.doesNotMatch(blob, /\b0\d{1,2}-?\d{7}\b/);
});

test('og:image is absolute when siteUrl is given, and CSP forbids objects', () => {
  const o = mkdtempSync(join(tmpdir(), 'bfj-abs-'));
  build({ root, out: o, base: '/bikes-for-jerusalem', siteUrl: 'https://example.test/bikes-for-jerusalem/' });
  const h = readFileSync(join(o, 'index.html'), 'utf8');
  assert.match(h, /og:image" content="https:\/\/example\.test\/bikes-for-jerusalem\/assets\/img\/og\.png"/);
  assert.match(h, /object-src 'none'/);
});
