# jsonplaceholder-users-app

## Objective

Small React + TypeScript app against https://jsonplaceholder.typicode.com:
searchable users list, per-user posts, and a validated create-post form, with
visible loading/error states, TDD (strict), at least 3 tests, and a README
covering decisions, future work and AI usage.

## Problem

The scaffold now has TypeScript, TanStack Query, react-hook-form and Vitest
pending first real use. This feature puts all of them under load with a real
public API.

## Source of requirements

User brief (this session, authoritative):

1. Users list with search by name.
2. Selecting a user shows their posts; a validated form creates a new post
   (title and text required). The API does not persist, so it is enough that
   the new post appears in the list.
3. Loading and error states visible.
4. At least 3 tests with Vitest or Jest + Testing Library.
5. README: how to run it, decisions taken, what to do with more time, and how
   AI was used (what was asked, accepted, corrected).

Process decision by the user: a global PRD plus one PRD per task, reviewed by
the user before implementation starts. TDD explicitly requested.

## Planning artifacts

- `docs/prd/global.md` — vision, scope, architecture, API contract, quality bar.
- `docs/prd/t1-test-infrastructure.md`
- `docs/prd/t2-users-list.md`
- `docs/prd/t3-user-posts.md`
- `docs/prd/t4-create-post-form.md`
- `docs/prd/t5-edit-delete-posts.md`
- `docs/prd/t6-readme.md`

Status: review round 1 applied (user decisions: axios, Zod + @hookform/resolvers,
edit/delete in scope with delete confirmation, cache-behavior tests in T2/T3,
client-side search kept with corrected rationale documented in the README).
Awaiting the user's second review. Implementation stays blocked until approval.

### Review round 1 — decisions of record

1. Navigation list -> posts confirmed as already specced (no change).
2. Axios adopted as HTTP transport behind `src/api/` (BASE_URL + typed
   wrappers); single source of truth for URLs is the module, not axios.
3. Cache-behavior tests added: T2-6 and T3-5 assert the fetch mock is called
   exactly once on remount (reads from cache).
4. Zod + @hookform/resolvers adopted: one schema = validation + types
   (`z.infer`); RHF has no "extendType" — schema inference is the typing.
5. Edit (inline, reuses the T4 schema, `PUT /posts/{id}`, in-place cache
   update) and delete (explicit confirmation, `DELETE /posts/{id}`, cache
   removal) added as T5; README renumbered to T6.
6. Search stays client-side; rationale corrected (server-side `?q=` exists,
   verified live, but the dataset can never really grow — every write is
   faked, verified with `POST /users` -> 201 that is not persisted); the
   README must document this decision and its evidence.

## Tasks

| ID | Task | PRD | Route | Notes |
| -- | ---- | --- | ----- | ----- |
| T1 | Test infrastructure: Vitest + Testing Library + jsdom, `test` script, smoke test RED→GREEN | `docs/prd/t1-test-infrastructure.md` | delegated writer | TDD enabler |
| T2 | Users list with name search; loading / error / empty states; cache test | `docs/prd/t2-users-list.md` | delegated writer | strict TDD |
| T3 | User selection shows their posts; cache test | `docs/prd/t3-user-posts.md` | delegated writer | strict TDD |
| T4 | Create-post form (RHF + Zod) with cache update | `docs/prd/t4-create-post-form.md` | delegated writer | strict TDD |
| T5 | Edit and delete posts with cache update | `docs/prd/t5-edit-delete-posts.md` | delegated writer | strict TDD |
| T6 | README | `docs/prd/t6-readme.md` | delegated writer | last, records real outcomes |

## TDD mode

- **Enabled, strict** — explicit user request ("Vamos a usar TDD").
- Source of the decision: session conversation; no project test config existed.
- Runner: Vitest + Testing Library (decided in PRD review; to be installed in T1).
- Rule: observable RED before each behavior implementation, then GREEN, then
  refactor. Never invent test evidence.

## Delivery

- Forecast: ~600–800 authored lines across code + tests + docs (exceeds the
  ~400-line review budget). Delivery strategy default `ask-on-risk`: ask the
  user once about chain strategy before `apply` crosses the budget.
- Branch: `feat/jsonplaceholder-users-app` (created from the current
  `feat/typescript-tanstack-query` branch, since this feature depends on it).

## Progress

- [x] Exploration: scaffold state known (TS strict, query client wired,
      RHF installed unused, Tailwind sole styling system, no tests yet).
- [x] PRDs drafted (global + 5 tasks).
- [x] Review round 1 applied: axios, Zod, T5 edit/delete, cache tests, search
      rationale corrected. 20 tests planned.
- [ ] PRDs approved by user (second review) — **BLOCKED, waiting on user**.
- [x] T1 Test infrastructure — vitest@0.34.6 + RTL 14.3.1 + jsdom 25.0.1 +
      jest-dom 6.9.1 (exact pin to avoid the RTL-14 peer conflict); `test`
      script `vitest run`; config in `vite.config.ts` via `vitest/config`
      (`defineConfig` — the `/// <reference types="vitest" />` directive does
      NOT typecheck on 0.34.6); `src/test/setup.ts` with cleanup;
      `src/App.test.tsx` smoke test. RED observed (`error Command "test" not
      found`), then GREEN. `resolutions: {"vitest/vite": "^4.3.9"}` added to
      keep a single Vite 4 copy (vitest's range resolves a nested vite 5
      otherwise). App.tsx/main.tsx untouched (verified via git diff).
- [ ] T2 Users list
- [ ] T3 User posts
- [ ] T4 Create-post form
- [ ] T5 Edit and delete posts
- [ ] T6 README
