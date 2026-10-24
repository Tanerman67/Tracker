# My Rhythm design system

Status: review implementation based on main `5ec2e3917ef385c9b7be0b8f29ce6f6fd83df999` (7.3.2). No release or schema migration.

## Ownership and architecture

`design-system.css` owns shared tokens and visual primitives. It loads after the existing screen modules. Screen CSS owns layout, not a second palette or font. Superseded root palettes and common paint declarations were removed from `app.css`; 327 selectors for retired English/motivation views were removed. Archived data readers and test fixtures remain intact.

`ui.js` contains inline SVG icons, editor draft checks, and VisualViewport handling. It never reads or writes persistent records. Keep calculations in their current modules. Do not change storage keys, addresses, schema, or historical source priority to implement a visual feature.

## Tokens

| Role | Rule |
| --- | --- |
| Font | Inter Variable, upright, with Latin and Cyrillic; system fallback |
| Main text | 16px; compact content 14px |
| Secondary text | 13–14px; no new tiny labels |
| Inputs | At least 16px to prevent iOS focus zoom |
| Weights | 400, 500, 600, 650; avoid extra heavy headings |
| Spacing | `--space-1/2/3/4/6/8`: 4, 8, 12, 16, 24, 32px |
| Controls | `--radius-control`: 12px |
| Cards | `--radius-card`: 18px |
| Surfaces | `--bg`, `--card`, `--card2`, `--input` |
| Text | `--text`, `--muted` |
| Actions | `--green`, `--on-accent`; green/teal identity |
| Borders and feedback | `--line`, `--danger`, `--focus` |

Both themes define the same semantic tokens. Use tokens instead of new hexadecimal colours. Chart series and cycle-state colours may use distinct semantic hues, but must remain readable in both themes. Avoid glow, background photography and heavy gradients. Use flat surfaces and restrained borders.

## Components

| Variant | Markup | Use |
| --- | --- | --- |
| Primary | `<button>` | Main action such as Save or Add food |
| Secondary | `<button class="secondary">` | Import, secondary actions |
| Ghost | `<button class="ghost">` | Quiet navigation or optional action |
| Danger | `<button class="danger">` | Delete/reset; keep explicit confirmation |
| Icon | Button with `uiIcon(name)` and an accessible label | Calendar, close and compact navigation |

Main actions are 48px high. Other controls have at least 44px touch targets. Use visible focus outlines, disabled and pressed states. The narrow month calendar uses a full-width layout to retain 44px day targets. Dense annual Alcohol overview remains a compact overview; use its month view for individual day actions.

Use native buttons, labelled inputs and `summary` for disclosure. A clickable history row must also support keyboard focus, Enter and Space. Do not rely on colour or emoji alone. System navigation uses the single SVG path set in `UI_PATHS`; user-defined tracker symbols are preserved.

Use the existing horizontal metric/range selectors in Progress and Body. Do not add another navigation level. Main numbers should be stronger than labels, explanations or coverage tables.

## Screen patterns

- Today: compact date header, configurable cards, visible daily energy and nutrition. Never reorder or resize the user's saved dashboard automatically.
- Nutrition: rings, Add food, secondary JSON import, diary, then optional tools/micros/history/goals. Keep historical protein source visible. Preserve unknown values and real percentages above 100%.
- Progress: period, metric, summary/change, graph, weekly review, calendar, expandable coverage. Keep expenditure, balance and weight comparison charts for Energy Balance.
- Body: current weight first, compact secondary values, one Add measurement action, existing chart/ranges and editable history. Back returns to Progress and restores its scroll.
- Settings: energy profile, dates/activity goals, appearance/language, backup, advanced diagnostics/reset. Destructive actions remain separated and confirmed.

## Forms and feedback

Food is a full-screen editor. Short habit edits remain sheets. Use the same fields and buttons in both. VisualViewport sets the available height above the software keyboard, with a sticky editor header and scrollable content. Never shrink input text below 16px.

Food and Body editors compare current fields with an initial snapshot. Closing a changed editor asks before discarding. Failed saves keep the editor open. Food save/delete/goals/import and energy-profile success messages must wait for persistence; never claim success before the storage result. Storage conflicts retain the existing downloadable draft mechanism.

Nutrition's bottom tab restores its selected date. A Today nutrition card passes Today's selected date explicitly. Avoid resetting date or scroll when returning from an editor.

## Font licence and offline behaviour

`fonts/InterVariable.woff2` is the original upright Inter Variable from `rsms/inter`, blob `5a8d3e72ad7ffb62af3b146e1b1f54ab5813a212`, 352,240 bytes. `fonts/OFL.txt` preserves the SIL Open Font License 1.1. Only one compressed variable font is shipped; no italic file, font CDN or external font request. The original glyph coverage is retained rather than an unverified subset. `font-display: swap` provides immediate fallback rendering.

The font, shared stylesheet and helpers are included in the existing service-worker asset cache. The review cache name is separate from 7.3.2, while all user-data stores and the application address are unchanged. App/package version stays 7.3.2 until a release is authorised.

## Future changes

Before adding CSS, search for an existing component. Edit the shared component or its screen layout instead of adding another override layer. Do not remove a selector just because it looks old: check active HTML, generated markup, and remaining module uses. Preserve archive readers independently from retired UI styles.

For UI changes, run unit/browser regressions and inspect screenshots. Cover narrow phones, English/Russian, both themes, unknown versus zero values, keyboard/focus, backup roundtrips and offline updates. Emulated keyboard tests do not replace a physical iPhone check.
