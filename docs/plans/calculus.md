# Calculus plan

Outline, threads and unit plans for Calculus 1, Calculus 2 and Multivariable Calculus. Part of
[LEARNING_PLATFORM.md](../LEARNING_PLATFORM.md).

## Depth from Calculus on

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
  version. Each item that uses the notation says what it means at that level. The choice of
  variable is part of it (2026-10-24): differentiating an equation "in $x$", "in $y$" or "in $t$",
  why that is allowed (the equation holds for every value of that variable), $\frac{dx}{dy}$ as
  the reciprocal of $\frac{dy}{dx}$, and $\frac{d^2y}{dx^2}$ for higher derivatives.
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

## Calculus outline

Approved by the owner on 2026-10-17, depth included. Units with items at headline level; slugs, skills and
exact content are settled in each unit plan. Kinds: E explore, L lesson, P practice, C checkpoint.
Thread marks: **Lz** Leibniz notation, **Lim** limits, **Lin** linear approximation.

### Calculus 1

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

### Calculus 2

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

### Multivariable Calculus and Optimization

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

### Legacy items and wish list placement

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

## Limits unit plan

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
| 1   | approaching-a-value             | explore    | reading-limits                       | $\frac{x^3 - 1}{x - 1}$ near its hole from both sides, zoom, $f(1)$ undefined or different, $\frac{\Delta y}{\Delta x} = 3 + \Delta x$                                    | done   |
| 2   | one-sided-and-infinite          | explore    | one-sided-limits, limits-at-infinity | A jump with slider $k$, $\frac{1}{(x - 2)^m}$, $\frac{2x^2 - 3x}{x^2 + 1}$ far out, dominant terms in three degree cases                                                  | done   |
| 3   | limit-laws                      | lesson     | evaluating-limits                    | $f + g$, $fg$, $\frac{f}{g}$ near $1$; substitution; factor, rationalize ($\frac{x - 4}{\sqrt{x} - 2}$), combine fractions; $\frac{k}{0}$                                 | done   |
| 4   | practice-evaluating-limits      | practice   | all four                             | Substitution, factor, rationalize, combine fractions, piecewise one-sided, does it exist, infinite limits, at infinity, roots at infinity                                 | done   |
| 5   | squeeze-and-standard-limits     | explore    | standard-limits                      | $x \sin\frac{1}{x}$ squeezed by $\pm\lvert x \rvert$; three areas on the unit circle; $\cos x \le \frac{\sin x}{x} \le 1$; $\frac{b^h - 1}{h} \to \ln b$; $(1 + t)^{1/t}$ | done   |
| 6   | continuity                      | explore    | continuity                           | Three conditions; removable, jump, infinite, oscillating; piecewise constant $c$; IVT on $x^3 - x - 1$; bisection with a zooming view                                     | done   |
| 7   | practice-continuity-and-squeeze | practice   | continuity, standard-limits          | Piecewise constant, classify (piecewise, rational), squeeze bounds, sine, $e^u - 1$, $(1 + \frac{a}{x})^{bx}$, IVT root interval                                          | done   |
| 8   | growth-rates                    | lesson     | growth-rates                         | Semi-log scale (`powerOfTen` axis labels); $x^p$ against $2^x$; $\ln x$; $x!$ via `lnGamma`; a dominant-term ratio; big-O with $C$                                        | done   |
| 9   | epsilon-delta                   | explore    | limit-definition                     | $\frac{x^2}{4} + 1$ with $f(2) = 3$: band, window, the game, nearer side, a jump beats every $L$, $\varepsilon$-$N$ on $2 + \frac{6 \sin x}{x}$                           | done   |
| 10  | epsilon-delta-proofs            | lesson     | limit-definition                     | Scratch work then proof; $2x + 1$; $x^2$ with $\min(1, \frac{\varepsilon}{3})$ and why; the sum law with $\frac{\varepsilon}{2}$; no limit at a jump                      | done   |
| 11  | practice-limit-definition       | practice   | limit-definition, growth-rates       | Best $\delta$ (line, parabola), the min rule, $N$ at infinity, growth ratios, big-O constant, proofs (linear, quadratic)                                                  | done   |
| 12  | checkpoint                      | checkpoint | all                                  | 11 generators across the unit plus a self-graded proof (constant multiple law)                                                                                            | done   |

Notes for the next batches: stages keep a uniform scale, so a view that zooms far out (limits at
infinity) passes a coarser `step` to `Grid` and `Axes`. Lesson checks take decimals only (no
fractions), so their answers are chosen to be short decimals. Infinite limits in practice are
multiple choice ($\infty$, $-\infty$, $0$, does not exist).

## Derivatives unit plan

Folder `src/content/mathematics/calculus-1/derivatives/`. Core unit, 13 items in three batches, as
in the Calculus outline. The thread: the derivative is the limit of secant slopes, so a curve
looks straight when zoomed in at a differentiable point; the rules come from that limit and from
pictures (a growing square, cube and rectangle, stretched number lines); implicit curves and
related rates use the same rules on equations. Leibniz notation: item 1 writes $\frac{dy}{dx}$ for
the limit of $\frac{\Delta y}{\Delta x}$ (one symbol, not yet a ratio; differentials come in
Applications 1), item 3 adds $\frac{d}{dx}$ as an operator, item 8 explains why the chain rule
looks like cancelling. Numerical derivatives (`derivative`, `secantSlope` in
`src/lib/math/calculus.ts`) verify every practice answer.

Skills: `secant-slope`, `definition` (kept from the legacy items), `derivative-graphs` (batch 1);
`basic-rules`, `transcendental-derivatives`, `chain-rule` (batch 2); `implicit-differentiation`,
`related-rates` (batch 3). Batches: 1 to 4 (two legacy items revised, the kit's `Box3D` for the
growing cube), 5 to 9, 10 to 13. The legacy checkpoint keeps its six problems, ordered last, until
batch 3 rebuilds it.

Batch 1 built on 2026-10-24 and reviewed by the owner; its two fixes (the missing explanation,
TeX in summaries) are done. Batch 2 built on 2026-10-24 and approved by the owner. Batch 3 built
and approved on 2026-10-24, with a revision to follow (below): item 10 adds rational exponents for $x < 0$ (odd
denominators) by implicit differentiation, and the checkpoint imports generators from items 2, 6,
9 and 12 and ends with a self-graded proof of the product rule. The power
rule is proved in steps, never stated beyond what is proved: whole $n$ (item 4), negative
integers at $x \neq 0$ (item 5, quotient rule), every real $n$ at $x > 0$ (item 7, by limits;
item 8 re-derives it with the chain rule). So fractional exponents are practiced in item 9, not
item 6. Notes for later units:
`MathLabel` anchors name the side the label goes to (`'e'` puts it right of the point). Stages
that zoom by changing `domain` pass `zoomedStep(1, z)` to `Grid` and `Axes`. `Box3D` draws
translucent boxes with the back faces first. `tangentPiece` and `linePiece` (`@/lib/math`) draw
tangent segments, vertical ones included.

| #   | Item                          | Kind       | Skills                                              | Content                                                                                                                                                               | Status |
| --- | ----------------------------- | ---------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | derivative-as-limit           | lesson     | secant-slope, definition                            | Revised: $\frac{\Delta y}{\Delta x}$ with $\Delta x = h$, the limit, the tangent line equation, zooming in until the curve is straight, $f'(x_0)$ and $\frac{dy}{dx}$ | done   |
| 2   | difference-quotients          | practice   | secant-slope, definition, derivative-graphs         | The six legacy generators, $\frac{k}{x}$ and $\sqrt{x}$ from the definition (combine fractions, rationalize), a slope that makes a piecewise function differentiable  | done   |
| 3   | derivative-function           | explore    | derivative-graphs                                   | $f'$ traced point by point; reading signs and zeros; corner of $\lvert x \rvert$, cusp of $x^{2/3}$, vertical tangent of $\sqrt[3]{x}$; $\frac{d}{dx}$ as an operator | done   |
| 4   | power-and-sum-rules           | explore    | basic-rules                                         | $x^2$ as a growing square, $x^3$ as a growing cube (3D), $(x + h)^n$ expanded, $nx^{n-1}$ against the slopes of $x^n$, linearity                                      | done   |
| 5   | product-and-quotient-rules    | explore    | basic-rules                                         | Product rule as a growing rectangle; quotient rule from the same rectangle with a known area; negative powers                                                         | done   |
| 6   | practice-basic-rules          | practice   | basic-rules                                         | Power (whole and negative), sum, product, quotient, both rules from values, tangent lines                                                                             | done   |
| 7   | exp-log-and-trig-derivatives  | explore    | transcendental-derivatives                          | $e^x$ is its own slope, $b^x$ with $\ln b$; $\sin' = \cos$ on the unit circle; $\ln$ as the inverse of $e^x$; $x^r$ for real $r$                                      | done   |
| 8   | chain-rule                    | explore    | chain-rule                                          | Composed stretching of number lines; $\frac{dy}{dx} = \frac{dy}{du}\frac{du}{dx}$ and why it looks like cancelling; the proof that handles $\Delta u = 0$             | done   |
| 9   | practice-chain-rule           | practice   | chain-rule, transcendental-derivatives, basic-rules | Exponential, log and trig derivatives, fractional exponents, chains with every rule so far                                                                            | done   |
| 10  | implicit-and-inverse          | lesson     | implicit-differentiation                            | Implicit curves, slope of an inverse as the reciprocal, $\arcsin$, $\arctan$, logarithmic differentiation, rational exponents                                         | done   |
| 11  | related-rates                 | lesson     | related-rates                                       | Linked quantities differentiated in $t$                                                                                                                               | done   |
| 12  | practice-implicit-and-related | practice   | implicit-differentiation, related-rates             | Implicit slopes, inverse derivatives, related rates                                                                                                                   | done   |
| 13  | checkpoint                    | checkpoint | all                                                 | Rebuilt for the whole unit, plus a self-graded proof                                                                                                                  | done   |

### Revision after the batch 3 review (next)

The owner approved batch 3's visualizations on 2026-10-24 and asked for more real-world
scenarios where they add value, motion (position, velocity, time), and the choice of variable in
Leibniz notation (see `DECISIONS.md`). The self-review found the same gaps: items 1 to 9 use no
real situation, motion and higher derivatives appear nowhere in Calculus 1 before Integrals, and
"differentiate in $y$" is never shown. Build these as one batch, then the unit is done:

1. **New lesson `motion`** (order 5, after `power-and-sum-rules`; later items shift by one, ids
   unchanged): position $s(t)$ of a moving object, average speed over a trip against the
   speedometer reading as the limit; $v = \frac{ds}{dt}$ and $a = \frac{dv}{dt} = \frac{d^2s}{dt^2}$;
   units as a reading of Leibniz notation (meters per second is "change in meters over change in
   seconds"); speeding up or slowing down from the signs of $v$ and $a$; a ball thrown upward,
   $s(t) = v_0t - 4.9t^2$. Introduces $f''$ and $\frac{d^2y}{dx^2}$ (Applications 4 extends them
   to concavity). Practice: motion generators in `practice-basic-rules` (velocity and
   acceleration at a time, when the object stops, highest point).
2. **Item 1** (`derivative-as-limit`): one paragraph tying the average rate to average speed and
   the derivative to the speedometer, pointing to `motion`.
3. **Item 7** (`exp-log-and-trig-derivatives`): $\frac{dP}{dt} = kP$ as growth proportional to
   size (population, continuous interest), the real reason $e^x$ matters.
4. **Item 8** (`chain-rule`): rates that multiply with units, for example a hiker's temperature
   $\frac{dT}{dt} = \frac{dT}{dh}\,\frac{dh}{dt}$ (degrees per meter times meters per minute), and
   one paragraph on backpropagation as the chain rule through layers (links the ML thread and the
   `backpropagation` visualization). A practice generator for the hiker type.
5. **Item 10** (`implicit-and-inverse`): a step "differentiate in $y$": at the circle's vertical
   tangents $\frac{dy}{dx}$ fails but $\frac{dx}{dy} = -\frac{y}{x}$ works; $\frac{dx}{dy} =
   1/\frac{dy}{dx}$ where both exist, the inverse rule in Leibniz form. An explanation section on
   which variable to differentiate in, and why. Practice: a "find $\frac{dx}{dy}$" generator.
6. **Item 11** (`related-rates`): two more examples, a person walking away from a streetlight
   (the shadow's tip moves faster than the person, by similar triangles) and two cars leaving a
   crossing at right angles (both legs change). Captions say "differentiate in $t$" and point back
   to item 10. Practice: shadow and two-cars generators; the checkpoint may swap `ladder` for one.

Done on 2026-10-24 already: the readout size toggle (labels too small to read).
