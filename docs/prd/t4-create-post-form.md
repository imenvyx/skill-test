# PRD — T4: Create-post form

Goal: add a validated create-post form on the posts screen. On success the new
post appears at the top of the visible list via the TanStack Query cache,
because the API does not persist. Strict TDD applies.

## User story

As a visitor, I want to create a post for the selected user through a
validated form, so that the new post shows up in their post list.

## Functional requirements

1. The posts screen (`/users/:userId`) contains a form with two fields: a
   text input for the post `title` and a textarea for the post `body`. Both
   fields are required (the user brief's "title and text required"; "text"
   maps to the `body` field of the API object).
2. The form is managed by react-hook-form with a Zod schema wired through
   `zodResolver`: a single `z.object` schema (both fields required) is the
   single source of truth for validation AND TypeScript types via `z.infer`
   (RHF has no "extendType" function — the typing comes from the schema
   inference). Submitting with any required field empty shows a visible
   validation error under each empty field, and no API call is made.
3. A valid submit calls `POST https://jsonplaceholder.typicode.com/posts`
   with `{ userId, title, body }` (the routed `userId`).
4. While the POST is in flight, the form fields and the submit button are
   disabled.
5. On success, the created post is prepended to the top of the visible post
   list by updating the `['posts', userId]` cache entry with
   `setQueryData`, and the form is cleared. This is the requirement because
   `POST /posts` does not persist server-side (it only returns the created
   object with a new `id`); a refetch would not return the new post.
6. If the POST fails, a visible error message is shown, the entered values
   are kept (the form is not cleared), and the fields are re-enabled.

## Out of scope

- Persisting the created post anywhere beyond the in-memory query cache (the
  API itself does not persist; documented, not worked around).
- Editing or deleting existing posts (that is T5's scope).
- Field validation beyond the Zod schema (no length limits, no format rules).
- Success toast or notification; the new post appearing in the list is the
  success signal.

## Test requirements

- T4-1 Required-field errors: submitting the empty form shows a visible
  validation error for the `title` field and for the `body` field, and the
  POST endpoint is not called.
  - RED criterion: fails because the form and its validation do not exist.
- T4-2 Valid submit: filling both fields, submitting clears the validation
  errors and calls the POST endpoint exactly once with the typed values plus
  the routed `userId`.
  - RED criterion: fails because no submission logic exists.
- T4-3 Prepend on success: after the mocked POST resolves, the created post
  (its title) is visible at the top of the post list, above the previously
  fetched posts, and the form fields are empty.
  - RED criterion: fails because no cache update exists.
- T4-4 Failure keeps the form: with the POST mocked to reject, a visible
  error message is shown, the typed `title` and `body` values remain in the
  fields, and the fields are enabled again.
  - RED criterion: fails because no failure handling exists.

## Acceptance criteria

- [ ] All four tests (T4-1 … T4-4) observed RED before their implementation
      and GREEN afterwards, with real runs of `corepack yarn test`.
- [ ] `corepack yarn typecheck`, `corepack yarn build`, `corepack yarn lint`
      pass.
- [ ] The cache entry updated on success is exactly `['posts', userId]` (the
      same key used by T3), and no refetch of `/posts` is triggered by the
      submission.
- [ ] Validation errors are per-field and rendered as visible text bound to
      each field.
- [ ] While posting, both fields and the submit button are disabled
      (asserted).
- [ ] The Zod schema is the single source of truth for both validation and
      form types (`z.infer`); no hand-written duplicate type exists.
- [ ] No persistence layer beyond the query cache exists in the code.
