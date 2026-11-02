import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toIcsDate, eventToIcs } from '../../src/ics.mjs';

test('toIcsDate converts to UTC basic format', () => {
  assert.equal(toIcsDate('2026-12-04T09:00:00+02:00'), '20261204T070000Z');
});

test('toIcsDate rejects invalid dates', () => {
  assert.throws(() => toIcsDate('not a date'), /Invalid date/);
});

test('eventToIcs produces a CRLF calendar with escaped text', () => {
  const ics = eventToIcs({ id: 'x', title: 'a,b;c', start: '2026-12-04T09:00:00+02:00', end: '2026-12-04T10:00:00+02:00', location: 'L', description: 'line1\nline2' }, new Date('2026-01-01T00:00:00Z'));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.includes('SUMMARY:a\\,b\\;c\r\n'));
  assert.ok(ics.includes('DESCRIPTION:line1\\nline2\r\n'));
  assert.ok(ics.includes('DTSTART:20261204T070000Z\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
});
