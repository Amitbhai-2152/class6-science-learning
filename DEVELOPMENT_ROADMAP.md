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

## Post-Phase-8 maintenance — Entry/Exit navigation hardening
- [x] Add consistent Home / All Classes / All Tests / Revision exits to Maths, English, Hindi, GK + Reasoning and Social Science hubs
- [x] Preserve full-card subject/chapter entry routes and mobile-sized navigation targets
- [x] Re-check relative paths from each subject hub after navigation changes

## Post-Phase-8 maintenance — Sunday examination planner
- [x] Add calendar-driven Sunday Preview → next Sunday Candidate Exam cycle
- [x] Schedule 13 candidate exams from 13 September 2026 through 28 February 2027
- [x] Add responsive test planner with live preview/exam status and countdown
- [x] Route the primary Home All Tests entry to the weekly planner while preserving the existing combined exam engine
- [x] Document weekly test planner navigation and QA boundary

## Post-Phase-8 maintenance — Sunday examination hardening
- [x] Create one centralized weekly schedule source used by the planner and exam gate
- [x] Validate exam count, Sunday dates, preview Sundays, 14-day spacing and final date at runtime
- [x] Strictly lock candidate registration outside the scheduled exam Sunday
- [x] Give each weekly examination a stable Exam ID
- [x] Make the weekly paper deterministic for the same Exam ID to prevent silent paper changes on refresh
- [x] Add repository smoke-check coverage for the weekly exam files, schedule and integration contracts

## Post-Phase-8 maintenance — Exact weekly syllabus enforcement
- [x] Define exact T1–T13 syllabus coverage across Science, Mathematics, English, Hindi, GK, Reasoning and Social Science
- [x] Drive the weekly paper from the declared syllabus instead of generic current/previous scope
- [x] Enforce 10 questions per core subject and a strict 5 GK + 5 Reasoning split
- [x] Add deterministic scoped question selection using each weekly Exam ID
- [x] Surface the same exact syllabus on the All Tests banner and planner
- [x] Extend the repository smoke-check to cover syllabus structure and scoped-paper contracts

## Post-Phase-8 maintenance — Candidate test UX hardening
- [x] Prevent the Science AI Tutor floating control from overlapping lesson Back/Next navigation on mobile and desktop layouts
- [x] Add a pre-test candidate-instruction gate for the Science full test
- [x] Add a pre-start instruction gate for Science CBT after candidate details are filled
- [x] Add candidate instructions before Science chapter challenges
- [x] Add a visible candidate-instruction block before Maths Practice/CBT entry
- [x] Preserve test landing pages as the explicit place where candidates review rules before starting timed tests

## Post-Phase-8 maintenance — Executable weekly schedule verification
- [x] Add an executable Node VM harness that loads the production `tests/weekly-exam-plan.js` with a minimal browser shim
- [x] Add runtime assertions for all 13 exam Sundays, all 13 preview Sundays, 14-day spacing and stable Exam IDs
- [x] Add runtime assertions for prep/preview/exam/closed state transitions and T1–T13 syllabus/config contracts
- [x] Add `npm run check:weekly-exam-runtime` so the executable test is repeatable locally and in CI
- [x] Add GitHub Actions workflow to execute the runtime schedule test on relevant changes and manual dispatch
- [ ] Verify the newly added runtime test passes in a GitHub Actions run

### Phase 8 QA boundary
The final QA pass is repository/static verification of the committed implementation. A live browser/device session is still the appropriate place for final human visual acceptance testing; this queue does not claim a browser session was executed by the assistant.

### Maintenance QA boundary
Revision, platform-integrity, entry/exit navigation, Sunday examination planner, Sunday examination hardening, exact weekly syllabus enforcement, candidate test UX hardening, and executable weekly schedule verification are verified from the committed GitHub source, route wiring, schedule/syllabus contracts and feature integration. A live browser/device session is still the appropriate place for final human visual acceptance testing; the repository does not claim such a session was executed by the assistant. The executable weekly schedule test is wired into GitHub Actions, but its CI result has not yet been independently confirmed here.

## Queue status
**Current queue is pending the first GitHub Actions pass of executable weekly schedule verification.** Future work should be treated as a new feature/maintenance request after that verification is confirmed.

## Rule for `next`
1. Take the first unchecked task in this queue.
2. Make the change in GitHub.
3. Mark the task `[x]` only after the implementation is actually committed.
4. Then report briefly what changed and what `next` will do.
