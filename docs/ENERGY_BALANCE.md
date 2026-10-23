# Energy Balance implementation

Base: main 8e018f44d3554478d6e6c11aee819ff4cfda23f8 (7.1.0), schema 3.

## Architecture and inventory (stage A)

- Existing weight: `data.logs[date].weight`, edited by `openBodyCheckin` / `saveBodyCheckin`. `bodyMeasurements` is not a second weight source.
- Existing steps: `data.logs[date].steps`, edited by `openEntry`. Gym is boolean; outdoors is not walking.
- Existing food: `nutritionAggregate(date).calories`, including null/partial/source quality. No second food sum.
- Today: `dashboardAvailable`, `dashboardCard`, `dashboardOpen`; the new block is opt-in, absent from `defaultDashboardBlocks`.
- Secondary screen: existing `moduleModal`, `moduleShell`, shared date picker. No fifth tab.
- Storage: additive optional `energyBalance: {profile, workouts, days}`; existing schema 3 can retain unknown fields, so no schema bump or rewrites of old records are needed. Full JSON backup and the normal mirror/IndexedDB/cache vault retain the object. Older backups without the object preserve the current module. Three-way merge handles workout arrays by stable ID.
- Pure calculations: `energy-core.js` accepts database snapshots and the existing nutrition aggregate; UI adapter `energy.js` performs normal saves and routes to existing editors. No network requests or computed TDEE storage.

## Risks to verify

Food confirmation must become stale after editing/importing/deleting food, including changes in another tab. Activity confirmation must become stale after steps/Gym/workouts change. Historical weight must never look forward. Total workout calories require minutes and subtract resting energy. Unknown overlap must never add walking and watch estimates together. Sparse weight data and missing days must not imply a complete trend or complete cumulative history.

## Stages

A: inventory and pure utilities. B: profile, historical weight and net steps. C: workouts and overlap. D: daily statuses and UI. E: period analysis, backup/browser/offline checks and PR. Each stage is committed and tested.
