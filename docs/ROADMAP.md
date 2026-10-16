# Roadmap

Tracker for the project. Update the tables whenever a visualization changes status.

Status values: `idea` (backlog), `draft` (in the repo with `status: 'draft'`), `review` (published,
awaiting feedback), `done`.

## Current phase

**Phase 2: learning platform.** Phase 1 (platform, design system, visualization kit, seven
visualizations, deployment to GitHub Pages) is done and reviewed. Phase 2 adds areas, courses and
units, lessons, practice with checked answers, and progress. Plan and task tracker:
[LEARNING_PLATFORM.md](LEARNING_PLATFORM.md).

Data Engineering and Architecture units are interleaved with the math track instead of coming last;
the schedule is in the Curriculum section of the learning platform plan.

## Content

Items in the content tree, by path under `src/content`. The full curriculum plan is in
[LEARNING_PLATFORM.md](LEARNING_PLATFORM.md).

| Path                                                                     | Kind    | Status | Notes                                      |
| ------------------------------------------------------------------------ | ------- | ------ | ------------------------------------------ |
| mathematics/calculus-1/derivatives/derivative-as-limit                   | lesson  | done   | Two checks (concept, computed value)       |
| mathematics/calculus-1/integrals/riemann-sums                            | explore | done   | Empty space below the x-axis at some sizes |
| mathematics/linear-algebra/linear-transformations/matrix-transformations | explore | done   | `MatrixView` could move to `ui` if reused  |
| mathematics/complex-numbers/arithmetic/complex-multiplication            | explore | done   |                                            |
| machine-learning/neural-networks/foundations/forward-pass                | explore | done   |                                            |
| machine-learning/neural-networks/training/backpropagation                | explore | done   |                                            |
| ai-engineering/retrieval/fundamentals/rag-pipeline                       | explore | done   | Vector store view opens in a larger sheet  |

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

## Platform

### Done

- App shell: sidebar, top bar, explanation pane, floating control dock, command palette
- Dark and light themes from one token set; keyboard shortcuts
- Visualization kit: Stage, plot primitives, diagram primitives, neural network drawing,
  animation hooks, drag, steps runtime
- Folder-based registry with code splitting and draft status
- Prose lint, unit tests, Playwright smoke tests, CI
- Glass surface shared by all overlays; resizable and floating explanation pane; `VizSheet`
- Viz animations on the kit's own requestAnimationFrame tween (fixed instant preset animations)

### Next

- Presentation mode for recording video lessons (stage only, larger labels, keyboard-driven steps,
  recording aspect ratios). Details in [PRODUCT_VISION.md](PRODUCT_VISION.md).
- Internationalization, Brazilian Portuguese first. Details in [PRODUCT_VISION.md](PRODUCT_VISION.md).

- Mobile layout: panes as bottom sheets, dock collapses into a drawer
- Shareable state in the URL (current step, key parameters)
- Section landing pages with ordered learning paths
- Thumbnails rendered from each visualization for the home cards
- 3D: a `Stage3D` built on react-three-fiber with the same runtime and controls
- Audio: optional sonification service (Web Audio) behind a toggle
- Deployment (GitHub Pages or Vercel) with SPA fallback
- Visual regression snapshots per step
- Split vendor code (KaTeX, motion, Radix) out of the main chunk; it is 856 kB (272 kB gzipped)

## Open questions for review

- Is the home page hero copy right?
- Should the explanation pane be open by default on first visit?
- Preferred deployment target?
