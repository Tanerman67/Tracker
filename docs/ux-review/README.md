# UX/UI review

Base: main `5ec2e39`, My Rhythm 7.3.2. All screenshots use synthetic records and a fictional meal. No personal backup was used. No deployment or merge is included.

## Comparison

Screenshots show the same scenario and 390px viewport; Body uses the existing 7-day chart. Full-page screenshots retain the fixed bottom navigation at the viewport position.

| Screen | Before | After | Russian / light / 320px |
| --- | --- | --- | --- |
| Today | [Before](before/today.png) | [After](after/today.png) | [Narrow](after-ru-light-320/today.png) |
| Nutrition | [Before](before/nutrition.png) | [After](after/nutrition.png) | [Narrow](after-ru-light-320/nutrition.png) |
| Progress | [Before](before/progress.png) | [After](after/progress.png) | [Narrow](after-ru-light-320/progress.png) |
| Body | [Before](before/body.png) | [After](after/body.png) | [Narrow](after-ru-light-320/body.png) |
| Settings | [Before](before/settings.png) | [After](after/settings.png) | [Narrow](after-ru-light-320/settings.png) |

## What changed

- One local variable font, shared tokens, flat green surfaces, consistent controls and SVG system icons.
- Today keeps the saved layout. The date header is quieter; key values are stronger. Energy no longer repeats logged food when a Nutrition card is present.
- Nutrition retires the legacy protein writer. Food entry remains available. The diary is above optional tools; complete food records avoid an unnecessary missing-data explanation.
- Progress puts the period/metric/graph first and coverage last. Energy's period sum, both energy charts and weight comparison remain.
- Body highlights current weight, uses the same selectors, keeps all measurements/ranges and provides keyboard-accessible editable history.
- Settings keeps the existing groups and storage controls, with consistent fields and separate confirmed reset.
- Food/Body drafts are guarded on close. Food and profile success feedback follows the save result. iPhone editor sizing follows VisualViewport.

## Historical protein contract

This is the existing 7.3.2 behaviour, unchanged by the redesign:

| Food protein | Historical manual value | Displayed result |
| --- | --- | --- |
| Complete | Present or absent | Food sum |
| Partial with some known protein | Absent | Known food sum, marked partial |
| Partial or entirely unknown | Present, including zero | Historical manual value |
| No foods | Present | Historical manual value, labelled as historical |
| No usable source | Absent | Missing, never invented zero |

Sources are never added together. `logs[date].protein` is not deleted or migrated. Backup/import and the existing canonical calculation are preserved. The old function is removed and the generic protein entry path redirects to Nutrition; saving a stale legacy protein editor cannot write a new manual value.

## Review boundaries

No business calculations, storage keys, schema version, application URL or dashboard order were changed. Existing backup/IndexedDB/multi-tab safeguards remain. Inter's original licence and glyph coverage are retained.

Physical iPhone keyboard behaviour and actual installed-iOS PWA update still need a device check. Browser viewport reduction and VisualViewport handling are automated approximations. The annual Alcohol overview remains intentionally dense; the month view is available for editing dates. Some existing specialised chart and annual-calendar styling remains scoped to its screen, rather than risking unrelated logic changes.

Detailed validation results are in [VALIDATION.md](VALIDATION.md). Design rules are in [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md).

[Changed files](CHANGED_FILES.md) · [Overview comparison](comparison.jpg)
