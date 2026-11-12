import test from 'node:test';
import assert from 'node:assert/strict';
import { serve, routes } from '../../scripts/a11y-preview.mjs';
import { PAGES } from '../../src/pages.mjs';

test('synthetic preview covers generated routes, binds loopback and strips only analytics', async () => {
  assert.deepEqual(routes, [...Object.values(PAGES).map(page => '/' + page.path), '/404.html']);
  const preview = await serve();
  try {
    assert.equal(preview.server.address().address, '127.0.0.1');
    for (const path of routes) {
      const response = await fetch(preview.base + path.slice(1));
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.doesNotMatch(html, /<script[^>]*src="https:/);
      assert.match(html, /script-src 'self' https:\/\/static.cloudflareinsights.com/);
      assert.match(html, /תוכן דמה/);
    }
    assert.equal((await fetch(preview.base + 'content/site.json')).status, 404);
  } finally { await preview.close(); }
});
