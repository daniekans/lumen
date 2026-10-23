# Lumen: notes for Claude

Lumen is Daniel's personal learning platform: interactive, 3Blue1Brown-style visualizations plus
lessons, practice and checkpoints. The focus is mathematics (pre-calculus onward) and Machine
Learning; Data Engineering and AI Engineering continue when Daniel asks. React 19, Vite 8, TypeScript (strict),
pnpm, deployed to GitHub Pages (https://daniekans.github.io/lumen/, public repo daniekans/lumen).

## Start here (every new session)

1. Read `docs/DECISIONS.md`: Daniel's preferences and the decisions already made. Do not reopen
   them without a reason.
2. Read `docs/ROADMAP.md` ("Phases"): what is done, and what comes next.
3. Read "Suggested order of units" at the top of `docs/LEARNING_PLATFORM.md`, then the plan file
   of the course the next step belongs to (`docs/plans/<course>.md`). Read the rest of
   `LEARNING_PLATFORM.md` (content model, practice engine, curriculum, wish list) only when the
   task needs it, and `docs/HISTORY.md` almost never.
4. Read `docs/ARCHITECTURE.md` before structural changes and `docs/ADDING_CONTENT.md` before writing
   content.
5. When a task finishes, update the trackers (the unit plan in `docs/plans/`, the suggested order,
   and the "Suggested next session" in `docs/ROADMAP.md`) in the
   same commit series, so the next session sees the true state.

Daniel prefers short sessions. Keep answers concise, work in focused steps, and leave the repository
(and its docs) in a state the next session can continue from without this conversation. Build content
in batches, then commit, push and deploy without asking. When a piece of work ends, close the answer
with a short prompt Daniel can paste into a clean session to continue (see `docs/DECISIONS.md`).

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

- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `ci:`, `chore:`, `test:`). No
  Co-Authored-By or other Claude attribution lines (decided 2026-10-17; `.claude/settings.json`
  turns them off). Author and committer are only Daniel's GitHub noreply address.
- Writing: follow `docs/WRITING.md` for every string (captions, MDX, UI copy, docs, comments). No em
  dashes, no hype. `pnpm lint` runs a prose lint.
- UI copy (outside content) goes in `src/i18n/messages.ts` and is read as `msg.<group>.<key>` from
  `@/i18n`; `pnpm lint` fails on hard-coded strings (`node scripts/ui-strings.mjs` lists them). Mark a
  deliberate exception with `// i18n-ignore`.
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
- Colors come from `vc` / `role` (`src/styles/viz-colors.ts`); each hue carries a meaning; two or three is usual, more when it makes the picture clearer (`docs/DESIGN.md`).
  Floating panels combine `surfaces.glass` in TSX.
- Animation: `useSequence`, `useAnimatedValue` (both on the kit's own rAF `tween`) or CSS transitions.
  Tweens set continuous values; snap only values the learner sets (drags, sliders). Rounding inside
  `onUpdate` makes the curve move in visible steps.

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
- **Vitest caches transformed modules** in `node_modules/.vitest-cache`, keyed on file content, so
  an `import.meta.glob` in an unchanged file (the catalog registry) misses new content folders and
  `registry.test.ts` reports "introduced in unknown item". Delete that folder and rerun.
- **Deep links on GitHub Pages return HTTP 404** with the app's `404.html`. That is expected.

## Verifying a change

1. `pnpm lint && pnpm typecheck && pnpm test`
2. Look at it. Start a check server in the background with
   `node scripts/check-server.mjs <scratch dir>/vite-cache` (port 5199), then
   `THEMES=dark STEPS=1 BASE_URL=http://localhost:5199 node scripts/shoot.mjs <outDir> /<item path>`
   screenshots every step and prints console errors. The item path is the content path with no
   prefix (`/data-engineering/<course>/<unit>/<item>`). Iterate in one theme and view only the
   steps that changed; run both themes once at the end. For interaction checks, write a short
   Playwright script against the same server and delete it after. Stop the server by PID.
3. `pnpm e2e` (builds and serves a production build) before pushing.
