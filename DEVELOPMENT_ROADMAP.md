# Class 6 Learning Platform — Development Roadmap

This file is the project queue. When the user says `next`, continue with the first unchecked task. Keep this file synchronized with actual committed repository work.

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
- [ ] Curate authoritative skill/cognitive-level metadata across all seven subject question banks and enforce a balanced cognitive blueprint per test
- [ ] Audit and repair weak/duplicate question concepts, explanations and distractors across the complete Class 6 corpus
- [ ] Make T12 and T13 final-exam syllabus coverage explicit chapter/topic contracts instead of relying only on all-material semantics

### Phase 8 QA boundary
The final QA pass is repository/static verification of the committed implementation. A live browser/device session is still the appropriate place for final human visual acceptance testing; this queue does not claim a browser session was executed by the assistant.

### Maintenance QA boundary
Revision, platform-integrity, entry/exit navigation, Sunday examination planner, Sunday examination hardening, exact weekly syllabus enforcement, candidate test UX hardening, executable weekly schedule verification, the structural question-quality hardening layer, and the difficulty-blueprint hardening are verified from committed GitHub source, route wiring, schedule/syllabus contracts, runtime assertions and CI execution. A live browser/device session is still the appropriate place for final human visual acceptance testing; the repository does not claim such a session was executed by the assistant. The corrected question-quality CI run #8 passed the structural audit, and the difficulty hardening CI run #14 passed syntax validation, the weekly schedule contract, the executable 13-exam paper-generation/syllabus-scope test, and the question-quality audit.

## Queue status
**Current queue is ready for the next quality-hardening task.** Difficulty blueprint enforcement is verified. The next unchecked item is authoritative skill/cognitive-level metadata and balanced cognitive blueprint enforcement across the seven subject banks.

## Rule for `next`
1. Take the first unchecked task in this queue.
2. Make the change in GitHub.
3. Mark the task `[x]` only after the implementation is actually committed and the relevant verification has passed.
4. Then report briefly what changed and what `next` will do.
