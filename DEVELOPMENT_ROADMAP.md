# Class 6 Learning Platform — Development Roadmap

This file is the project queue. When the user says `next`, continue with the first unchecked task. Keep this file synchronized with actual committed repository work.

## Progress Engine v2 — user-directed maintenance
- [x] Audit all progress, XP, streak and cloud-sync entry points before migration
- [x] Establish a single learning-activity date source for streak calculations
- [x] Migrate XP and progress consumers without losing existing user state
- [x] Harden streak persistence and cloud merging around activity dates
- [x] Add runtime regression checks for progress/XP/streak invariants
- [x] Add migration/versioning for the new progress state
- [x] Verify the migrated system across the main learning flows and leave final visual acceptance for a live browser/device session

## Post-Phase-8 maintenance — Executable weekly schedule verification
- [x] Add an executable Node VM harness that loads the production `tests/weekly-exam-plan.js` with a minimal browser shim
- [x] Add runtime assertions for all 13 exam Sundays, all 13 preview Sundays, 14-day spacing and stable Exam IDs
- [x] Add runtime assertions for prep/preview/exam/closed state transitions and T1–T13 syllabus/config contracts
- [x] Add `npm run check:weekly-exam-runtime` so the executable test is repeatable locally and in CI
- [x] Add GitHub Actions workflow to execute the runtime schedule test on relevant changes and manual dispatch
- [x] Verify the newly added runtime test passes in a GitHub Actions run

## Post-Phase-8 maintenance — Question bank quality hardening
- [x] Strengthen the repository question-quality audit with explicit structural validation, required bank presence checks, duplicate-stem detection and explanation/metadata reporting
- [x] Add a runtime quality gate to the scheduled paper for exactly 60 questions, exact subject counts, strict 5-question Reasoning split, unique stems, valid options/answers and syllabus-scope protection
- [x] Run the strengthened question-quality audit automatically in the weekly examination GitHub Actions workflow
- [x] Curate authoritative difficulty metadata across all seven subject question banks and enforce a balanced difficulty blueprint per test
- [x] Curate authoritative skill/cognitive-level metadata across all seven subject question banks and enforce a balanced cognitive blueprint per test
- [x] Audit and repair weak/duplicate question concepts, explanations and distractors across the complete Class 6 corpus
- [x] Make T12 and T13 final-exam syllabus coverage explicit chapter/topic contracts instead of relying only on all-material semantics

## Post-Phase-8 maintenance — GK content depth upgrade
- [x] Expand the seven Hindi GK topic tracks from compact 10-lesson sets to 15 lessons each with deeper explanations, context and examples
- [x] Activate the new depth layer without replacing the existing GK question/progress architecture
- [x] Synchronize the GK section overview with the expanded lesson counts and question-bank size
- [x] Align each newly added depth lesson with a lesson-specific Hindi question and show the lesson source in topic/practice views

## Post-Phase-8 maintenance — Global dark-theme consistency
- [x] Make the saved dark/light theme available across all HTML routes and harden dark-mode text contrast/readability without changing learning content

### Phase 8 QA boundary
The final QA pass is repository/static verification of the committed implementation. A live browser/device session is still the appropriate place for final human visual acceptance testing; this queue does not claim a browser session was executed by the assistant.

### Maintenance QA boundary
Revision, platform-integrity, entry/exit navigation, Sunday examination planner, Sunday examination hardening, exact weekly syllabus enforcement, candidate test UX hardening, executable weekly schedule verification, the structural question-quality hardening layer, the difficulty-blueprint hardening, the cognitive-blueprint hardening, question-corpus quality audit/repair, explicit T12/T13 final-syllabus contracts, Progress Engine v2, Science Easy-Language Aid, the GK content-depth upgrade, the GK lesson-question alignment, and the Global dark-theme consistency fix are verified from committed GitHub source, route wiring, schedule/syllabus contracts, runtime assertions, existing CI execution evidence, and live user acceptance of the repaired Science learning flow. The corrected question-quality CI run #8 passed the structural audit, the difficulty hardening CI run #14 passed the schedule/paper-generation/syllabus/difficulty checks, the cognitive hardening CI run #15 passed the complete weekly examination verification including the cognitive blueprint, the challenge-review quality CI run #35 passed the complete weekly examination verification plus 144 Science challenge review explanations and production resolver wiring, final-syllabus CI run #42 passed the explicit T12/T13 contract and generated-paper scope checks, and Progress Engine runtime CI run #2 passed the progress/XP/streak regression suite.

## Queue status
**Global dark-theme consistency maintenance is complete.** The saved theme now applies across the site's HTML routes, standalone pages receive the shared toggle, and dark-mode readability/contrast rules cover common learning-page text, cards, controls, forms, tables and feedback elements.

## Rule for `next`
1. Take the first unchecked task in this queue.
2. Make the change in GitHub.
3. Mark the task `[x]` only after the implementation is actually committed and the relevant verification has passed.
4. Then report briefly what changed and what `next` will do.
