# Roadmap

Tracker for the project. Update the tables whenever a visualization changes status.

Status values: `idea` (backlog), `draft` (in the repo with `status: 'draft'`), `review` (published,
awaiting feedback), `done`.

## Phases

| Phase | What                                                                                      | Status  |
| ----- | ----------------------------------------------------------------------------------------- | ------- |
| 1     | Platform, design system, visualization kit, first seven visualizations, GitHub Pages      | done    |
| 2A    | Content tree, progress store, lessons                                                     | done    |
| 2B    | Practice engine: math input, answer checking, generators, sessions, checkpoints           | done    |
| 2C    | Home dashboard (continue, course progress) and mixed practice across chosen skills        | done    |
| 2D    | Pilot content: Pre-calculus / Functions end to end, then the first Data Engineering unit  | done    |
| 3     | Explore page: browse every exploration and lesson as a gallery, outside the course tree   | planned |
| 4     | Pan and zoom on stages with axes, and a fullscreen mode                                   | done    |
| 5     | 3D stages for multivariable calculus and linear algebra                                   | planned |
| 6     | Code lessons: the math of an item as real code (NumPy, SymPy, Spark, ML libraries)        | idea    |
| 7     | Notation and glossary index: every symbol and term, linked to the item that introduces it | done    |
| 8     | Internationalization groundwork: UI strings in one module (no translation yet)            | done    |
| 9     | Light UI polish: distinct course and unit pages, matrix zoom, interactive readout panels  | done    |
| later | Presentation mode, internationalization (pt-BR), mobile layout                            | planned |

Phase numbers are labels, not an order. A phase starts when the content needs it: 3D (phase 5)
when a linear algebra or calculus visualization calls for it, code lessons (phase 6) when items
that apply them come up, and pan, zoom and fullscreen (phase 4) whenever it is worth doing before
more content. Phases 7 and 8 get more expensive as content grows, so they are worth doing early.
Pick the next phase or content unit by what helps the curriculum next.

Phase 2 details and its task tracker: [LEARNING_PLATFORM.md](LEARNING_PLATFORM.md). 2D closed on
2026-10-17 with four reviewed units (Functions, Relational model and joins, Algebra essentials,
Storage and file formats). Content units continue after it as ongoing work, in the suggested order
of `LEARNING_PLATFORM.md`, alongside the numbered phases.

**Suggested next session:** take the next step of "Suggested order of units" in
`LEARNING_PLATFORM.md`: build Calculus 1: Limits batch 1 (write its unit plan from the Calculus
outline first). Outline steps in that list (Linear Algebra next) come up on their own; do them
when reached and get Daniel's review. Polynomial and rational functions and Exponential and
logarithmic functions were built on 2026-10-17 and await Daniel's review. Stages use `zoomable`,
titled readout panels with hints, and `useVizParam` where a view is worth linking.

### Phase 3: Explore page

A gallery of explorations and lessons, independent of courses: a grid of cards with a live or static
preview, filters by area and tag, and search. Cards open the item normally. Needs a preview per item:
either a small static SVG thumbnail rendered from the visualization at a fixed step, or a
`thumbnail` export in the item folder. The catalog already lists every item, so this is mostly UI.

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

### Phase 5: 3D

Needed for surfaces, gradients, partial derivatives and 3D linear maps. Two options, to decide at
the start of the phase:

- **Own projection in SVG** (orbit camera, painter's ordering): keeps the exact 2D look (crisp strokes,
  same tokens, KaTeX labels), enough for curves, vectors, grids, wireframe and simple shaded surfaces.
- **react-three-fiber (three.js)**: real depth, lighting and large meshes, at the cost of a heavier
  bundle and more work to match the flat, clean aesthetic.

A likely path is SVG first for 3Blue1Brown-style line drawings, and three.js only if a visualization
needs shaded surfaces that SVG cannot handle well. Either way it plugs in as a `Stage3D` using the same
runtime, steps, controls and palette.

### Phase 6: Code lessons (idea, not planned yet)

Goal: show how the math of an item is applied in real code, so the "why" behind NumPy, SymPy,
scikit-learn and deep learning code is not lost, and how data engineering ideas show up in real
dataframe and SQL engines. Not a Python course. NumPy matters most on the math side (it is linear
algebra in code); on the data side, Spark's DataFrame API and its execution model matter more than
pandas. Feasible on GitHub
Pages with no server:

- **Code view on existing items (cheapest).** A tab or pane next to the stage with the same
  computation in Python, highlighted at build time (for example Shiki), with lines linked to steps
  and to the symbols in the visualization: $A\mathbf{v}$ next to `A @ v`, a Riemann sum next to
  `np.sum(f(x) * dx)`. Read-only, no runtime cost.
- **Runnable cells.** Pyodide (CPython compiled to WebAssembly) runs NumPy, pandas, SymPy and
  scikit-learn in the browser, in a Web Worker, loaded only on pages that need it (several MB on
  first load, then cached). Cells could feed values back to the stage, such as plotting a
  learner's function.
- **A `code` item kind.** Standalone lessons built like notebooks: short cells, each tied to a
  formula, with checks that compare the printed result with a value computed independently in
  TypeScript, the same way practice answers are verified.
- **Data engineering.** Spark does not run in the browser (it needs a JVM). Two pieces fit: real
  SQL and dataframe queries in DuckDB-Wasm (columnar, Parquet-aware, small enough to lazy load),
  and PySpark code shown read-only next to a visualization of what Spark does with it: partitions,
  narrow versus wide transformations, shuffles, the logical and physical plan, predicate pushdown
  and partition pruning. The storage unit's Parquet items are a natural first place.
- **Deep learning.** PyTorch does not run in Pyodide. Build models from scratch in NumPy (which is
  where the math shows), then show the equivalent PyTorch code read-only, line by line.

A likely path: code view first, applied to a few items in Linear Algebra and Machine Learning;
runnable cells and the `code` kind once those show what is worth running. Code should model good
practice (typing, small functions, clear names), since Daniel cares about it.

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

Small improvements, no new routes and no heavy features. Agreed with Daniel on 2026-10-17.

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

### Later

- Presentation mode and internationalization: see [PRODUCT_VISION.md](PRODUCT_VISION.md).
- Mobile layout: panes as bottom sheets, dock as a drawer.

## Content

Items in the content tree, by path under `src/content`. The full curriculum plan is in
[LEARNING_PLATFORM.md](LEARNING_PLATFORM.md).

| Path                                                                                               | Kind       | Status | Notes                                                                  |
| -------------------------------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| mathematics/pre-calculus/algebra-essentials/exponent-laws                                          | explore    | done   | Tiles join, cancel across a bar, and repeat in a grid                  |
| mathematics/pre-calculus/algebra-essentials/radicals                                               | explore    | done   | Roots as sides of squares; oblique cube for cube roots                 |
| mathematics/pre-calculus/algebra-essentials/practice-exponents-and-radicals                        | practice   | done   | Eight generators; simplest forms asked as choices                      |
| mathematics/pre-calculus/algebra-essentials/factoring-as-area                                      | explore    | done   | Tiles fly into rectangles; strip turns for $a^2 - b^2$                 |
| mathematics/pre-calculus/algebra-essentials/rational-expressions                                   | lesson     | done   | Holes and asymptotes; heights add for sums; four checks                |
| mathematics/pre-calculus/algebra-essentials/practice-factoring-and-fractions                       | practice   | done   | Nine generators; factored forms asked as choices                       |
| mathematics/pre-calculus/algebra-essentials/equations-and-inequalities                             | explore    | done   | Crossings, squaring, sign chart, distance                              |
| mathematics/pre-calculus/algebra-essentials/practice-equations-and-inequalities                    | practice   | done   | Ten generators; solution sets checked by sampling                      |
| mathematics/pre-calculus/algebra-essentials/checkpoint                                             | checkpoint | done   | Ten problems including a self-graded proof                             |
| mathematics/pre-calculus/polynomial-and-rational/lines-and-parabolas                               | explore    | review | Slope triangle, vertex drag, completing the square, zeros              |
| mathematics/pre-calculus/polynomial-and-rational/polynomial-graphs                                 | explore    | review | Draggable zeros, multiplicity sliders, leading term, turning points    |
| mathematics/pre-calculus/polynomial-and-rational/rational-functions                                | explore    | review | Vertical, horizontal and slant asymptotes; a whole graph read          |
| mathematics/pre-calculus/polynomial-and-rational/practice-polynomial-and-rational                  | practice   | review | Eleven generators, verified from the prompt TeX                        |
| mathematics/pre-calculus/polynomial-and-rational/checkpoint                                        | checkpoint | review | Nine practice generators plus a proof (vertex and discriminant)        |
| mathematics/pre-calculus/exponential-and-logarithmic/exponential-growth                            | explore    | review | Factor per step, base and mirror, doubling distance, $2^x$ vs $x^2$    |
| mathematics/pre-calculus/exponential-and-logarithmic/the-number-e                                  | explore    | review | Compounding staircase, slope at zero, tangent run of 1, $e^{rt}$       |
| mathematics/pre-calculus/exponential-and-logarithmic/logarithms                                    | lesson     | review | Reflection, product rule as stacked heights, change of base; 5 checks  |
| mathematics/pre-calculus/exponential-and-logarithmic/practice-exponential-and-logarithmic          | practice   | review | Eleven generators; equations verified by substituting into prompt TeX  |
| mathematics/pre-calculus/exponential-and-logarithmic/checkpoint                                    | checkpoint | review | Nine practice generators plus a proof (product rule, change of base)   |
| mathematics/pre-calculus/functions/function-as-mapping                                             | explore    | done   | Mapping folds into a graph; vertical line test                         |
| mathematics/pre-calculus/functions/domain-and-range                                                | explore    | done   | Shadows on both axes (`AxisInterval` in the kit)                       |
| mathematics/pre-calculus/functions/reading-graphs                                                  | lesson     | done   | Four checks on one cubic                                               |
| mathematics/pre-calculus/functions/practice-evaluate-and-domain                                    | practice   | done   | Seven generators, verified by property tests                           |
| mathematics/pre-calculus/functions/composition                                                     | explore    | done   | Three number lines; order switch                                       |
| mathematics/pre-calculus/functions/inverses                                                        | explore    | done   | Graph reflects across y = x                                            |
| mathematics/pre-calculus/functions/transformations                                                 | explore    | done   | Dock wraps to two rows at 1440 px                                      |
| mathematics/pre-calculus/functions/practice-compose-and-invert                                     | practice   | done   | Seven generators, verified by property tests                           |
| mathematics/pre-calculus/functions/practice-transformations                                        | practice   | done   | Five generators, verified by property tests                            |
| mathematics/pre-calculus/functions/checkpoint                                                      | checkpoint | done   | Ten problems including a self-graded proof                             |
| data-engineering/storage-and-processing/storage-and-file-formats/row-vs-columnar                   | explore    | done   | Values fly into pages; layout toggle; scan, lookup, insert             |
| data-engineering/storage-and-processing/storage-and-file-formats/scan-cost                         | lesson     | done   | Table as an $N \times W$ area cut into pages; five checks              |
| data-engineering/storage-and-processing/storage-and-file-formats/practice-layouts                  | practice   | done   | Eight generators, verified by brute-force page counts                  |
| data-engineering/storage-and-processing/storage-and-file-formats/encodings                         | explore    | done   | Dictionary, bit packing with a $d$ slider, runs, sorting, deltas       |
| data-engineering/storage-and-processing/storage-and-file-formats/entropy-and-compression           | lesson     | done   | Information, entropy as the floor, order and codecs; seven checks      |
| data-engineering/storage-and-processing/storage-and-file-formats/practice-encoding-and-compression | practice   | done   | Nine generators, verified independently                                |
| data-engineering/storage-and-processing/storage-and-file-formats/parquet-anatomy                   | explore    | done   | Row groups, chunks, pages, footer; pushdown with a $t$ slider, sorting |
| data-engineering/storage-and-processing/storage-and-file-formats/practice-parquet                  | practice   | done   | Seven generators, verified by brute force and materialized row groups  |
| data-engineering/storage-and-processing/storage-and-file-formats/checkpoint                        | checkpoint | done   | Nine practice generators plus a proof about runs                       |
| data-engineering/relational-foundations/relational-model-and-joins/tables-as-relations             | explore    | done   | Product grid; pairs fly into the table                                 |
| data-engineering/relational-foundations/relational-model-and-joins/keys-and-references             | explore    | done   | FK arrows; ON DELETE options                                           |
| data-engineering/relational-foundations/relational-model-and-joins/joins-as-products               | explore    | done   | `JoinGrid` in the kit; condition sweep, theta joins                    |
| data-engineering/relational-foundations/relational-model-and-joins/outer-joins                     | explore    | done   | NULL-padded cells beside the grid; anti join                           |
| data-engineering/relational-foundations/relational-model-and-joins/join-row-counts                 | lesson     | done   | Join size as rectangles $a_k \times b_k$; five checks                  |
| data-engineering/relational-foundations/relational-model-and-joins/practice-relations-and-keys     | practice   | done   | Eight generators, verified by property tests                           |
| data-engineering/relational-foundations/relational-model-and-joins/practice-joins                  | practice   | done   | Eight generators, checked against materialized joins                   |
| data-engineering/relational-foundations/relational-model-and-joins/checkpoint                      | checkpoint | done   | Ten problems including a self-graded proof                             |
| mathematics/calculus-1/derivatives/derivative-as-limit                                             | lesson     | done   | Two checks (concept, computed value)                                   |
| mathematics/calculus-1/derivatives/difference-quotients                                            | practice   | done   | Six generators, verified by property tests                             |
| mathematics/calculus-1/derivatives/checkpoint                                                      | checkpoint | done   | Six problems including a self-graded proof                             |
| mathematics/calculus-1/integrals/riemann-sums                                                      | explore    | done   | Empty space below the x-axis at some sizes                             |
| mathematics/linear-algebra/linear-transformations/matrix-transformations                           | explore    | done   | Zoomable (`TransformedGrid`); `MatrixView` could move to `ui`          |
| mathematics/complex-numbers/arithmetic/complex-multiplication                                      | explore    | done   |                                                                        |
| machine-learning/neural-networks/foundations/forward-pass                                          | explore    | done   |                                                                        |
| machine-learning/neural-networks/training/backpropagation                                          | explore    | done   |                                                                        |
| ai-engineering/retrieval/fundamentals/rag-pipeline                                                 | explore    | done   | Vector store view opens in a larger sheet                              |

Planned units without content (the rest of pre-calculus, limits, applications of derivatives) appear
on their course pages as planned.

## Backlog

### Calculus

- Limits: epsilon-delta game (choose epsilon, find delta)
- The chain rule as composed stretching of number lines
- Product rule as the area of a growing rectangle
- Taylor polynomials converging to a function
- Fundamental theorem of calculus: accumulated area and its slope
- Euler's method versus the exact solution of an ODE

### Linear Algebra

- Vectors: addition and scaling, span of two vectors
- Matrix multiplication as composition of transformations
- Eigenvectors: directions that only get scaled
- Change of basis
- Dot product as projection
- Singular value decomposition: rotate, stretch, rotate

### Complex Numbers

- Euler's formula and the unit circle
- Roots of unity
- Complex functions as plane maps (domain coloring)
- Fourier series with epicycles

### Neural Networks

- A single neuron as a linear classifier with a decision boundary
- Activation functions compared (sigmoid, tanh, ReLU)
- Gradient descent on a 2D loss surface (with momentum and learning rate effects)
- Universal approximation: building a bump from two sigmoids
- Convolution as a sliding kernel
- Attention: queries, keys and values on a short sentence
- Softmax and temperature

### AI Engineering

- Tokenization of a sentence
- Embeddings and cosine similarity
- Chunking strategies compared (fixed, sentence, overlap)
- Agent loop with tool calls
- Evaluation: precision and recall of retrieval

### Data Architecture (section not created yet)

- Batch versus streaming pipelines
- Medallion architecture (bronze, silver, gold)
- Partitioning and file layout
- Slowly changing dimensions

### Probability and Statistics (section not created yet)

- Central limit theorem with sampling
- Bayes' theorem as area
- Random walks

## Platform notes

- Main JS chunk is about 890 kB (276 kB gzipped). Splitting vendor code is listed in
  [PRODUCT_VISION.md](PRODUCT_VISION.md) as work before a product.
- Other ideas: thumbnails for cards, visual regression snapshots per step, optional sonification.
