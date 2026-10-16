# Product vision

Lumen is a personal learning platform today. It may become a product for other learners later, with
accounts, a backend and possibly a paid tier. That is a far-future possibility, not a plan with
dates. This document records it so today's decisions do not close doors, and so the code stays simple
in the meantime.

## Principles

1. **Build for one learner now.** No accounts, servers, payments or analytics until there is a real
   need. Static hosting on GitHub Pages costs nothing and needs no maintenance.
2. **Keep the seams, not the features.** Where a future feature would plug in, keep a clean boundary
   (an interface, a single function, a data file). Do not build the feature behind it.
3. **Low maintenance first.** Few dependencies, a boring stack, no services to babysit. Every new
   dependency or service must justify the upkeep it adds for a solo owner.

## Seams to keep

| Future need                                  | Seam today                                                                                                              | What changes later                                                                                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Progress synced to a server                  | All progress goes through a `ProgressStore` interface with async methods; the only implementation is local (IndexedDB)  | Add an HTTP implementation and pick it when signed in                                                                                       |
| Accounts                                     | Domain logic never reads a user identity; progress belongs to the local learner                                         | An auth provider supplies a learner id to the store                                                                                         |
| Premium content                              | Content metadata is plain data, and access to an item is decided in one place                                           | Add an `access` field to metadata and check it in that one function                                                                         |
| Content managed outside the code             | Content lives in `src/content` as typed data plus MDX, separate from the app and the kit                                | Content could move to its own package or a headless CMS without touching the app                                                            |
| Server-side checking (exams, certificates)   | Problem generators and answer checkers are pure TypeScript in `src/lib` with no DOM access                              | The same code runs in a server function                                                                                                     |
| Other languages (Brazilian Portuguese first) | UI copy is short and lives in components; long text lives in content files; numbers are formatted in one helper (`fmt`) | Extract UI strings to message files, add `meta.pt-BR.ts` / `explanation.pt-BR.mdx` next to the English ones, locale-aware number formatting |
| Usage insight                                | None                                                                                                                    | Add privacy-friendly analytics only if the product exists                                                                                   |

Rules that keep these seams cheap:

- `src/lib` stays pure (no React, no DOM, no storage).
- Components read and write progress only through the store's hooks, never IndexedDB directly.
- Content never imports app internals other than `catalog/types`, the viz kit, ui components and
  `src/lib`.

## Planned features that shape today's code

- **Presentation mode.** Video lessons will be recorded with the visualizations, possibly in Portuguese.
  A presentation mode would show the stage alone (no chrome), with larger labels and controls driven
  from the keyboard, and possibly a teleprompter view of the steps, a cursor highlight, scripted
  playback of steps, and fixed aspect ratios for recording. Seam today: the stage is independent of
  the panes, steps are data, and every visualization reacts to steps through `useStepEffect`.
- **Internationalization.** Brazilian Portuguese first, both for lessons and for a possible product
  audience. Seams today are listed in the table above. Rules: no English inside logic or data keys,
  ids stay in English and never show in the UI, and user-facing text comes from content files or
  component copy only.

## If it becomes a product

Options to evaluate at that time, not decisions:

- Backend: a managed Postgres with built-in auth (for example Supabase) to avoid running servers.
- Payments: Stripe or a merchant of record (for example Lemon Squeezy) to avoid handling taxes.
- Hosting: move from GitHub Pages to a host with server functions (for example Cloudflare or Vercel)
  only when accounts exist.
- Licensing: the repository is public but has no license, which means all rights are reserved. Choose a
  license deliberately before accepting contributions, or make the repository private again when a
  product exists.

## Not now

Accounts, backend, payments, sharing, leaderboards, notifications, reminders, spaced repetition and
analytics.
