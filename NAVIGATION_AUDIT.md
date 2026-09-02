# Navigation Audit — Class 6 Learning Platform

Audit date: 2026-09-02

## Scope

This audit covers the repository's primary navigation entry points, subject hubs, chapter/tool pages, test hubs, Revision routes, legacy redirects, and literal internal `href` / `src` references.

## Navigation hierarchy

The platform uses a strict parent-child navigation model for subject learning:

- Home → All Classes → Subject Hub
- Subject Hub → Chapter / Subject Tool
- Chapter / Subject Tool → its own Subject Hub
- Subject Hub → All Classes
- All Classes → Home
- Moving between chapters/topics stays inside the same Subject Hub context.

Child pages must not add global Home / All Classes / All Tests / Revision navigation controls merely to provide an exit. Their primary exit is the immediate parent subject hub.

## Verified primary routes

- Home → All Classes: `subjects/all-classes.html`
- Home → All Tests: `tests/index.html`
- Home → Revision: `revision-v2.html`
- All Classes → Science: `subjects/science/index.html`
- All Classes → Maths: `subjects/maths/index.html`
- All Classes → English: `subjects/english/index.html`
- All Classes → Hindi: `subjects/hindi/index.html`
- All Classes → GK + Reasoning: `subjects/gk/index.html`
- All Classes → Social Science: `subjects/social-science/index.html`

## Verified subject exits

- Science chapter flow exits to the dedicated Science Subject Hub.
- Maths chapters use `← Maths Home` → `subjects/maths/index.html`.
- English chapters and English learning tools use `← English Home` → `subjects/english/index.html`.
- Hindi chapters and Hindi learning tools use `← Hindi Home` → `subjects/hindi/index.html`.
- GK topic/practice/challenge/reasoning flows use `← GK + Reasoning` → `subjects/gk/index.html`.
- Social Science chapter/practice/tool flows use their local Subject Hub exit → `subjects/social-science/index.html`.
- Subject hubs themselves exit one level upward to `subjects/all-classes.html`.
- Subject chapter links stay within their subject and preserve the `chapter` / `topic` query context.

## Verified subject tool routes

- Science practice / CBT routes are owned by the Science learning flow and return to the Science context rather than bypassing the subject layer.
- Maths chapter, practice and CBT links resolve to files present in `subjects/maths/`.
- English chapter, practice, translation, error-correction, vocabulary and full-test entry points resolve to files present in `subjects/english/`.
- Hindi chapter, grammar, paragraph-learning, practice and full-test entry points resolve to files present in `subjects/hindi/`.
- GK + Reasoning topic, practice and challenge entry points resolve to files present in `subjects/gk/`.
- Social Science chapter, practice, test, tutor, map and progress entry points resolve to files present in `subjects/social-science/`.
- Revision subject routes use the single stable `revision-v2.html?subject=<id>` route and the existing `js/revision-quality.js` owner.
- Legacy `revision.html` is an intentional redirect to `revision-v2.html`.
- Social Science `practice.html` and `test.html` remain intentional compatibility redirects to their current implementations.

## Navigation safeguards

`scripts/check-navigation.mjs` recursively checks literal internal HTML `href` / `src` resource references and validates the known dynamic route contracts. Run with:

```bash
npm run check:navigation
```

External URLs, anchors, `mailto:` links, and JavaScript/data URLs are intentionally excluded from literal file-existence checks.

## QA boundary

This is a repository/static navigation audit. It does not claim a live browser/device session was executed. Final visual/touch acceptance should still be performed in a browser, including mobile testing of every hub and test flow.
