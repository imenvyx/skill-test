# PRD — Global: JSONPlaceholder Users App

Small React + TypeScript application against https://jsonplaceholder.typicode.com:
a searchable users list, per-user posts, and a validated create-post form, with
visible loading/error states, strict TDD, at least 3 tests, and a README that
records decisions and AI usage. This document governs the five task PRDs
(`t1-test-infrastructure.md` … `t5-readme.md`); where a task PRD repeats a rule,
this document wins on conflicts.

## Vision

A compact, honest demo of the existing scaffold under real load: TypeScript
strict, TanStack Query, react-hook-form, Vitest + Testing Library, and Tailwind
all get their first production use against a real public API. The app is small
on purpose; its value is the engineering discipline around it (TDD, visible
states, documented tradeoffs), not feature count.

## Requirements

User brief (from `odd/tasks/jsonplaceholder-users-app.md`, section
"Source of requirements" — authoritative, verbatim):

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

## Scope

| Task | Deliverable | PRD |
| ---- | ----------- | --- |
| T1 | Vitest + Testing Library + jsdom, `test` script, smoke test RED→GREEN | `docs/prd/t1-test-infrastructure.md` |
| T2 | Users list with name search; loading / error / empty states | `docs/prd/t2-users-list.md` |
| T3 | User selection shows their posts | `docs/prd/t3-user-posts.md` |
| T4 | Create-post form (react-hook-form) with cache update | `docs/prd/t4-create-post-form.md` |
| T5 | README recording real outcomes | `docs/prd/t5-readme.md` |

## Non-goals

- No authentication or any form of session handling.
- No pagination and no sorting of users or posts (10 users; JSONPlaceholder
  returns all posts per user in one call).
- No server-side search: not offered by JSONPlaceholder; the app filters
  client-side only.
- No persistence of created posts beyond the in-memory query cache: the
  `POST /posts` endpoint of JSONPlaceholder does not persist; documenting this
  and updating the cache is the requirement, not a backend.
- No editing or deleting of users or posts.
- No search by any field other than the user's name.
- No themes, dark mode, or visual redesign beyond Tailwind-based states.
- No E2E (Playwright) tests and no coverage thresholds tooling; the quality bar
  is behavior tests with Testing Library.
- No i18n; UI copy in English.

## Architecture decisions

| Decision | Rationale (one line) |
| -------- | -------------------- |
| React Router v6 with routes `/users` and `/users/:userId` | Installed but unused; two screens need shareable URLs and navigation without hand-rolled state. |
| TanStack Query as the only server-state layer, keys `['users']` and `['posts', userId]` | `QueryClientProvider` is already wired at the root (`src/lib/queryClient.ts`); it provides loading/error/retry semantics without ad-hoc state machines. |
| Client-side case-insensitive substring search on the user's `name` | JSONPlaceholder has no server-side search endpoint and exposes exactly 10 users, so in-memory filtering is correct and simple. |
| react-hook-form for the create-post form | Installed but unused; per-field validation and submit lifecycle without manually controlled inputs. |
| Tailwind for all styling | Tailwind 3 is the only styling system in the repo (Emotion was removed). |
| Vitest + Testing Library + jsdom as the test stack | Decided in planning; Vitest reuses the Vite 4 toolchain with no extra bundler configuration. |
| Create flow updates the query cache (`setQueryData` on `['posts', userId]`) instead of refetching | `POST /posts` does not persist, so a refetch would not return the created post; the cache update is what makes it appear. |

API contract (fixed): `GET /users` → 10 user objects; `GET /posts?userId={id}`
→ array of posts (empty array for unknown `userId`); `POST /posts` → created
object with a new `id`, not persisted.

## Directory layout

```
src/
├── api/              # fetch wrappers for the three JSONPlaceholder endpoints
├── features/
│   ├── users/        # users list screen: data hook, search, component, tests
│   └── posts/        # posts screen: data hook, create form, component, tests
├── components/       # shared presentational pieces (loading, error, retry)
└── lib/              # queryClient.ts (existing, unchanged)
```

Tests live next to their units (`*.test.tsx` in the same feature folder).

## TDD policy

Strict mode, explicitly requested by the user ("Vamos a usar TDD").

- RED observed before implementation: the new or changed test must be compiled
  and executed, and must fail for the intended reason (missing behavior or,
  for T1, the missing test runner). A test that was only written does not
  count as RED; a failure caused by unrelated syntax errors or broken setup
  does not count either.
- GREEN with minimal implementation; refactor only while tests remain green.
- Test evidence is never invented; every claimed RED/GREEN comes from an
  actual run of `corepack yarn test`.
- Checkpoint commits after RED and after GREEN validation, per the
  tdd-workflow skill (implementation-time rule; applies when implementation
  starts, not during PRD review).

## Test quality bar

The user brief sets a floor of 3 tests. The planned set exceeds it:

| PRD | Planned tests |
| --- | ------------- |
| T1 | 1 (smoke test) |
| T2 | 5 |
| T3 | 4 |
| T4 | 4 |
| **Total** | **14** |

All tests target user-visible behavior (Testing Library queries by role/text),
not implementation details; each test is independent and sets up its own data.

## Delivery

- Forecast: ~600–800 authored lines across code + tests + docs, which exceeds
  the ~400-line review budget.
- Delivery strategy default `ask-on-risk`: ask the user once about chain
  strategy (e.g. chained PRs vs. single PR) before `apply` crosses the budget.
- Branch: `feat/jsonplaceholder-users-app`, created from the current
  `feat/typescript-tanstack-query` branch (this feature depends on it).
- Verification commands, all required to pass before a task is done:
  `corepack yarn test`, `corepack yarn typecheck`, `corepack yarn build`,
  `corepack yarn lint`.

## Next step

User reviews these PRDs; implementation starts only after approval or
adjustments.
