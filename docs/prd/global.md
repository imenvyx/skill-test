# PRD — Global: JSONPlaceholder Users App

Small React + TypeScript application against https://jsonplaceholder.typicode.com:
a searchable users list, per-user posts, and a validated create-post form, with
visible loading/error states, strict TDD, at least 3 tests, and a README that
records decisions and AI usage. This document governs the six task PRDs
(`t1-test-infrastructure.md` … `t6-readme.md`); where a task PRD repeats a rule,
this document wins on conflicts.

All verified-API-evidence claims in these PRDs (endpoint shapes, the
non-persistence of every write, the existence of server-side search) come from
live probes against JSONPlaceholder recorded in the session record; the README
(T6) cites that record as its evidence.

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
| T4 | Create-post form (react-hook-form + Zod) with cache update | `docs/prd/t4-create-post-form.md` |
| T5 | Edit and delete posts with cache update | `docs/prd/t5-edit-delete-posts.md` |
| T6 | README recording real outcomes | `docs/prd/t6-readme.md` |

## Non-goals

- No authentication or any form of session handling.
- No pagination and no sorting of users or posts (10 users; JSONPlaceholder
  returns all posts per user in one call).
- No server-side search in the app: JSONPlaceholder *does* offer server-side
  full-text search (`GET /users?q=…`, verified), but the dataset can never
  really grow (every write is faked — verified with `POST /users`), so one
  fetch plus in-memory filtering is the chosen design, not a workaround.
- No persistence of any write beyond the in-memory query cache: `POST /posts`,
  `PUT /posts/{id}`, `DELETE /posts/{id}`, and `POST /users` are all faked by
  JSONPlaceholder (each verified); the dataset can never really grow. Documenting
  this and updating the cache is the requirement, not a backend.
- No editing or deleting of users.
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
| Client-side case-insensitive substring search on the user's `name` | Server-side full-text search exists (`?q=`, verified), but the dataset can never really grow (all writes are faked, verified), so one fetch plus in-memory filtering is correct and simpler. |
| Axios as the HTTP transport, behind the `src/api/` module (`BASE_URL` constant + typed wrappers) | Interceptors and centralized error normalization; the ~12–13 kB gzip cost vs native fetch is accepted. |
| react-hook-form for the create-post form | Installed but unused; per-field validation and submit lifecycle without manually controlled inputs. |
| Zod + `@hookform/resolvers` as the single source of truth for form validation and types (T4) | One `z.object` schema drives both validation and TypeScript types via `z.infer`, wired with `zodResolver`; RHF has no "extendType" function — the typing comes from schema inference. |
| Tailwind for all styling | Tailwind 3 is the only styling system in the repo (Emotion was removed). |
| Vitest + Testing Library + jsdom as the test stack | Decided in planning; Vitest reuses the Vite 4 toolchain with no extra bundler configuration. |
| Create flow updates the query cache (`setQueryData` on `['posts', userId]`) instead of refetching | `POST /posts` does not persist, so a refetch would not return the created post; the cache update is what makes it appear. |

API contract (verified against the live API): `GET /users` → `array[10]` with
fields `id, name, username, email, address, phone, website, company`;
`GET /posts?userId={id}` → array of posts (`[]` for an unknown `userId` —
filtered collections never 404; only single-item `GET /posts/{id}` would);
`POST /posts` → 201 echoing the object with a new `id` (101), not persisted;
`PUT /posts/{id}` → 200 echoing the sent object, not persisted (a GET after the
PUT still returns the old title); `DELETE /posts/{id}` → 200 with an empty
body, not persisted (a GET after the DELETE still returns the post);
`POST /users` → 201 with `id: 11`, not persisted (`GET /users` still returns
10 users). Conclusion: the dataset can never really grow; every write is
faked.

## Directory layout

```
src/
├── api/              # single source of truth for URLs: BASE_URL constant + typed axios wrappers for the JSONPlaceholder endpoints
├── features/
│   ├── users/        # users list screen: data hook, search, component, tests
│   └── posts/        # posts screen: data hook, create/edit forms, delete flow, component, tests
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
| T2 | 6 |
| T3 | 5 |
| T4 | 4 |
| T5 | 4 |
| T6 | — (documentation checks, not counted) |
| **Total** | **20** |

All tests target user-visible behavior (Testing Library queries by role/text),
not implementation details; each test is independent and sets up its own data.

## Delivery

- Forecast: ~800–1000 authored lines across code + tests + docs, which exceeds
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
