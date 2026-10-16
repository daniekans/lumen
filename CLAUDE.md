# Lumen: notes for Claude

Lumen is Daniel's personal learning platform: interactive, 3Blue1Brown-style visualizations plus
lessons, practice and checkpoints, starting with mathematics (pre-calculus onward), with Data
Engineering, Machine Learning and AI Engineering alongside. React 19, Vite 8, TypeScript (strict),
pnpm, deployed to GitHub Pages (https://daniekans.github.io/lumen/, public repo daniekans/lumen).

## Start here (every new session)

1. Read `docs/DECISIONS.md`: Daniel's preferences and the decisions already made. Do not reopen
   them without a reason.
2. Read `docs/ROADMAP.md` ("Phases"): what is done, and what comes next.
3. For the current phase, read its plan and tracker (`docs/LEARNING_PLATFORM.md` for phase 2).
4. Read `docs/ARCHITECTURE.md` before structural changes and `docs/ADDING_CONTENT.md` before writing
   content.
5. When a task finishes, update the trackers (`docs/ROADMAP.md`, `docs/LEARNING_PLATFORM.md`) in the
   same commit series, so the next session sees the true state.

Daniel prefers short sessions. Keep answers concise, work in focused steps, and leave the repository
(and its docs) in a state the next session can continue from without this conversation.

## Environment

- WSL. Node 24 is installed with nvm, but the shells Claude gets do not load it: prefix commands with
  `export PATH=$HOME/.nvm/versions/node/v24.22.0/bin:$PATH`.
- Daniel often runs `pnpm dev` on port 5173. Do not kill it. For your own checks, start a separate
  server on another port, ideally with its own cache dir (see "Verifying a change").
- Git pushes use SSH. If the agent has no key (`ssh-add -l` says "no identities"), ask Daniel to run
  `ssh-add`, or push once over HTTPS without changing config:
  `git -c credential.helper= -c credential.helper='!gh auth git-credential' push https://github.com/daniekans/lumen.git main`.
- Every push to `main` deploys (`.github/workflows/deploy.yml`) and runs CI. Check both with `gh run list`.
  A Pages deploy can fail with a GitHub 500; rerun it (`gh run rerun <id> --failed`).

## Conventions

- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `ci:`, `chore:`, `test:`), ending
  with the Co-Authored-By line.
- Writing: follow `docs/WRITING.md` for every string (captions, MDX, UI copy, docs, comments). No em
  dashes, no hype. `pnpm lint` runs a prose lint.
- Content lives in `src/content/<area>/<course>/<unit>/<item>/`. Scaffold with `pnpm new:item`.
  When content moves, add a redirect in `src/catalog/redirects.ts`; the site is public.
- Content imports only from `@/catalog/types`, `@/viz-kit`, `@/ui/*`, `@/lib/*`, `@/styles/*`.
  Shared pieces go into the kit or `ui`, never copied between items.
- Pure logic (math, NN, practice generators, answer checking) lives in `src/lib` with Vitest tests.
- Practice problems are generators in `problems.ts` with a `problems.test.ts` that verifies every
  answer independently (`testProblemSet`).
- Progress is read and written only through `useProgress` (`@/progress`), persisted via the
  `ProgressStore` interface. Learning is on demand: no spaced repetition, due queues or streaks, and
  every status is settable by the learner in both directions.
- Colors come from `vc` / `role` (`src/styles/viz-colors.ts`); at most three hues per visualization.
  Floating panels combine `surfaces.glass` in TSX.
- Animation: `useSequence`, `useAnimatedValue` (both on the kit's own rAF `tween`) or CSS transitions.

## Pitfalls already hit (and the fix)

- **Shell heredocs mangle `\\;`** into `\;`. Write TeX-heavy files with the Write/Edit tools.
- **Prettier reformats** source, tables and scripts. Re-read a file before scripted string
  replacements, or the replacement silently misses.
- **Zustand selectors must return stable values.** Select stored records and derive afterwards;
  a selector that builds a new object loops forever ("getSnapshot should be cached").
- **Never call a store setter during render.** Use event handlers or effects.
- **CSS module class names are shared inside one file.** Reusing a name (it happened with
  `.indicator`) merges two unrelated styles.
- **Write only `backdrop-filter`, never `-webkit-backdrop-filter`.** The production minifier keeps
  only the prefixed one when both exist, and Chrome rejects it with `var()`: no blur in production.
- **Libraries reached only by dynamic import** go in `optimizeDeps.include` (`vite.config.ts`), or the
  dev server re-bundles on first use and reloads the page. After dependency changes, restart dev.
- **One KaTeX version** (pnpm override in `pnpm-workspace.yaml`); otherwise MDX math loses styling.
- **`pkill -f <pattern>` can kill your own shell** when the pattern appears in the command. Kill by PID.
- **An MDX line that starts with `<C>` or `<StepLink>`** becomes a block when Prettier runs, which
  splits the paragraph. Keep a word before the tag; `pnpm lint` checks this.
- **Deep links on GitHub Pages return HTTP 404** with the app's `404.html`. That is expected.

## Verifying a change

1. `pnpm lint && pnpm typecheck && pnpm test`
2. Look at it. `STEPS=1 BASE_URL=http://localhost:<port> node scripts/shoot.mjs <outDir> /<item path>`
   screenshots both themes and every step and prints console errors. For interaction checks, write a
   short Playwright script that starts its own Vite server
   (`createServer({ cacheDir: <scratch dir>, server: { port: 5199 } })`) and delete the script after.
3. `pnpm e2e` (builds and serves a production build) before pushing.
