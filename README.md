# Lumen

Interactive visual explanations of mathematics, machine learning and computing. Each visualization
is built around one concept, with narrative steps, direct manipulation and a written explanation.

## Run it

Requires Node 24 (see `.nvmrc`) and pnpm (`corepack enable`).

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

| Command                                                                 | What it does                                          |
| ----------------------------------------------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                                                              | Dev server with hot reload                            |
| `pnpm build`                                                            | Typecheck and production build into `dist/`           |
| `pnpm lint`                                                             | ESLint plus the prose lint (`scripts/lint-prose.mjs`) |
| `pnpm typecheck`                                                        | TypeScript only                                       |
| `pnpm test`                                                             | Unit tests (Vitest) for `src/lib`                     |
| `pnpm e2e`                                                              | Playwright smoke tests against a production build     |
| `pnpm new:item <area>/<course>/<unit>/<slug> [explore\|lesson] "Title"` | Scaffold a content item                               |

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
- [Adding content](docs/ADDING_CONTENT.md): the workflow and the checklist.
- [Design](docs/DESIGN.md): tokens, palette rules, motion rules.
- [Writing](docs/WRITING.md): rules for all text in the project.
- [Roadmap](docs/ROADMAP.md): status of every visualization and the backlog.
- [Learning platform](docs/LEARNING_PLATFORM.md): plan and tracker for courses, practice and progress.
- [Product vision](docs/PRODUCT_VISION.md): possible future as a product, and the seams kept for it.

Live site: https://daniekans.github.io/lumen/ (deployed by `.github/workflows/deploy.yml` on every push to `main`).
