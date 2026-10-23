# Energy Balance implementation

Current UI: 7.3.0, based on main 1a006e6e531e8a87b808fe7708f7881e0c4f33e4 (7.2.2), schema 3. Formulas are unchanged.

## Existing architecture

- Existing weight: `data.logs[date].weight`, edited by `openBodyCheckin` / `saveBodyCheckin`. `bodyMeasurements` is not a second weight source.
- Existing steps: `data.logs[date].steps`, edited by `openEntry`. Gym is boolean; outdoors is not walking.
- Existing food: `nutritionAggregate(date).calories`, including null/partial/source quality. No second food sum.
- Today: `dashboardAvailable`, `dashboardCard`, `dashboardOpen`; the new block is opt-in, absent from `defaultDashboardBlocks`.
- Secondary screen: existing `moduleModal`, `moduleShell`, shared date picker. No fifth tab.
- Storage: additive optional `energyBalance: {profile, workouts, days}`; existing schema 3 can retain unknown fields, so no schema bump or rewrites of old records are needed. Full JSON backup and the normal mirror/IndexedDB/cache vault retain the object. Older backups without the object preserve the current module. Three-way merge handles workout arrays by stable ID.
- Pure calculations: `energy-core.js` accepts database snapshots and the existing nutrition aggregate; UI adapter `energy.js` performs normal saves and routes to existing editors. No network requests or computed TDEE storage.

## Everyday workflow

No food, activity or day-completion confirmation is required. The main view shows estimated full-day expenditure, known food calories and the provisional difference. Three rows explain usual-day energy, extra walking and recorded workouts. Step totals, included allowance and extra steps are visible together. An empty diary is unknown, never zero intake.

Profile setup shows usual activity, height, date of birth and the user's explicit male/female equation choice. Formula details, known manual RMR and the included-step override are in Advanced settings. Existing profile values and all historical weight sources are retained.

The workout form initially needs type and explicitly labelled **Active calories from your watch**. This is an explicit active-calorie input, not a reinterpretation of unknown energy. Total/unknown calories and source are in optional details; selecting Total reveals duration and requires it before saving a known calorie value. Walking/running reveal step accounting. Cycling/strength/swimming use the usual no-step-overlap assumption; other activities require an overlap choice. Existing saved types/overlap/source are preserved when edited.

## Model and assumptions

`TDEE = RMR × routinePAL + extraWalkingNet + nonOverlappingExerciseNet`.
The routine factor includes average digestion (TEF). TEF is never added again.

- RMR: Mifflin-St Jeor `10 × kg + 6.25 × cm - 5 × age + offset`, with explicit `+5` or `-161` selection. Formula use requires age 18–120. Birthdays update age against the date being calculated; a February 29 birthday advances on March 1 in non-leap years. An explicitly entered known RMR is an alternative. Height is still needed when estimating nonzero walking distance.
- Weight: last positive valid `logs[date].weight` at or before the calculation date. No future weight. More than 30 days old lowers the status to provisional when used. No new weight storage.
- Routine assumptions: seated ×1.20 / 800 steps, light ×1.35 / 2500, on feet ×1.55 / 6000. Users explicitly choose a routine and can edit the included step allowance. These factors describe the chosen habitual day, not a separate full-day activity estimate to which all steps are added. The higher presets are assumptions for greater habitual movement, not validated individual energy needs or universal clinical categories. Changing an allowance changes which steps count as additional, not the selected routine factor. A large mismatch requires choosing a more suitable routine. Below-baseline steps never cause an arbitrary energy subtraction.
- Walking: `max(0, dailySteps - baselineIncludedSteps - knownWatchWorkoutSteps)`. Distance is additional steps × height in metres × 0.415, converted to km. Net walking energy is distance × kg × 0.5 kcal/kg/km. The 0.415 length factor is an engineering approximation, not a measured personal stride. Walking models can be inaccurate at different speeds/grades/gaits and for running. Step mode for running explicitly warns that it uses the walking approximation.
- The net coefficient follows the ACSM level walking oxygen equation after removing its rest term: 0.1 ml/kg/metre × approximately 5 kcal/litre. Sensitivity uses stride/height 0.35–0.50, net cost 0.35–0.65 kcal/kg/km, and the routine ranges in `ROUTINES`. These are transparent scenario assumptions, not calibrated confidence intervals. RMR and watch error are excluded from those scenario bounds; the real result may lie outside them. UI energy is rounded to 10 kcal; calculations retain precision.

Sources reviewed during implementation:

1. [Mifflin et al., 1990, original equation](https://pubmed.ncbi.nlm.nih.gov/2305711/).
2. [Agiovlasitis et al., 2010, walking equation and its limitations](https://medicaljournals.se/jrm/content/html/10.2340/16501977-0570). This study discusses underestimation in both study groups; the formula must not be presented as accurate for every user.
3. [FAO/WHO/UNU, Human energy requirements, adult energy requirements](https://www.fao.org/4/y5686e/y5686e07.htm). This supports separating habitual expenditure and discretionary activity. Its whole-day PAL categories are not claimed as validation of our low-step baseline presets.

## Workouts and completeness

Workouts contain a stable ID, date, type, optional minutes/kcal/steps, source, explicit energy type, step overlap choice, and `scope: workout`. All-day watch totals are rejected. A session is additional to the selected usual routine. Sources are user-entered estimates, never a watch integration.

- Active energy: already above rest.
- Total energy: subtract `RMR × minutes / 1440`, clamp at zero. Without duration or RMR it is not added as known exercise energy.
- Unknown type/energy: saved as unknown, not silently converted to active or zero in the data. It is excluded from known workout energy and flagged as incomplete.
- Count from steps: watch kcal are not added.
- Count from watch with included steps: remove known session steps from additional walking. Multiple separate sessions are handled once each. Duplicate IDs are rejected; the UI asks before adding another session with the same date/type/kcal/duration.
- Unknown overlap: suppress all extra walking as a conservative choice, show an explicit warning and a provisional difference using known components. Such dates are excluded from sufficient-data history totals. An impossible session-step sum also excludes a date from sufficient-data history.
- New cycling/strength/swimming sessions default to no step overlap based on the activity type. Other/legacy overlap choices are retained. Gym is unchanged. Gym=true without an energy-bearing/step-counted session remains provisional, never a made-up energy amount. Outdoors is not used as walking.

Food totals come exclusively from `nutritionAggregate(date).calories`. Without usable calories or a base-energy profile, the balance is unavailable. Otherwise the provisional difference uses the **known** intake/activity components. The 7.2.2 missing-step behavior is retained: recorded steps remain null and the configured usual allowance supplies a clearly labelled calculation assumption, with no extra walking added. Assumptions are never written into logs or backups. Workout overlap uses actual recorded steps only. Partial food values keep their ≥ marker. Missing components and unreliable overlap are disclosed in a compact limitations section, and the summary explicitly indicates missing data. No real-world diary completeness is claimed.

Legacy `days.foodSignature`, `days.activitySignature` and `days.noExtraSteps` are retained for backup compatibility; signatures no longer gate any calculation. Existing explicit no-extra-step records remain valid historical input. Source changes recalculate the day/card/history immediately. Cross-tab refresh preserves unfinished form drafts through the existing save/conflict infrastructure. Derived expenditure is never persisted as a second source of truth.

## History and weight comparison

7/14/30/90 days and custom ranges up to 3661 days are available. Days automatically enter totals when profile, food calories and workout/overlap inputs are sufficiently known; unlogged steps use the 7.2.2 usual-activity assumption and its day count is displayed; no manual approval is used. All totals and comparisons remain provisional because unlogged meals/activity cannot be detected. A period with no qualified days has an unknown sum, not zero. Counts and all exclusion reasons are visible. The daily chart uses discrete points/bars with explicit missing positions; it cannot draw a cumulative line across gaps.

The 7700 kcal/kg conversion is only an illustrative energy equivalent. Weight averages use at least three measurements in a trailing seven-calendar-day window and appear only on actual measurement dates. Comparison requires two such points at least seven days apart. Their measurement counts/dates are shown. Energy is compared over full days `[first average date, last average date)`; measurement times are unknown. A discrepancy is withheld unless every day in this matching interval qualifies and none relies on assumed steps. Sparse weight histories produce no confident trend or comparison. No automatic calibration, energy target changes, or future weight access.

## Compatibility, privacy and operation

Version 7.3.0, schema remains 3. `energyBalance` is optional and not added to old databases merely by opening Today. Hiding its card retains its data. Old backups without this object preserve the current module during import, consistent with other optional modules. New full backups include it. Malformed records fail validation before storage/import. Unknown extension fields survive; existing food/steps/weight/null/zero/Gym values are not rewritten.

The existing localStorage primary/mirror, IndexedDB current/snapshots, recovery cache, Web Locks/fallback and ID-based three-way array merge remain in use. The app asset cache is separately versioned `my-rhythm-v7.3.0`; new assets are precached without deleting the data vault. No network calls, SDKs, account, server, health import or sync were added. Only fictional fixtures are committed. Device backups are never placed in GitHub.

Enable through **Today → Customize blocks → Energy Balance**, then set Profile. Use the existing Food/Steps/Body Check-in links for those inputs. Publication follows successful unit/browser tests, PR merge and the existing GitHub Pages process. The simplification task explicitly authorizes publication.
