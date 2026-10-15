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

Decisions already made: progress lives in the browser with JSON export and import; answers are typed
in a MathLive math field with an on-screen keyboard; the math track starts with pre-calculus.

## Content model

```
Area            Mathematics, Machine Learning, Data Engineering, AI Engineering
  Course        Pre-calculus, Calculus 1, Linear Algebra, Data Modeling, ...
    Unit        Functions, Limits, Derivatives, Dimensional modeling, ...
      Item      one of: explore, lesson, practice, review
```

| Item kind  | What it is                                                                 | Done when                    |
| ---------- | -------------------------------------------------------------------------- | ---------------------------- |
| `explore`  | Today's visualizations: steps, controls, explanation                       | Opened and all steps visited |
| `lesson`   | Guided sequence through a concept, with checkpoint questions between steps | All checkpoints answered     |
| `practice` | Generated problems for one or two skills, with hints and worked solutions  | Skill reaches "proficient"   |
| `review`   | End-of-unit set mixing the unit's skills, including pen-and-paper problems | Score at or above 80%        |

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
  <area>/<course>/<unit>/<item>/problems.ts  problem generators (practice and review)
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
- Equivalence: Cortex Compute Engine (same author as MathLive) parses the LaTeX. Two expressions match
  when they agree structurally after canonicalization, or numerically at a set of random sample points
  inside the domain. Numbers compare exactly when rational and within a tolerance otherwise.
- Feedback distinguishes "not equivalent" from "equivalent but not simplified" when a problem asks for
  a simplified form, and from "could not read this".
- Every generator has Vitest property tests over many seeds: the stored answer is checked against an
  independent computation (for example a numeric limit or derivative from `src/lib/math`), and the
  checker must accept the canonical answer and reject common wrong ones.

### Practice flow

Problem card in the stage area (prompt, answer field, Check), progress dots for the set, hints revealed
one at a time, the worked solution after a correct answer or after giving up, and a link back to the
explore item for the concept. Wrong answers produce a fresh problem of the same kind instead of
repeating the same one.

Review sets also offer a worksheet view: all problems on one page, solved on paper, then answered in
any order, with a printable layout.

## Progress and review

- Store: IndexedDB through a small versioned schema (attempts log, skill states, item completion,
  last position). JSON export and import in a settings panel. A schema version and migrations from the
  first release.
- Mastery per skill: new, practiced, proficient, mastered, from recent accuracy and streaks, with harder
  problems unlocked as mastery grows.
- Spaced review: FSRS (ts-fsrs) schedules each skill. Due skills appear in a review queue that draws
  fresh problems for them.
- Order is suggested, never enforced: prerequisites show as hints ("Functions is recommended first"),
  nothing is locked.

## Interface changes

- Sidebar: area switcher at the top, then a collapsible tree of courses, units and items, with a small
  progress indicator per unit and an icon per item kind.
- Home becomes a dashboard: continue where you left off, reviews due today, progress per course. The
  hero stays, smaller.
- Course page: units in order with progress, plus a prerequisite map (drawn with the diagram kit).
- Unit page: its items in order, the skills it covers, and the review set.
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
| Content tree (areas, courses, units, items), registry and types | todo   |
| Move the seven visualizations, redirects from old URLs          | todo   |
| Sidebar tree with area switcher; course and unit pages          | todo   |
| Progress store (IndexedDB, schema version, export and import)   | todo   |
| `lesson` item kind with checkpoint questions                    | todo   |

### 2B. Practice

| Task                                                                        | Status |
| --------------------------------------------------------------------------- | ------ |
| Spike: MathLive and Compute Engine bundle size, theming, equivalence checks | todo   |
| `MathInput` molecule and answer checker library with tests                  | todo   |
| Problem generator API, seeded random source, property tests                 | todo   |
| Practice runner: card, hints, solutions, progress, fresh problems on errors | todo   |
| Review sets with worksheet view and self-graded problems                    | todo   |
| Skill mastery model                                                         | todo   |

### 2C. Dashboard and review

| Task                                                    | Status |
| ------------------------------------------------------- | ------ |
| Home dashboard (continue, due reviews, course progress) | todo   |
| FSRS scheduling and review queue                        | todo   |
| Course prerequisite map                                 | todo   |

### 2D. Pilot content

The first unit is built end to end to validate the whole loop before scaling content.

| Task                                                                                                                      | Status |
| ------------------------------------------------------------------------------------------------------------------------- | ------ |
| Pre-calculus / Functions: explore items (function as a mapping, domain and range, composition, inverses, transformations) | todo   |
| Pre-calculus / Functions: lesson, practice sets, unit review                                                              | todo   |
| Data Engineering / Relational model and SQL joins (first interleaved unit)                                                | todo   |
| Pre-calculus / Algebra essentials                                                                                         | todo   |

After the pilot: continue unit by unit, updating this tracker and `docs/ROADMAP.md`.

## Risks

- **Correctness of content.** Mitigated by property tests for every generator and checker, syllabi as
  references, and worked solutions derived from the same code that computes answers.
- **Bundle size.** MathLive and Compute Engine are large; they load only on practice pages.
- **Content volume.** Each unit is several items. Templates and the generator API keep the cost per
  item low; the tracker keeps the order clear across sessions.
- **Progress loss.** Browser storage can be cleared; export and import is the backup, and the home page
  reminds when the last export is old.
