МОЙ РИТМ — V4.0

Добавлено:
- Today Dashboard и дневной score.
- Completion Rate вместо упора только на streak.
- Недельные цели English и Gym.
- Прогресс 7/30 дней.
- Календарь и встроенный график активности.
- Insights по накопленным данным.
- Experiments для личных гипотез.
- Schema v2 с автоматической миграцией из V3.2.
- Постоянная база my-life-tracker-data и backup сохранены.

Загружай содержимое архива на ТОТ ЖЕ HTTPS-адрес. Перед обновлением желательно сделать backup.


V4.1:
- Убран трекер «Настроение».
- Кнопки в English теперь все одного стиля.
- В блоке «Быстрый ввод» все кнопки одного стиля.
- Тема обновлена на изумрудно-индиго.
- База my-life-tracker-data и backup полностью совместимы с V4.0.


V4.2 — BILINGUAL
- Добавлен полноценный язык интерфейса: Русский / English.
- Переключатель: Insights -> Оформление -> Язык интерфейса.
- Выбор языка сохраняется в постоянной базе my-life-tracker-data.
- Язык можно переключать сколько угодно без потери данных.
- Убран встроенный трекер «Настроение».
- Insights больше не зависят от настроения: используются улица, сон и English.
- Все кнопки быстрого ввода и English приведены к одному стилю.
- Закреплена изумрудно-индиго тема.
- Backup и schema v2 остаются совместимыми с V4.0/V4.1.


V4.3 — FULL BILINGUAL + NO WATER
- Убран встроенный трекер «Вода».
- Старые записи воды сохраняются в backup, но не показываются в интерфейсе.
- Доработан English UI для всех страниц и динамических элементов:
  названия метрик, единицы, Today Dashboard, Health, Progress, Insights,
  Experiments, календарь, цели и подписи.
- Встроенные метрики локализуются напрямую по ID, поэтому язык не зависит
  от того, как название сохранено в базе.
- Переключение языка по-прежнему сохраняется в my-life-tracker-data.


V4.4 — ENGLISH SIMPLIFIED
- В разделе English убраны Speaking и Grammar.
- В интерфейсе и новых расчётах English теперь участвуют только:
  ChatGPT, Native teacher, Russian teacher, Watching.
- Старые записи speaking/grammar остаются внутри backup/старых логов,
  но больше не отображаются и не входят в новые подсчёты.
- Остальные изменения V4.3 сохранены:
  full bilingual UI, no water, emerald-indigo theme.

V4.8 STABILITY AUDIT: fixed render crash, safe storage, tracker fallback, data diagnostics, visible goals, bilingual reference-like home UI.

V5.0 — NEON GLASS REBUILD
- Основа: стабильная V4.8 с восстановлением данных и диагностикой.
- Новый визуал: neon emerald + indigo, стеклянные карточки и тактильные кнопки.
- Добавлена фоновая картинка с ночными горами/лунным неоном.
- Мотивационный баннер использует отдельный scenic background.
- Карточки Без сигарет и Без алкоголя возвращены как активные кнопки.
- Нажатие отмечает текущий день smoke_free / alcohol_free, не меняя дату старта streak.
- Если дата старта не задана, карточка ведёт к настройкам даты.
- Ключ базы остаётся my-life-tracker-data, schemaVersion остаётся 2.
- Backup, RU/EN, English tracker, Progress, Insights и Experiments сохранены.


V5.1 — COMPACT HOME
- Полностью удалён блок Quick entry / Быстрый ввод с главного экрана.
- Карточки главных показателей сами остаются кликабельными для ввода данных.
- Убрана дублирующая строка Goal / Цель из карточек.
- Цель по-прежнему видна в формате current / target (например 7.5 / 8 h).
- Убраны длинные вспомогательные подписи из карточек без сигарет / без алкоголя.
- Карточки стали компактнее по высоте, особенно на iPhone.
- Данные, цели, backup и схема хранения не менялись.


V5.2 — SMOKE/ALCOHOL AS TOP STATS
- Карточки «Без сигарет» и «Без алкоголя» перенесены в верхний ряд.
- Эти две карточки теперь статистические, а не чек-ин карточки.
- Убран круглый чек-бокс / checkmark для них.
- Значения берутся из уже заполненных данных (дата начала периода / серия дней).
- Белок и Улица сдвинуты ниже.
- Остальная логика, данные и база хранения не менялись.


V5.3 — CLEAN STATS
- Убрана плашка «Статистика / Stats» из карточек без сигарет и без алкоголя.
- Значение серии теперь занимает больше доступной ширины.
- «455 дней / 455 days» принудительно отображается в одну строку и не переносится.
- Остальные данные и логика приложения не менялись.


V5.4 — HEALTH DATA FIX
- Health больше не выглядит пустым, если запись была вчера, а не сегодня.
- Если сегодня нет значения, показывается последняя реальная запись с датой: например «Вчера: 4200 / 7000 шагов».
- Большой процент теперь показывает прогресс последней/сегодняшней записи к цели:
  100/120 г = 83%, 4200/7000 шагов = 60%.
- Отдельно показывается среднее за 7 дней.
- Отдельно показывается число дней, когда цель была достигнута полностью.
- Таким образом 100 г белка или 4200 шагов больше не выглядят как «0 данных».
- Ключ базы, история и schemaVersion не менялись.


V5.7 — FOUR TABS / ATOMIC HEALTH REMOVAL
Base: working V5.4.

Only these UI/runtime changes were made:
1) Removed Health section.
2) Removed Health bottom navigation button.
3) Removed renderHealth from the main render() job list.
4) Changed bottom navigation grid from 5 columns to 4.

Current navigation:
Today → English → Progress → Insights.

Goals, Experiments, settings, dates, backup and diagnostics remain inside Insights
exactly as they were in V5.4.

The renderHealth function is intentionally left as unused guarded legacy code.
This avoids touching unrelated application logic.

DATA_KEY remains: my-life-tracker-data
schemaVersion remains: 2


V5.8 — STEPS INPUT
Base: V5.7 four-tab stable structure.

- Restored a direct Steps input point without bringing Health back.
- Added a wide Steps card to Today.
- Steps reads today's value from the same existing database key.
- Tapping the Steps card calls the same openEntry('steps') flow as the other numeric trackers.
- Displays current / goal, e.g. 4200 / 7000 steps.
- Progress/statistics logic and stored history were not changed.
- DATA_KEY remains my-life-tracker-data.
- schemaVersion remains 2.


V5.9 — WEIGHT + EXACT HOME GRID
Base: V5.8.

Today grid is now exactly:
Smoke-free | Alcohol-free
Weight     | Protein
Outdoors   | Steps
Workout    | Sleep

Weight behavior:
- Uses today's weight when available.
- Otherwise shows the latest weight already stored in history.
- Never displays an artificial 0 / goal.
- Tapping Weight opens the existing weight-entry flow.
- Weight remains stored under the existing weight field; no schema change.

Steps is back to a normal half-width card.
DATA_KEY remains my-life-tracker-data.
schemaVersion remains 2.


V6.0 — SAFE STORAGE + NEW ICON CACHE BUST
Base UI / trackers: V5.9.

DATA SAFETY
- Permanent primary key remains: my-life-tracker-data
- New mirror key: my-life-tracker-data-mirror-v1
- Every save writes both localStorage copies.
- Every save also updates IndexedDB database my-rhythm-vault-v1.
- IndexedDB keeps up to 100 rolling snapshots.
- Latest copy is also written to CacheStorage vault my-rhythm-data-vault-v1.
- Startup checks local, IndexedDB snapshots and CacheStorage and automatically restores
  the richer history if the primary copy is empty or less complete.
- External JSON backup is still required before deleting the PWA or clearing Safari data.
- Insights now shows local copy count, snapshot count, and last external backup date.
- Reset All uses two confirmations and clears every local recovery store.

ICONS
- apple-touch-icon-v2.png (180x180)
- my-rhythm-icon-192-v2.png
- my-rhythm-icon-512-v2.png
- New manifest URL: manifest-v6.webmanifest
- New filenames are intentional to bypass Safari's old icon URL cache.

IMPORTANT
Local redundancy protects against app-code bugs, a damaged/missing storage key,
and many ordinary upgrades. Browser/PWA deletion can remove ALL origin-local stores.
Only an exported JSON backup or future cloud sync protects against that scenario.


V6.1 — SAFARI HOME SCREEN ICON TEST
- Data/storage logic is unchanged from V6.0.
- Standard Safari icon added at site root: /apple-touch-icon.png (180x180).
- apple-touch-icon and apple-touch-icon-precomposed both point to it with ?v=61.
- New manifest: /manifest-v61.webmanifest?v=61.
- New manifest id/start_url to make this install distinguishable from older Home Screen installs.
- New icon filenames:
  /icon-192-v61.png
  /icon-512-v61.png
  /favicon-32-v61.png
- All generated icon PNGs are fully opaque.
- Service worker cache version bumped to v6.1-icon-test.

TEST:
1. Deploy all V6.1 files to the SAME Netlify site.
2. Open the site in Safari.
3. Refresh once.
4. Share -> Add to Home Screen.
5. Check the preview icon BEFORE pressing Add.
6. Since the historical data has not been restored yet, it is safe to delete/re-add the Home Screen app during this icon test.


V6.2 — ALCOHOL HISTORY CALENDAR
- Alcohol card on Today is clickable and opens a full-screen Month / Year calendar.
- Stored model: only drinking dates.
- Unmarked tracked past dates are automatically alcohol-free.
- Future dates are neutral/disabled.
- No portions are stored.
- Tracking starts 2025-01-01.
- Current streak is derived from calendar history.
- Visual language: emerald = alcohol-free; indigo/violet neon = drank; dark = future.
- Preloaded from the user's screenshots:
  2025: 82 drinking days
  2026 through Sep 8: 24 drinking days
  Total: 106
  Latest drinking day: 2026-08-30
  Current alcohol-free period begins: 2026-08-31
- V6 safe storage and Safari Home Screen icon setup are preserved.


V6.3 — BODY CHECK-IN (GitHub Pages)

MAIN SCREEN
- No visual/layout changes to Today.
- Weight card stays in the same position and style.
- Only its tap action changed: Weight now opens the Body screen.

BODY SCREEN
- Current weight + change vs previous weight.
- Last body-measurement check-in.
- Latest waist + change vs previous waist measurement.
- New Body Check-in form:
  Weight, Chest, Waist, Abdomen, Hips, Thigh.
- Any fields may be left blank.
- Existing date can be opened again and edited.
- A check-in can be deleted.
- Metric tabs:
  Weight / Chest / Waist / Abdomen / Hips / Thigh.
- Each metric has a trend chart, total change, and history list.
- Weight continues to use the existing daily logs field "weight",
  so Today, Progress, Body, backup and recovery remain consistent.
- Body circumference data is stored in additive field "bodyMeasurements".

PRELOADED BODY HISTORY FROM USER SCREENSHOTS
2026-01-09  Chest 104 / Waist 96 / Abdomen 103 / Hips 108
2026-01-23  Chest 102 / Waist 93 / Abdomen 101 / Hips 106
2026-02-11  Chest 99  / Waist 91 / Abdomen 100 / Hips 106
2026-02-20  Chest 99  / Waist 92 / Abdomen 98  / Hips 106
2026-03-07  Chest 101 / Waist 91 / Abdomen 99  / Hips 108
2026-03-18  Chest 99  / Waist 92 / Abdomen 99  / Hips 108
2026-04-10  Chest 98  / Waist 90 / Abdomen 99  / Hips 106
2026-06-12  Chest 99  / Waist 90 / Abdomen 98  / Hips 107
2026-06-28  Chest 102 / Waist 90 / Abdomen 98  / Hips 106

No historical Thigh values were invented. Thigh starts with the first new measurement.

V6 safe redundant storage, Alcohol Calendar, GitHub Pages-relative paths,
and Safari Home Screen icons are preserved.


V6.4 — MOTIVATION ENGINE (GitHub Pages)

PLACEMENT
- The top Today pill ("Small steps change big lives") stays unchanged.
- The large mountain card under the eight Today metric cards is now dynamic.
- No changes to the eight metric-card layout.

PRIORITY
1. Unseen milestone
2. Personal progress from the user's own data
3. One deterministic daily motivation message

LIBRARY
46 built-in motivational outcomes:
- 8 smoking milestones
- 7 alcohol milestones
- 5 English accumulated-practice milestones
- 4 gym milestones
- 3 protein-goal streak milestones
- 3 step-goal streak milestones
- 3 sleep-tracking milestones
- 3 body-check-in milestones
- 10 general daily messages

MEDICAL CONTENT
Smoking facts use official CDC / American Cancer Society timelines.
Alcohol facts intentionally do NOT claim a precise bodily recovery timeline.
They use supported risk-reduction wording from CDC and WHO.
Medical cards are clickable and expose their source link in the detail sheet.

MILESTONE BEHAVIOR
- A newly reached milestone stays on the mountain card until opened and marked as seen.
- Acknowledging a milestone also marks lower milestones in the same category as seen,
  so an old 1-day milestone will not appear after a newer 365-day milestone.
- Seen-state is stored in additive field motivationSeen and is included in backup/recovery.
- Generic daily messages are deterministic for the date and do not randomly change on every render.

PERSONAL PROGRESS
The fallback can use:
- current alcohol-free streak
- current smoke-free streak
- English minutes/hours in last 7 days
- waist change from first to latest Body check-in
- 7-day average sleep

V6 safe storage, Alcohol Calendar, Body, GitHub Pages paths, and Safari Home Screen icons are preserved.


V6.5 — MOTIVATION PHRASE ON HOME CARD
- The mountain motivation card now shows the actual motivation / medical fact directly.
- Medical cards no longer show "Source · ..." on the Home screen.
- The source remains available only inside the detail sheet after tapping the card.
- Medical/milestone layout:
    line 1: milestone title
    line 2–3: actual fact / motivation phrase
    footer: "Tap to learn more" or achievement label
- Today metric grid and all other screens are unchanged.


V6.6 — SAFE UI REORGANIZATION

PURPOSE
This release reorganizes the interface BEFORE Weekly Review.
It does NOT change the data schema or storage architecture.

VISIBLE CHANGES
- Removed the large repeated My Rhythm / Better than yesterday / RU/EN / Search / Gear header.
- Today starts directly with the existing Today/date/Small steps hero.
- English and Progress start directly with their compact page headings.
- Bottom tab "Insights" is now visibly "Settings".
- Existing relationship insights moved to Progress under "Patterns".
- Settings now contains Goal settings, Appearance & language, Data & backup,
  collapsible Data diagnostics, and collapsible Advanced/Experiments/Reset.

SAFETY / COMPATIBILITY
- Internal section id remains "analytics".
- Internal tab id remains "tabAnalytics".
- insightsList id is preserved and merely moved to Progress.
- Existing render/save functions remain connected to their original ids.
- schemaVersion remains 2.
- Primary localStorage key remains my-life-tracker-data.
- Mirror key remains my-life-tracker-data-mirror-v1.
- IndexedDB vault remains my-rhythm-vault-v1.
- Recovery Cache Storage remains my-rhythm-data-vault-v1.
- logs, alcoholHistory, bodyMeasurements, motivationSeen, experiments,
  trackers, goals, smokeDate and alcoholDate are not renamed or migrated.
- Weekly Review is NOT included in this release.

DIAGNOSTICS
Diagnostics now also show stored alcohol drinking-day count and Body Check-in count.
These values are derived and are not stored separately.

PUBLISHING
Upload all files from this package to the GitHub Pages repository root.
Do NOT upload personal backup JSON files to the public repository.
