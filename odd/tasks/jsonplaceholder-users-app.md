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
- `docs/prd/t5-readme.md`

Status: drafted, awaiting user review. Implementation is blocked until the
user approves or adjusts the PRDs.

## Tasks

| ID | Task | PRD | Route | Notes |
| -- | ---- | --- | ----- | ----- |
| T1 | Test infrastructure: Vitest + Testing Library + jsdom, `test` script, smoke test RED→GREEN | `docs/prd/t1-test-infrastructure.md` | delegated writer | TDD enabler |
| T2 | Users list with name search; loading / error / empty states | `docs/prd/t2-users-list.md` | delegated writer | strict TDD |
| T3 | User selection shows their posts | `docs/prd/t3-user-posts.md` | delegated writer | strict TDD |
| T4 | Create-post form (RHF) with cache update | `docs/prd/t4-create-post-form.md` | delegated writer | strict TDD |
| T5 | README | `docs/prd/t5-readme.md` | delegated writer | last, records real outcomes |

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
- [ ] PRDs reviewed / adjusted by user — **BLOCKED, waiting on user**.
- [ ] T1 Test infrastructure
- [ ] T2 Users list
- [ ] T3 User posts
- [ ] T4 Create-post form
- [ ] T5 README
