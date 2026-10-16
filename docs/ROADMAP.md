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
| later | Presentation mode, internationalization (pt-BR), mobile layout                           | planned |

Phase 2 details and its task tracker: [LEARNING_PLATFORM.md](LEARNING_PLATFORM.md). 2C and 2D can run
in either order; 2D was recommended first because the dashboard is more useful with real content.

**Suggested next session:** continue phase 2D with the Functions unit plan in
`LEARNING_PLATFORM.md` ("Functions unit plan"). Item 1 (function-as-mapping) is a draft waiting for
Daniel's review; apply that feedback, publish it, then build item 2 (domain-and-range).

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

### Later

- Presentation mode and internationalization: see [PRODUCT_VISION.md](PRODUCT_VISION.md).
- Mobile layout: panes as bottom sheets, dock as a drawer.

## Content

Items in the content tree, by path under `src/content`. The full curriculum plan is in
[LEARNING_PLATFORM.md](LEARNING_PLATFORM.md).

| Path                                                                     | Kind       | Status | Notes                                          |
| ------------------------------------------------------------------------ | ---------- | ------ | ---------------------------------------------- |
| mathematics/pre-calculus/functions/function-as-mapping                   | explore    | draft  | Mapping folds into a graph; vertical line test |
| mathematics/calculus-1/derivatives/derivative-as-limit                   | lesson     | done   | Two checks (concept, computed value)           |
| mathematics/calculus-1/derivatives/difference-quotients                  | practice   | done   | Six generators, verified by property tests     |
| mathematics/calculus-1/derivatives/checkpoint                            | checkpoint | done   | Six problems including a self-graded proof     |
| mathematics/calculus-1/integrals/riemann-sums                            | explore    | done   | Empty space below the x-axis at some sizes     |
| mathematics/linear-algebra/linear-transformations/matrix-transformations | explore    | done   | `MatrixView` could move to `ui` if reused      |
| mathematics/complex-numbers/arithmetic/complex-multiplication            | explore    | done   |                                                |
| machine-learning/neural-networks/foundations/forward-pass                | explore    | done   |                                                |
| machine-learning/neural-networks/training/backpropagation                | explore    | done   |                                                |
| ai-engineering/retrieval/fundamentals/rag-pipeline                       | explore    | done   | Vector store view opens in a larger sheet      |

Planned units without content (all of pre-calculus, limits, applications of derivatives, relational
model and joins) appear on their course pages as planned.

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
