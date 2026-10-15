# Lumen

Interactive visual explanations of mathematics, machine learning and computing. Each visualization
is built around one concept, with narrative steps, direct manipulation and a written explanation.

## Run it

Requires Node 24 (see `.nvmrc`) and pnpm (`corepack enable`).

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

| Command                                 | What it does                                          |
| --------------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                              | Dev server with hot reload                            |
| `pnpm build`                            | Typecheck and production build into `dist/`           |
| `pnpm lint`                             | ESLint plus the prose lint (`scripts/lint-prose.mjs`) |
| `pnpm typecheck`                        | TypeScript only                                       |
| `pnpm test`                             | Unit tests (Vitest) for `src/lib`                     |
| `pnpm e2e`                              | Playwright smoke tests against a production build     |
| `pnpm new:viz <section> <slug> "Title"` | Scaffold a new visualization                          |

## Keyboard

| Key             | Action                      |
| --------------- | --------------------------- |
| `Ctrl K` or `/` | Search                      |
| `←` `→`         | Previous or next step       |
| `[`             | Toggle the sidebar          |
| `]`             | Toggle the explanation pane |
| `t`             | Toggle light and dark theme |

## Documentation

- [Architecture](docs/ARCHITECTURE.md): how the app, the visualization kit and content fit together.
- [Adding a visualization](docs/ADDING_A_VISUALIZATION.md): the workflow and the checklist.
- [Design](docs/DESIGN.md): tokens, palette rules, motion rules.
- [Writing](docs/WRITING.md): rules for all text in the project.
- [Roadmap](docs/ROADMAP.md): status of every visualization and the backlog.
