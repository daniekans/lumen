# Learning platform

Plan and tracker for turning Lumen from a showcase into a personal learning platform. The look and
the explore-and-manipulate core stay as they are; this phase adds structure (areas, courses, units),
practice with checked answers, and progress.

## Goals

- Learn Mathematics, Machine Learning, Data Engineering and Architecture, and AI Engineering, with a
  smooth difficulty curve that ends in mastery, not familiarity.
- Every concept is seen (visualization), explained (text and formulas), and practiced (problems with
  feedback). Practice includes pen-and-paper work whose results are typed in and checked.
- The focus is intermediate and advanced material. Fundamentals are refreshers: enough for a smooth
  curve, not full courses (see Curriculum, Unit depths).
- Math starts from pre-calculus. Data Engineering and Architecture run as their own track alongside
  the math instead of waiting until the end.

Decisions already made:

- Learning is on demand. There is no spaced repetition, no schedule, no due queue and no streaks;
  study and practice happen whenever there is time, and nothing piles up in the meantime.
- Keep the practice features simple.
- Progress lives in the browser with JSON export and import.
- Answers are typed in a MathLive math field with an on-screen keyboard.
- The math track starts with pre-calculus, and the Functions unit is the pilot.
- Prerequisites are suggestions; nothing is locked. A unit checkpoint passes at 80%.
- The project may become a product for other learners later; see [PRODUCT_VISION.md](PRODUCT_VISION.md)
  for what that means for the code today.

## Content model

```
Area            Mathematics, Machine Learning, Data Engineering, AI Engineering
  Course        Pre-calculus, Calculus 1, Linear Algebra, Data Modeling, ...
    Unit        Functions, Limits, Derivatives, Dimensional modeling, ...
      Item      one of: explore, lesson, practice, checkpoint
```

| Item kind    | What it is                                                                 | Done when                    |
| ------------ | -------------------------------------------------------------------------- | ---------------------------- |
| `explore`    | Today's visualizations: steps, controls, explanation                       | Opened and all steps visited |
| `lesson`     | Guided sequence through a concept, with checkpoint questions between steps | All checkpoints answered     |
| `practice`   | Generated problems for one or two skills, with hints and worked solutions  | Skill reaches "proficient"   |
| `checkpoint` | End-of-unit set mixing the unit's skills, including pen-and-paper problems | Score at or above 80%        |

Skills are the unit of mastery. Every problem tags the skills it exercises; items and units report
progress as an aggregate of their skills.

### Files

```
src/content/
  areas.ts                                   area list and order
  <area>/<course>/course.ts                  title, description, order, prerequisites
  <area>/<course>/<unit>/unit.ts             title, description, order, skills, prerequisites
  <area>/<course>/<unit>/<item>/meta.ts      kind, title, summary, order, skills, steps
  <area>/<course>/<unit>/<item>/index.tsx    the component (explore, lesson, interactive problems)
  <area>/<course>/<unit>/<item>/explanation.mdx
  <area>/<course>/<unit>/<item>/problems.ts  problem generators (practice and checkpoint)
```

The registry keeps discovering everything through `import.meta.glob`, now four levels deep, and
builds a tree. Current visualizations move into the tree; their old URLs redirect to the new ones
because the site is public.

| Today                                  | Moves to                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------ |
| calculus/derivative-as-limit           | mathematics/calculus-1/derivatives/derivative-as-limit                   |
| calculus/riemann-sums                  | mathematics/calculus-1/integrals/riemann-sums                            |
| linear-algebra/matrix-transformations  | mathematics/linear-algebra/linear-transformations/matrix-transformations |
| complex-numbers/complex-multiplication | mathematics/complex-numbers/arithmetic/complex-multiplication            |
| neural-networks/forward-pass           | machine-learning/neural-networks/foundations/forward-pass                |
| neural-networks/backpropagation        | machine-learning/neural-networks/training/backpropagation                |
| ai-engineering/rag-pipeline            | ai-engineering/retrieval/fundamentals/rag-pipeline                       |

## Practice engine

### Problems

A problem generator is a pure function from a seeded random source to a problem. Generated problems
give unlimited practice and stay reproducible, because a seed identifies each instance.

```ts
export const problems = defineProblems([
  {
    id: 'limit-direct-substitution',
    skills: ['limits.direct-substitution'],
    difficulty: 1,
    generate: (rng) => {
      const a = rng.int(-4, 4)
      const b = rng.nonZeroInt(-5, 5)
      return {
        prompt: tex`\lim_{x \to ${a}} (x^2 + ${b}x)`,
        answer: number(a * a + b * a),
        hints: ['The function is a polynomial, so it is continuous everywhere.', ...],
        solution: [tex`\lim_{x \to ${a}} (x^2 + ${b}x) = (${a})^2 + ${b}(${a})`, ...],
      }
    },
  },
])
```

Answer kinds: `number` (with tolerance or exact rational), `expression` (equivalent expressions are
accepted), `choice` (one or several), `interval`, `point`, `list` (unordered or ordered), `interactive`
(the learner manipulates a Stage, for example drags a graph until it matches a target), and
`self-graded` (proofs and long work: the solution is shown and the learner marks the attempt).

### Checking answers

- Input: a `MathInput` molecule wrapping MathLive's `<math-field>`, styled with the design tokens, with
  its virtual keyboard on demand. Lazy loaded so explore pages do not pay for it.
- Equivalence: a small TeX evaluator in `src/lib/practice/texEval.ts` reads what MathLive produces.
  Two expressions match when they agree at random sample points inside the domain. Numbers compare
  within a tight tolerance. (Compute Engine was tried first and dropped: about 1.1 MB gzipped for
  features the checker did not need.)
- Feedback distinguishes "not equivalent" from "could not read this" and from answers that use the
  wrong variables. Requiring a simplified form is not supported yet.
- Every generator has Vitest property tests over many seeds: the stored answer is checked against an
  independent computation (for example a numeric limit or derivative from `src/lib/math`), and the
  checker must accept the canonical answer and reject common wrong ones.

### Practice flow

Problem card in the stage area (prompt, answer field, Check), progress dots for the set, hints revealed
one at a time, the worked solution after a correct answer or after giving up, and a link back to the
explore item for the concept. Wrong answers produce a fresh problem of the same kind instead of
repeating the same one.

Checkpoints also offer a worksheet view: all problems on one page, solved on paper, then answered in
any order, with a printable layout.

## Progress

Progress describes where things stand. It never creates obligations: no reminders, no due dates.

- Progress (how much content is done) and skill status (how well you know something) are separate.
  Progress rings show only content done; skill statuses never move them.
- Status per skill: `new`, `practiced`, `proficient`, `mastered`.
  - Practice suggests a status from recent results (for example, "proficient" after several correct
    answers in a row, including a harder one).
  - The learner can set any status at any time, in either direction: mark a topic mastered upfront,
    or move a skill back to practiced when it feels shaky. A manual choice wins over the suggestion and
    shows as such ("set by you").
  - "I already know this unit" marks its content done and its skills mastered, and can be undone.
- Practice is always available on demand. Problems get harder as the status of the skill rises, and a
  "mixed practice" button draws problems from any skills chosen on the spot (a unit, a course, or
  everything not yet mastered).
- Store: IndexedDB through a small versioned schema (attempt log, skill statuses, item completion, last
  position), behind a `ProgressStore` interface so a server can replace it later. JSON export and
  import in a settings panel, with the date of the last export shown there.
- Order is suggested, never enforced: prerequisites show as hints ("Functions is recommended first").

## Interface changes

- Sidebar: area switcher at the top, then a collapsible tree of courses, units and items, with a small
  progress indicator per unit and an icon per item kind.
- Home becomes a dashboard: continue where you left off, progress per course, quick access to mixed
  practice. The hero stays, smaller.
- Course page: units in order with progress, plus a prerequisite map (drawn with the diagram kit).
- Unit page: its items in order, the skills it covers with their statuses (editable), and the
  checkpoint.
- Lesson and practice reuse the same shell: stage in the middle, explanation pane on the right, dock at
  the bottom.

## Curriculum

Daniel's focus is intermediate and advanced material: Calculus, Linear Algebra, Probability, Data
Engineering and Architecture, Machine Learning and AI Engineering. Fundamentals stay in the plan
so the difficulty curve is smooth, but they are refreshers and get less depth. Syllabi (OpenStax
Precalculus and Calculus, MIT 18.01, 18.06, 18.05) are the reference for what each unit covers.

### Unit depths

| Depth     | Items                                                        | Batches   | Used for                                   |
| --------- | ------------------------------------------------------------ | --------- | ------------------------------------------ |
| Refresher | About 5: two or three explorations, one practice, checkpoint | 1         | Pre-calculus and other prerequisites       |
| Core      | About 10, more when the topic needs it (no upper limit)      | 3 or more | Everything from Calculus 1 and DE units on |

A refresher explores the ideas that later units lean on (and the ones easy to get wrong), and skips
drill that "I already know this unit" would mark done anyway. Functions and Algebra essentials were
built before this rule and stay as they are.

### Tracks

Areas run as parallel tracks. Each track has its own order; links between tracks are suggested
prerequisites shown on unit pages, never gates.

**Mathematics**

1. Pre-calculus (refresher): Functions (done), Algebra essentials, Polynomial and rational functions
   (lines and parabolas included), Exponential and logarithmic functions, Trigonometry.
2. Calculus 1 (core): limits, derivatives, applications, integrals.
3. Linear Algebra (core): vectors and span, linear maps and matrices, determinants, systems,
   eigenvectors, orthogonality and projections, SVD. It does not depend on calculus, so it can run
   alongside Calculus 1.
4. Probability and Statistics (core): distributions, expectation, the central limit theorem,
   Bayes, estimation.
5. Calculus 2 (core): integration techniques, sequences and series (sigma notation, geometric sums,
   Taylor series), parametric and polar.
6. Multivariable Calculus and Optimization (core): gradients, the chain rule in many variables,
   gradient descent, convexity, constrained optimization. These feed Machine Learning directly.
7. Discrete Math (core, decided 2026-10-17): sets, logic, relations, and graph theory in depth
   (DAGs, lineage, graph neural networks later).
8. Differential Equations (core, after Linear Algebra and Multivariable): second-order equations,
   systems through eigenvalues, phase portraits, Fourier and Laplace. First-order equations are in
   Calculus 2.
9. Topology (later, after Multivariable): $\varepsilon$-$\delta$ generalized to open sets.

The Calculus courses are outlined below (Calculus outline, approved on 2026-10-17). Each unit
gets a full unit plan, like the pre-calculus ones, when its first batch is built.

**Outline a course before its first unit.** Every course gets an outline like the Calculus one
(units with items at headline level, threads, legacy items, wish list topics) before its first
new unit is built, and Daniel reviews it. The suggested order of units lists these outline steps
explicitly, so the next session picks them up without being asked. When that list gets within
three steps of its end, the session that finishes a step extends it.

### Depth from Calculus on

Pre-calculus was a refresher. From Calculus 1 on, units are comprehensive: the fundamentals are
mastered first and then carried to intermediate and advanced levels, so each unit builds on the
last without jumps. Ideas that span several units are planned as threads, each unit taking them
one level further. Threads so far:

- **Leibniz notation.** $dx$ and $\frac{dy}{dx}$ first as a limit of $\frac{\Delta y}{\Delta x}$
  and as the slope of the tangent; then differentials $dy = f'(x)\,dx$ as linear approximation; the
  chain rule $\frac{dy}{dx} = \frac{dy}{du}\frac{du}{dx}$ and why it looks like cancelling;
  $\int f(x)\,dx$ as a limit of sums $\sum f(x_i)\,\Delta x$; substitution as a change of
  variable; separable differential equations; partial derivatives, total differentials and the
  Jacobian in many variables; line and surface integrals; differential forms as the rigorous
  version. Each item that uses the notation says what it means at that level.
- **Limits.** From intuition to the techniques for evaluating them (algebra, squeeze, standard
  limits, L'Hôpital, series) and to the epsilon-delta definition, so limit problems become routine.
- **Linear approximation** (approved 2026-10-17). The tangent line as the best linear fit; differentials;
  L'Hôpital and Newton's method as uses of it; Taylor polynomials as better fits; the tangent plane,
  the gradient and the Jacobian as the best linear map; Newton's method and gradient descent in
  many variables. This is the thread that leads into Machine Learning.

**Legacy items.** The first seven visualizations (`derivative-as-limit`, `riemann-sums`,
`matrix-transformations`, `complex-multiplication`, `forward-pass`, `backpropagation`,
`rag-pipeline`) and the items added around them (`difference-quotients`, the derivatives
checkpoint) were built before any course plan. When
their unit is built, fit them into it: keep the visuals mostly as they are, and revise the
explanation, labels, titles, steps, order and placement where the plan needs it.

### Calculus outline

Approved by Daniel on 2026-10-17, depth included. Units with items at headline level; slugs, skills and
exact content are settled in each unit plan. Kinds: E explore, L lesson, P practice, C checkpoint.
Thread marks: **Lz** Leibniz notation, **Lim** limits, **Lin** linear approximation.

#### Calculus 1

Units stay as the existing folders: Limits, Derivatives, Applications of derivatives, Integrals.
Trigonometry (refresher) comes before Derivatives, as in the suggested order.

**1. Limits** (12 items)

| #   | Item                            | Kind | Content                                                                                                     | Threads |
| --- | ------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------- | ------- |
| 1   | approaching-a-value             | E    | Zoom in on $x \to a$ from both sides; a hole where $f(a)$ differs; $\Delta x$ and $\Delta y$ shrink         | Lim, Lz |
| 2   | one-sided-and-infinite          | E    | Left and right limits, jumps, vertical asymptotes, limits at infinity (rational functions revisited)        | Lim     |
| 3   | limit-laws                      | L    | Laws, direct substitution, factor and cancel, rationalize, common denominators                              | Lim     |
| 4   | practice-evaluating-limits      | P    | Algebraic limits, one-sided limits, limits at infinity                                                      |         |
| 5   | squeeze-and-standard-limits     | E    | Squeeze theorem; $\frac{\sin x}{x}$ by areas on the unit circle; $\frac{e^h - 1}{h}$; $(1 + \frac{1}{n})^n$ | Lim     |
| 6   | continuity                      | E    | Three conditions, kinds of discontinuity, the intermediate value theorem by bisection                       |         |
| 7   | practice-continuity-and-squeeze | P    | Continuity conditions, piecewise parameters, standard limits, IVT root intervals                            |         |
| 8   | growth-rates                    | L    | $\ln x \ll x^p \ll b^x \ll x!$ at infinity, dominant terms, a first look at big-O                           | Lim     |
| 9   | epsilon-delta                   | E    | The game: choose $\varepsilon$, find $\delta$ (backlog item); $\varepsilon$-$N$ at infinity                 | Lim     |
| 10  | epsilon-delta-proofs            | L    | Writing proofs for linear and quadratic functions and for a limit law                                       | Lim     |
| 11  | practice-limit-definition       | P    | $\delta$ for a given $\varepsilon$, growth comparisons, self-graded proofs                                  |         |
| 12  | checkpoint                      | C    | All of the above plus a proof                                                                               |         |

**2. Derivatives** (13 items; legacy items 1, 2 and 13)

| #   | Item                          | Kind | Content                                                                                                    | Threads |
| --- | ----------------------------- | ---- | ---------------------------------------------------------------------------------------------------------- | ------- |
| 1   | derivative-as-limit (legacy)  | L    | Revised: $\frac{dy}{dx}$ as the limit of $\frac{\Delta y}{\Delta x}$, tangent as the limit of secants      | Lz, Lim |
| 2   | difference-quotients (legacy) | P    | Kept; revised to match item 1                                                                              |         |
| 3   | derivative-function           | E    | $f'$ drawn point by point; where it fails (corner, cusp, vertical tangent); $\frac{d}{dx}$ as an operator  | Lz      |
| 4   | power-and-sum-rules           | E    | $(x + h)^n$ expanded; $x^2$ as a growing square, $x^3$ as a growing cube; linearity                        |         |
| 5   | product-and-quotient-rules    | E    | Product rule as a growing rectangle (backlog item); quotient rule from it                                  |         |
| 6   | practice-basic-rules          | P    | Power, sum, product, quotient                                                                              |         |
| 7   | exp-log-and-trig-derivatives  | E    | $e^x$ is its own slope; $\sin' = \cos$ on the unit circle; $\ln$ via the inverse                           |         |
| 8   | chain-rule                    | E    | Composed stretching of number lines (backlog item); why $\frac{dy}{du}\frac{du}{dx}$ looks like cancelling | Lz      |
| 9   | practice-chain-rule           | P    | Chains with every rule so far                                                                              |         |
| 10  | implicit-and-inverse          | L    | Implicit curves, slope of an inverse as the reciprocal, $\arcsin$, logarithmic differentiation             | Lz      |
| 11  | related-rates                 | L    | Linked quantities differentiated in $t$                                                                    | Lz      |
| 12  | practice-implicit-and-related | P    | Implicit slopes, inverse derivatives, related rates                                                        |         |
| 13  | checkpoint (legacy)           | C    | Rebuilt for the whole unit                                                                                 |         |

**3. Applications of derivatives** (11 items)

| #   | Item                         | Kind | Content                                                                                      | Threads  |
| --- | ---------------------------- | ---- | -------------------------------------------------------------------------------------------- | -------- |
| 1   | linear-approximation         | E    | Tangent as the best linear fit; $dy = f'(x)\,dx$ against $\Delta y$; error shrinks as $dx^2$ | Lz, Lin  |
| 2   | extrema                      | E    | Critical points, first derivative test, extreme value theorem on a closed interval           |          |
| 3   | mean-value-theorem           | E    | A secant slope matched by a tangent; Rolle; $f' = 0$ means constant                          |          |
| 4   | concavity-and-sketching      | E    | $f''$, inflection points, reading $f$, $f'$, $f''$ together                                  |          |
| 5   | practice-curve-analysis      | P    | Critical points, intervals, inflection, absolute extrema                                     |          |
| 6   | optimization                 | L    | Modeling, then optimizing on an interval                                                     |          |
| 7   | practice-optimization        | P    | Optimization problems with computed answers                                                  |          |
| 8   | lhopital                     | E    | Ratio of two linear approximations near $a$; $0 \cdot \infty$, $1^\infty$, back to $e$       | Lim, Lin |
| 9   | newtons-method               | E    | Iterating tangents to a root; fast convergence and failures                                  | Lin      |
| 10  | practice-lhopital-and-newton | P    | Indeterminate forms, Newton steps                                                            |          |
| 11  | checkpoint                   | C    | All of the above plus a proof (MVT consequence)                                              |          |

**4. Integrals** (11 items; legacy item 1)

| #   | Item                             | Kind | Content                                                                          | Threads |
| --- | -------------------------------- | ---- | -------------------------------------------------------------------------------- | ------- |
| 1   | riemann-sums (legacy)            | E    | Revised: sigma notation, $\sum f(x_i)\,\Delta x \to \int f(x)\,dx$               | Lz, Lim |
| 2   | definite-integral                | L    | Signed area, properties, exact values from sum formulas                          |         |
| 3   | accumulation-functions           | E    | $A(x) = \int_a^x f$ grows at rate $f(x)$: FTC part 1 (backlog item)              |         |
| 4   | fundamental-theorem              | L    | Antiderivatives, FTC part 2, evaluation                                          |         |
| 5   | practice-antiderivatives-and-ftc | P    | Basic antiderivatives, definite integrals, derivatives of accumulation functions |         |
| 6   | substitution                     | E    | Change of variable as stretching the axis; $du = g'(x)\,dx$                      | Lz      |
| 7   | practice-substitution            | P    | Indefinite and definite substitution                                             |         |
| 8   | net-change-and-average-value     | L    | Displacement against distance, average value, mean value theorem for integrals   |         |
| 9   | area-between-curves              | E    | Slices in $x$ or in $y$                                                          | Lz      |
| 10  | practice-applying-integrals      | P    | Net change, average value, areas                                                 |         |
| 11  | checkpoint                       | C    | All of the above plus a proof                                                    |         |

#### Calculus 2

Six units, about 60 items.

1. **Integration techniques** (11): integration by parts (the product rule rectangle in reverse),
   trigonometric integrals and substitutions, partial fractions (rational functions revisited),
   numerical integration (trapezoid, Simpson, error bounds), improper integrals (Gabriel's horn).
   Threads: Lz, Lim.
2. **Applications of integration** (10): volumes by disks, washers and shells; arc length; surface
   area; work; center of mass; probability densities (a bridge to Probability). Lz: every quantity
   built as $\int (\text{piece})$ from a slice.
3. **Differential equations** (10): slope fields, separable equations ($\frac{dy}{y} = k\,dx$ as a
   legitimate use of differentials), growth, decay and logistic models, Euler's method against the
   exact solution (backlog item), first-order linear equations with an integrating factor. Lz.
4. **Sequences and series** (12): sequences and $\varepsilon$-$N$ limits, partial sums, geometric
   series, convergence tests (integral, comparison, ratio, root, alternating), absolute and
   conditional convergence (rearrangement). Lim.
5. **Power and Taylor series** (11): Taylor polynomials converging to a function (backlog item), the
   remainder, radius of convergence, operating on series term by term, limits through series, and
   Euler's formula: $e^{ix}$ from the series and the spiral $\left(1 + \frac{i\pi}{n}\right)^n \to -1$.
   Lim, Lin.
6. **Parametric and polar** (8): parametric curves, $\frac{dy}{dx} = \frac{dy/dt}{dx/dt}$, arc length,
   polar curves and their areas. Lz.

#### Multivariable Calculus and Optimization

Five units, about 55 items. Needs 3D stages (phase 5) and leans on Linear Algebra (vectors,
matrices, eigenvalues) as a suggested prerequisite.

1. **Curves and surfaces in space** (8): 3D coordinates, dot and cross product as a recap from
   Linear Algebra, lines and planes, vector-valued functions (velocity, arc length, curvature).
2. **Partial derivatives** (12): surfaces and level curves, limits along paths, partial
   derivatives, tangent planes, the total differential $dz = f_x\,dx + f_y\,dy$, the chain rule
   in many variables (`backpropagation` linked as its application), gradient and directional
   derivatives, the Jacobian as the best linear map, implicit functions. Lz, Lin.
3. **Optimization** (11): critical points, the Hessian and the second derivative test through
   eigenvalues, convexity, gradient descent on a 2D loss surface with step size and momentum
   (backlog item, reused by Machine Learning), Newton's method in $n$ dimensions, Lagrange
   multipliers, least squares as an optimization. Lin.
4. **Multiple integrals** (11): double integrals as iterated sums, order of integration, polar,
   cylindrical and spherical coordinates, change of variables with $dA = |\det J|\,du\,dv$, the
   Gaussian integral, mass and probability. Lz.
5. **Vector calculus** (13): vector fields, line integrals (work and flux), conservative fields and
   potentials, Green's theorem, curl and divergence, surface integrals, the Stokes and divergence
   theorems, and differential forms with $\int_{\partial M} \omega = \int_M d\omega$ as the
   Leibniz thread's end point. Lz.

#### Legacy items and wish list placement

- `derivative-as-limit`, `difference-quotients`, the derivatives checkpoint: Derivatives 1, 2, 13.
  `riemann-sums`: Integrals 1. The others are outside Calculus: `matrix-transformations` (Linear
  Algebra), `complex-multiplication` (Complex Numbers), `forward-pass`, `backpropagation`
  (Machine Learning, with the multivariable chain rule linked), `rag-pipeline` (AI Engineering).
- Euler's formula and the $(1 + \frac{i\pi}{n})^n$ spiral: Calculus 2, Power and Taylor series,
  linked from Complex Numbers.
- Limit techniques: the Limits thread (Limits 3, 5, 8 to 10; L'Hôpital; series).
- Line and surface integrals, Multivariable Calculus: Multivariable, Vector calculus.
- Differential equations: first-order in Calculus 2. A later Differential Equations course
  (second-order, systems through eigenvalues, phase portraits, Fourier and Laplace) after Linear
  Algebra and Multivariable.
- Outside Calculus (approved; detail them when those courses are outlined): complex numbers as
  plane maps (Complex Numbers), graph theory (Discrete Math, now core: DAGs, lineage, GNNs),
  fractals (Complex Numbers iteration, with Koch-style lengths from geometric series), topology
  (a later course after Multivariable, generalizing $\varepsilon$-$\delta$ to open sets).

### Topics Daniel asked for

Not exhaustive, not in order, and not all in Calculus 1. Place each one in a unit when its course
is outlined:

- Euler's formula and $e^{i\pi} = -1$, with a triangle spiral built from
  $\left(1 + \frac{i\pi}{n}\right)^n$ (as in a Mathologer video), tied to the limit definition of $e$
- Mastering limit techniques (see the thread above)
- Line and surface integrals
- Multivariable Calculus
- Differential equations
- Linear Algebra (core track, already planned)
- Complex numbers as plane transformations, in the spirit of Welch Labs' "Complex Numbers are Real"
- Topology
- Graph theory
- Fractals

**Data Engineering and Architecture** (core)

| #   | Unit                                                                           | Suggested math              |
| --- | ------------------------------------------------------------------------------ | --------------------------- |
| 1   | Relational model and SQL joins (done)                                          | Functions                   |
| 2   | Storage and file formats (done)                                                | Exponentials and logs       |
| 3   | Partitioning, bucketing and hashing (consistent hashing included)              | Sums, distributions of keys |
| 4   | Distributed processing (shuffles, stages, skew, cost models)                   | Limits, asymptotic growth   |
| 5   | Data modeling (normalization, dimensional models, slowly changing dimensions)  | Relations and keys          |
| 6   | Streaming (event time, windows, watermarks, exactly-once)                      | Change over time            |
| 7   | Probabilistic data structures (Bloom filters, HyperLogLog, reservoir sampling) | Probability, expectation    |
| 8   | Architecture (lakehouse, medallion layers, lambda and kappa, data mesh, CAP)   | Trade-off reasoning         |

Topics that mix areas live in the area they lean on most (sampling theory in Probability,
consistent hashing in Data Engineering) and come after the fundamentals they need. They are not
openers and not side units added early; they arrive when the curriculum reaches them.

**Machine Learning and AI Engineering** (core) start once Linear Algebra and Probability have their
first units: linear regression as a projection, gradient descent, classification, neural networks,
deep learning (convolution, attention, transformers), generative models; then embeddings,
retrieval, evaluation and agents. The existing neural network and RAG visualizations seed these
courses.

### Suggested order of units

A rotation across tracks, so the interesting material arrives early. Any unit can be picked out of
order.

1. Algebra essentials, batch 3 (done)
2. DE: Storage and file formats (done)
3. Pre-calculus: Polynomial and rational functions (refresher, built, in review)
4. Pre-calculus: Exponential and logarithmic functions (refresher, built, in review)
5. Outline the Calculus courses (done, approved 2026-10-17)
6. Calculus 1: Limits (built: batches 1 to 3 on 2026-10-17 and 2026-10-18, in review)
7. Outline Linear Algebra (for review), then Linear Algebra: Vectors and linear combinations
8. DE: Partitioning, bucketing and hashing (check the DE unit table and outline the unit's items)
9. Pre-calculus: Trigonometry (refresher)
10. Calculus 1: Derivatives
11. Linear Algebra: Linear maps and matrices
12. DE: Distributed processing
13. Outline Probability and Statistics (for review), then its first unit

After that, keep rotating: Calculus 1, Linear Algebra, Probability, one DE unit every two or three
math units, and Machine Learning once its prerequisites exist (outline it first). Extend this
list with concrete steps, outline steps included, before it runs out.

## Phases and tracker

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

#### Functions unit plan

Folder `src/content/mathematics/pre-calculus/functions/`. Build one item per step, in this order, and
look at every step in both themes before moving on. Item status: `todo`, then the content values
from `ROADMAP.md` (`draft` while it has `status: 'draft'`, `review` once published, `done`).

Skills (local ids in `unit.ts`): `definition` (what makes a relation a function), `evaluate`
(evaluate from a formula, a table or a graph), `domain-range`, `compose`, `inverse`, `transform`.

| #   | Item                         | Kind       | Skills                 | Content                                                                                                 | Status |
| --- | ---------------------------- | ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| 1   | function-as-mapping          | explore    | definition, evaluate   | Arrows from inputs to outputs, one output per input, the mapping folds into a graph, vertical line test | done   |
| 2   | domain-and-range             | explore    | domain-range           | A graph casts shadows on the axes: domain on $x$, range on $y$; roots, fractions, restricted pieces     | done   |
| 3   | reading-graphs               | lesson     | evaluate, domain-range | Read $f(a)$, solve $f(x) = c$, increasing and decreasing intervals, with checks                         | done   |
| 4   | practice-evaluate-and-domain | practice   | evaluate, domain-range | Evaluate formulas and piecewise rules, domain of roots and fractions                                    | done   |
| 5   | composition                  | explore    | compose                | Three number lines: $x \to g(x) \to f(g(x))$; order matters                                             | done   |
| 6   | inverses                     | explore    | inverse                | Reflection across $y = x$, horizontal line test, restricting the domain                                 | done   |
| 7   | transformations              | explore    | transform              | $a\,f(b(x - h)) + k$ with sliders: shifts, stretches, reflections                                       | done   |
| 8   | practice-compose-and-invert  | practice   | compose, inverse       | Compose formulas, evaluate compositions, find inverse formulas                                          | done   |
| 9   | practice-transformations     | practice   | transform              | Formula from a described transformation and the reverse                                                 | done   |
| 10  | checkpoint                   | checkpoint | all                    | Mix of the practice generators plus a self-graded proof (a composition of injective functions)          | done   |

Answer kinds today have no `interval`; domain and range answers use `choice` (and `list` for
excluded values). The checkpoint uses `problemCount: 10`, one problem per generator. All ten items
are published and reviewed. Known minor issue: the transformations dock wraps to two rows at 1440 px.

After the pilot: continue unit by unit, updating this tracker and `docs/ROADMAP.md`.

#### Relational model and joins unit plan

Folder `src/content/data-engineering/relational-foundations/relational-model-and-joins/`. Same
process as the Functions unit. The math link: a table is a relation (a subset of a Cartesian
product), a key makes it a function, and every join is a filtered product. Join logic lives in
`src/lib/relational` (tested), and tables are drawn with `RelationTable` from the kit. Practice
prompts show tables as KaTeX arrays and SQL in `\texttt`.

Skills: `relations` (a table as a set of tuples, products, degree and cardinality), `keys` (primary
and candidate keys, foreign keys, referential integrity), `inner-join` (cross, inner and theta joins),
`outer-join` (left, right, full and anti joins, NULL padding), `row-counts` (predict how many rows a
join returns).

| #   | Item                        | Kind       | Skills                             | Content                                                                                                                    | Status |
| --- | --------------------------- | ---------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | tables-as-relations         | explore    | relations                          | Two domains, their product as a grid, a relation as lit cells that fly into a table; order; a key as a function            | done   |
| 2   | keys-and-references         | explore    | keys                               | Primary key, foreign key arrows from orders to customers (many to one), customers with no orders, an orphan                | done   |
| 3   | joins-as-products           | explore    | inner-join                         | Grid of row pairs: cross join, the ON condition lights matching cells, the result table, fan-out, NULL keys                | done   |
| 4   | outer-joins                 | explore    | outer-join                         | Same grid: unmatched rows padded with NULLs for left, right and full joins; anti join; why Venn diagrams mislead           | done   |
| 5   | join-row-counts             | lesson     | row-counts, inner-join, outer-join | Join size as a sum of rectangles $a_k \times b_k$ per key; one to many, many to many, left join, NULLs, ON vs WHERE        | done   |
| 6   | practice-relations-and-keys | practice   | relations, keys                    | Product sizes, number of relations, candidate keys, functional dependencies, orphan rows                                   | done   |
| 7   | practice-joins              | practice   | inner-join, outer-join, row-counts | Row counts of cross, inner, left and full joins on small tables, anti joins, fan-out, ON vs WHERE                          | done   |
| 8   | checkpoint                  | checkpoint | all                                | Mix of the practice generators plus a self-graded proof (an inner join on a key of $A$ has at most $\lvert B \rvert$ rows) | done   |

Built in three batches; all eight items are published and reviewed. The checkpoint uses
`problemCount: 10`: nine practice generators plus the proof. Practice prompts draw tables with
`tex.table` and `tex.tables` (side by side, padded to equal height) from `@/lib/practice`, and store
key columns in problem data with `encodeColumn` from `@/lib/relational`.

#### Algebra essentials unit plan

Folder `src/content/mathematics/pre-calculus/algebra-essentials/`. Same process as the Functions
unit. The thread through the unit: every rule is a picture first. Exponent laws are tiles that join
and cancel, radicals are sides of squares, factoring is arranging area tiles into a rectangle, and
solving an equation or inequality is reading where two graphs meet or which one is higher.

Skills: `exponents`, `radicals`, `factor`, `rational-expressions`, `equations`, `inequalities`,
`absolute-value` (titles in `unit.ts`).

The answer checker accepts any equivalent expression, so an answer that must be in a simplified
form (a factored polynomial, a simplest radical) is asked as a `choice` whose distractors include
equal but unsimplified forms, or as a `number` (an exponent, a coefficient).

| #   | Item                                | Kind       | Skills                                  | Content                                                                                                                                | Status |
| --- | ----------------------------------- | ---------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | exponent-laws                       | explore    | exponents                               | Factors as tiles: products join rows, quotients cancel pairs across a bar, zero and negative exponents, $(a^m)^n$ as a grid            | done   |
| 2   | radicals                            | explore    | radicals                                | $\sqrt{A}$ as the side of a square, $\sqrt{k^2 r} = k\sqrt{r}$ as a grid, $\sqrt{a + b} \neq \sqrt{a} + \sqrt{b}$, cube roots          | done   |
| 3   | practice-exponents-and-radicals     | practice   | exponents, radicals                     | Exponent laws, negative and rational exponents, simplest radical form, rationalizing, adding radicals                                  | done   |
| 4   | factoring-as-area                   | explore    | factor                                  | Algebra tiles: $x^2 + bx + c$ arranged into $(x + p)(x + q)$, common factors, difference of squares                                    | done   |
| 5   | rational-expressions                | lesson     | rational-expressions, factor            | Cancel common factors (and keep the excluded values: the graph has a hole), multiply, add over a common denominator                    | done   |
| 6   | practice-factoring-and-fractions    | practice   | factor, rational-expressions            | Common factors, trinomials, difference of squares, simplify, multiply and add rational expressions                                     | done   |
| 7   | equations-and-inequalities          | explore    | equations, inequalities, absolute-value | Solutions as intersections, inequalities as where one graph is above, sign charts, $\lvert x - a \rvert < r$ as an interval around $a$ | done   |
| 8   | practice-equations-and-inequalities | practice   | equations, inequalities, absolute-value | Linear, quadratic and rational equations (extraneous roots), linear and quadratic inequalities, absolute value                         | done   |
| 9   | checkpoint                          | checkpoint | all                                     | Mix of the practice generators plus a self-graded proof ($\sqrt{2}$ is irrational)                                                     | done   |

Built in three batches; all nine items are published and reviewed. Batch 3 was trimmed from
four items to three when fundamentals became refreshers: one exploration covers equations,
inequalities and absolute value. Solution sets are asked as choices in interval notation; the
practice test parses each option and compares it with the inequality at every endpoint and between
them. The checkpoint takes nine generators from the three practice sets plus the proof. Number answers that
are repeating decimals show as fractions (`answerTex`), so generators can return any rational.

#### Storage and file formats unit plan

Folder `src/content/data-engineering/storage-and-processing/storage-and-file-formats/`. Core depth,
three batches. The course `storage-and-processing` also lists the next two DE units (partitioning,
distributed processing) as planned. The thread through the unit: storage is a sequence of bytes
read in pages, so the cost of a query is the pages it touches. A layout decides which pages that
is, an encoding decides how many bytes a column needs, and file metadata decides which pages can be
skipped without reading them. The math link is logarithms: $\lceil \log_2 d \rceil$ bits for $d$
distinct values, information and entropy as the floor for compression, plus ceilings and offsets
(row-major and column-major order, as with arrays). Logic lives in `src/lib/storage` (tested).

Skills: `layouts` (row and column layouts, where a value lives, which layout fits a workload),
`scan-cost` (bytes and pages a query reads), `encoding` (dictionary, bit packing, run-length,
delta), `compression` (entropy, and why order and cardinality drive compression), `parquet` (row
groups, column chunks, pages, footer statistics, predicate pushdown, choosing a file format).

| #   | Item                              | Kind       | Skills                | Content                                                                                                                               | Status |
| --- | --------------------------------- | ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | row-vs-columnar                   | explore    | layouts               | One table written to pages row by row and column by column; a column sum, a point lookup and an insert touch different pages          | done   |
| 2   | scan-cost                         | lesson     | layouts, scan-cost    | The table as an area $N \times W$; a layout cuts it into pages, a query is a region, its cost the pages it touches; wide tables       | done   |
| 3   | practice-layouts                  | practice   | layouts, scan-cost    | Table sizes, bytes and pages scanned in both layouts, value offsets, choosing a layout for a workload                                 | done   |
| 4   | encodings                         | explore    | encoding              | Dictionary codes, bit packing with $\lceil \log_2 d \rceil$ bits, run-length on a sorted column, delta for timestamps                 | done   |
| 5   | entropy-and-compression           | lesson     | compression, encoding | Information $\log_2 (1/p)$, entropy as the floor for symbol codes, sorting to lengthen runs, codecs layered on encodings              | done   |
| 6   | practice-encoding-and-compression | practice   | encoding, compression | Bit widths, dictionary and run-length sizes, delta ranges, entropy of small distributions, compression ratios                         | done   |
| 7   | parquet-anatomy                   | explore    | parquet, scan-cost    | File, row groups, column chunks, pages, footer; min and max statistics skip row groups; sorting tightens the ranges                   | done   |
| 8   | practice-parquet                  | practice   | parquet, scan-cost    | Row groups skipped by a predicate, bytes read with projection and pushdown, choosing among CSV, JSON, Avro and Parquet                | done   |
| 9   | checkpoint                        | checkpoint | all                   | Mix of the practice generators plus a self-graded proof (a column with $d$ distinct values has at least $d$ runs, sorted exactly $d$) | done   |

Batches: 1 = items 1 to 3 (layouts and scan cost), 2 = items 4 to 6 (encoding and compression),
3 = items 7 to 9 (Parquet and the checkpoint). All nine items are published and reviewed. The cost model: a table of $N$ rows with column
widths $w_j$ (row width $W = \sum_j w_j$) and pages of $P$ bytes. A row layout stores rows back to
back, so any full scan reads $\lceil NW/P \rceil$ pages; a column layout gives each column its own
pages, so a scan of the columns $S$ reads $\sum_{j \in S} \lceil N w_j / P \rceil$. A point lookup
whose position is known reads one page in a row layout and one page per selected column in a column
layout. Encodings and entropy live in `src/lib/storage/encoding.ts` (`codeBits`,
`bitsFor`, `dictionaryEncode`, `runLengths`, `deltaEncode`, `entropy`); the city column of
`encodings` (counts $6, 4, 4, 2$, $86$ bytes as text, $25$ encoded) is reused by the lesson.
Row groups and footer statistics live in `src/lib/storage/parquet.ts` (`rowGroups`,
`groupRanges`, `mayMatch`, `groupsRead`, `groupsSpanned`). The exploration's file has $24$ rows in
$4$ row groups of $6$, pages of $3$ values; its days are chosen so every unsorted range contains
$12$ and the sorted file reads one row group for day $12$ and none for day $7$. The checkpoint takes
nine generators from the three practice sets plus the proof.

#### Polynomial and rational functions unit plan

Folder `src/content/mathematics/pre-calculus/polynomial-and-rational/`. The first refresher unit:
three explorations, one practice set and a checkpoint, built in one batch. The thread: a polynomial
is read from its factors (zeros and multiplicities) and its leading term (the ends); a rational
function is read from the factors of its denominator (holes and vertical asymptotes) and the degrees
(the line it approaches). Polynomial arithmetic lives in `src/lib/math/polynomial.ts` (`polyEval`,
`polyMul`, `polyFromRoots`, `polyDivide`, `polyDerivative`, `signChanges`, tested).
`FunctionPlot` takes `breaks` so a curve is never joined across a pole. `tex.num` and `tex.signed`
write rational numbers in readouts and prompts.

Skills: `lines`, `quadratics`, `end-behavior`, `zeros`, `asymptotes` (titles in `unit.ts`).

| #   | Item                             | Kind       | Skills              | Content                                                                                                          | Status |
| --- | -------------------------------- | ---------- | ------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | lines-and-parabolas              | explore    | lines, quadratics   | Slope as rise over run with draggable $P$ and $Q$; vertex form; completing the square; zeros $h \pm \sqrt{-k/a}$ | review |
| 2   | polynomial-graphs                | explore    | zeros, end-behavior | Draggable zeros, multiplicity sliders (cross or touch), leading term overlay, turning points at most $n - 1$     | review |
| 3   | rational-functions               | explore    | asymptotes          | $\frac{1}{(x - c)^m}$ near a pole; horizontal by degrees; slant by long division; a whole graph with a hole      | review |
| 4   | practice-polynomial-and-rational | practice   | all                 | Slope, line, vertex form, extreme value, end behavior, touching zero, least degree, asymptotes, hole             | review |
| 5   | checkpoint                       | checkpoint | all                 | Nine practice generators plus a self-graded proof (vertex at $-\frac{b}{2a}$ and the discriminant)               | review |

Practice answers are verified from the prompt's own TeX (`evaluateTex` on numerator and denominator),
so a prompt that disagrees with its answer fails the test.

#### Exponential and logarithmic functions unit plan

Folder `src/content/mathematics/pre-calculus/exponential-and-logarithmic/`. Refresher, one batch:
two explorations, a lesson, one practice set and a checkpoint. The thread: an exponential
multiplies by the same factor over equal steps, $e$ is the base whose slope equals its height, and
a logarithm finds the exponent, turning products into sums. Helpers live in
`src/lib/math/exponential.ts` (`logBase`, `compoundFactor`, `timeToMultiply`, tested). The TeX
evaluator reads `\log_b x` (as $\ln x / \ln b$), so learners can type exact answers such as
$\log_2 10$ or $\frac{\ln 5}{2}$.

Skills: `exponential-models`, `natural-exponential`, `logarithms`, `exp-log-equations` (titles in
`unit.ts`).

| #   | Item                                 | Kind       | Skills                                  | Content                                                                                                         | Status |
| --- | ------------------------------------ | ---------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | exponential-growth                   | explore    | exponential-models                      | $\times b$ per step, growth or decay with the mirror $b^{-x}$, $a$ as $f(0)$, doubling distance, $2^x$ vs $x^2$ | review |
| 2   | the-number-e                         | explore    | natural-exponential, exponential-models | Compounding staircase to $e$, slope $\ln b$ at $0$, tangent of $e^x$ with run $1$, $e^{rt}$ vs $(1 + r)^t$      | review |
| 3   | logarithms                           | lesson     | logarithms, exp-log-equations           | Reflection of $b^x$, what power, product rule as stacked heights, change of base, solving $b^x = c$             | review |
| 4   | practice-exponential-and-logarithmic | practice   | all                                     | Evaluate, expand, combine; model through two points; half-life; $Pe^{rt}$; doubling time; equations             | review |
| 5   | checkpoint                           | checkpoint | all                                     | Nine practice generators plus a self-graded proof (product rule and change of base)                             | review |

Equation answers are verified by substituting the answer into the prompt's own equation TeX; the
extraneous root of the logarithmic equation must make the left side undefined. Decimal answers
("two decimal places") use a tolerance of $0.006$.

### Ongoing units

Units built after 2D closed, in the suggested order. Each gets its plan here when its first batch
is built.

#### Limits unit plan

Folder `src/content/mathematics/calculus-1/limits/`. Core unit, 12 items in three batches, as in
the Calculus outline. The thread: a limit is about the neighbors of $a$, never $a$ itself; the
laws and three pieces of algebra evaluate it; continuity, growth rates and $\varepsilon$-$\delta$
make it precise. Item 1 starts the Leibniz thread with $\Delta x$, $\Delta y$ and a first
$\frac{\Delta y}{\Delta x} \to \frac{dy}{dx}$. Numerical limits live in `src/lib/math/limits.ts`
(`approachInputs`, `oneSidedLimit`, `limit`, tested): practice tests evaluate each prompt's own TeX
near the point (or far out) and compare with the stored answer.

Skills: `reading-limits`, `one-sided-limits`, `limits-at-infinity`, `evaluating-limits` (batch 1);
`standard-limits`, `continuity`, `growth-rates` (batch 2); `limit-definition` (batch 3).
Bisection, `lnGamma`, `largestDelta` (the best $\delta$ for an $\varepsilon$, by sampling and
bisection) and `thresholdN` (its $\varepsilon$-$N$ version) live in `src/lib/math/limits.ts`
(tested). The kit's `Band` draws the $\varepsilon$ band and the $\delta$ window across the view.

| #   | Item                            | Kind       | Skills                               | Content                                                                                                                                                                   | Status |
| --- | ------------------------------- | ---------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | approaching-a-value             | explore    | reading-limits                       | $\frac{x^3 - 1}{x - 1}$ near its hole from both sides, zoom, $f(1)$ undefined or different, $\frac{\Delta y}{\Delta x} = 3 + \Delta x$                                    | review |
| 2   | one-sided-and-infinite          | explore    | one-sided-limits, limits-at-infinity | A jump with slider $k$, $\frac{1}{(x - 2)^m}$, $\frac{2x^2 - 3x}{x^2 + 1}$ far out, dominant terms in three degree cases                                                  | review |
| 3   | limit-laws                      | lesson     | evaluating-limits                    | $f + g$, $fg$, $\frac{f}{g}$ near $1$; substitution; factor, rationalize ($\frac{x - 4}{\sqrt{x} - 2}$), combine fractions; $\frac{k}{0}$                                 | review |
| 4   | practice-evaluating-limits      | practice   | all four                             | Substitution, factor, rationalize, combine fractions, piecewise one-sided, does it exist, infinite limits, at infinity, roots at infinity                                 | review |
| 5   | squeeze-and-standard-limits     | explore    | standard-limits                      | $x \sin\frac{1}{x}$ squeezed by $\pm\lvert x \rvert$; three areas on the unit circle; $\cos x \le \frac{\sin x}{x} \le 1$; $\frac{b^h - 1}{h} \to \ln b$; $(1 + t)^{1/t}$ | review |
| 6   | continuity                      | explore    | continuity                           | Three conditions; removable, jump, infinite, oscillating; piecewise constant $c$; IVT on $x^3 - x - 1$; bisection with a zooming view                                     | review |
| 7   | practice-continuity-and-squeeze | practice   | continuity, standard-limits          | Piecewise constant, classify (piecewise, rational), squeeze bounds, sine, $e^u - 1$, $(1 + \frac{a}{x})^{bx}$, IVT root interval                                          | review |
| 8   | growth-rates                    | lesson     | growth-rates                         | Semi-log scale (`powerOfTen` axis labels); $x^p$ against $2^x$; $\ln x$; $x!$ via `lnGamma`; a dominant-term ratio; big-O with $C$                                        | review |
| 9   | epsilon-delta                   | explore    | limit-definition                     | $\frac{x^2}{4} + 1$ with $f(2) = 3$: band, window, the game, nearer side, a jump beats every $L$, $\varepsilon$-$N$ on $2 + \frac{6 \sin x}{x}$                           | review |
| 10  | epsilon-delta-proofs            | lesson     | limit-definition                     | Scratch work then proof; $2x + 1$; $x^2$ with $\min(1, \frac{\varepsilon}{3})$ and why; the sum law with $\frac{\varepsilon}{2}$; no limit at a jump                      | review |
| 11  | practice-limit-definition       | practice   | limit-definition, growth-rates       | Best $\delta$ (line, parabola), the min rule, $N$ at infinity, growth ratios, big-O constant, proofs (linear, quadratic)                                                  | review |
| 12  | checkpoint                      | checkpoint | all                                  | 11 generators across the unit plus a self-graded proof (constant multiple law)                                                                                            | review |

Notes for the next batches: stages keep a uniform scale, so a view that zooms far out (limits at
infinity) passes a coarser `step` to `Grid` and `Axes`. Lesson checks take decimals only (no
fractions), so their answers are chosen to be short decimals. Infinite limits in practice are
multiple choice ($\infty$, $-\infty$, $0$, does not exist).

## Risks

- **Correctness of content.** Mitigated by property tests for every generator and checker, syllabi as
  references, and worked solutions derived from the same code that computes answers.
- **Bundle size.** MathLive and Compute Engine are large; they load only on practice pages.
- **Content volume.** Each unit is several items. Templates and the generator API keep the cost per
  item low; the tracker keeps the order clear across sessions.
- **Progress loss.** Browser storage can be cleared; export and import is the backup.
- **Scope creep.** Practice features stay minimal until the pilot unit shows what is missing.
