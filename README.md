# אופניים בשביל ירושלים (אב״י)

[![CI](https://github.com/reihlinstinct/bikes-for-jerusalem/actions/workflows/ci.yml/badge.svg)](https://github.com/reihlinstinct/bikes-for-jerusalem/actions/workflows/ci.yml)
[![Pages](https://github.com/reihlinstinct/bikes-for-jerusalem/actions/workflows/pages.yml/badge.svg)](https://github.com/reihlinstinct/bikes-for-jerusalem/actions/workflows/pages.yml)

Website of **Bikes for Jerusalem (AVI)**, the organization of Jerusalem's cyclists. Hebrew, RTL, mobile-first, static.

Live site: https://reihlinstinct.github.io/bikes-for-jerusalem/

## Status
Phase 1 (static skeleton, placeholder content and logo) is done. See [CHANGELOG](CHANGELOG.md).

## Docs
- [Site plan](docs/plan.md) (Hebrew) and [wireframes v1](docs/design/wireframes-v1.pdf)
- [Phase 1 design](docs/design/phase1-design.md)
- [Brand assets and provenance](docs/assets.md)

## Develop
Needs Node 22.

```sh
npm ci
npm test                      # unit tests
npm run build && npm run serve   # http://localhost:4173
npx playwright install chromium webkit
npm run test:e2e              # e2e, desktop and mobile
```

## Structure
- `content/` - all site content as JSON (events, pages, home, site settings)
- `src/` - HTML helpers, page templates, ICS generator, build
- `scripts/` - build and local server
- `assets/` - CSS, JS, images
- `tests/unit`, `tests/e2e`

`BASE_PATH` sets the URL prefix (Pages uses `/bikes-for-jerusalem`).

## Contributing
Open an issue, work on a branch, open a PR with tests. Content edits are PRs to `content/`. No personal data in this public repo.

Licence: MIT (code). Brand assets are covered separately in [docs/assets.md](docs/assets.md).
