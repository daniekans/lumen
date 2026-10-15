# Lumen: notes for Claude

Interactive math, AI and computing visualizations. React 19, Vite, TypeScript (strict), pnpm.
Read `docs/ARCHITECTURE.md` before structural changes, `docs/ROADMAP.md` for current status and
`docs/LEARNING_PLATFORM.md` for the current phase plan and its task tracker.

Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `ci:`, `chore:`, `test:`).

## Environment

Node lives in nvm inside WSL. Shells do not load it automatically, so prefix commands with
`export PATH=$HOME/.nvm/versions/node/v24.22.0/bin:$PATH`.

## Conventions

- A visualization is a folder `src/visualizations/<section>/<slug>/` with `meta.ts`, `index.tsx` and
  `explanation.mdx`. The registry discovers it; no central list to edit.
- Visualizations import only from `@/viz-kit`, `@/ui/*`, `@/lib/*` and `@/styles/*`. Anything two
  visualizations could share goes into the kit (generic) or `ui` (chrome), never copied.
- Pure math stays in `src/lib` with Vitest tests. Components never contain numeric algorithms.
- Colors come from `vc` / `role` in `src/styles/viz-colors.ts`, never hex literals. At most three
  hues per visualization.
- Animations use `useSequence` (scripted, cancellable), `useAnimatedValue` (eased targets) or CSS
  transitions on SVG style properties. Never `setInterval`.
- Controls go through `<VizControls>` using ui atoms and molecules, so the dock stays consistent.

## Writing

Follow `docs/WRITING.md` for every string: captions, MDX, UI copy, docs and code comments. No em
dashes, no hype. `pnpm lint` enforces part of this.

## Verifying a change

1. `pnpm lint && pnpm typecheck && pnpm test`
2. With `pnpm dev` running: `STEPS=1 node scripts/shoot.mjs <outDir> /<section>/<slug>` writes
   screenshots for both themes and every step, and prints console errors. Look at them.
3. `pnpm e2e` before pushing.
