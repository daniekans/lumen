# Roadmap

Tracker for the project: phases, legacy items and the backlog. Content status lives in the unit
plans (`docs/plans/`). Finished phase details are in [HISTORY.md](HISTORY.md).

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
| 5     | 3D stages for multivariable calculus and linear algebra                                   | done    |
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

Phase 2's task trackers are in [HISTORY.md](HISTORY.md). 2D closed on
2026-10-17 with four reviewed units (Functions, Relational model and joins, Algebra essentials,
Storage and file formats). Content units continue after it as ongoing work, in the suggested order
of `LEARNING_PLATFORM.md`, alongside the numbered phases.

**Suggested next session:** Linear maps and matrices batch 1 is built (`plans/linear-algebra.md`,
"Batch 1"). Collect the owner's review of it, then build batch 2 (items 5 to 8: the gallery of
maps, composition, matrix multiplication and its practice). The focus is
Mathematics and Machine Learning; Data Engineering continues only on request, and its next step
is outlining the Distributed processing unit.

### Phase 3: Explore page

A gallery of explorations and lessons, independent of courses: a grid of cards with a live or static
preview, filters by area and tag, and search. Cards open the item normally. Needs a preview per item:
either a small static SVG thumbnail rendered from the visualization at a fixed step, or a
`thumbnail` export in the item folder. The catalog already lists every item, so this is mostly UI.

### Phase 5: 3D (done 2026-10-18)

Built as an own projection in SVG, the first of the two options considered (the other was
react-three-fiber). `Stage3D` (`src/viz-kit/stage3d/`) wraps the 2D `Stage` with an orthographic
orbit camera: drag the background to orbit, wheel or buttons to zoom, double-click to reset. The
primitives (`Vector3D`, `Segment3D`, `Line3D`, `Path3D`, `Plane3D`, `Grid3D`, `Axes3D`, `Point3D`,
`MathLabel3D`, `DropLines3D`) project their points and draw with the 2D kit, so strokes, colors,
KaTeX labels and point hover work as in 2D. A step can drive the camera (`camera` and
`onCameraChange` make it controlled). Drawing order is tree order; translucent planes keep it
readable. First used by Vectors items 6 and 7.

Polish (2026-10-18, after the owner's review): depth cueing (far parts fade, which also removes the
illusion that the far edge of a plane is wider), lines, axes and planes that fade into the
distance, hover highlight linked to the readouts (`useHighlight`, `hoverKey`), a slow idle sway
(on by default, a button switches it off and the choice is remembered), orbit momentum, a views
menu (home, above, front, side, plus item views such as "along the plane"), arrow keys and +/-
on a focused stage, arrows that grow in (2D too), one-shot pulses (`Pulse`, `Pulse3D`), and a
"playing" mark with a Replay button in the steps header for every item.

Next for 3D, in order of priority:

1. **Surfaces** $z = f(x, y)$ for Multivariable Calculus and later courses (the owner's top
   priority; same look as the rest). Plan: an SVG `Surface3D` drawn as a wireframe of grid
   curves plus translucent quads sorted back to front (painter's ordering), shaded by depth and
   optionally by height with one hue; contour lines on the floor; a point and its tangent plane.
   Move to WebGL (three.js) only if the SVG version is too slow or cannot shade well enough, and
   then keep the same palette, strokes and labels.
2. Depth sorting of lines and vectors against planes (the part of a vector behind a plane
   drawn dimmer).
3. Pinch to zoom on touch screens (with the mobile layout).
4. The camera in the URL, opt-in like other parameters.
5. Hover keys on the 2D primitives (`Vector`, `Segment`, `Path`), so 2D items can link shapes
   and readouts too.
6. A slight perspective option, only if depth cueing turns out not to be enough.

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
practice (typing, small functions, clear names), since the owner cares about it.

### Later

- Presentation mode and internationalization: see [PRODUCT_VISION.md](PRODUCT_VISION.md).
- Mobile layout: panes as bottom sheets, dock as a drawer.

## Legacy items

Items built before the course plans, outside any unit plan. Each is revised when its unit is built
(see `plans/calculus.md`, Legacy items). Every other item's status is in its unit plan.

| Path                                                          | Kind       | Status | Notes                                                    |
| ------------------------------------------------------------- | ---------- | ------ | -------------------------------------------------------- |
| mathematics/calculus-1/derivatives/checkpoint                 | checkpoint | done   | Six problems; rebuilt in Derivatives batch 3             |
| mathematics/calculus-1/integrals/riemann-sums                 | explore    | done   | Empty space below the x-axis at some sizes               |
| mathematics/linear-algebra/linear-maps/matrix-transformations | explore    | done   | Revised 2026-10-25 as item 2 of Linear maps and matrices |
| mathematics/complex-numbers/arithmetic/complex-multiplication | explore    | done   |                                                          |
| machine-learning/neural-networks/foundations/forward-pass     | explore    | done   |                                                          |
| machine-learning/neural-networks/training/backpropagation     | explore    | done   |                                                          |
| ai-engineering/retrieval/fundamentals/rag-pipeline            | explore    | done   | Vector store view opens in a larger sheet                |

## Backlog

### Calculus

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

### Scaling watchlist

Reviewed on 2026-10-18 at 67 items (the plans add several hundred). Each entry says what grows,
the measure, and when to act.

- **Main JS chunk.** 1.09 MB (335 kB gzipped), up from 890 kB (276 kB) a few units ago. The
  catalog loads every `meta.ts` (steps, captions, check prompts: about 110 kB of source) and every
  `unit.ts` (skills, terms: about 50 kB) eagerly, so it grows with every item. Fix: split item
  metadata into an eager index (title, kind, order, skills, tags, summary) and step data loaded
  with the item. Act when the chunk passes about 500 kB gzipped, or with Phase 3, which needs only
  the index. Vendor splitting stays in [PRODUCT_VISION.md](PRODUCT_VISION.md).
- **Explanation chunks.** 100 to 200 kB raw each (rehype-katex inlines rendered HTML), but about
  9 kB gzipped and loaded per item. The whole build is 7.6 MB. No action needed.
- **Session docs.** Every session reads the start-up docs, so their size is a cost per session.
  Done on 2026-10-18: unit plans moved to `docs/plans/<course>.md`, finished trackers to
  `HISTORY.md`, the per-item content table dropped (unit plans hold status). Keep it that way: a
  finished course plan can shrink to its status tables.
- **Item ids are paths.** Moving content changes ids. Redirects keep links working, and progress
  (items, skills) now follows them on load (`currentId`, `migrate`). Still add a redirect for
  every move.
- **Visual checks.** Screenshots are the largest token cost of a content session. Shoot one
  theme and only the steps that changed; both themes once per batch.
- **Test helpers.** `problems.test.ts` files repeat small helpers (`close`, the TeX of a prompt,
  a limit read from a prompt). Move them into `src/lib/practice/testing.ts` when a test file is
  next touched.
- **Test and e2e time.** Problem-set tests are CPU-bound (150 seeds per generator) and grow with
  every practice set; under parallel load a single set takes 10 s or more, against a 30 s
  timeout. On 2026-10-18 validated TeX is cached and checkpoints run 20 seeds (their generators
  are covered in the practice sets): the suite went from 21 s to 13.5 s. Next lever when it
  passes about 60 s: fewer seeds by default with a full run on CI. E2e takes about 3 minutes (it
  builds); if it passes 5 minutes, run it on CI only and locally before structural changes.
