# My Rhythm 7.0

Source baseline: `46ee50a4413b8d7c5ee89172e53f193446f5392c` on `main`.
This release is an incremental static JavaScript upgrade of the actual repository.
Older ZIPs and README release descriptions are historical.

## Behaviour

- Four permanent destinations: Today, Nutrition, Progress, Settings.
- Today blocks can be hidden, added, moved with accessible up/down controls, and expanded.
- Cycle and English Activity are optional and absent from the default dashboard.
- Smoking quit date and alcohol tracking start are editable. The current alcohol-free streak is calculated separately. The legacy `alcoholDate` field is retained, never rewritten by that calculation.
- Alcohol history records explicit drinking days. Within the configured tracking period, other days mean no alcohol was marked, rather than independently confirmed abstinence.
- Cycle records contain start, optional end, symptoms and notes. Estimates require at least three intervals with a spread of no more than seven days. The displayed uncertainty is a simple descriptive range, not a validated medical prediction. No ovulation/fertility predictions.
- English Activity adds dated study sessions to the existing legacy time calculation. Legacy detailed daily totals take priority over the old general daily total, preserving the previous fallback. Learning content remains in backups. The old learning UI and code are removed from the running app; a frozen compatibility harness exists only under tests.
- Nutrition retains rings, macro/micronutrients, import previews, partial values, unit/basis validation and effective-protein fallback. Different stable IDs are separate meals; re-importing the same IDs is idempotent. Replacements require explicit opt-in.
- Food reuse opens an editable copy. Favourites store a reusable local template. Portion recalculation uses a known original serving in the same unit; unknowns remain unknown and estimates retain estimated quality.
- Goal modes distinguish minimums, maximums, ranges, booleans, weekly frequency and observation. Old goals remain unchanged. Progress retains 7/30/90/365/all-time charts and adds coverage-aware descriptive averages.

## Storage and data flow

All personal data stays in this browser profile and origin. Devices and browser profiles are independent. A shared browser profile has shared records, without local accounts. Cross-device transfer requires the user's JSON export/import.

Schema 3 adds `dashboard`, `cycle`, `englishActivity`, and `goalRules`. Existing keys, records, settings, unknown extensions, numeric zero, false, null and old English content are retained. `migrateData` is idempotent. Schema 0/1/2 and raw/enveloped backups remain readable. Old backups lacking a new module preserve that module's current records; the existing old-backup nutrition fallback also remains.

The primary and mirror localStorage keys remain unchanged. IndexedDB snapshots/current and the separate CacheStorage data vault remain. App assets alone are managed by the service worker cache. Upgrading the worker never deletes the data vault.

Web Locks serialize writes between modern same-origin tabs. Saves compare baseline, local edits and latest stored state; independent object fields and stable-ID records merge. Conflicting edits do not overwrite the stored records. The unsaved draft is kept locally and can be downloaded from Settings. If Web Locks is absent, an IndexedDB readwrite transaction serializes the critical compare/merge/local-write section. If both APIs are absent, only revision comparison is available; prefer one editing tab in those older browsers. Initial recovery finishes before editing is enabled. Regular JSON backups remain necessary because browsers may evict local storage.

Records flow from UI validation into the existing data object, through coordinated persistence to primary/mirror storage, then to serialized recovery copies. Linked screens recalculate from the same object. There is no server, login, synchronization, telemetry or remote AI API.

## Privacy and security review

Runtime requests are limited to public same-origin static assets. The service worker never handles the data vault URL as an app asset. Nutrition, cycle and other records are never sent over the network. Reference health-source links open only after a user action. No external scripts/fonts/analytics added.

Imported structures reject dangerous prototype keys and unsupported schema versions. User-entered HTML is escaped or rendered with textContent. Nutrition dates, units, nutrient quality and measurement bases are validated. Public test fixtures are fictional; no user backup, profile or health diary was added to the repository.

## Verification

Run `npm ci --ignore-scripts` and `npm test` for pure JavaScript/storage tests.
For browser checks: `npx playwright install --with-deps chromium webkit`, then `npm run test:browser`.
GitHub Actions uses Ubuntu 24.04. Projects cover Chromium desktop, Chromium with an iPhone viewport, and mobile WebKit. Mobile emulation does not mean a physical iPhone or the Safari application was tested. CI uploads screenshots/traces on failure and dashboard screenshots for visual inspection.

Browser scenarios include a clean profile, navigation, dashboard persistence, cycle and English CRUD, nutrition/rings/reuse/scaling, JSON preview and idempotence, full backup export/import into a second profile, same-browser tab conflicts, offline reload, sparse chart ranges, Russian interface, and an upgrade from actual 6.13 assets at the same origin with pre-existing synthetic records.

See the PR and its final successful Actions run for the exact deployed verification counts. Earlier failed runs remain visible as a record of fixes.

## Safe update and rollback

Export a fresh JSON backup before updating or reverting application assets. Retain the same Pages URL and browser profile. Do not clear browser storage, delete the installed PWA, remove the data-vault cache, or reset user data as an update method.

To roll back the app, create a new commit reverting the release merge (or restoring the public app assets from the baseline above). Publish it through the existing Pages setup, and use a new service-worker asset cache name so old caches cannot mask the rollback. Never force-push or rewrite history. Keep the latest schema-3 backup outside the public repository. Older app versions retain unknown fields, but do not provide a UI for new modules; returning to 7.0 restores those views.

## Scope and limits

The app remains static, uses the existing data stores, and adds no production dependency. Refactoring is incremental; remaining app.js sections still contain legacy analytics/settings code. This release does not add cloud sync, accounts, English Path integration, medical guidance, contraceptive predictions, or external AI analysis.
