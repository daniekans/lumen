# Pre-calculus plan

Unit plans for the Pre-calculus course (refresher depth, except Functions and Algebra
essentials). Part of [LEARNING_PLATFORM.md](../LEARNING_PLATFORM.md).

## Functions unit plan

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

After the pilot: continue unit by unit, updating this tracker.

## Algebra essentials unit plan

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

## Polynomial and rational functions unit plan

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

## Exponential and logarithmic functions unit plan

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
