# Roadmap

Tracker for the project. Update the tables whenever a visualization changes status.

Status values: `idea` (backlog), `draft` (in the repo with `status: 'draft'`), `review` (published,
awaiting feedback), `done`.

## Phases

| Phase | What                                                                                     | Status  |
| ----- | ---------------------------------------------------------------------------------------- | ------- |
| 1     | Platform, design system, visualization kit, first seven visualizations, GitHub Pages     | done    |
| 2A    | Content tree, progress store, lessons                                                    | done    |
| 2B    | Practice engine: math input, answer checking, generators, sessions, checkpoints          | done    |
| 2C    | Home dashboard (continue, course progress) and mixed practice across chosen skills       | next    |
| 2D    | Pilot content: Pre-calculus / Functions end to end, then the first Data Engineering unit | doing   |
| 3     | Explore page: browse every exploration and lesson as a gallery, outside the course tree  | planned |
| 4     | Pan and zoom on stages with axes                                                         | planned |
| 5     | 3D stages for multivariable calculus and linear algebra                                  | planned |
| 6     | Code lessons: the math of an item as real NumPy, pandas, SymPy or PyTorch code           | idea    |
| later | Presentation mode, internationalization (pt-BR), mobile layout                           | planned |

Phase 2 details and its task tracker: [LEARNING_PLATFORM.md](LEARNING_PLATFORM.md). 2C and 2D can run
in either order; 2D was recommended first because the dashboard is more useful with real content.

**Suggested next session:** Algebra essentials is complete (all nine items await review). Next,
per "Suggested order of units" in `LEARNING_PLATFORM.md`: DE: Storage and file formats. Plan the
unit (refresher or core depth, skills, items, batches) in `LEARNING_PLATFORM.md`, then build its
first batch.

### Phase 3: Explore page

A gallery of explorations and lessons, independent of courses: a grid of cards with a live or static
preview, filters by area and tag, and search. Cards open the item normally. Needs a preview per item:
either a small static SVG thumbnail rendered from the visualization at a fixed step, or a
`thumbnail` export in the item folder. The catalog already lists every item, so this is mostly UI.

### Phase 4: Pan and zoom

Feasible with modest work because every primitive draws through `useCoords()`. The Stage would hold
a view transform (center and scale) on top of its fitted domain, changed by wheel, pinch and drag on
empty space, with a reset button and limits. Grid and axes already cover the visible view, so they
extend naturally. Things to handle: drag conflicts with draggable points (drag only on background),
label density when zoomed out (axis ticks already adapt via `niceStep`), and opting out for diagrams
where zoom makes no sense (a `zoomable` prop, off by default).

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

Goal: show how the math of an item is applied in real code, so the "why" behind NumPy, pandas,
SymPy, scikit-learn and deep learning code is not lost. Not a Python course. Feasible on GitHub
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
- **Deep learning.** PyTorch does not run in Pyodide. Build models from scratch in NumPy (which is
  where the math shows), then show the equivalent PyTorch code read-only, line by line.

A likely path: code view first, applied to a few items in Linear Algebra and Machine Learning;
runnable cells and the `code` kind once those show what is worth running. Code should model good
practice (typing, small functions, clear names), since Daniel cares about it.

### Later

- Presentation mode and internationalization: see [PRODUCT_VISION.md](PRODUCT_VISION.md).
- Mobile layout: panes as bottom sheets, dock as a drawer.

## Content

Items in the content tree, by path under `src/content`. The full curriculum plan is in
[LEARNING_PLATFORM.md](LEARNING_PLATFORM.md).

| Path                                                                                           | Kind       | Status | Notes                                                   |
| ---------------------------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------- |
| mathematics/pre-calculus/algebra-essentials/exponent-laws                                      | explore    | review | Tiles join, cancel across a bar, and repeat in a grid   |
| mathematics/pre-calculus/algebra-essentials/radicals                                           | explore    | review | Roots as sides of squares; oblique cube for cube roots  |
| mathematics/pre-calculus/algebra-essentials/practice-exponents-and-radicals                    | practice   | review | Eight generators; simplest forms asked as choices       |
| mathematics/pre-calculus/algebra-essentials/factoring-as-area                                  | explore    | review | Tiles fly into rectangles; strip turns for $a^2 - b^2$  |
| mathematics/pre-calculus/algebra-essentials/rational-expressions                               | lesson     | review | Holes and asymptotes; heights add for sums; four checks |
| mathematics/pre-calculus/algebra-essentials/practice-factoring-and-fractions                   | practice   | review | Nine generators; factored forms asked as choices        |
| mathematics/pre-calculus/algebra-essentials/equations-and-inequalities                         | explore    | review | Crossings, squaring, sign chart, distance               |
| mathematics/pre-calculus/algebra-essentials/practice-equations-and-inequalities                | practice   | review | Ten generators; solution sets checked by sampling       |
| mathematics/pre-calculus/algebra-essentials/checkpoint                                         | checkpoint | review | Ten problems including a self-graded proof              |
| mathematics/pre-calculus/functions/function-as-mapping                                         | explore    | done   | Mapping folds into a graph; vertical line test          |
| mathematics/pre-calculus/functions/domain-and-range                                            | explore    | review | Shadows on both axes (`AxisInterval` in the kit)        |
| mathematics/pre-calculus/functions/reading-graphs                                              | lesson     | review | Four checks on one cubic                                |
| mathematics/pre-calculus/functions/practice-evaluate-and-domain                                | practice   | review | Seven generators, verified by property tests            |
| mathematics/pre-calculus/functions/composition                                                 | explore    | review | Three number lines; order switch                        |
| mathematics/pre-calculus/functions/inverses                                                    | explore    | review | Graph reflects across y = x                             |
| mathematics/pre-calculus/functions/transformations                                             | explore    | review | Dock wraps to two rows at 1440 px                       |
| mathematics/pre-calculus/functions/practice-compose-and-invert                                 | practice   | review | Seven generators, verified by property tests            |
| mathematics/pre-calculus/functions/practice-transformations                                    | practice   | review | Five generators, verified by property tests             |
| mathematics/pre-calculus/functions/checkpoint                                                  | checkpoint | review | Ten problems including a self-graded proof              |
| data-engineering/relational-foundations/relational-model-and-joins/tables-as-relations         | explore    | review | Product grid; pairs fly into the table                  |
| data-engineering/relational-foundations/relational-model-and-joins/keys-and-references         | explore    | review | FK arrows; ON DELETE options                            |
| data-engineering/relational-foundations/relational-model-and-joins/joins-as-products           | explore    | review | `JoinGrid` in the kit; condition sweep, theta joins     |
| data-engineering/relational-foundations/relational-model-and-joins/outer-joins                 | explore    | review | NULL-padded cells beside the grid; anti join            |
| data-engineering/relational-foundations/relational-model-and-joins/join-row-counts             | lesson     | review | Join size as rectangles $a_k \times b_k$; five checks   |
| data-engineering/relational-foundations/relational-model-and-joins/practice-relations-and-keys | practice   | review | Eight generators, verified by property tests            |
| data-engineering/relational-foundations/relational-model-and-joins/practice-joins              | practice   | review | Eight generators, checked against materialized joins    |
| data-engineering/relational-foundations/relational-model-and-joins/checkpoint                  | checkpoint | review | Ten problems including a self-graded proof              |
| mathematics/calculus-1/derivatives/derivative-as-limit                                         | lesson     | done   | Two checks (concept, computed value)                    |
| mathematics/calculus-1/derivatives/difference-quotients                                        | practice   | done   | Six generators, verified by property tests              |
| mathematics/calculus-1/derivatives/checkpoint                                                  | checkpoint | done   | Six problems including a self-graded proof              |
| mathematics/calculus-1/integrals/riemann-sums                                                  | explore    | done   | Empty space below the x-axis at some sizes              |
| mathematics/linear-algebra/linear-transformations/matrix-transformations                       | explore    | done   | `MatrixView` could move to `ui` if reused               |
| mathematics/complex-numbers/arithmetic/complex-multiplication                                  | explore    | done   |                                                         |
| machine-learning/neural-networks/foundations/forward-pass                                      | explore    | done   |                                                         |
| machine-learning/neural-networks/training/backpropagation                                      | explore    | done   |                                                         |
| ai-engineering/retrieval/fundamentals/rag-pipeline                                             | explore    | done   | Vector store view opens in a larger sheet               |

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

- Main JS chunk is about 890 kB (276 kB gzipped). Splitting vendor code (KaTeX, motion, Radix) is a
  possible improvement.
- Other ideas: shareable state in the URL (step, parameters), thumbnails for cards, visual regression
  snapshots per step, optional sonification.
