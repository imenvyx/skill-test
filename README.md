# JSONPlaceholder Users App

React + TypeScript app over [JSONPlaceholder](https://jsonplaceholder.typicode.com):
a searchable users list, each user's posts, and a validated create form plus
per-post edit and delete. Loading, error (with retry), empty/not-found, and
mutation-failure states are all visible in the UI.

Stack: React 18, TypeScript (strict), Vite 4, TanStack Query 5, react-hook-form
with Zod, React Router 6, Tailwind, Vitest + Testing Library.

## How to run

Requires Node 18+ (developed on Node 24) with Corepack available, and Yarn 1
through Corepack — no `npm`/`package-lock.json`.

```bash
corepack yarn install     # install dependencies
corepack yarn dev         # start the dev server (Vite, prints the local URL)
corepack yarn test        # run the Vitest suite once (vitest run)
corepack yarn typecheck   # tsc -b, TypeScript strict, no emit
corepack yarn build       # production build (vite build)
corepack yarn lint        # ESLint with --max-warnings 0
```

`test` runs 21 tests across 3 files. `preview` also exists (`vite preview`) for
serving a built bundle locally.

Routes: `/` (landing link), `/users` (searchable list), `/users/:userId`
(posts of that user, create form, and per-post edit/delete).

## Decisions taken

- **React Router 6 for routing.** `/users` and `/users/:userId` map directly to
  the brief; a router keeps the list and the detail screen independent and makes
  the user selection a real navigation instead of a local toggle.
- **TanStack Query with explicit query keys.** `['users']` for the list and
  `['posts', userId]` for one user's posts — one cache entry per user. Mutations
  update that entry with `setQueryData` instead of refetching, which keeps the
  list stable and avoids extra requests.
- **Every write is faked, so the cache is the source of truth after a write.**
  Verified against the live API: `POST /posts` returns `201` with `id: 101`,
  `PUT /posts/{id}` returns `200` echoing the sent object, and
  `DELETE /posts/{id}` returns `200` with `{}` — none of them persist (a
  follow-up `GET` still returns the original data). So create prepends the
  returned post to `['posts', userId]`, edit replaces the post with the matching
  id, and delete filters it out. That cache change is what makes the action
  visible; there is no real persistence to rely on.
- **Zod + `@hookform/resolvers` for validation.** One `z.object` schema
  (`createPostSchema`) is the single source of truth for both runtime validation
  and TypeScript types via `z.infer`; the edit form imports the exact same
  schema instead of duplicating rules.
- **react-hook-form for form state.** Uncontrolled inputs, validation errors
  rendered from `formState.errors`, and no hand-rolled field state. The edit form
  is prefilled from the post being edited.
- **Explicit confirmation before delete.** Clicking delete opens a confirmation
  step and sends no `DELETE` until the user confirms; the mock call count is
  asserted in the tests.
- **Client-side search, and why.** Server-side search does exist — `GET
  /users?q=leanne` returns one user and is case-insensitive (verified live;
  `?name_like=` and exact `?name=`/`?username=` also work). The reason for
  filtering in memory is the dataset: it can never really grow, because every
  write is faked (`POST /users` returns `201` with `id: 11` but `GET /users`
  still returns the same 10 users). One fetch plus an in-memory
  case-insensitive substring filter is therefore simpler, instant per keystroke,
  and costs zero extra requests. If the dataset could grow, the existing `?q=`
  query would be the natural upgrade.
- **Typed `request<T>` wrapper instead of axios.** All HTTP goes through one
  seam (`src/api/client.ts`) with a shared `API_BASE_URL` and typed `ApiError`,
  so URLs are not scattered across features. Axios was planned during planning
  review but deferred: the brief does not require it and the wrapper already
  gives the single-source-of-truth behaviour it was meant to provide. Swapping
  in axios later means changing that one file, not the features. This is a
  documented deviation from the planning documents, which still name axios.
- **Tailwind as the only styling system.** The scaffold's Emotion dependency was
  removed so there is one styling approach rather than two.
- **Vitest + Testing Library pinned to Vitest 0.34.6.** Vitest 1.x/2.x require
  Vite 5 while this project is on Vite 4; a Yarn `resolutions` entry keeps a
  single Vite 4 copy. Tests exercise real component behaviour: user typing,
  click flows, cache reuse on remount, and failure paths.

## What to do with more time

All of this is **not done** — it is future work, not a claim:

- Coverage reporting (`@vitest/coverage-v8`) with a threshold in CI.
- E2E tests (Playwright) for the full flow against a real browser and real
  network timing, which unit tests with mocked API modules cannot cover.
- Server-side pagination and a server-backed search path, only if the dataset
  could actually grow.
- Better error observability: surface the HTTP status from `ApiError` and add a
  global error boundary around routes.
- Optimistic mutations with rollback, once the API persists writes.
- A real backend, so create/edit/delete stop being cache-only illusions.

## How AI was used

### What was asked

The request was to build the app against JSONPlaceholder with: a searchable
users list, per-user posts, a validated create form (title and body required)
whose new post appears in the list, visible loading/error/empty states, at least
three tests with Vitest and Testing Library, and a README covering how to run,
decisions, future work, and AI usage. Explicit constraints: strict TDD, and a
global PRD plus one PRD per task, reviewed before implementation.

Review round 1 then added: a single source of truth for URLs, a validation
library with react-hook-form, edit and delete features (with confirmation on
delete), a test proving a repeated query reads from cache, and a documented
rationale for client-side search.

### What was accepted

- The planning structure (global PRD + T1–T6 task PRDs) and implementing in TDD
  order, one work unit per task with tests, code, and docs in the same commit.
- Zod + `@hookform/resolvers`, react-hook-form, TanStack Query with per-user
  keys, React Router, and the `setQueryData` flows for create/edit/delete.
- The edit/delete features and the explicit delete confirmation.
- The cache-behaviour tests (remount without refetch) for users and posts.
- The client-side search decision, with its rationale written here.

### What was corrected

- **Client-side search rationale.** The first justification claimed server-side
  search did not exist. That was wrong: `?q=`, `?name_like=`, and `?name=` were
  then verified live and do work. The decision stands, but for the real reason:
  the dataset cannot grow because writes are faked. The README states the
  verified evidence instead of the incorrect claim.
- **Axios.** Planned in review round 1, then deliberately deferred. The typed
  `request<T>` wrapper covers the single-source-of-URL need; the deviation is
  documented above rather than hidden.
- **An over-eager implementation.** The first version of the create-form task
  was implemented all at once, which would have made the following three tests
  pass before they were written. It was reduced back to the minimum for the
  current test so each later test had a real red run first.
- **A leaking test mock.** One retry test failed with `called 2 times, but got
  5` because mock call counts accumulated across tests; fixed with
  `vi.resetAllMocks()` in `beforeEach`.
- **Discarded work without evidence.** A delegated attempt left uncommitted code
  behind with no observed red run. It was deleted and the task was rebuilt from
  scratch, test by test, rather than keeping code whose TDD history could not be
  shown.
- **Toolchain traps.** `tsc -b` emitted `vite.config.js` into the repository root
  and Vite resolved the stale `.js` before the `.ts`; build outputs were moved
  under `node_modules/.tmp`. ESLint was bumped for `@typescript-eslint` peer
  compatibility.

### Why the native review never ran

The native review integration is **inoperable in this runtime**, and it was
diagnosed with evidence rather than assumed. What happens:

- The reviewer subagent receives `GENTLE_AI_REVIEW_BINDING` correctly — it quotes
  the exact subject hash of the frozen candidate — but the host transport never
  injects the companion `GENTLE_AI_REVIEW_CONTEXT` block, which is the one that
  carries `artifact_subject`, `base_tree`, `candidate_tree`, and
  `changed_path_manifest`. Without those immutable trees the reviewer has
  nothing legitimate to inspect.
- The reviewer then does the correct thing: it refuses rather than falling back
  to the live worktree, returning `inspection.status: "incomplete"`. A fallback
  to mutable working files would have produced a review of bytes that were never
  frozen, which is worse than no review.
- This was reproduced twice with different models over OpenRouter
  (`baidu/ernie-5.5-flash-preview:free` and
  `thinkingmachines/inkling-2-small:free`), so it is deterministic transport
  behaviour, not a quota issue or a model-capability issue.

Separately, the default subagent channel was blocked by per-account free-usage
caps, reproduced across several models: `opencode/*` free returned
`Free usage limit reached`, `ollama-cloud/*` returned `Add usage credits or
subscribe`, and OpenRouter returned `Rate limit exceeded: free-models-per-day` on
its free tier and `This request requires more credits, or fewer max_tokens` on
its paid tier. That is why tasks T2–T6 were implemented inline by the parent
orchestrator instead of being delegated, still one test at a time with an
observed RED before every behaviour.

**Consequence:** each review candidate was declined candidate-scoped — not the
kill switch, reviews stayed enabled — and verification rested on the functional
checks (`test`, `typecheck`, `build`, `lint`) plus parent spot checks. No review
receipt exists for this work and this README does not claim one.

**Manual review:** the author reviewed all the implemented code by hand — each
task's diff, the test suite, and the four verification commands — to confirm
the work was correct. That review was manual and is not represented as an
automated review receipt.
