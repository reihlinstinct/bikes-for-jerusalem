// Minimal RFC 5545 generator for a single event.
const pad = (n) => String(n).padStart(2, '0');

export function toIcsDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${iso}`);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

const escText = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Folds a content line at 75 octets (RFC 5545 3.1) without splitting UTF-8 characters. */
export function foldLine(line) {
  const enc = new TextEncoder();
  const out = [];
  let cur = '';
  let len = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (len + n > limit) { out.push(cur); cur = ''; len = 0; limit = 74; }
    cur += ch; len += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}

export function eventToIcs(ev, now = new Date()) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//bikes-for-jerusalem//site//HE',
    'BEGIN:VEVENT',
    `UID:${ev.id}@bikes-for-jerusalem`,
    `DTSTAMP:${toIcsDate(now.toISOString())}`,
    `DTSTART:${toIcsDate(ev.start)}`,
    `DTEND:${toIcsDate(ev.end ?? ev.start)}`,
    `SUMMARY:${escText(ev.title)}`,
    `LOCATION:${escText(ev.location ?? '')}`,
    `DESCRIPTION:${escText(ev.description ?? '')}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].map(foldLine).join('\r\n');
}
