# Learning platform

Plan and tracker for turning Lumen from a showcase into a personal learning platform. The look and
the explore-and-manipulate core stay as they are; this phase adds structure (areas, courses, units),
practice with checked answers, and progress.

## Goals

- Learn Mathematics, Machine Learning, Data Engineering and Architecture, and AI Engineering, with a
  smooth difficulty curve that ends in mastery, not familiarity.
- Every concept is seen (visualization), explained (text and formulas), and practiced (problems with
  feedback). Practice includes pen-and-paper work whose results are typed in and checked.
- Math comes first, starting from pre-calculus. Data Engineering and Architecture units are
  interleaved with the math instead of waiting until the end.

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

### Mathematics (first)

Based on standard syllabi (OpenStax Precalculus and Calculus, MIT 18.01, 18.06, 18.05) so nothing is
skipped.

1. **Pre-calculus**
   1. Algebra essentials: exponents and radicals, factoring, rational expressions, equations and
      inequalities, absolute value
   2. Functions: definition, domain and range, reading graphs, composition, inverses, transformations
   3. Linear and quadratic functions: slope, forms of a line, parabolas, completing the square
   4. Polynomial and rational functions: end behavior, zeros, asymptotes
   5. Exponential and logarithmic functions: growth and decay, e, log rules, equations
   6. Trigonometry: radians, the unit circle, graphs, identities, inverse functions
   7. Sequences and series: sigma notation, arithmetic and geometric, sums
2. **Calculus 1**: limits (intuition, laws, one-sided and infinite, squeeze, epsilon-delta,
   continuity), derivatives (definition, rules, chain rule, implicit, related rates), applications
   (extrema, mean value theorem, curve sketching, optimization, L'Hôpital, linear approximation),
   integrals (Riemann sums, fundamental theorem, substitution)
3. **Calculus 2**: integration techniques, applications, sequences and series, Taylor series,
   parametric and polar
4. **Linear Algebra**, **Discrete Math** (sets, logic, relations, graphs), **Probability and
   Statistics**, **Multivariable Calculus**, **Optimization**

### Data Engineering and Architecture (interleaved)

Cadence: roughly one Data Engineering unit after every two math units, placed where the math supports
it.

| After                               | Data Engineering unit                                                                       | Link to the math                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Pre-calculus: Functions             | Relational model and SQL joins                                                              | Sets, relations, functions as mappings |
| Pre-calculus: Exponentials and logs | Storage and file formats (row vs columnar, Parquet, compression)                            | Growth, log scales, cost models        |
| Pre-calculus: Sequences and series  | Partitioning, bucketing and hashing                                                         | Sums, distributions of keys            |
| Calculus 1: Limits                  | Distributed processing (shuffles, stages, skew)                                             | Rates and asymptotic behavior          |
| Calculus 1: Derivatives             | Streaming (event time, windows, watermarks)                                                 | Change over time                       |
| Discrete Math                       | Data modeling (normalization, dimensional models, slowly changing dimensions)               | Relations and keys                     |
| Probability                         | Probabilistic data structures (Bloom filters, HyperLogLog), sampling                        | Probability, expectation               |
| Later                               | Architecture: lakehouse, medallion layers, lambda and kappa, data mesh, CAP and consistency | Trade-off reasoning                    |

Machine Learning and AI Engineering follow once Linear Algebra and Probability are in place; the
existing neural network and RAG visualizations become the seeds of those courses.

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
| Data Engineering / Relational model and SQL joins (first interleaved unit) | doing  |
| Pre-calculus / Algebra essentials                                          | todo   |

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
| 3   | joins-as-products           | explore    | inner-join                         | Grid of row pairs: cross join, the ON condition lights matching cells, the result table, fan-out, NULL keys                | todo   |
| 4   | outer-joins                 | explore    | outer-join                         | Same grid: unmatched rows padded with NULLs for left, right and full joins; anti join; why Venn diagrams mislead           | todo   |
| 5   | join-row-counts             | lesson     | row-counts, inner-join, outer-join | Join size as a sum of rectangles $a_k \times b_k$ per key; one to many, many to many, left join, NULLs, ON vs WHERE        | todo   |
| 6   | practice-relations-and-keys | practice   | relations, keys                    | Product sizes, number of relations, candidate keys, functional dependencies, orphan rows                                   | todo   |
| 7   | practice-joins              | practice   | inner-join, outer-join, row-counts | Row counts of cross, inner, left and full joins on small tables, anti joins, fan-out, ON vs WHERE                          | todo   |
| 8   | checkpoint                  | checkpoint | all                                | Mix of the practice generators plus a self-graded proof (an inner join on a key of $A$ has at most $\lvert B \rvert$ rows) | todo   |

Batches: (1) the plan, `src/lib/relational`, `RelationTable`, items 1 and 2; (2) items 3 and 4;
(3) items 5 to 8.

## Risks

- **Correctness of content.** Mitigated by property tests for every generator and checker, syllabi as
  references, and worked solutions derived from the same code that computes answers.
- **Bundle size.** MathLive and Compute Engine are large; they load only on practice pages.
- **Content volume.** Each unit is several items. Templates and the generator API keep the cost per
  item low; the tracker keeps the order clear across sessions.
- **Progress loss.** Browser storage can be cleared; export and import is the backup.
- **Scope creep.** Practice features stay minimal until the pilot unit shows what is missing.
