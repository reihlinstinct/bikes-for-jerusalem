# Design: Phase 1 static skeleton

Status: implemented in 0.1.0. Follows `docs/plan.md` (sections 2-4 and 6) and `docs/design/wireframes-v1.pdf`.

## Goals
Seven pages with shared nav and footer, Hebrew RTL, mobile-first, placeholder content, free hosting on GitHub Pages (project site, no custom domain).

## Decisions
- **No framework, no runtime dependencies.** A ~100 line Node build turns `content/*.json` into static HTML. Production ships HTML, one CSS file and a ~1 KB JS file (menu and tabs). Chosen over Eleventy to keep installs and CI minutes small. The page templates are plain functions, so moving to Eleventy later is cheap.
- **Content as data.** All text lives in `content/`; editing is a PR. Events carry ISO dates with offset; the build writes one `.ics` per event.
- **Base path.** `BASE_PATH` (default empty) prefixes every link so the same build works at `/` locally and `/bikes-for-jerusalem/` on Pages.
- **Security.** CSP via meta tag (Pages cannot set headers): self-only scripts and styles. No inline script or style. `security.txt` under `.well-known/` (only effective at a domain root; kept for when a domain exists).
- **Accessibility.** Skip link, landmarks, `aria-current`, `aria-expanded` on the menu button, tab roles on the articles page, visible focus.
- **Mobile.** Nav collapses to a menu button under 48rem; cards stack to one column.

## Out of scope (later phases)
Monthly calendar and event cards (phase 2), final visual design and logo (phase 3), maps layer, performance budget and accessibility audit (phase 4).

## Tests
Unit: escaping, ICS, build output (pages, nav, RTL, CSP, internal links, no personal data). E2E (Chromium and WebKit, desktop and mobile): render, no horizontal overflow, navigation, menu, tabs, `.ics`, no console errors. Screenshots are uploaded as CI artifacts.

## Known limitations
Placeholder logo and content; calendar is a list; social and contact links are `#`.
