MY RHYTHM 7.3.2 - STATIC GITHUB PAGES APP
See docs/SAFE_CLEANUP_7.3.2.md. Chromium desktop/mobile browser checks passed; Safari is not independently verified.
Publication authorised by the user on 2026-10-24. Keep the same Pages origin and /Tracker/ path.

ARCHIVED INSTRUCTIONS BELOW:
MY RHYTHM 7.0 - STATIC GITHUB PAGES APP

Current release details, architecture, verification and rollback:
docs/RELEASE_7.md

Existing deployment: Tanerman67/Tracker, main branch, repository root.
Keep the existing origin and browser profile to retain local records.
No production build step or runtime package dependency is needed.

Personal records remain on-device. Transfer records only with user-directed
JSON backup export/import. Never commit personal backups or health diaries.
Do not clear storage or uninstall the PWA as an update method.

Run npm test for unit/storage regression checks. Browser verification runs
through the committed Playwright suite and GitHub Actions before release.
Historical README and UPDATE files describe older versions.
