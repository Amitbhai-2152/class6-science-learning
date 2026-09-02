# Class 6 Learning Platform — Development Queue

This file is the project queue. When the user says `next`, continue with the first unfinished item in order. Do not ask the user to restate the plan unless they explicitly change direction.

## Phase 1 — Science foundation
- [x] Modular chapter architecture
- [x] Science Chapters 1–12 content files
- [x] Learning navigation and resume progress
- [x] Quiz engine with explanations/retry
- [x] Student dashboard and quiz history
- [x] XP, badges and streaks
- [x] Tutor quick actions and mobile chat UI
- [x] Interactive visual cards and SVG diagram foundation

## Phase 2 — Science quality upgrades
- [x] Connect real diagrams to relevant chapter sections
- [x] Add more chapter-specific SVG/illustrations
- [x] Add interactive mini activities/simulations
- [x] Improve tutor to use chapter content more deeply
- [x] Add spaced-revision / weak-topic recommendations
- [x] Add a full 12-chapter Science test mode
- [x] Add 2-hour CBT mode with timer, marks, review and final report
- [x] Run a full bug/accessibility/mobile audit

## Phase 3 — Mathematics
- [x] Create `subjects/maths/` modular architecture
- [x] Add Class 6 NCERT Maths chapter files
- [x] Build step-by-step solution engine
- [x] Add hint system and mistake analysis
- [x] Add Maths quiz/CBT engine
- [x] Add Maths tutor
- [x] Connect Maths progress/XP to shared learner dashboard

## Phase 4 — English Grammar & Translation
- [x] Create modular English architecture
- [x] Grammar lessons with examples
- [x] Translation practice
- [x] Error correction and answer explanation
- [x] Quiz/CBT and tutor

## Phase 5 — Hindi
- [x] Paragraph learning
- [x] Hindi grammar lessons
- [x] Practice and objective tests
- [x] Tutor and progress integration

## Phase 6 — GK + Mind/Thinking
- [x] Topic modules
- [x] Reasoning and thinking challenges
- [x] Timed quizzes
- [x] Progress and mastery tracking

## Phase 7 — Social Science (पूर्ण हिंदी)
- [x] Create Social Science architecture and 14-chapter Hindi learning hub
- [x] Add detailed chapter lessons, examples and source-based learning
- [x] Add map skills and interactive map activities
- [x] Add large Hindi practice bank with explanations
- [x] Add chapter tests and full Social Science CBT
- [x] Add Hindi Social Science Tutor with chapter context
- [x] Add Social Science progress, XP, mastery, revision and badges
- [x] Run Social Science mobile/accessibility/runtime QA

## Phase 8 — Platform Final QA & Polish
- [x] Audit and unify Social Science progress storage compatibility (V1/V2/V3 migration + cache refresh)
- [x] Audit primary internal links and redirect entry points for the completed platform sections
- [x] Audit primary script loading and dependency ordering for active learning flows
- [x] Audit responsive layout, overflow and touch-target safeguards in the active platform flows
- [x] Audit accessibility basics: labels, semantic controls, keyboard-accessible buttons/links and visible focus paths
- [x] Audit practice/CBT scoring, timer, restart and post-test review logic
- [x] Verify legacy/duplicate entry pages are retained only as intentional compatibility redirects
- [x] Complete repository-level static smoke-check and close the development queue

## Post-Phase-8 maintenance — Revision system
- [x] Repair Revision subject navigation using stable direct HTML routes
- [x] Provide 8 meaningful study cards per chapter across all six Revision subjects
- [x] Add persistent chapter-completion tracking for Revision
- [x] Connect Revision completion to XP and study streaks with duplicate-award protection
- [x] Surface Revision progress, XP and streak in shared learner progress
- [x] Remove obsolete Revision experiments that were superseded by the stable flow

## Post-Phase-8 maintenance — Platform integrity
- [x] Audit primary navigation across Home, All Classes, All Tests, all six subject hubs, Revision and compatibility redirects
- [x] Add repository navigation smoke-check for literal internal links and dynamic route contracts
- [x] Document navigation QA boundaries and remaining live browser/device acceptance requirement

### Phase 8 QA boundary
The final QA pass is repository/static verification of the committed implementation. A live browser/device session is still the appropriate place for final human visual acceptance testing; this queue does not claim a browser session was executed by the assistant.

### Maintenance QA boundary
Revision and platform-integrity maintenance above is verified from the committed GitHub source, route wiring, navigation contracts and progress integration. A live browser/device session is still the appropriate place for final human visual acceptance testing; the repository does not claim such a session was executed by the assistant.

## Queue status
**Development queue closed after Phase 8; Revision maintenance and platform-integrity audit items above are completed.** Future work should be treated as a new feature/maintenance request rather than assuming an unfinished queue item.

## Rule for `next`
1. Take the first unchecked task in this queue.
2. Make the change in GitHub.
3. Mark the task `[x]` only after the implementation is actually committed.
4. Then report briefly what changed and what `next` will do.
