# History

Finished phase trackers and notes, kept for reference. Nothing here is read at the start of a
session.

## Phase 2 trackers (learning platform)

Status: `todo`, `doing`, `done`.

### 2A. Structure

| Task                                                            | Status |
| --------------------------------------------------------------- | ------ |
| Content tree (areas, courses, units, items), registry and types | done   |
| Move the seven visualizations, redirects from old URLs          | done   |
| Sidebar tree with area switcher; course and unit pages          | done   |
| Progress store (IndexedDB, schema version, export and import)   | done   |
| `lesson` item kind with check questions on steps                | done   |

### 2B. Practice

| Task                                                                         | Status |
| ---------------------------------------------------------------------------- | ------ |
| Spike: MathLive and Compute Engine bundle size, theming, equivalence checks  | done   |
| `MathInput` molecule and answer checker library with tests                   | done   |
| Problem generator API, seeded random source, property tests                  | done   |
| Practice runner: card, hints, solutions, progress, fresh problems on errors  | done   |
| Checkpoints with worksheet view and self-graded problems                     | done   |
| Skill statuses: suggested from results, manually settable in both directions | done   |

Follow-ups after review (done): sessions and checkpoint sheets persist across visits, earlier
problems can be reviewed read-only, the counter shows the viewed problem, difficulty changes apply
immediately to an unanswered problem, the math field hint is a dimmed overlay, and checkpoints print
as clean worksheets.

### 2C. Dashboard

| Task                                                       | Status  |
| ---------------------------------------------------------- | ------- |
| Home dashboard (continue, course progress, mixed practice) | done    |
| Mixed practice across chosen skills                        | done    |
| Course prerequisite map                                    | dropped |

Kept small on purpose (2026-10-17): the home page keeps its hero and course cards (which already
show progress) and gains a "Mixed practice" button next to "Continue". Mixed practice lives at
`/practice`: pick units (all by default), optionally skip skills already mastered, then a normal
session of eight problems drawn from those units' practice items. Its answers do not count toward
item progress; status suggestions at the end apply as usual. The prerequisite map was dropped:
unit pages already list suggested prerequisites, and a map adds little for one learner.

### 2D. Pilot content

The first unit is built end to end to validate the whole loop before scaling content.

| Task                                                                       | Status |
| -------------------------------------------------------------------------- | ------ |
| Pre-calculus / Functions (items below)                                     | done   |
| Data Engineering / Relational model and SQL joins (first interleaved unit) | done   |
| Pre-calculus / Algebra essentials                                          | done   |
| Data Engineering / Storage and file formats (core depth)                   | done   |
| Pre-calculus / Polynomial and rational functions (refresher)               | review |
| Pre-calculus / Exponential and logarithmic functions (refresher)           | review |

## Finished roadmap phases

### Phase 4: Pan and zoom, fullscreen

Feasible with modest work because every primitive draws through `useCoords()`. The Stage would hold
a view transform (center and scale) on top of its fitted domain, changed by wheel, pinch and drag on
empty space, with a reset button and limits. Grid and axes already cover the visible view, so they
extend naturally. Things to handle: drag conflicts with draggable points (drag only on background),
label density when zoomed out (axis ticks already adapt via `niceStep`), and opting out for diagrams
where zoom makes no sense (a `zoomable` prop, off by default).

Step and parameters in the URL: `?step=<id>` for every item (the runtime owns the step, so this is
one change in `ItemPage`), so a note or a recording script can link an exact view. Parameters
(slider and toggle values) need each visualization to declare them, through a kit hook such as
`useVizParam(name, default)` that reads and writes the query string. Adopt it in new
visualizations and in old ones when they are touched, not as a sweep of every item.

Fullscreen mode: one toggle (button and a key) that hides the sidebar, top bar and explanation
pane and puts the stage in the browser's fullscreen, keeping the dock and step navigation (arrow
keys). Not yet a presentation mode: no speaker notes, scripted timing or recording aids.

Done on 2026-10-17:

- `<Stage zoomable>` (on the ten stages with axes): wheel and pinch zoom about the pointer, drag on
  the background to pan, double-click or the reset button to return, and zoom buttons in the middle
  of the right edge. Zoom is limited to 0.25 to 10 and the view center to one domain size away.
  Draggable points keep working because they call `preventDefault`. The view resets on each step.
  Grid and axes switch to 1, 2 or 5 multiples of their step as the zoom changes, and tick labels
  stay along the edge when the origin is out of view. The math is in `coords.ts` (tested).
- `?step=<id>` opens a step; the URL follows the step through `history.replaceState`, batched,
  with no new history entries (`src/viz-kit/runtime/query.ts`).
- `useVizParam(name, default, codec?)` keeps a value in the query string, adopted in
  `transformations` (`f` for the base function, `p=a_b_h_k`). A link with parameters skips the
  opening step's `useStepEffect` handler so the linked view is not overwritten.
- Fullscreen: the button in the top bar or `f` puts the stage area in browser fullscreen (a fixed
  layer where the API is missing), with a bar for step navigation and exit. Tooltips portal into
  the fullscreen element (`PortalContainerContext`).

### Phase 7: Notation and glossary index

A page listing every symbol and term (for example $f^{-1}$, domain, cardinality, row group), each
linked to the item that introduces it and to the items that use it, also reachable from the command
palette. Cheap because the data is small and declared next to the content:

- Each unit declares its terms in `unit.ts`: `{ id, title, tex?, summary, introducedIn }`, where
  `introducedIn` is an item slug. The catalog builder resolves them and fails the build on unknown
  slugs, like skills.
- Optional: a `<Term id="...">` MDX widget that links a word in an explanation to the index entry.
- The cost is the retrofit of existing units (about 13): one pass per unit, reading its items'
  summaries and explanations. New units declare terms as part of `ADDING_CONTENT.md`.

Done on 2026-10-17. "Used in" is inferred from `<Term id="...">` links in explanations, scanned at
build time by a Vite plugin (`src/catalog/termUsesPlugin.ts`). Term ids are global. The page is
`/glossary` (sidebar footer and command palette). All 11 units with content were retrofitted:
97 terms. New units declare terms as part of `ADDING_CONTENT.md`.

### Phase 8: Internationalization groundwork

Move UI copy (about 100 to 150 strings in `src/ui`, `src/practice`, `src/app`) into one typed
messages module, with plural and number helpers, and a lint rule or check against new hard-coded
copy. No translations and no locale switch yet. To keep it cheap in tokens: list the strings with a
script first, then move them file by file, one commit per layer. Content (MDX, step captions,
problem prompts in generators) stays out of scope; its plan is in [PRODUCT_VISION.md](PRODUCT_VISION.md).
Doing it before phases 4 and 7 means their new UI is written against the messages module.

Done on 2026-10-17: about 220 strings moved into `src/i18n/messages.ts` (`msg`), with `plural`,
`count`, `formatInteger`, `formatPercent` and `formatDateTime` in `src/i18n/format.ts`.
`scripts/ui-strings.mjs` lists hard-coded copy and `pnpm lint` fails on any. The answer checker
in `src/lib` returns issue codes, worded by the UI. Next for i18n (not planned): a `pt-BR` object
of type `Messages`, a locale setting, then content translation as in `PRODUCT_VISION.md`.

### Phase 9: Light UI polish

Small improvements, no new routes and no heavy features. Agreed with the owner on 2026-10-17.

**Course and unit pages, a little more distinct.** Both pages stay separate (units keep their
own URLs, the sidebar already shows the tree, and the unit page's controls need room), but today
they share the same `DocumentLayout` and list rows, so they look alike. Give each its own job:

- Course page as a map: units on a vertical path with their rings, the next unit highlighted with
  a "Continue" link to its next item, a row of small kind icons per unit (one per item, filled
  when done), planned units dimmed.
- Unit page as a workspace: items grouped by role (explore and lessons, practice, checkpoint), the
  next item called out, the checkpoint with its best score, skills as today, and a header with the
  unit number within the course and prerequisites as chips.

**Zoom on `matrix-transformations`.** It has no labeled axes, only a grid of the plane and the
transformed grid, so phase 4 left it out, but zooming out helps to follow a matrix that stretches
the plane. Draw the transformed grid over the visible view (it uses a fixed `REACH` today, whose
edges would show when zoomed out), then add `zoomable`.

**Readout panels that do a bit more.** The corner panels (`Overlay` with `ReadoutPanel`, for
example the cost and sparkline in `backpropagation` or the matrix and determinant in
`matrix-transformations`) are static and small. Light options, in the kit so every item gets them:

- an expand button on a panel that opens its content larger in a `VizSheet`, as the RAG vector
  store does (for example, the cost sparkline with axes);
- tooltips on readout labels with a one-line meaning (`Readout` gets an optional `hint`);
- panels can collapse to their title, so they never hide the drawing.

Done on 2026-10-17. The course page is a path of unit cards: a ring per unit, one kind icon per
item (teal when done, each a link), planned units dimmed, and a "Continue" link on the first
unfinished unit (`nextUnit`, `nextItem` in `src/progress/derive.ts`). The unit page has "Unit n
of m" as its eyebrow, prerequisites as chips, an "Up next" card, items in course order with a badge
per kind (the checkpoint shows its pass mark or best score), the unit's glossary terms as chips
that open the term popover, then skills. `matrix-transformations` is zoomable, drawing its grid with the
kit's `TransformedGrid`. Readout panels got `title` (collapsible), `onExpand` and `hint`; they are
applied in `matrix-transformations` and `backpropagation` (whose cost opens a `SeriesPlot`). Other
items' panels can adopt them as they are revisited. After review: points show their coordinates on
hover (`Point` `coords`, on for zoomable stages), and floating UI animates out as well as in.
