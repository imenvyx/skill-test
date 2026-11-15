# PRD — T5: Edit and delete posts

Goal: add per-post edit and delete actions on the posts screen. Both mutations
are faked by the API, so the requirement is the in-place update/removal of the
`['posts', userId]` TanStack Query cache entry. Strict TDD applies.

## User story

As a visitor, I want to edit or delete a post from the user's post list, so
that the list reflects my changes without leaving the screen.

## Functional requirements

1. Each rendered post has an edit action and a delete action.
2. The edit action opens an inline edit form prefilled with the post's current
   `title` and `body`. The form reuses the exact Zod schema of T4 (title and
   body required, validated via `zodResolver`, types via `z.infer`).
3. A valid edit submit calls `PUT
   https://jsonplaceholder.typicode.com/posts/{id}` with the updated
   `{ title, body }`.
4. On edit success, the `['posts', userId]` cache entry is updated in place by
   post id with `setQueryData` — the post with that id shows the new `title`
   and `body` — and the edit form closes. This is the requirement because the
   PUT response is faked: `PUT /posts/{id}` returns 200 echoing the sent
   object but does not persist (verified: a GET after the PUT still returns
   the old title), so the cache update is what makes the edit visible.
5. The delete action requires an explicit confirmation step before any API
   call; no `DELETE` request is sent until the user confirms.
6. On confirmed delete, `DELETE https://jsonplaceholder.typicode.com/posts/{id}`
   is called; on success the post is removed from the `['posts', userId]`
   cache entry and disappears from the visible list. This is the requirement
   because the DELETE is faked: it returns 200 with an empty body but does not
   persist (verified: a GET after the DELETE still returns the post), so the
   cache removal is what makes the delete visible.
7. If a PUT or DELETE fails, a visible error message is shown, the list data
   is preserved (no post is removed or left half-edited), and the edit/delete
   actions are re-enabled.

## Out of scope

- Editing or deleting users (only posts are mutable in this app).
- Persistence of edits or deletes beyond the in-memory query cache (the API
  itself fakes every write; documented, not worked around).
- Optimistic updates before server confirmation: success is fast enough, so
  the await-then-update mutation semantics of T4 are kept.

## Test requirements

- T5-1 Edit opens prefilled: clicking the edit action on a post shows an
  inline edit form with the post's current `title` and `body` in the fields.
  - RED criterion: fails because no edit UI exists.
- T5-2 Valid edit updates the cache and the visible list: with
  `PUT /posts/{id}` mocked to succeed, submitting the edited form calls the
  PUT endpoint and the post's `title` in the visible list shows the new value
  (cache updated in place).
  - RED criterion: fails because no edit logic exists.
- T5-3 Delete after confirmation removes the post from the list: clicking the
  delete action first shows an explicit confirmation step and sends no DELETE
  request; after confirming, `DELETE /posts/{id}` is called exactly once and
  the post disappears from the visible list.
  - RED criterion: fails because no delete flow exists.
- T5-4 A failed PUT or DELETE shows a visible error and preserves data: with
  the mutation mocked to reject, a visible error message is shown, the list
  keeps all previously fetched posts, and the edit/delete actions are
  re-enabled.
  - RED criterion: fails because no failure handling exists.

## Acceptance criteria

- [ ] All four tests (T5-1 … T5-4) observed RED before their implementation
      and GREEN afterwards, with real runs of `corepack yarn test`.
- [ ] `corepack yarn typecheck`, `corepack yarn build`, `corepack yarn lint`
      pass.
- [ ] The edit form imports the exact Zod schema of T4; no duplicated schema
      exists.
- [ ] Both mutations target the `['posts', userId]` cache entry via
      `setQueryData`; no refetch of `/posts` is triggered after an edit or a
      delete.
- [ ] No DELETE request is sent before explicit user confirmation (asserted
      by the mock call count).
- [ ] No optimistic updates: list changes happen only after the mutation
      promise resolves.
