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

| Depth     | Items                                                        | Batches | Used for                                   |
| --------- | ------------------------------------------------------------ | ------- | ------------------------------------------ |
| Refresher | About 5: two or three explorations, one practice, checkpoint | 1       | Pre-calculus and other prerequisites       |
| Core      | 8 to 10: explorations, lessons, practice sets, checkpoint    | 2 or 3  | Everything from Calculus 1 and DE units on |

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
7. Discrete Math (refresher, on demand): sets, logic, relations, graphs, as other units need them.

**Data Engineering and Architecture** (core)

| #   | Unit                                                                          | Suggested math              |
| --- | ----------------------------------------------------------------------------- | --------------------------- |
| 1   | Relational model and SQL joins (done)                                         | Functions                   |
| 2   | Storage and file formats (row vs columnar, Parquet, encoding, compression)    | Exponentials and logs       |
| 3   | Partitioning, bucketing and hashing                                           | Sums, distributions of keys |
| 4   | Distributed processing (shuffles, stages, skew, cost models)                  | Limits, asymptotic growth   |
| 5   | Data modeling (normalization, dimensional models, slowly changing dimensions) | Relations and keys          |
| 6   | Streaming (event time, windows, watermarks, exactly-once)                     | Change over time            |
| 7   | Probabilistic data structures (Bloom filters, HyperLogLog, sampling)          | Probability, expectation    |
| 8   | Architecture (lakehouse, medallion layers, lambda and kappa, data mesh, CAP)  | Trade-off reasoning         |

**Machine Learning and AI Engineering** (core) start once Linear Algebra and Probability have their
first units: linear regression as a projection, gradient descent, classification, neural networks,
deep learning (convolution, attention, transformers), generative models; then embeddings,
retrieval, evaluation and agents. The existing neural network and RAG visualizations seed these
courses.

### Suggested order of units

A rotation across tracks, so the interesting material arrives early. Any unit can be picked out of
order.

1. Algebra essentials, batch 3 (done)
2. DE: Storage and file formats
3. Pre-calculus: Polynomial and rational functions (refresher)
4. Pre-calculus: Exponential and logarithmic functions (refresher)
5. Calculus 1: Limits
6. Linear Algebra: Vectors and linear combinations
7. DE: Partitioning, bucketing and hashing
8. Pre-calculus: Trigonometry (refresher)
9. Calculus 1: Derivatives
10. Linear Algebra: Linear maps and matrices
11. DE: Distributed processing

After that, keep rotating: Calculus 1, Linear Algebra, Probability, one DE unit every two or three
math units, and Machine Learning once its prerequisites exist.

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

| Task                                                       | Status |
| ---------------------------------------------------------- | ------ |
| Home dashboard (continue, course progress, mixed practice) | todo   |
| Mixed practice across chosen skills                        | todo   |
| Course prerequisite map                                    | todo   |

### 2D. Pilot content

The first unit is built end to end to validate the whole loop before scaling content.

| Task                                                                       | Status |
| -------------------------------------------------------------------------- | ------ |
| Pre-calculus / Functions (items below)                                     | review |
| Data Engineering / Relational model and SQL joins (first interleaved unit) | review |
| Pre-calculus / Algebra essentials                                          | review |
| Data Engineering / Storage and file formats (core depth)                   | doing  |

#### Functions unit plan

Folder `src/content/mathematics/pre-calculus/functions/`. Build one item per step, in this order, and
look at every step in both themes before moving on. Item status: `todo`, then the content values
from `ROADMAP.md` (`draft` while it has `status: 'draft'`, `review` once published, `done`).

Skills (local ids in `unit.ts`): `definition` (what makes a relation a function), `evaluate`
(evaluate from a formula, a table or a graph), `domain-range`, `compose`, `inverse`, `transform`.

| #   | Item                         | Kind       | Skills                 | Content                                                                                                 | Status |
| --- | ---------------------------- | ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| 1   | function-as-mapping          | explore    | definition, evaluate   | Arrows from inputs to outputs, one output per input, the mapping folds into a graph, vertical line test | done   |
| 2   | domain-and-range             | explore    | domain-range           | A graph casts shadows on the axes: domain on $x$, range on $y$; roots, fractions, restricted pieces     | review |
| 3   | reading-graphs               | lesson     | evaluate, domain-range | Read $f(a)$, solve $f(x) = c$, increasing and decreasing intervals, with checks                         | review |
| 4   | practice-evaluate-and-domain | practice   | evaluate, domain-range | Evaluate formulas and piecewise rules, domain of roots and fractions                                    | review |
| 5   | composition                  | explore    | compose                | Three number lines: $x \to g(x) \to f(g(x))$; order matters                                             | review |
| 6   | inverses                     | explore    | inverse                | Reflection across $y = x$, horizontal line test, restricting the domain                                 | review |
| 7   | transformations              | explore    | transform              | $a\,f(b(x - h)) + k$ with sliders: shifts, stretches, reflections                                       | review |
| 8   | practice-compose-and-invert  | practice   | compose, inverse       | Compose formulas, evaluate compositions, find inverse formulas                                          | review |
| 9   | practice-transformations     | practice   | transform              | Formula from a described transformation and the reverse                                                 | review |
| 10  | checkpoint                   | checkpoint | all                    | Mix of the practice generators plus a self-graded proof (a composition of injective functions)          | review |

Answer kinds today have no `interval`; domain and range answers use `choice` (and `list` for
excluded values). The checkpoint uses `problemCount: 10`, one problem per generator. All ten items
are published; open questions for review: the transformations dock wraps to two rows at 1440 px.

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
| 1   | tables-as-relations         | explore    | relations                          | Two domains, their product as a grid, a relation as lit cells that fly into a table; order; a key as a function            | review |
| 2   | keys-and-references         | explore    | keys                               | Primary key, foreign key arrows from orders to customers (many to one), customers with no orders, an orphan                | review |
| 3   | joins-as-products           | explore    | inner-join                         | Grid of row pairs: cross join, the ON condition lights matching cells, the result table, fan-out, NULL keys                | review |
| 4   | outer-joins                 | explore    | outer-join                         | Same grid: unmatched rows padded with NULLs for left, right and full joins; anti join; why Venn diagrams mislead           | review |
| 5   | join-row-counts             | lesson     | row-counts, inner-join, outer-join | Join size as a sum of rectangles $a_k \times b_k$ per key; one to many, many to many, left join, NULLs, ON vs WHERE        | review |
| 6   | practice-relations-and-keys | practice   | relations, keys                    | Product sizes, number of relations, candidate keys, functional dependencies, orphan rows                                   | review |
| 7   | practice-joins              | practice   | inner-join, outer-join, row-counts | Row counts of cross, inner, left and full joins on small tables, anti joins, fan-out, ON vs WHERE                          | review |
| 8   | checkpoint                  | checkpoint | all                                | Mix of the practice generators plus a self-graded proof (an inner join on a key of $A$ has at most $\lvert B \rvert$ rows) | review |

Built in three batches; all eight items are published and await review. The checkpoint uses
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
| 1   | exponent-laws                       | explore    | exponents                               | Factors as tiles: products join rows, quotients cancel pairs across a bar, zero and negative exponents, $(a^m)^n$ as a grid            | review |
| 2   | radicals                            | explore    | radicals                                | $\sqrt{A}$ as the side of a square, $\sqrt{k^2 r} = k\sqrt{r}$ as a grid, $\sqrt{a + b} \neq \sqrt{a} + \sqrt{b}$, cube roots          | review |
| 3   | practice-exponents-and-radicals     | practice   | exponents, radicals                     | Exponent laws, negative and rational exponents, simplest radical form, rationalizing, adding radicals                                  | review |
| 4   | factoring-as-area                   | explore    | factor                                  | Algebra tiles: $x^2 + bx + c$ arranged into $(x + p)(x + q)$, common factors, difference of squares                                    | review |
| 5   | rational-expressions                | lesson     | rational-expressions, factor            | Cancel common factors (and keep the excluded values: the graph has a hole), multiply, add over a common denominator                    | review |
| 6   | practice-factoring-and-fractions    | practice   | factor, rational-expressions            | Common factors, trinomials, difference of squares, simplify, multiply and add rational expressions                                     | review |
| 7   | equations-and-inequalities          | explore    | equations, inequalities, absolute-value | Solutions as intersections, inequalities as where one graph is above, sign charts, $\lvert x - a \rvert < r$ as an interval around $a$ | review |
| 8   | practice-equations-and-inequalities | practice   | equations, inequalities, absolute-value | Linear, quadratic and rational equations (extraneous roots), linear and quadratic inequalities, absolute value                         | review |
| 9   | checkpoint                          | checkpoint | all                                     | Mix of the practice generators plus a self-graded proof ($\sqrt{2}$ is irrational)                                                     | review |

Built in three batches; all nine items are published and await review. Batch 3 was trimmed from
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
| 1   | row-vs-columnar                   | explore    | layouts               | One table written to pages row by row and column by column; a column sum, a point lookup and an insert touch different pages          | review |
| 2   | scan-cost                         | lesson     | layouts, scan-cost    | The table as an area $N \times W$; a layout cuts it into pages, a query is a region, its cost the pages it touches; wide tables       | review |
| 3   | practice-layouts                  | practice   | layouts, scan-cost    | Table sizes, bytes and pages scanned in both layouts, value offsets, choosing a layout for a workload                                 | review |
| 4   | encodings                         | explore    | encoding              | Dictionary codes, bit packing with $\lceil \log_2 d \rceil$ bits, run-length on a sorted column, delta for timestamps                 | todo   |
| 5   | entropy-and-compression           | lesson     | compression, encoding | Information $\log_2 (1/p)$, entropy as the floor for symbol codes, sorting to lengthen runs, codecs layered on encodings              | todo   |
| 6   | practice-encoding-and-compression | practice   | encoding, compression | Bit widths, dictionary and run-length sizes, delta ranges, entropy of small distributions, compression ratios                         | todo   |
| 7   | parquet-anatomy                   | explore    | parquet, scan-cost    | File, row groups, column chunks, pages, footer; min and max statistics skip row groups; sorting tightens the ranges                   | todo   |
| 8   | practice-parquet                  | practice   | parquet, scan-cost    | Row groups skipped by a predicate, bytes read with projection and pushdown, choosing among CSV, JSON, Avro and Parquet                | todo   |
| 9   | checkpoint                        | checkpoint | all                   | Mix of the practice generators plus a self-graded proof (a column with $d$ distinct values has at least $d$ runs, sorted exactly $d$) | todo   |

Batches: 1 = items 1 to 3 (layouts and scan cost), 2 = items 4 to 6 (encoding and compression),
3 = items 7 to 9 (Parquet and the checkpoint). Batch 1 is published and awaits review. The cost model: a table of $N$ rows with column
widths $w_j$ (row width $W = \sum_j w_j$) and pages of $P$ bytes. A row layout stores rows back to
back, so any full scan reads $\lceil NW/P \rceil$ pages; a column layout gives each column its own
pages, so a scan of the columns $S$ reads $\sum_{j \in S} \lceil N w_j / P \rceil$. A point lookup
whose position is known reads one page in a row layout and one page per selected column in a column
layout.

## Risks

- **Correctness of content.** Mitigated by property tests for every generator and checker, syllabi as
  references, and worked solutions derived from the same code that computes answers.
- **Bundle size.** MathLive and Compute Engine are large; they load only on practice pages.
- **Content volume.** Each unit is several items. Templates and the generator API keep the cost per
  item low; the tracker keeps the order clear across sessions.
- **Progress loss.** Browser storage can be cleared; export and import is the backup.
- **Scope creep.** Practice features stay minimal until the pilot unit shows what is missing.
