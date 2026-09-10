# Progress Engine v2 — Entry-Point Audit

Date: 2026-09-10
Scope: `main` branch, Class 6 Learning Hub only.

## Current architecture
The repository currently has two overlapping progress/reward layers:

1. `js/progress.js` — Science-first state containing `completed`, `best`, `section`, `history`, `xp`, `badges`, `streak`, `lastActive`, and `review`.
2. `js/xp-system.js` — unified subject XP state containing `subjects`, `total`, `events`, `daily`, and now `activeDays`.

The cloud layer persists these through the shared `student_state` record, while separate sync modules also handle XP, streak, badges, and Science subject progress.

## Activity / XP entry points audited

### `js/progress.js`
- `markActive()` is the legacy Science activity/streak writer.
- `addXP(points)` calls `markActive()` and writes legacy Science XP.
- `complete(id)` calls `markActive()` and then `addXP(50)`.
- `addAttempt(...)` and `recordCompositeTest(...)` call `markActive()` and `addXP(...)`.
- Review scheduling and Science badges are stored in the same legacy object.

Finding: this is a separate reward/state authority from `XPSystem` and can create duplicate XP/streak accounting.

### `js/app.js`
- Opening/advancing Science sections calls `Progress.markActive()`.
- Activity completion calls `Progress.addXP(5)`.
- Challenge completion updates best score, records an attempt, and may call `Progress.complete()`.
- Home reward UI reads the legacy `Progress.data.xp`, `Progress.data.streak`, and legacy badges.

Finding: the main Science flow is still wired directly to the legacy engine.

### `js/activities.js`
- Interactive Science activities award via `Progress.addXP(5)`.
- A per-activity localStorage flag prevents repeated awards for the same activity.

Finding: activity XP is not yet routed through the unified event ledger.

### `js/xp-system.js`
- `award()` is the unified XP writer.
- `score()` wraps `award()` for attempts.
- `recordActivity()` records a calendar activity date in `activeDays`.
- `recordLearningDay()` exposes activity-only recording.
- Daily XP is capped at 200 and XP events are retained up to 500 records.

Finding: this is the best candidate to become the primary reward/activity engine, but consumers must be migrated carefully to avoid double awards.

## Streak readers / writers audited

### `js/home-streak.js`
Current display derives a maximum across:
- dates found in unified XP events;
- legacy Science `streak`/`lastActive`;
- `streakState.streak`.

Finding: multiple authorities can disagree. The display should eventually calculate from one canonical activity-date set.

### `js/home-streak-cloud-sync.js`
- Reads local activity dates/events and cloud `streakState`.
- Current merge still includes `max(local.streak, cloud.streak)`.
- Activity dates are merged, but the persisted streak is not fully derived from those dates.

Finding: cloud streak must be recalculated from merged activity dates rather than preserving the largest historical number.

### `js/subject-progress-cloud-sync.js`
- Persists Science progress including legacy `streak` and `lastActive`.
- Its merge also uses `max(streak)` and latest `lastActive`.

Finding: this duplicates streak persistence and must stop acting as an independent streak authority during migration.

## Unified XP cloud path audited

### `js/xp-cloud-sync.js`
- Uses account-scope protection through `prepareUser(user.id)`.
- Merges subject XP by maximum and combines XP events.
- Saves the unified XP object back to the cloud.

Finding: event/subject merging is useful, but the new `activeDays` field must become part of the canonical cloud merge contract.

### `js/badge-cloud-sync.js`
- Derives badges from unified XP and merges badge IDs into `badgeState`.

Finding: badge authority can remain derived from unified XP after migration; no need for a second independent badge calculator.

## Cross-subject progress display audited

### `js/shared-progress.js`
- Reads each subject's legacy local storage structure directly.
- Calculates a separate total XP from those legacy sources.
- Reads Science from `Progress.data`.

Finding: this view currently reflects multiple storage formats and therefore cannot be the source of truth. It should consume the canonical progress engine after migration.

## Main risks identified

1. Double XP: one user action can still be processed by legacy `Progress` and unified `XPSystem` paths.
2. Streak divergence: legacy streak, event-derived streak, and cloud streak can disagree.
3. Cloud merge inflation/staleness: `max(streak)` can preserve an invalid streak after activity dates change.
4. Cross-subject inconsistency: shared progress reads legacy subject stores rather than unified state.
5. Migration risk: replacing legacy writes without preserving old scores/attempts can erase legitimate user progress.

## Migration boundary
The safe migration direction is:

`learning action -> canonical activity record -> XP ledger + progress state -> cloud sync -> derived UI`

Legacy structures should first be treated as migration inputs, then stopped from receiving new reward writes once equivalent v2 writes are verified.

## Verification plan
Before enabling the migrated engine broadly, verify:
- one action creates at most one XP event;
- repeated action IDs are idempotent where intended;
- activity-only actions update the learning day without requiring XP;
- streak is exactly the number of consecutive active calendar days ending today;
- a missed day resets current streak but preserves longest streak;
- cloud merge unions activity dates and XP events without duplicating awards;
- account switching cannot import prior account progress;
- existing legacy XP/progress remains available after migration;
- home/progress/revision/test flows all consume the same canonical state.
