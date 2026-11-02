// Minimal RFC 5545 generator for a single event.
const pad = (n) => String(n).padStart(2, '0');

export function toIcsDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${iso}`);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

const escText = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

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
  ].join('\r\n');
}
