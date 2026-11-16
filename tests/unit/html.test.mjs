import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, html, raw } from '../../src/html.mjs';

test('esc escapes HTML special characters', () => {
  assert.equal(esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});

test('html template escapes interpolations but not raw()', () => {
  assert.equal(html`<p>${'<b>'}</p>`.toString(), '<p>&lt;b&gt;</p>');
  assert.equal(html`<p>${raw('<b>')}</p>`.toString(), '<p><b></p>');
});

test('html template joins arrays of nested templates', () => {
  const items = ['a', 'b'].map((x) => html`<li>${x}</li>`);
  assert.equal(html`<ul>${items}</ul>`.toString(), '<ul><li>a</li><li>b</li></ul>');
});
