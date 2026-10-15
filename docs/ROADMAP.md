# Roadmap

Tracker for the project. Update the tables whenever a visualization changes status.

Status values: `idea` (backlog), `draft` (in the repo with `status: 'draft'`), `review` (published,
awaiting feedback), `done`.

## Current phase

**Phase 1: foundation and first batch.** The platform, design system, visualization kit and seven
visualizations exist. Waiting for review of direction before scaling up.

## Visualizations

| Section         | Visualization                  | Status | Notes                                                        |
| --------------- | ------------------------------ | ------ | ------------------------------------------------------------ |
| Calculus        | The derivative as a limit      | review |                                                              |
| Calculus        | Riemann sums                   | review | Empty space below the x-axis at some sizes                   |
| Linear Algebra  | Matrices as transformations    | review | `MatrixView` could move to `ui` if reused                    |
| Complex Numbers | Complex multiplication         | review |                                                              |
| Neural Networks | The forward pass               | review |                                                              |
| Neural Networks | Backpropagation                | review |                                                              |
| AI Engineering  | Retrieval-augmented generation | review | Vector store view opens in a larger sheet with hover details |

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
