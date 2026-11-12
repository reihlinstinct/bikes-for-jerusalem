# Accessibility statement

Our target is SI 5568 level AA, with additional WCAG 2.2 A/AA automated coverage.
No complete SI 5568/WCAG conformance audit has been completed.

## Evidence

The pinned repo-checks axe action scans all seven generated pages and the 404
page in Chromium and WebKit at 1280x900 and 390x844. Project tests also scan mobile
navigation open on each page and all three article tabs. This gives 32 initial
and 28 interaction states. Active CSS transitions finish before state scans.
The shared action repeats the initial subset as a consumer integration check.
Existing browser tests remain in place, including production CSP checks.

The preview uses the site's existing placeholder-only content, binds to 127.0.0.1,
and strips only the exact analytics tag. Production analytics and UI are unchanged.
The scanner is for first-party synthetic/no-secret previews, not network isolation.
Unsupported browser network paths remain outside this contract.

## Known limits

Manual keyboard, screen-reader, zoom/reflow, focus and real-device testing remain
open. WebKit on Linux is not iOS Safari; two browser engines are not native two-OS
coverage. Automated results do not certify legal compliance. The placeholder site
must be checked again when real content replaces the placeholders.

## Feedback

Report barriers and reproducible steps through the repository Issues page:
https://github.com/reihlinstinct/bikes-for-jerusalem/issues
Do not include personal data.

Browser CI uses a digest-pinned official Playwright 1.65.0 runtime matching the
shared tools lockfile. The preinstalled mode still launches and renders in both
engines before axe scans. Missing browsers or libraries fail CI; no browser
cache, apt mirror fetch or skipped test substitutes for these checks. Update
the image digest and matching tool lockfiles together.
