# Unpublished Progress and Body fixes

Base: main d0ca860 (7.3.2 package version). No open pull requests at inspection.

- Energy Balance's multi-section history now uses an automatic-height chart host and establishes its own flow context. Other metrics retain their existing fixed chart heights. Chart rendering and energy calculations are unchanged.
- Body measurements have explicit chest, waist, abdomen, hips and thigh SVG paths instead of the generic Progress fallback.
- Customize Blocks rows use shared card, spacing and typography tokens and the same module icons as Today. Controls and saved layout semantics are unchanged.
- Added one Playwright regression test covering Energy Balance containment and separation from the weekly review at 320, 390 and 1280 px, in English and Russian, and returning to the weight chart.

Validation: all 116 Node tests passed; JavaScript syntax and git diff whitespace checks passed. Browser suite attempted but WebKit could not launch because required system libraries are missing. Chromium installation returned a truncated/invalid archive. The new geometry regression therefore remains unexecuted; visual verification is outstanding.

No storage, migration, backup, import/export, record values or calculation changes. Application asset cache version updated for release; the data vault is unaffected. Publication authorized by the user.
