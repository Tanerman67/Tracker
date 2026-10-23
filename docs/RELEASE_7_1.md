# My Rhythm 7.1 UI cleanup

Source: actual main at `192d401cb4371050499253671d544f67dbbddfce` (7.0.0), verified before implementation. Changes are developed on `work/ui-cleanup-7-1`. The existing GitHub Pages origin, static architecture, production dependencies and schema 3 remain unchanged.

## Changes and dependencies

Settings now has personal dates, activity goals, appearance, data/backup and a collapsed Advanced area. All diagnostics, snapshots, conflict recovery, Experiments and reset safeguards remain accessible. A conflict download appears only when a local draft exists. Protein target and mode live in Nutrition. Customize blocks follows the Today grid and weekly summary; the Today privacy footer is removed. The concise local-storage explanation remains in Settings.

`data.proteinGoal` is canonical. `goalFor('protein')` and `goalRule('protein')` preserve explicit null/zero rather than falling back to a stale legacy tracker target. Nutrition stages validation before assigning calories/protein/fat/carbs and synchronises the protein tracker and rule target in the same save. Settings never reads or writes protein. Existing protein rule modes, upper bounds and extensions are retained. No `nutrition.goals.protein` source is introduced. Hidden `nutrition.goals.fiber` remains in records/backups, as do fibre grams; only the target editor and target progress are removed.

Nutrition is a normal `.app` section, using the single existing bottom tab bar. The legacy `nutritionModal` ID and `nutritionOpen(date)` API remain compatible. Tab state, selected date and per-section scroll are view state only. Nested food/import screens use sticky internal Back controls, safe-area padding and temporary body locks, then return to the selected day and scroll position.

Copy-food date/action form a compact responsive group. Date/Meal columns are equal above 374px and stacked below it. Native date fields retain their IDs, validation and change handlers. The shared custom calendar is available beside each date input; native keyboard/system input remains a browser fallback. System date popups are not styled or claimed to be identical.

`calendar.js`/`calendar.css` share Monday-based layouts, RU/EN month names, month/year jumps, bounds, today/selected/focus styles and keyboard controls. Alcohol retains explicit drinking toggles and tracking boundaries. Cycle highlights recorded intervals only and edits existing records when selected. Progress retains recorded-day markers and can open the selected Today date. Rendering never persists date changes. Date selection dispatches the existing native input/change flow. Calendar arithmetic uses local noon and handles historical years, leap days and DST boundaries.

## Data safety and verification

No data migration is required. Existing localStorage keys, IndexedDB current/snapshots, CacheStorage data vault, backup envelope and unknown extensions are untouched. Only the app asset cache changes to `my-rhythm-v7.1.0`; its allowlist includes the new shared calendar assets. No backend, account, sync, analytics or personal-data network request is introduced.

Synthetic tests cover Settings/protein isolation, atomic validation, null/zero/missing targets, retained fibre/extensions, effective protein fallback, full backup round trips, old English content, cycle/layout/experiments, date constraints and recorded markers. Browser checks cover desktop Chromium, iPhone-sized Chromium and WebKit; widths 320/360/375/390/414, both languages and themes, document/overlay overflow, Date/Meal geometry, nested Back and scroll, reduced-height keyboard/rotation layouts, offline reload and upgrades from both 6.13 and 7.0. Screenshots are uploaded as CI artifacts and inspected before publishing. Exact final counts and successful workflow URLs are recorded in the PR.

Mobile browser projects and reduced viewport checks are emulation. A physical iPhone and real iOS keyboard are not available in this environment.

## Rollback

Revert the 7.1 release merge in a new commit, retain schema 3 and all data stores, and publish through the existing Pages setup. Use a new service-worker asset cache name/revision for the rollback so cached assets cannot mask it. The baseline above is the known 7.0.0 source. Do not reset records, clear browser storage, remove the data vault, force-push, or place personal backups in the public repository. External JSON backup remains available in Settings before and after rollback.
