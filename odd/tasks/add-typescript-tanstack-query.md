# add-typescript-tanstack-query

## Objective

Add TypeScript to the Vite + React scaffold and install `react-hook-form` and
`@tanstack/react-query`, wiring the query client into the app root.

## Problem

The project is plain JavaScript with no type safety, no form layer, and no
server-state cache. Every feature added from here pays the migration cost later.

## Why

- TypeScript: catch prop/state errors at build time, unlock typed hooks.
- `react-hook-form`: uncontrolled form state with minimal re-renders.
- `@tanstack/react-query`: shared server-state cache, dedupe, retries,
  background refetch, cache invalidation.

## Scope

In scope:

- TypeScript toolchain (typescript, `@types/*`, tsconfig files, Vite config in TS).
- Source migration: `src/main.jsx` -> `main.tsx`, `src/App.jsx` -> `App.tsx`,
  `index.html` entry update.
- Shared `QueryClient` instance + `QueryClientProvider` at root.
- Install `react-hook-form` and `@tanstack/react-query`.
- Repair the ESLint config so lint actually runs (see Constraints).

Out of scope (explicitly not invented):

- No example form, no example query, no feature UI. Dependency wired, not demoed.
- No tests (project has no test runner).
- No styling system unification (Tailwind + Emotion coexist; separate decision).

## Constraints

- Package manager is Yarn v1 (a `yarn.lock` v1 exists). Yarn is not installed
  globally; use `corepack yarn` (corepack 0.34.2 is available). Do NOT introduce
  a `package-lock.json`.
- TypeScript `strict: true` is required. No `any` escape hatches.
- `.eslintrc.json` currently extends `plugin:import/errors`,
  `plugin:jsx-a11y/recommended` and `prettier`, but `eslint-plugin-import`,
  `eslint-plugin-jsx-a11y` and `eslint-config-prettier` are not installed, so
  lint is broken on the base. Installing them is part of this change because
  lint is a verification command.
- TDD mode: **disabled** — the project has no test runner or test configuration,
  and the user has not enabled TDD in this session. Required checks are
  typecheck, build, and lint.

## Tasks

| ID | Task | Route | Trigger evidence |
| -- | ---- | ----- | ---------------- |
| T1 | Install deps with corepack yarn: `@tanstack/react-query@^5`, `react-hook-form@^7` (prod); `typescript@^5`, `@types/node`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-config-prettier` (dev) | delegated | writer trigger: 2+ non-trivial files |
| T2 | Add `tsconfig.json` (strict, bundler resolution, `jsx: react-jsx`, `noEmit`), `tsconfig.node.json`, `src/vite-env.d.ts`; rename `vite.config.js` -> `vite.config.ts` | delegated | writer trigger |
| T3 | Migrate `src/main.jsx` -> `src/main.tsx`, `src/App.jsx` -> `src/App.tsx` with explicit types; update `index.html` script src to `/src/main.tsx`; update `lint` script to `--ext js,jsx,ts,tsx` | delegated | writer trigger |
| T4 | Add `src/lib/queryClient.ts` exporting a configured `QueryClient`, wrap root render in `QueryClientProvider` | delegated | writer trigger |
| T5 | Update `.eslintrc.json` for TypeScript (parser, plugin, `env`, `overrides` for config files) so lint runs clean | delegated | writer trigger |
| T6 | Verify: `corepack yarn tsc --noEmit`, `corepack yarn build`, `corepack yarn lint` | delegated | per-action |

## Acceptance criteria

- `corepack yarn tsc --noEmit` exits 0 with no errors.
- `corepack yarn build` produces `dist/`.
- `corepack yarn lint` exits 0 with 0 warnings (script uses `--max-warnings 0`).
- No `.js`/`.jsx` source file remains under `src/`.
- No `package-lock.json` added; `yarn.lock` updated only by yarn.
- `QueryClientProvider` wraps `<App />` in the root render.
- Only the approved dependencies were added; nothing else changed.

## Delivery

- Forecast: ~150 authored changed lines (well under the 400-line budget).
- Strategy: `single-pr` (no split needed, no exception needed).
- Branch: `feat/typescript-tanstack-query` (current branch is `main`).
- Commits: one work unit per task group, Conventional Commits:
  - `chore(deps): add typescript toolchain and tanstack query`
  - `refactor(ts): migrate scaffold to typescript`
  - `feat(query): add shared query client and provider`
  - `chore(lint): repair eslint config for typescript`

## Progress

- [x] Feature document created; exploration done (5 files inspected inline:
  `package.json`, `vite.config.js`, `.eslintrc.json`, `src/App.jsx`, `src/main.jsx`).
- [x] T1 Dependencies installed via `corepack yarn` (`yarn 1.22.22`); no
      `package-lock.json` created.
- [x] T2 TypeScript config added (`strict`, bundler resolution, `jsx: react-jsx`),
      `tsconfig.node.json`, `src/vite-env.d.ts`, `vite.config.ts`.
- [x] T3 Sources migrated; `lint` script extended to `ts,tsx`.
- [x] T4 `src/lib/queryClient.ts` singleton + `QueryClientProvider` at root.
- [x] T5 ESLint repaired for TypeScript.
- [x] T6 Verification: typecheck, build, lint all green.

### Post-review correction (T2)

The plan's `tsconfig.node.json` (`composite: true`, no emit redirection) made
`tsc -b` emit `vite.config.js`, `vite.config.d.ts` and `tsconfig.node.tsbuildinfo`
into the repository root. Vite resolves `vite.config.js` **before**
`vite.config.ts`, so the emitted file would silently shadow the real config.

Verified with `corepack yarn tsc -b` (root contained `vite.config.js`,
`vite.config.d.ts`, `tsconfig.node.tsbuildinfo`, `tsconfig.tsbuildinfo`), then
fixed:

- `tsconfig.node.json`: added `emitDeclarationOnly`, `outDir:
  ./node_modules/.tmp/tsc-node`, `tsBuildInfoFile:
  ./node_modules/.tmp/tsconfig.node.tsbuildinfo`.
- `tsconfig.json`: `tsBuildInfoFile: ./node_modules/.tmp/tsconfig.tsbuildinfo`.
- `package.json`: added `"typecheck": "tsc -b"`.

After the fix, `tsc -b` leaves the repository root clean and additionally
type-checks `vite.config.ts`, which plain `tsc --noEmit` never covered.

## Review record

- Assessed tier: **medium** (`configuration_change` in `.eslintrc.json`),
  `review_due: true` (`slice_budget_reached`, 15 files, 1575 changed lines).
- Candidate consent: **granted** by the user; native transaction
  `review-cdb452306617d3dd` created and frozen at revision
  `sha256:86ae96ff90036f2a6b0640a6ad16f838b00c8362f6236dc6d37b838738b3d9be`.
- The single selected lens (`review-reliability`) could not run: the runtime
  model hit a free-usage hard cap on three launches (not a Gentle AI defect).
  No reviewer result, no receipt, no authority burned.
- User then chose to **skip this candidate**: the exact provider-issued decline
  invocation ran once and returned `action: "declined"`,
  `consent: "declined_this_candidate"`. No review record is persisted; future
  reviews stay enabled.
- Consequence: this change ships **without a native review receipt**. Delivery
  (push / PR / merge) remains a separate human decision.

## Verification evidence

Run on the final worktree, after the correction above:

- `corepack yarn typecheck` (`tsc -b`): exit 0, `Done in 2.21s`; repository root
  left with only the pre-existing `tailwind.config.js`.
- `corepack yarn tsc --noEmit`: exit 0, `Done in 2.05s`.
- `corepack yarn build`: exit 0, `77 modules transformed`,
  `dist/assets/index-fc6c4a00.js 172.32 kB (gzip 54.54 kB)`, `✓ built in 2.38s`.
- `corepack yarn lint`: exit 0, zero warnings (`--max-warnings 0`).
- Writer-side probe: a throwaway `src/__lintprobe.ts` using `any` failed with
  `@typescript-eslint/no-explicit-any`, proving ESLint actually parses `.ts`/`.tsx`.

## Known follow-ups (not in this change)

- ~~`eslint` resolves to 8.50.0 from the lockfile while `@typescript-eslint@8.72.2`
  declares peer `eslint ^8.57.0`~~ — **resolved**: bumped to `^8.57.0`
  (commit `chore(deps)`), lint clean on the new version.
- The `vite.config.ts` / `*.cjs` ESLint overrides are currently unreachable
  because `lint` only targets `src`. Extending lint to the repository root
  requires handling `tailwind.config.js` (`module.exports` in a `.js` file) too.
- `react-hook-form` is installed and unused by design. First real form imports it.
- `@emotion/*` (3 packages) have zero usages in `src/` — decision pending:
  remove or adopt. Tailwind is the only styling system currently in use.
