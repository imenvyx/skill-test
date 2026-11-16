# PRD — T3: User posts screen

Goal: implement the `/users/:userId` route: selecting a user from the list
shows their posts fetched with `GET /posts?userId={id}`, with loading, error
(with retry), and not-found states. Strict TDD applies.

## User story

As a visitor, I want to select a user and see their posts so that I can read
what that user wrote.

## Functional requirements

1. A route `/users/:userId` is registered in React Router and renders the
   posts screen for the `userId` path parameter.
2. Navigating from a user in the `/users` list to `/users/{id}` shows that
   user's posts.
3. Posts are fetched via `GET
   https://jsonplaceholder.typicode.com/posts?userId={id}` under the query
   key `['posts', userId]` (one cache entry per user).
4. Every returned post renders its `title` and `body`.
5. While the `['posts', userId]` query is pending, a visible loading state is
   shown (not a blank screen).
6. If the query fails, a visible error state is shown together with a retry
   action that re-runs the query.
7. If the query resolves with an empty list, a visible not-found state is
   shown. Note: JSONPlaceholder returns `[]` for any unknown/nonexistent
   `userId`, so an empty result is the observable definition of "user not
   found" — there is no 404 to distinguish it.

## Out of scope

- Expanding individual posts (edit and delete of posts are T5's scope).
- A separate user-detail screen (the posts screen is the detail view).
- Prefetching posts when hovering a user in the list.
- Route transitions other than list → posts.

## Test requirements

- T3-1 Renders posts for a user: with the route `/users/1` and `GET
  /posts?userId=1` mocked to succeed, the screen shows the mocked post titles
  and bodies.
  - RED criterion: fails because the route or the posts component does not
    exist.
- T3-2 Shows loading then posts: with a deferred mock, the loading state is
  visible first and the posts appear after the promise resolves.
  - RED criterion: fails because no loading state exists.
- T3-3 Shows an error state with retry when the fetch fails, and the retry
  re-triggers the request (mock rejects first, succeeds after retry).
  - RED criterion: fails because no error UI or retry action exists.
- T3-4 Shows a not-found state when the query resolves with an empty array
  for the routed `userId`.
  - RED criterion: fails because no not-found state exists.
- T3-5 Cache read on remount: mount `/users/1`, unmount, then remount (or
  navigate away and back), and assert the fetch mock was called exactly once
  for the `['posts', 1]` key — the second mount reads the entry from the
  TanStack Query cache (`staleTime` is 60s and `refetchOnWindowFocus` is
  false in `src/lib/queryClient.ts`).
  - RED criterion: fails because no posts screen exists yet to mount twice.

## Acceptance criteria

- [ ] All five tests (T3-1 … T3-5) observed RED before their implementation
      and GREEN afterwards, with real runs of `corepack yarn test`.
- [ ] `corepack yarn typecheck`, `corepack yarn build`, `corepack yarn lint`
      pass.
- [ ] The query key is exactly `['posts', userId]`; changing the routed user
      triggers a fetch for that user's id only.
- [ ] Clicking a user in the `/users` list lands on `/users/{id}` and shows
      that user's posts (link behavior from T2 reused, not duplicated).
- [ ] Loading, error+retry, and not-found states are asserted through
      user-visible content, not internal state.
