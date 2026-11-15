# PRD — T6: README

Goal: write the repository README so it answers exactly the five points of
the user brief: how to run it, decisions taken, what to do with more time, and
how AI was used (what was asked, accepted, corrected). This task is last and
records real outcomes, not intentions.

## User story

As a reviewer of this project, I want a README that explains how to run the
app and reflects the real decisions and AI collaboration, so that I can
evaluate the work without reading the whole history.

## Functional requirements

1. The README contains a "How to run" section listing the exact commands:
   install, `corepack yarn dev`, `corepack yarn test`, `corepack yarn
   typecheck`, `corepack yarn build`, `corepack yarn lint`, and what each
   verifies.
2. It contains a "Decisions taken" section that mirrors the decisions and
   rationales of `docs/prd/global.md` (router, TanStack Query keys, axios as
   the HTTP transport, Zod + `@hookform/resolvers` for form validation,
   client-side search, react-hook-form, Tailwind, Vitest, and the
   cache-update flows for create, edit, and delete because every write —
   `POST /posts`, `PUT /posts/{id}`, `DELETE /posts/{id}` — is faked and not
   persisted).
3. The "Decisions taken" section documents the client-side-search decision
   with its verified evidence: server-side full-text search exists
   (`GET /users?q=leanne` → `array[1]`, case-insensitive, verified; also
   `?name_like=`, exact `?name=`, and `?username=` filters), but the dataset
   can never really grow (`POST /users` was verified to not persist —
   `GET /users` still returns 10 users), so one fetch plus in-memory
   filtering is the chosen design.
3. It contains a "What to do with more time" section listing honest future
   work (for example: coverage tooling, E2E tests, better error observability,
   pagination if the dataset grew) — future work only, never presented as
   done.
4. It contains a "How AI was used" section with three parts: what was asked,
   what was accepted, and what was corrected.
5. The "How AI was used" section is written from the real session record —
   the PRD planning review and the rejected/corrected items — and is not
   invented; if the record does not cover a point, the section states that
   instead of fabricating content.
6. The README contains no claims that were not verified in this project
   (commands listed must be the scripts that actually exist in
   `package.json` at the time of writing).

## Out of scope

- Badges, screenshots, or a landing-style hero section.
- API documentation of JSONPlaceholder (a link is enough).
- Deployment instructions (no deployment target exists in the brief).
- Contribution guidelines or license files.

## Test requirements

T5 produces no executable code; its "tests" are documentation checks. Each
has a fails-now criterion because the README section does not exist yet.

- T6-1 "How to run" section exists and lists only commands that match real
  `package.json` scripts.
  - RED criterion: fails now because the README does not exist.
- T6-2 "Decisions taken" section exists and matches `docs/prd/global.md`
  decisions with their one-line rationales.
  - RED criterion: fails now because the README does not exist.
- T6-3 "What to do with more time" section exists and lists only undone work.
  - RED criterion: fails now because the README does not exist.
- T6-4 "How AI was used" section exists with asked/accepted/corrected parts
  traceable to the real session record (PRD review outcomes).
  - RED criterion: fails now because the README does not exist.

## Acceptance criteria

- [ ] The four sections (T6-1 … T6-4) exist, in that order or better.
- [ ] Every command in the README runs successfully in the repo at the time
      of writing.
- [ ] The AI-usage section cites real review outcomes (for example: PRDs
      reviewed before implementation, any item rejected or corrected during
      the review) with no invented dialogue or metrics.
- [ ] The README states that every JSONPlaceholder write is faked —
      `POST /posts`, `PUT /posts/{id}`, and `DELETE /posts/{id}` all return
      success without persisting, so the dataset can never really grow —
      wherever the create, edit, or delete flow is described.
- [ ] `corepack yarn typecheck`, `corepack yarn build`, `corepack yarn lint`,
      and `corepack yarn test` all pass after the README is added (docs-only
      change, but the suite must stay green).
