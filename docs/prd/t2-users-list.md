# PRD — T2: Users list with search

Goal: implement the `/users` screen: fetch all users from JSONPlaceholder,
render them, and filter them by name as the user types, with visible loading,
error (with retry), and empty states. Strict TDD applies.

## User story

As a visitor, I want to search the users by name so that I can find a specific
user quickly.

## Functional requirements

1. On mount, the screen fetches all users via `GET
   https://jsonplaceholder.typicode.com/users` through the `['users']`
   TanStack Query key.
2. Every returned user's `name` is rendered in a visible list.
3. A search input filters the list while the user types: a user matches when
   their `name` contains the typed text as a case-insensitive substring. No
   submit button is required.
4. While the `['users']` query is pending, a visible loading state is shown
   (not a blank screen).
5. If the `['users']` query fails, a visible error state is shown together
   with a retry action that re-runs the query.
6. When the current filter matches no user, a visible empty state is shown
   (not an empty list element).
7. Each rendered user is a link that navigates to `/users/{user.id}` (the
   posts screen of T3).

## Out of scope

- Pagination or sorting of the user list.
- Search by any field other than `name` (no username, email, or company
  search).
- Server-side search is deliberately not used in the app: JSONPlaceholder
  does offer it (`GET /users?q=leanne` → `array[1]`, full-text and
  case-insensitive, verified), but the dataset can never really grow (every
  write is faked — `POST /users` verified to not persist), so one fetch plus
  in-memory filtering is correct and simpler. The README (T6) must document
  this decision together with its verified evidence.
- A user detail screen; the link target is the posts screen.

## Test requirements

- T2-1 Renders users after load: with `GET /users` mocked to succeed, the
  list shows the mocked user names.
  - RED criterion: fails because no users-list component or data hook exists.
- T2-2 Filters as the query changes: typing a case-varied substring (for
  example `LEa`) leaves only matching names visible.
  - RED criterion: fails because no search input or filter logic exists.
- T2-3 Shows a visible loading state while the query is pending (asserted
  with a never-resolving or deferred promise).
  - RED criterion: fails because no loading UI exists.
- T2-4 Shows an error state with a retry action when the fetch fails, and the
  retry re-triggers the request (mock rejects first, succeeds after retry).
  - RED criterion: fails because no error UI or retry action exists.
- T2-5 Shows the empty state when the filter matches nothing (type text that
  matches no user name).
  - RED criterion: fails because no empty-state UI exists.
- T2-6 Cache read on remount: mount the users screen, unmount it, remount it,
  and assert the fetch mock was called exactly once — the second mount reads
  the `['users']` entry from the TanStack Query cache (`staleTime` is 60s and
  `refetchOnWindowFocus` is false in `src/lib/queryClient.ts`).
  - RED criterion: fails because nothing asserts the fetch call count across
    mounts.

## Acceptance criteria

- [ ] All six tests (T2-1 … T2-6) observed RED before their implementation
      and GREEN afterwards, with real runs of `corepack yarn test`.
- [ ] `corepack yarn typecheck`, `corepack yarn build`, `corepack yarn lint`
      pass.
- [ ] Filtering is pure client-side logic over the fetched array; no extra
      network call is made while typing (asserted by the fetch mock count).
- [ ] Loading, error+retry, and empty states are asserted through user-visible
      content, not internal state.
- [ ] No pagination, sorting, or non-`name` search fields present in the code.
