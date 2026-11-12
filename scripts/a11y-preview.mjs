// First-party placeholder-only preview, not network isolation.
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, loadData } from '../src/build.mjs';
import { PAGES } from '../src/pages.mjs';
export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const routes = [...Object.values(PAGES).map(page => '/' + page.path), '/404.html'];
const beacon = `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "59690418e5c04a2db334eb4dc883be64"}'></script>`;
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.ics': 'text/calendar', '.txt': 'text/plain' };
export async function serve(port = 0) {
  const data = loadData(root);
  if (!data.site.placeholderNotice.includes('תוכן דמה') || data.events.some(event => !event.description.startsWith('תוכן דמה.'))) throw new Error('synthetic content required');
  const out = await mkdtemp(resolve(tmpdir(), 'zz-bikes-a11y-'));
  build({ root, out });
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let target = resolve(out, '.' + pathname);
      if (!target.startsWith(out + sep) && target !== out) throw new Error('path');
      if (pathname.endsWith('/')) target = resolve(target, 'index.html');
      let body = await readFile(target);
      if (extname(target) === '.html') {
        const html = body.toString('utf8');
        if (html.split(beacon).length !== 2) throw new Error('beacon changed');
        body = html.replace(beacon, '');
      }
      res.writeHead(200, { 'content-type': mime[extname(target)] || 'application/octet-stream' }); res.end(body);
    } catch { res.writeHead(404); res.end('Synthetic preview unavailable'); }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return { server, base: `http://127.0.0.1:${server.address().port}/`, close: async () => { server.closeAllConnections(); server.close(); await rm(out, { recursive: true, force: true }); } };
}
if (process.argv[2] === 'preview') {
  await serve(8765);
  await writeFile(resolve(root, '.a11y-routes.json'), JSON.stringify({ version: 1, paths: routes }));
  console.log('Synthetic accessibility preview ready');
}
