# Changelog

Format: [Keep a Changelog](https://keepachangelog.com), versioning: [SemVer](https://semver.org).

## [0.1.0] - 2026-11-02
### Added
- Phase 1 static skeleton: seven RTL mobile-first pages (home, rider guide, events, articles, act, about, contact) with placeholder content.
- Dependency-free build (`scripts/build.mjs`), content in `content/*.json`, per-event `.ics` files.
- Unit tests (node:test) and Playwright e2e on Chromium and WebKit, desktop and mobile.
- CI, GitHub Pages deploy, security.txt, CSP meta tag, favicon, OG image, neutral placeholder logo.
- Review fixes: absolute og:image (SITE_URL), actions pinned by SHA, deploy guarded to main, CSP object-src none, ICS line folding, arrow-key navigation for tabs.
