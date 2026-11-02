import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { layout, PAGES } from './pages.mjs';
import { raw } from './html.mjs';
import { eventToIcs } from './ics.mjs';

const readJson = (root, f) => JSON.parse(readFileSync(join(root, 'content', f), 'utf8'));

export function loadData(root) {
  return {
    site: readJson(root, 'site.json'),
    home: readJson(root, 'home.json'),
    events: readJson(root, 'events.json'),
    organizers: readJson(root, 'organizers.json'),
    pages: readJson(root, 'pages.json'),
  };
}

export function normalizeBase(b) {
  const s = (b ?? '').trim().replace(/\/+$/, '');
  return s && !s.startsWith('/') ? `/${s}` : s;
}

export function build({ root, out = join(root, 'dist'), base = '' }) {
  const data = loadData(root);
  const b = normalizeBase(base);
  rmSync(out, { recursive: true, force: true });
  for (const [id, page] of Object.entries(PAGES)) {
    const body = page.render({ base: b, data });
    const doc = layout({ site: data.site, base: b, current: id, title: page.title, body });
    const dir = join(out, page.path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), doc.toString());
  }
  mkdirSync(join(out, 'events'), { recursive: true });
  for (const ev of data.events) writeFileSync(join(out, 'events', `${ev.id}.ics`), eventToIcs(ev));
  cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });
  if (existsSync(join(root, '.well-known'))) cpSync(join(root, '.well-known'), join(out, '.well-known'), { recursive: true });
  writeFileSync(join(out, '404.html'), layout({ site: data.site, base: b, current: '', title: 'הדף לא נמצא', body: raw('<h1>הדף לא נמצא</h1><p><a href="' + (b || '') + '/">חזרה לדף הבית</a></p>') }).toString());
  writeFileSync(join(out, '.nojekyll'), '');
  return { pages: Object.keys(PAGES).length, events: data.events.length };
}
