import { html, raw, esc } from './html.mjs';

const link = (base, path) => `${base}/${path}`.replace(/\/{2,}/g, '/').replace(/^$/, '/');

export function layout({ site, base, current, title, body, siteUrl = '' }) {
  const origin = siteUrl.replace(/\/+$/, '');
  const pageTitle = current === 'home' ? `${site.name} (${site.short})` : `${title} | ${site.short}`;
  const nav = site.nav.map((n) => html`<li><a href="${link(base, n.path)}"${raw(n.id === current ? ' aria-current="page"' : '')}>${n.label}</a></li>`);
  const social = site.social.map((s) => html`<li><a href="${s.url}" rel="noopener">${s.label}</a></li>`);
  return html`<!doctype html>
<html lang="${site.lang}" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'">
<title>${pageTitle}</title>
<meta name="description" content="${site.name} - ${site.tagline}">
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${site.tagline}">
<meta property="og:type" content="website">
<meta property="og:locale" content="he_IL">
<meta property="og:image" content="${origin ? `${origin}/assets/img/og.png` : link(base, 'assets/img/og.png')}">
<link rel="icon" type="image/png" sizes="64x64" href="${link(base, 'assets/img/favicon.png')}">
<link rel="apple-touch-icon" href="${link(base, 'assets/img/apple-touch-icon.png')}">
<meta name="theme-color" content="#684199">
<link rel="stylesheet" href="${link(base, 'assets/css/site.css')}">
<script src="${link(base, 'assets/js/site.js')}" defer></script>
</head>
<body>
<a class="skip" href="#main">דלגו לתוכן</a>
<header class="site-header">
  <a class="brand" href="${link(base, '')}"><img src="${link(base, 'assets/img/logo.jpg')}" alt="לוגו אב״י" width="44" height="44"><span>${site.short}</span></a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">תפריט</button>
  <nav aria-label="ניווט ראשי"><ul id="site-nav" class="nav">${nav}</ul></nav>
</header>
<div class="notice" role="note">${site.placeholderNotice}</div>
<main id="main">${body}</main>
<footer class="site-footer">
  <p>${site.name} - ${site.tagline}</p>
  <ul class="social" aria-label="רשתות חברתיות">${social}</ul>
</footer>
</body>
</html>
`;
}

const cta = (base, label, path) => html`<a class="btn" href="${link(base, path)}">${label}</a>`;

export function home({ base, data }) {
  const h = data.home;
  const upcoming = data.events.slice(0, 3);
  return html`
<section class="hero"><h1>${h.welcome.title}</h1><p>${h.welcome.text}</p>
  ${cta(base, h.welcome.cta.label, h.welcome.cta.path)}
  <ul class="shortcuts">${h.welcome.shortcuts.map((s) => html`<li>${cta(base, s.label, s.path)}</li>`)}</ul>
</section>
<section><h2>${h.riderTeaser.title}</h2><p>${h.riderTeaser.text}</p>${cta(base, 'לכל המידע', h.riderTeaser.path)}</section>
<section><h2>אירועים קרובים בירושלים</h2>
  <ul class="cards">${upcoming.map((e) => eventCard(base, e, data.organizers))}</ul>
  ${cta(base, 'כל האירועים', 'events/')}
</section>
<section><h2>הצטרפו אלינו</h2><ul class="row">${h.join.map((j) => html`<li><a class="btn" href="${j.url}" rel="noopener">${j.label}</a></li>`)}</ul></section>
<section><h2>השפיעו כבר היום</h2>
  <ul class="cards">${h.impact.map((i) => html`<li class="card"><a href="${link(base, i.path)}">${i.title}</a></li>`)}</ul>
</section>`;
}

function fmtDate(iso) {
  return new Intl.DateTimeFormat('he-IL', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Jerusalem' }).format(new Date(iso));
}

function eventCard(base, e, organizers) {
  return html`<li class="card event event-${e.organizer}"><h3>${e.title}</h3>
  <p><time datetime="${e.start}">${fmtDate(e.start)}</time></p>
  <p>${e.location}</p><p class="tag">${organizers[e.organizer] ?? organizers.other}</p>
  <a href="${link(base, `events/${e.id}.ics`)}" download>הוספה ליומן</a></li>`;
}

export function events({ base, data }) {
  const legend = Object.entries(data.organizers).map(([k, v]) => html`<li class="legend event-${k}">${v}</li>`);
  return html`<h1>אירועים</h1>
<p>רשימת האירועים הקרובים. (תצוגת לוח חודשי תתווסף בשלב 2.)</p>
<ul class="legend-list" aria-label="מקרא">${legend}</ul>
<ul class="cards">${data.events.map((e) => html`<li class="card event event-${e.organizer}" id="${e.id}"><h2>${e.title}</h2>
  <p>${e.description}</p><p><time datetime="${e.start}">${fmtDate(e.start)}</time></p><p>${e.location}</p>
  <p class="tag">${data.organizers[e.organizer] ?? data.organizers.other}</p>
  <a href="${link(base, `events/${e.id}.ics`)}" download>הוספה ליומן</a></li>`)}</ul>`;
}

export function rider({ data }) {
  const p = data.pages.rider;
  return html`<h1>${p.title}</h1><p>${p.lead}</p>
<ul class="cards">${p.cards.map((c) => html`<li class="card"><h2>${c.title}</h2><p>${c.text}</p><time datetime="${c.date}">${c.date}</time></li>`)}</ul>`;
}

export function articles({ data }) {
  const p = data.pages.articles;
  return html`<h1>${p.title}</h1>
<div class="tabs" role="tablist" aria-label="סוג תוכן">${p.tabs.map((t, i) => html`<button role="tab" type="button" id="tab-${t.id}" aria-controls="panel-${t.id}" aria-selected="${i === 0 ? 'true' : 'false'}">${t.label}</button>`)}</div>
${p.tabs.map((t, i) => html`<section role="tabpanel" id="panel-${t.id}" aria-labelledby="tab-${t.id}"${raw(i === 0 ? '' : ' hidden')}>
  <ul class="cards">${t.items.map((it) => html`<li class="card"><h2>${it.title}</h2><p>${it.text}</p>${it.date ? html`<time datetime="${it.date}">${it.date}</time>` : ''}</li>`)}</ul></section>`)}`;
}

export function act({ data }) {
  const p = data.pages.act;
  return html`<h1>${p.title}</h1><p>${p.lead}</p>
${p.blocks.map((b) => html`<section><h2>${b.title}</h2><ul class="cards">${b.items.map((i) => html`<li class="card">${i}</li>`)}</ul></section>`)}`;
}

export function about({ data }) {
  const p = data.pages.about;
  return html`<h1>${p.title}</h1>
<section><h2>מי אנחנו</h2><p>${p.who}</p></section>
<section><h2>ציר זמן</h2><ol class="timeline">${p.timeline.map((t) => html`<li><strong>${t.year}</strong> ${t.text}</li>`)}</ol></section>
<section><h2>איך אנחנו פועלים</h2><p>${p.how}</p></section>`;
}

export function contact({ data }) {
  const p = data.pages.contact;
  return html`<h1>${p.title}</h1>
<section><h2>הצטרפו ועקבו</h2><ul class="row">${p.links.map((l) => html`<li><a class="btn" href="${l.url}" rel="noopener">${l.label}</a></li>`)}</ul></section>
<section><h2>פניה ישירה</h2><ul class="row">${p.direct.map((l) => html`<li><a class="btn" href="${l.url}" rel="noopener">${l.label}</a></li>`)}</ul></section>`;
}

export const PAGES = {
  home: { path: '', title: 'דף הבית', render: home },
  rider: { path: 'rider/', title: 'הכל לרוכב', render: rider },
  events: { path: 'events/', title: 'אירועים', render: events },
  articles: { path: 'articles/', title: 'ניירות עמדה וכתבות', render: articles },
  act: { path: 'act/', title: 'השפיעו כבר היום', render: act },
  about: { path: 'about/', title: 'אודות', render: about },
  contact: { path: 'contact/', title: 'צרו קשר', render: contact },
};
export { esc };
