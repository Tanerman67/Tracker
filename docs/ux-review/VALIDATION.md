# Validation

Baseline: `main` 5ec2e39 (7.3.2). Latest five main commits inspected; no open PR at the start. Implementation is a review branch, not a deployed release.

## Checks

- Baseline `npm test`: 113 passed.
- Revised `npm test`: 116 passed, including historical protein source combinations, blocking the legacy writer, failed-save feedback and repeated Save taps.
- Playwright: Chromium desktop and iPhone-emulated Chromium; complete suite plus the added contrast check. 70 checks passed in the complete Chromium run (35 per project). The final contrast regression passed in both Chromium projects, and the compact Alcohol-year regression passed in both projects, giving 74 successful Chromium checks across the suite and the added checks. The default command then stopped on WebKit launch because host libraries are unavailable.
- Widths: 320, 360, 375, 390, 414px; English/Russian; dark/light; main screens and food editor, plus a dedicated Body matrix.
- Focus-visible and 44px main controls; 16px fields; contrast checks for controls/headings/labels. Visual inspection corrected low-contrast light chart labels and narrow calendar targets.
- Food save/edit/delete, partial and over-100% rings, frequent-food reuse, scaling and copy-day behaviour.
- Backup export and restore into another browser profile; legacy records and unknown/zero values; dashboard order, cycle and archived English data.
- Reload persistence, multi-tab independent edits/conflicts, IndexedDB fallback and recovery.
- PWA offline reload and upgrades from historical 6.13/7.0 assets. Review cache name and shared font/helper assets included.
- Keyboard viewport reduction, sticky food-editor controls, date context and scroll restoration.
- Screenshot comparison for all five requested screens; extra Russian/light/320px captures. See README.

## Local environment limits

The WebKit browser was downloaded, but this container lacks the required GTK/GStreamer/shared libraries. Installing host dependencies failed because the container could not write the system package cache. No WebKit pass is claimed locally. The existing GitHub Actions verification is enabled for pull requests and installs Chromium/WebKit with dependencies on its Ubuntu runner.

A real iPhone software keyboard, safe-area behaviour and installed iOS PWA update require a physical-device check. Emulation covers viewport/layout changes, not the complete iOS environment.

The annual Alcohol overview retains smaller day cells as an overview; the normal month calendar is the editing surface. Common/root styles and retired English selectors were cleaned, but this is not a rewrite of every specialised chart/annual-calendar rule.

## Data contracts

No storage code/schema/key changes. No personal data in fixtures or screenshots. Historical protein values are read-only and preserved by backups; complete food data takes priority, incomplete food data falls back to a historical manual value, and sources never sum together.

## CI follow-up

The first remote run stopped during the existing IndexedDB fallback test with a DevTools execution-context error. The trace showed no navigation request. The test now starts the same two concurrent saves and polls their completion results instead of holding two long-lived DevTools Promise handles. Both results must still be true and the merged records must still survive reload. Application storage logic is unchanged. This version passed 20 local repetitions across desktop/mobile Chromium; remote Chromium/WebKit verification is rerun on the updated head.
