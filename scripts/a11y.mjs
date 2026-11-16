// Shared trusted tools scan every generated page and interactive states.
import { resolve, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { serve, routes } from './a11y-preview.mjs';
const tools = process.env.A11Y_TOOLS;
if (!tools || !isAbsolute(tools)) throw new Error('tool path');
const { scan, TAGS, summarize } = await import(pathToFileURL(resolve(tools, 'scan.mjs')));
const axe = (await import(pathToFileURL(resolve(tools, 'node_modules/axe-core/axe.js')))).default;
const preview = await serve();
const states = [];
try {
  const result = await scan(preview.base, { version: 1, paths: routes }, { inspect: async (page, report) => {
    let failed = false;
    page.on('request', request => { if (new URL(request.url()).origin !== new URL(preview.base).origin) failed = true; });
    page.on('pageerror', () => { failed = true; });
    page.on('response', response => { if (response.status() >= 400) failed = true; });
    await page.routeWebSocket('**/*', socket => { failed = true; socket.close(); });
    const inspect = async state => {
      await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {}))));
      await page.addScriptTag({ content: axe.source });
      const findings = await page.evaluate(tags => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS);
      if (failed || new URL(page.url()).origin !== new URL(preview.base).origin) throw new Error('interaction failed');
      states.push({ engine: report.engine, width: report.width, page: report.page, state, ...summarize(findings) });
    };
    if (report.width === 390) {
      await page.locator('.menu-toggle').click();
      if (await page.locator('.menu-toggle').getAttribute('aria-expanded') !== 'true') throw new Error('menu state');
      await inspect('navigation-open');
      await page.locator('.menu-toggle').click();
    }
    if (new URL(page.url()).pathname === '/articles/') {
      for (const tab of await page.getByRole('tab').all()) { await tab.click(); await inspect('article-tab'); }
    }
    if (process.env.A11Y_SCREENSHOT && report.engine === 'chromium' && report.page === 1 && report.width === 390) await page.screenshot({ path: process.env.A11Y_SCREENSHOT, fullPage: true });
  } });
  console.log(JSON.stringify(result));
  console.log(JSON.stringify({ scope: 'automated-only', states }));
  if (result.status !== 'pass' || states.some(state => state.violations)) process.exitCode = 1;
} catch {
  console.log('{"schema_version":1,"status":"error","scope":"automated-only"}'); process.exitCode = 2;
} finally { await preview.close(); }
