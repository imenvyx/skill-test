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

## Review status (native RDD)

Native review is **inoperable in this runtime**, diagnosed with evidence:

- The `review-reliability` lens subagent receives `GENTLE_AI_REVIEW_BINDING`
  correctly (it quotes the exact subject hash) but the host transport never
  injects the `GENTLE_AI_REVIEW_CONTEXT` block carrying `artifact_subject`,
  `base_tree`, `candidate_tree` and `changed_path_manifest`. The lens correctly
  refuses instead of falling back to the live worktree, returning
  `inspection.status: "incomplete"`.
- Reproduced twice with different models over OpenRouter
  (`baidu/ernie-5.5-flash-preview:free`, `thinkingmachines/inkling-2-small:free`)
  — deterministic, not a quota or model-capability issue.
- Separately, the default subagent channel (`opencode/*`, `ollama-cloud/*`) was
  blocked by a per-account free-usage cap, reproduced across 4 models.

Consequence: candidates are declined candidate-scoped (never the kill switch,
reviews stay enabled) and verification relies on the functional checks
(`test`, `typecheck`, `build`, `lint`) plus parent spot checks. T6 (README)
must state this honestly.

## Tasks

| ID | Task | PRD | Route | Notes |
| -- | ---- | --- | ----- | ----- |
| T1 | Test infrastructure: Vitest + Testing Library + jsdom, `test` script, smoke test RED→GREEN | `docs/prd/t1-test-infrastructure.md` | delegated writer | TDD enabler |
| T2 | Users list with name search; loading / error / empty states; cache test | `docs/prd/t2-users-list.md` | inline (parent) | strict TDD; delegation blocked by provider quota |
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
- [x] PRDs approved: review round 1 applied, then the user said "procede"
      (implementation of T1/T2 proceeded under that approval).
- [x] T1 Test infrastructure — vitest@0.34.6 + RTL 14.3.1 + jsdom 25.0.1 +
      jest-dom 6.9.1 (exact pin to avoid the RTL-14 peer conflict); `test`
      script `vitest run`; config in `vite.config.ts` via `vitest/config`
      (`defineConfig` — the `/// <reference types="vitest" />` directive does
      NOT typecheck on 0.34.6); `src/test/setup.ts` with cleanup;
      `src/App.test.tsx` smoke test. RED observed (`error Command "test" not
      found`), then GREEN. `resolutions: {"vitest/vite": "^4.3.9"}` added to
      keep a single Vite 4 copy (vitest's range resolves a nested vite 5
      otherwise). App.tsx/main.tsx untouched (verified via git diff).
- [x] T2 Users list — inline implementation (all subagent providers blocked by
      quota: opencode free, Ollama Cloud, OpenRouter paid and free, reproduced
      across 6+ launches). Aborted delegated code discarded; T2 rebuilt from
      scratch with observed RED for all six tests:
      - T2-1 RED `Failed to resolve import "../../api/users"` → GREEN.
      - T2-2 RED `Unable to find a label with the text of: /search users by name/i` → GREEN.
      - T2-3 RED `Unable to find an element with the text: /loading users/i` → GREEN.
      - T2-4 RED `Unable to find an element with the text: /failed to load users/i`
        (then a cross-test mock leak surfaced as `called 2 times, but got 5`;
        fixed with `vi.resetAllMocks()` in `beforeEach`) → GREEN.
      - T2-5 RED empty `<ul />` with no message → GREEN.
      - T2-6 RED `expected "spy" to be called 1 times, but got 2 times` with a
        `staleTime: 0` client → GREEN after wiring `queryClientDefaults`.
      Files: `src/api/{client,types,users}.ts`, `src/features/users/{useUsers.ts,
      UsersScreen.tsx,UsersScreen.test.tsx}`, routing in `src/App.tsx` +
      `src/main.tsx`, `src/App.test.tsx` wrapped in `MemoryRouter`.
      `queryClient.ts` now exports `queryClientDefaults` (behavior and values
      unchanged) so T2-6 asserts the real production cache config.
      Checks: `test` 7 passed, `typecheck` 0, `build` 0, `lint` 0 warnings.
- [ ] T3 User posts
- [ ] T4 Create-post form
- [ ] T5 Edit and delete posts
- [ ] T6 README
