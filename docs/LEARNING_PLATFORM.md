# Learning platform

Plan and tracker for turning Lumen from a showcase into a personal learning platform. The look and
the explore-and-manipulate core stay as they are; this phase adds structure (areas, courses, units),
practice with checked answers, and progress.

Read "Suggested order of units" first: it says what comes next. Course outlines and unit plans,
with their status tables, live in [plans/](plans/) (one file per course or track). Finished
phase trackers are in [HISTORY.md](HISTORY.md).

## Suggested order of units

The focus is Mathematics and Machine Learning (decided 2026-10-23). Data Engineering and
Architecture continue only when the owner asks; their next steps are listed separately below, and a
session offers one as an alternative prompt when it fits (see `DECISIONS.md`, Content plan). Any
unit can be picked out of order.

1. Algebra essentials, batch 3 (done)
2. DE: Storage and file formats (done)
3. Pre-calculus: Polynomial and rational functions (done)
4. Pre-calculus: Exponential and logarithmic functions (done)
5. Outline the Calculus courses (done, approved 2026-10-17)
6. Calculus 1: Limits (done)
7. Outline Linear Algebra (done, approved 2026-10-18), then Linear Algebra: Vectors and linear
   combinations (done, all batches approved 2026-10-19)
8. DE: Partitioning, bucketing and hashing, batches 1 and 2 (done, approved 2026-10-23; batch 3
   moved to the Data Engineering list below)
9. Pre-calculus: Trigonometry (refresher) (done, approved 2026-10-24)
10. Calculus 1: Derivatives
11. Linear Algebra: Linear maps and matrices
12. Outline Probability and Statistics (for review), then its first unit
13. Calculus 1 and Linear Algebra, next units

After that, keep alternating Calculus, Linear Algebra and Probability, and outline Machine Learning
as soon as Linear Algebra and Probability have their first units, then build it. Extend this
list with concrete steps, outline steps included, before it runs out.

**Data Engineering and Architecture (on request).** Not part of the default order. When the owner asks
for it, or when a session offers it as the alternative prompt, take the first open step:

1. DE: Partitioning, bucketing and hashing, batch 3 (done, approved 2026-10-24)
2. DE: Distributed processing (outline its unit plan first)
3. The rest of the DE track in its order (Curriculum, Tracks)

## Goals

- Learn Mathematics, Machine Learning, Data Engineering and Architecture, and AI Engineering, with a
  smooth difficulty curve that ends in mastery, not familiarity.
- Every concept is seen (visualization), explained (text and formulas), and practiced (problems with
  feedback). Practice includes pen-and-paper work whose results are typed in and checked.
- The focus is intermediate and advanced material. Fundamentals are refreshers: enough for a smooth
  curve, not full courses (see Curriculum, Unit depths).
- Math starts from pre-calculus. Mathematics and Machine Learning are the focus (2026-10-23); Data
  Engineering and Architecture are their own track, continued when the owner asks.

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

The owner's focus is intermediate and advanced material: Calculus, Linear Algebra, Probability, Data
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
new unit is built, and the owner reviews it. The suggested order of units lists these outline steps
explicitly, so the next session picks them up without being asked. When that list gets within
three steps of its end, the session that finishes a step extends it.

### Topics the owner asked for

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

Machine Learning and Deep Learning (added 2026-10-23), with all the math they involve:

- Neural networks, comprehensively: neurons, layers, activations, losses, backpropagation as the
  chain rule, initialization, optimizers, regularization
- Neural network architectures and how to choose between them
- Deep learning: depth, normalization, residual connections, training at scale
- Convolutional neural networks (convolution, pooling, receptive fields)
- Recurrent neural networks (unrolling, backpropagation through time, vanishing gradients, LSTM
  and GRU)
- Transformers and all their math: embeddings, attention as weighted averages, scaled dot-product
  and softmax, multi-head attention, positional encodings, layer norm, residual streams
- Federated learning (training across devices without pooling the data, federated averaging)

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

### Plans

Every course is outlined in its plan file before its first unit is built, and each unit gets a
plan there (items, skills, status) when its first batch is built. Status values: `todo`,
`review` (built, awaiting the owner's feedback), `done`.

- [plans/pre-calculus.md](plans/pre-calculus.md): Functions, Algebra essentials, Polynomial and
  rational functions, Exponential and logarithmic functions.
- [plans/calculus.md](plans/calculus.md): depth and threads, the Calculus outline (Calculus 1, 2,
  Multivariable), and unit plans from Limits on.
- [plans/linear-algebra.md](plans/linear-algebra.md): threads and the Linear Algebra outline
  (awaiting review).
- [plans/data-engineering.md](plans/data-engineering.md): Relational model and joins, Storage and
  file formats, Partitioning, bucketing and hashing.

## Risks

- **Correctness of content.** Mitigated by property tests for every generator and checker, syllabi as
  references, and worked solutions derived from the same code that computes answers.
- **Bundle size.** MathLive and Compute Engine are large; they load only on practice pages.
- **Content volume.** Each unit is several items. Templates and the generator API keep the cost per
  item low; the tracker keeps the order clear across sessions.
- **Progress loss.** Browser storage can be cleared; export and import is the backup.
- **Scope creep.** Practice features stay minimal until the pilot unit shows what is missing.
