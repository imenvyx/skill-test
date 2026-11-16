# PRD — T1: Test infrastructure

Goal: make `corepack yarn test` a real, runnable command backed by Vitest +
Testing Library + jsdom, and prove the loop works with one smoke test that
goes through an observable RED before GREEN. This task adds zero application
behavior.

## User story

As a developer, I want a configured test runner so that every subsequent task
can follow the RED → GREEN → refactor loop with observable evidence.

## Functional requirements

1. A `test` npm script exists in `package.json` and runs Vitest (invoked as
   `corepack yarn test`).
2. Vitest is configured with the `jsdom` environment and a setup file (for
   example `src/test/setup.ts`) that loads `@testing-library/jest-dom`
   matchers.
3. The following dependencies are installed as devDependencies: `vitest`,
   `jsdom`, `@testing-library/react`, `@testing-library/user-event`,
   `@testing-library/jest-dom`.
4. Exactly one smoke test exists that renders the existing `App` component and
   asserts it renders without crashing.
5. No application code (components, routes, API calls) is added or modified by
   this task; `src/App.tsx` and `src/main.tsx` are unchanged.

## Out of scope

- Any feature behavior (users list, posts, form) — T2–T4 own those.
- Coverage tooling, thresholds, or CI integration.
- E2E testing setup.
- Changes to `src/lib/queryClient.ts` or the build configuration beyond what
  Vitest needs to run.

## Test requirements

- T1-1 Smoke test: renders `App` and asserts a React-rendered element is
  present.
  - RED criterion: before Vitest is installed and the `test` script is added,
    `corepack yarn test` fails (no `test` script / missing runner). This
    infrastructural failure is the intended RED signal for this task; it must
    be observed and recorded before adding the runner. The smoke test itself
    goes GREEN in the same cycle once the runner exists.

## Acceptance criteria

- [ ] `corepack yarn test` runs the smoke test and it passes (GREEN observed
      after the RED step above).
- [ ] `corepack yarn typecheck` (`tsc -b`) passes.
- [ ] `corepack yarn build` passes.
- [ ] `corepack yarn lint` passes with zero warnings.
- [ ] `src/App.tsx` and `src/main.tsx` are byte-identical to their pre-T1
      state (no behavior change).
- [ ] The setup file loads jest-dom matchers; at least one matcher from
      jest-dom is used by a test (proves the setup file is wired).
