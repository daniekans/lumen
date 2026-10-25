# Linear Algebra plan

Outline, threads and unit plans for Linear Algebra. Part of
[LEARNING_PLATFORM.md](../LEARNING_PLATFORM.md).

## Status

Outline approved by the owner on 2026-10-18, as drafted: eight units, the dot product in unit 1
(revisited as duality in unit 7), and 3D from Vectors 6 on. The review decisions are at the end
of the outline. Units are built in order; the Vectors unit (plan below) is done, its revision approved on
2026-10-25, and the Linear maps and matrices unit plan (below) is drafted for the owner's review.

## Depth and threads

Core depth, as in Calculus: the geometric picture first (a matrix is a function of space, in the
spirit of 3Blue1Brown's "Essence of linear algebra"), then the computation, then proofs, carried
to the level Machine Learning and Multivariable Calculus need (projections, eigenvalues, SVD,
PCA). It runs alongside Calculus 1 and does not depend on it. Threads:

- **Map (M).** A matrix is a linear map, and every operation has a geometric meaning: $A\mathbf{x}$
  moves a vector, $AB$ composes, $\det A$ scales volume, $A^{-1}$ undoes, $A^T$ is the map seen from
  the row side, eigenvectors are the directions the map only stretches.
- **Two pictures (P).** $A\mathbf{x}$ as a combination of columns and as dot products with rows.
  The column picture leads to span, column space and rank; the row picture to equations, null space
  and orthogonality. The four fundamental subspaces join them.
- **Basis (B).** Coordinates depend on the basis. Change of basis, then the basis that makes a map
  simplest: eigenvectors diagonalize, orthonormal bases make projections easy, and the SVD picks the
  best basis on both sides. PCA is the SVD of a data table.
- **Toward ML (ML).** Feature vectors and cosine similarity (unit 1), a layer $W\mathbf{x} + \mathbf{b}$
  (unit 2), regression as a projection (unit 7), PCA and low-rank approximation (unit 8). The
  Jacobian in Multivariable Calculus is "the best linear map", which links this course to the
  linear approximation thread in [calculus.md](calculus.md).

Code lessons (phase 6) fit here first: almost every item has a short NumPy counterpart (`A @ v`,
`np.linalg.solve`, `np.linalg.eig`, `np.linalg.svd`). Plan the code view when phase 6 starts.

**3D (phase 5).** Span in space, 3D maps, volume, the cross product and projections onto planes
need 3D stages. Phase 5 built them (`Stage3D`, SVG with an orbit camera) on 2026-10-18 for
Vectors 6, the first 3D item.

**Legacy item.** `matrix-transformations` (folder `linear-transformations/`) becomes item 2 of
Linear maps and matrices. Keep the visual (including `MatrixView`, which may move to `ui`), and
revise text, steps and its two skills to fit the unit. The determinant part moves to Determinants.
The folder `linear-transformations/` is renamed to `linear-maps/` (with a redirect). The item has its own
Replay button in the dock, which the page's Replay (steps header) now covers; drop it then.

## Linear Algebra outline

Eight units, about 90 items. Kinds: E explore, L lesson, P practice, C checkpoint.

**1. Vectors and linear combinations** (11 items)

| #   | Item                           | Kind | Content                                                                                                                                                                   | Threads |
| --- | ------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | vectors                        | E    | Arrow and list of numbers as one object; tip-to-tail addition; scaling, negatives; a row of a table as a vector in $\mathbb{R}^n$                                         | ML      |
| 2   | linear-combinations            | E    | $a\mathbf{v} + b\mathbf{w}$ with sliders, reaching any point; when the two are parallel, only a line                                                                      | P       |
| 3   | vector-algebra                 | L    | Componentwise rules and why they match the arrows; the eight properties; length $\lVert\mathbf{v}\rVert$, unit vectors, distance                                          | P       |
| 4   | practice-vector-arithmetic     | P    | Combinations, lengths, unit vectors, distances, solving $a\mathbf{v} + b\mathbf{w} = \mathbf{u}$ in 2D                                                                    |         |
| 5   | dot-product                    | E    | $\mathbf{v} \cdot \mathbf{w}$ as projection length times length; angle and $\cos\theta$; orthogonal; cosine similarity of feature vectors                                 | P, ML   |
| 6   | span-and-independence          | E    | Span of one, two, three vectors in 3D (line, plane, space); a dependent vector adds nothing; redundancy as a combination equal to $\mathbf{0}$                            | P       |
| 7   | lines-and-planes               | L    | $\mathbf{p} + t\mathbf{v}$ and $\mathbf{p} + s\mathbf{v} + t\mathbf{w}$; normal form $\mathbf{n} \cdot (\mathbf{x} - \mathbf{p}) = 0$; spans as planes through the origin | P       |
| 8   | practice-dot-and-span          | P    | Dot products, angles, orthogonality, in the span or not, independence of 2 or 3 vectors, plane equations                                                                  |         |
| 9   | basis-and-coordinates          | E    | $\hat{\imath}, \hat{\jmath}$; another basis draws another grid and gives the same arrow other coordinates                                                                 | B       |
| 10  | practice-basis-and-coordinates | P    | Coordinates in a given basis (2D, 3D), is it a basis                                                                                                                      |         |
| 11  | checkpoint                     | C    | All of the above plus a proof (adding a vector outside the span keeps a set independent)                                                                                  |         |

**2. Linear maps and matrices** (12 items; legacy item 2)

| #   | Item                            | Kind | Content                                                                                                                                                          | Threads |
| --- | ------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | linear-maps                     | E    | Grid lines stay straight, parallel, evenly spaced, origin fixed; $T(a\mathbf{v} + b\mathbf{w}) = aT(\mathbf{v}) + bT(\mathbf{w})$; maps that fail (shift, bend)  | M       |
| 2   | matrix-transformations (legacy) | E    | Revised: columns are where $\hat{\imath}$ and $\hat{\jmath}$ land; reading a matrix from a picture and back                                                      | M       |
| 3   | matrix-vector-product           | L    | $A\mathbf{x}$ as a combination of columns and as row dot products; shapes $m \times n$; a layer $W\mathbf{x} + \mathbf{b}$                                       | P, ML   |
| 4   | practice-matrix-vector          | P    | Products, matrix from a described map, image of a vector, is this map linear                                                                                     |         |
| 5   | gallery-of-maps                 | E    | Rotation, reflection, shear, scaling, projection onto a line; what each does to areas and lengths                                                                | M       |
| 6   | composition                     | E    | Matrix multiplication as doing one map after another (backlog item); $AB \ne BA$ shown                                                                           | M       |
| 7   | matrix-multiplication           | L    | Column by column, row times column, associativity from composition, identity, transpose rules; a sparse product as a join and a group by                         | M, P    |
| 8   | practice-matrix-products        | P    | Products, powers of a rotation, composing described maps, transposes                                                                                             |         |
| 9   | maps-in-3d                      | E    | $3 \times 3$ maps on a 3D grid; rotations about an axis; non-square maps ($\mathbb{R}^3 \to \mathbb{R}^2$ projection, $\mathbb{R}^2 \to \mathbb{R}^3$ embedding) | M       |
| 10  | kernel-and-image-preview        | E    | What a map squashes to $\mathbf{0}$ and what it can reach; first look at rank as the dimension of the image                                                      | M, P    |
| 11  | practice-maps                   | P    | Classify maps, image dimension, matrices of 3D rotations and projections                                                                                         |         |
| 12  | checkpoint                      | C    | All of the above plus a proof (composition of linear maps is linear, so $AB$ is its matrix)                                                                      |         |

**3. Determinants** (8 items)

| #   | Item                      | Kind | Content                                                                                                           | Threads |
| --- | ------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | area-scaling              | E    | $\det A$ as the factor by which the unit square's area changes; sign as orientation; $0$ as collapse              | M       |
| 2   | volume-in-3d              | E    | The unit cube becomes a parallelepiped; $3 \times 3$ determinant as signed volume; collapse to a plane            | M       |
| 3   | computing-determinants    | L    | $ad - bc$ from the parallelogram; cofactor expansion; row operations and what each does to $\det$                 |         |
| 4   | practice-determinants     | P    | $2 \times 2$, $3 \times 3$, triangular, after row operations, find $k$ so that $\det = 0$                         |         |
| 5   | product-rule              | E    | $\det(AB) = \det A \det B$ as scaling twice; $\det A^{-1} = \frac{1}{\det A}$; $\det A^T = \det A$                | M       |
| 6   | cross-product             | L    | $\mathbf{v} \times \mathbf{w}$ as the vector whose length is the parallelogram's area, via a determinant; normals | M       |
| 7   | practice-volume-and-cross | P    | Areas and volumes, cross products, normals to planes, the product rule                                            |         |
| 8   | checkpoint                | C    | All of the above plus a proof (a matrix with two equal columns has $\det = 0$)                                    |         |

**4. Systems and inverses** (12 items)

| #   | Item                     | Kind | Content                                                                                                                               | Threads |
| --- | ------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | two-pictures-of-a-system | E    | $A\mathbf{x} = \mathbf{b}$ as lines (planes) meeting and as a combination of columns hitting $\mathbf{b}$; none, one, infinitely many | P       |
| 2   | elimination              | E    | Row operations step by step, pivots, back substitution; the system's picture stays the same solution                                  |         |
| 3   | row-echelon-form         | L    | Echelon and reduced echelon form, free variables, the solution set as particular plus null directions                                 | P       |
| 4   | practice-elimination     | P    | Solve $2 \times 2$ and $3 \times 3$ systems, count solutions, parametric solution sets                                                |         |
| 5   | inverse-matrices         | E    | $A^{-1}$ undoes the map; exists exactly when $\det A \ne 0$; $(AB)^{-1} = B^{-1}A^{-1}$ as undoing in reverse order                   | M       |
| 6   | computing-inverses       | L    | Gauss-Jordan on $[A \mid I]$; the $2 \times 2$ formula; why software solves instead of inverting                                      |         |
| 7   | practice-inverses        | P    | Inverses, solve with an inverse, invertible or not                                                                                    |         |
| 8   | lu-factorization         | L    | Elimination recorded as $A = LU$; one factorization, many right sides (what `np.linalg.solve` does)                                   |         |
| 9   | column-and-null-space    | E    | Column space as everything reachable, null space as everything sent to $\mathbf{0}$; rank and nullity                                 | P       |
| 10  | rank-nullity             | L    | $\text{rank} + \text{nullity} = n$; the invertible matrix theorem as one list of equivalent statements                                | P       |
| 11  | practice-rank-and-spaces | P    | Rank, bases for column and null space, consistency of $A\mathbf{x} = \mathbf{b}$                                                      |         |
| 12  | checkpoint               | C    | All of the above plus a proof (null space is a subspace; solution sets differ by null vectors)                                        |         |

**5. Vector spaces and change of basis** (about 10): abstract vector spaces (polynomials and
functions as vectors, a link to Fourier series), subspaces, basis and dimension in general,
coordinates relative to a basis, the change of basis matrix, a map in another basis as
$P^{-1}AP$ (same map, new coordinates), the four fundamental subspaces and their dimensions. B, P.

**6. Eigenvalues and eigenvectors** (about 13): directions that are only scaled (backlog item), the
characteristic polynomial, trace and determinant as sum and product of eigenvalues, eigenbasis and
diagonalization, powers $A^k$ (Fibonacci, Markov chains and PageRank, linked from Discrete Math
graphs), complex eigenvalues as rotation and scaling (linked from Complex Numbers), dynamical
systems $\mathbf{x}_{k+1} = A\mathbf{x}_k$ (a preview of systems of differential equations),
symmetric matrices and the spectral theorem, quadratic forms and positive definite matrices (used
by the Hessian in Multivariable). M, B.

**7. Orthogonality and least squares** (about 11): the dot product revisited as a $1 \times n$
matrix (duality), orthogonal complements and the row space, projection onto a line then onto a
subspace ($P = A(A^TA)^{-1}A^T$), least squares and the normal equations, linear regression as a
projection (the first Machine Learning seed), orthonormal bases and orthogonal matrices (lengths
and angles kept), Gram-Schmidt and $A = QR$. P, B, ML.

**8. SVD and PCA** (about 10): rotate, stretch, rotate (backlog item), the SVD from $A^TA$,
singular values as the map's stretches, rank-$k$ approximation (an image compressed), the
pseudo-inverse and least squares again, the condition number and why some systems lose digits,
PCA on a small data set (covariance matrix, explained variance, a suggested link to Probability),
low-rank structure in ML (embeddings, low-rank adapters). B, ML.

### Wish list and backlog placement

- Backlog items: span of two vectors (Vectors 2, 6), matrix multiplication as composition (Linear
  maps 6), eigenvectors (Eigen 1), change of basis (Vector spaces), dot product as projection
  (Vectors 5, Orthogonality), SVD (SVD 1).
- Complex numbers as plane maps: a complex number $a + bi$ acts as the matrix
  $\begin{bmatrix} a & -b \\ b & a \end{bmatrix}$; linked from Eigen (complex eigenvalues). The
  full topic stays in Complex Numbers.
- Graph theory: adjacency matrices and PageRank in Eigen, linked to Discrete Math.
- Fourier series: functions as vectors in Vector spaces; orthogonal functions in Orthogonality.

### Review decisions (2026-10-18)

1. **Scope.** Eight units, about 90 items, as drafted. Units 5 and 7 keep their size.
2. **Dot product in unit 1.** It is introduced in Vectors 5 as projection length times length,
   with angles and cosine similarity, and Orthogonality extends it (a $1 \times n$ matrix,
   duality). Nothing said in unit 1 is taken back later; unit 7 only adds a second view. This
   follows the owner's rule for every course: introduce an idea correctly and expand it later, never
   simplify it in a way a later item has to correct.
3. **3D early.** 3D first appears at Vectors 6 (span in space). Phase 5 starts right before that
   item, as the next step after the unit's first batch.

### Wish list and backlog placement

- Backlog items: span of two vectors (Vectors 2, 6), matrix multiplication as composition (Linear
  maps 6), eigenvectors (Eigen 1), change of basis (Vector spaces), dot product as projection
  (Vectors 5, Orthogonality), SVD (SVD 1).
- Complex numbers as plane maps: a complex number $a + bi$ acts as the matrix
  $\begin{bmatrix} a & -b \\ b & a \end{bmatrix}$; linked from Eigen (complex eigenvalues). The
  full topic stays in Complex Numbers.
- Graph theory: adjacency matrices and PageRank in Eigen, linked to Discrete Math.
- Fourier series: functions as vectors in Vector spaces; orthogonal functions in Orthogonality.

### Open questions for the review

1. **Eight units, about 90 items.** Is the scope right, or should units 5 (Vector spaces) and 7
   (Orthogonality) be leaner?
2. **Dot product in unit 1** (for cosine similarity and the row picture early), revisited as
   duality in unit 7. The alternative (3Blue1Brown's order) introduces it only after maps.
3. **Phase 5 timing.** 3D first appears at Vectors 6. The alternative is to keep units 1 and 2 in
   the plane and gather 3D items into a later batch.

## Vectors and linear combinations unit plan

Folder `src/content/mathematics/linear-algebra/vectors/`. Core unit, 11 items in three batches, as
in the outline. The thread: a vector is an arrow and a list at once; adding and scaling give linear
combinations; length, the dot product and span measure and describe them; a basis turns the
weights into coordinates. Components are written $(3, 1)$ in text and as columns in display
formulas. Colors: $\mathbf{v}$ blue, $\mathbf{w}$ yellow, sums and results teal.

Skills: `vector-arithmetic`, `vector-length`, `linear-combinations` (batch 1); `dot-product`,
`span-and-independence`, `lines-and-planes` (batch 2); `basis-coordinates` (batch 3).
Practice answers use the `vector` answer kind (ordered components, typed as `(3, -1)` or a
column), added for this unit. `src/lib/math/vector.ts` has n-dimensional helpers (`addN`, `dotN`,
`normN`, `simplifySqrt`); `tex.vector` and `tex.root` write vectors and simplified roots.

| #   | Item                           | Kind       | Skills                                               | Content                                                                                                                                                                                | Status |
| --- | ------------------------------ | ---------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | vectors                        | explore    | vector-arithmetic                                    | Arrow and components, the same vector from any tail, tip to tail, either order (parallelogram), scaling with $c$, $\mathbf{w} - \mathbf{v}$, rows of a table and their average         | done   |
| 2   | linear-combinations            | explore    | linear-combinations                                  | $a\mathbf{v} + b\mathbf{w}$ with sliders, reach $\mathbf{u} = (3, 4)$ (drag the tip, weights by Cramer), the slanted grid of whole weights, $\mathbf{w}$ turning parallel: only a line | done   |
| 3   | vector-algebra                 | lesson     | vector-arithmetic, vector-length                     | Componentwise rules, the eight rules (grouping as two routes), length by Pythagoras in $\mathbb{R}^n$, $\lVert c\mathbf{v} \rVert$, unit vectors, distance, triangle inequality        | done   |
| 4   | practice-vector-arithmetic     | practice   | all three                                            | Combinations (2D, 3D), solve $c\mathbf{x} + \mathbf{v} = \mathbf{w}$, exact lengths, unit vectors (whole lengths), distances, a missing component, weights of a target                 | done   |
| 5   | dot-product                    | explore    | dot-product                                          | Projection length times length; $\cos\theta$; orthogonality; cosine similarity of feature vectors; Cauchy-Schwarz and the triangle inequality in $\mathbb{R}^n$ (item 3 promises it)   | done   |
| 6   | span-and-independence          | explore    | span-and-independence                                | First 3D item: span of one, two, three vectors (line, plane, space); a dependent vector adds nothing; a combination equal to $\mathbf{0}$                                              | done   |
| 7   | lines-and-planes               | lesson     | lines-and-planes                                     | $\mathbf{p} + t\mathbf{v}$, $\mathbf{p} + s\mathbf{v} + t\mathbf{w}$, normal form $\mathbf{n} \cdot (\mathbf{x} - \mathbf{p}) = 0$, spans as planes through the origin (3D)            | done   |
| 8   | practice-dot-and-span          | practice   | dot-product, span-and-independence, lines-and-planes | Dot products, angles, orthogonality, in the span or not, independence of 2 or 3 vectors, plane equations                                                                               | done   |
| 9   | basis-and-coordinates          | explore    | basis-coordinates                                    | $\hat{\imath}, \hat{\jmath}$; another basis draws another grid (item 2's grid, now named) and gives the same arrow other coordinates                                                   | done   |
| 10  | practice-basis-and-coordinates | practice   | basis-coordinates                                    | Coordinates in a given basis (2D, 3D), is it a basis                                                                                                                                   | done   |
| 11  | checkpoint                     | checkpoint | all                                                  | All of the above plus a self-graded proof (adding a vector outside the span keeps a set independent)                                                                                   | done   |

Batches: 1 is items 1 to 4 (2D only), approved by the owner on 2026-10-18. Batch 2 is items 5 to 8,
built on 2026-10-18 together with phase 5 (`Stage3D`, see `ARCHITECTURE.md`, Drawing), approved
by the owner on 2026-10-18; the 3D polish that followed that review (depth cue, fades, hover links,
sway, views, pulses) is applied to items 6 and 7. Item 5 is 2D; items 6 and 7 are the first 3D
items. Batch 3 is items 9 to 11, built on 2026-10-19 and approved by the owner
on 2026-10-19 without changes.

Batch 2 notes: span uses $\mathbf{v} = (1, 2, 0)$, $\mathbf{w} = (-1, 0, 2)$ and a third vector
$\mathbf{u}$ in white (the neutral `vc.fg`, so the item keeps three hues); its in-plane step turns
the camera edge on and back. Lines and planes uses the plane $x + 2y + 2z = 6$ through $(2, 0, 2)$
along $(2, -1, 0)$ and $(0, 1, -1)$. The cross product is not used before Determinants: normals
are given or checked with dot products. Practice item 8 has eight generators (dot product, angle,
orthogonal $k$, projection, in the span, independent, plane equation, line meets plane), verified
by an independent rank computation in `problems.test.ts`.

Batch 3 notes: basis and coordinates reuses item 2's $\mathbf{v}$, $\mathbf{w}$ as
$\mathbf{b}_1 = (2, 1)$, $\mathbf{b}_2 = (-1, 2)$ and $\mathbf{x} = (3, 4)$ (coordinates
$(2, 1)$); the basis morphs from $\hat{\imath}, \hat{\jmath}$, $\mathbf{b}_2$ turns to $(1, 3)$ and
then to $-\frac{1}{2}\mathbf{b}_1$; its 3D step uses $(2, -1, 0)$, $(0, 1, 1)$, $(-1, 0, 1)$ and
$\mathbf{x} = (-3, 2, 2)$, chosen because they read well from the home camera. `basisCoords`
(`mat2.ts`) and `basisCoords3`, `det3` (`vec3.ts`) solve for coordinates. New terms: `basis`,
`standard-basis`, `coordinates`. The legacy term `basis-vectors` (unit Linear transformations)
overlaps `standard-basis`: merge it when Linear maps and matrices is built. The checkpoint has 14
problems (13 from the three practice sets and a self-graded proof that adding a vector outside the
span keeps a set independent).

### Revision after the self-review (2026-10-24; items 1 to 5 and 7 to 9 built 2026-10-25)

A review of the unit against the owner's goals (see `ADDING_CONTENT.md`, section 0). All 11
items match the plan and the rigor is mostly good; these need fixing. Do them before or together
with batch 1 of Linear maps and matrices, since that unit revises `matrix-transformations`.

**Correctness (take-backs), first:**

1. `vectors/explanation.mdx:72` and `meta.ts:23` ("a length and a direction, nothing else")
   clash with the zero vector and with vectors such as polynomials in Vector spaces: say "an
   arrow in $\mathbb{R}^2$ or $\mathbb{R}^3$". The glossary entry (`unit.ts:48`) becomes "a vector in
   $\mathbb{R}^n$ is an ordered list".
2. `vector-algebra/explanation.mdx:37` ("anything that obeys these eight rules counts as a vector")
   omits closure under addition and scaling.
3. `linear-combinations/meta.ts:29` reads as if every point lies on the whole-number grid: say
   every point has exactly one pair $(a, b)$, whole or not, and add the one-line reason
   (the $2 \times 2$ system has a nonzero determinant) to the explanation.
4. `lines-and-planes/explanation.mdx:159` states the converse of the normal form without proof:
   if $\mathbf{x} - \mathbf{p} \perp \mathbf{n}$ but is off the plane, the three vectors span
   $\mathbb{R}^3$, so $\mathbf{n} \perp \mathbf{n}$ and $\mathbf{n} = \mathbf{0}$.
5. Wording: "only when" to "exactly when" (`dot-product/meta.ts:50`), "for nonzero vectors"
   (`dot-product/meta.ts:38`), a nonzero vector spans a line (`span-and-independence/meta.ts:24`);
   the "components share one ratio" solution text breaks with zero components
   (`practice-dot-and-span/problems.ts` near 271, `practice-basis-and-coordinates/problems.ts:157`):
   solve from a nonzero component, then check the rest.
6. Legacy `matrix-transformations` (fix with Linear maps): a rotation does not change shapes
   (`explanation.mdx:51`); the area factor is $|\det A|$, $\det A$ being signed (`meta.ts:34`);
   basis colors to match `basis-and-coordinates`.

**Status (2026-10-25).** Built: 1 to 5, 7 and 9 (text and captions; item 9's food mix is a
new last step `mix` in `linear-combinations`, food A $= \mathbf{v} = (2, 1)$ and food B
$= (0.5, 2)$ in units of 10 g, weights clamped at $0$, the cone shaded; the other scenarios are
explanation sections: house distances and standardization, a basket bill and an exam score
$\mathbf{w} \cdot \mathbf{x} + b$ with $\mathbf{w} = (0.5, 0.3)$, $b = -4$, unit embeddings,
a rent table with one-hot columns, a drone at constant velocity, the exam model's decision
boundary). Item 8 built the same day: `in-span` became `span-weights` (find $(a, b)$),
`independent` became `dependence` (a relation $a\mathbf{v} + b\mathbf{w} + \mathbf{u} = \mathbf{0}$,
or $k$ that makes two vectors dependent), `is-basis` became `basis-k` ($k$ that stops three
vectors of space being a basis, or a third vector of the plane from the other two); new
`plane-normal` (parametric to $ax + by + cz = d$, no cross product, which the unit does not
teach), `normal-to-parametric` (a missing component of the point or a direction),
`feature-vectors` (cosine of word counts in $\mathbb{R}^5$, distance of standardized houses in
$\mathbb{R}^4$) and `proof-short` (the four proofs, one per problem). The checkpoint has 16
problems with the new ones. The owner approved the revision on 2026-10-25. Item 6 is done
with batch 1 of Linear maps and matrices.

**Depth and real scenarios:**

7. The dot product as a weighted sum is missing, the main link to ML: in `dot-product`, a basket
   total (quantities times prices, with units) and a linear score $\mathbf{w} \cdot \mathbf{x} + b$
   (a neuron before its activation), which sets up $W\mathbf{x} + \mathbf{b}$ in unit 2. One
   sentence seeds duality: $\mathbf{w} \mapsto \mathbf{v} \cdot \mathbf{w}$ is linear.
8. Practice: replace yes/no answers (`independent`, `is-basis`, `in-span`) with weights, a
   dependence relation or "find $k$ that makes them dependent"; plane problems that find a normal
   from two directions and convert between parametric and normal form; one problem in
   $\mathbb{R}^4$ or $\mathbb{R}^5$ (distance or cosine of feature vectors); short proofs in practice
   (nonzero orthogonal vectors are independent, $\mathbf{u}$ orthogonal to a span, Pythagoras exactly
   when $\mathbf{v} \cdot \mathbf{w} = 0$, a span is closed).
9. Real scenarios: two foods as (protein, carbs) per serving in `linear-combinations` (real mixes
   need weights $\ge 0$, one cone of the span); features in different units dominating a distance,
   hence standardization (`vector-algebra`); normalized embeddings making the dot product the
   cosine; a column that is the sum of others, or one-hot columns, adds nothing
   (multicollinearity) in `span-and-independence`; a classifier boundary
   $\mathbf{w} \cdot \mathbf{x} = b$ as a plane with normal $\mathbf{w}$, and $\mathbf{p} + t\mathbf{v}$ as
   motion at constant velocity, in `lines-and-planes`.

## Linear maps and matrices unit plan

Approved by the owner on 2026-10-25, with the review decisions at the end. Folder `src/content/mathematics/linear-algebra/linear-maps/`
(the legacy unit folder `linear-transformations/` renamed, with a redirect). Core unit, 12 items
in three batches, as in the outline. The thread: a function of space is linear when it keeps
linear combinations; then it is fixed by where the basis lands, and those images are the columns
of its matrix; $A\mathbf{x}$ reads as a combination of columns or as row dot products; doing one
map after another multiplies matrices; a map can lose a direction (kernel) and reach only part of
the target (image). Colors as in Vectors: $\hat{\imath}$ and its image green, $\hat{\jmath}$ red
(as `basis-and-coordinates`), the input $\mathbf{x}$ blue, the output $A\mathbf{x}$ teal; a
second map in composition yellow.

**Stated with conditions, never taken back.**

- Definition: $T$ is linear when $T(\mathbf{u} + \mathbf{v}) = T(\mathbf{u}) + T(\mathbf{v})$ and
  $T(c\mathbf{v}) = cT(\mathbf{v})$ for all vectors and scalars. "Grid lines stay straight, parallel
  and evenly spaced, the origin fixed" is the picture of that rule, not the definition, and it
  holds as stated only for maps that do not collapse; a collapsing map sends lines to a line or to
  a point, still evenly spaced along it. $T(\mathbf{0}) = \mathbf{0}$ follows (necessary, not
  sufficient: $(x, y) \mapsto (x^2, y)$ fixes the origin and is not linear).
- Matrices are introduced for maps $\mathbb{R}^n \to \mathbb{R}^m$ with the standard basis; a map in
  another basis ($P^{-1}AP$) is unit 5, which adds a view, not a correction.
- $W\mathbf{x} + \mathbf{b}$ is affine, not linear, when $\mathbf{b} \ne \mathbf{0}$: a linear map
  followed by a shift. The extra coordinate $1$ (homogeneous coordinates) makes it linear one
  dimension up; said once, used again in ML.
- $AB \ne BA$ in general; some pairs commute (two rotations, a matrix and its powers, $I$).
- Projection onto a line is the orthogonal one, $P = \frac{\mathbf{u}\mathbf{u}^T}{\mathbf{u} \cdot \mathbf{u}}$,
  from Vectors 5 (scalar projection); an oblique shadow is also linear, named as such.
- Transpose: defined as rows and columns swapped, with $(AB)^T = B^TA^T$ and
  $\mathbf{x} \cdot (A\mathbf{y}) = (A^T\mathbf{x}) \cdot \mathbf{y}$ checked by computation. Its
  geometric meaning waits for unit 7, which adds it.
- Rank here is the dimension of the image, the same definition unit 4 computes by elimination.
- Determinant: not in this unit. Gallery items say what a map does to areas (twice, half, the same,
  flipped) from the picture; the number $\det A$ arrives in Determinants.

**Threads.** Map (M): every item. Two pictures (P): item 3 introduces both readings of
$A\mathbf{x}$, item 7 both readings of $AB$ (columns $A\mathbf{b}_j$, entries row times column),
item 10 links the column picture to the image. Basis (B): item 2 reuses
`basis-and-coordinates`; a matrix records where the basis goes. Duality seed (for unit 7): a $1 \times n$
matrix is the linear map $\mathbf{x} \mapsto \mathbf{w} \cdot \mathbf{x}$ (item 3, one sentence,
extending the Vectors 5 seed). ML: item 3 (a layer), item 7 (two layers without an activation
are one matrix, so the activation is what adds power), item 10 (redundant features leave weights
undetermined).

Skills: `linear-maps` (is it linear, images from the images of a basis), `matrix-columns` (kept
from the legacy unit: the matrix of a described or drawn map), `matrix-vector` (products, shapes,
both pictures) (batch 1); `standard-maps` (rotation, reflection, shear, scaling, projection),
`matrix-multiplication` (batch 2); `maps-in-3d`, `kernel-and-image` (batch 3). The legacy skill
`determinant` leaves the unit with a redirect to the future Determinants unit, so progress is kept.

Terms: `linear-transformation` (kept id, retitled "Linear map", definition by the two rules),
`matrix` (an $m \times n$ table; columns as images), `matrix-vector-product`, `affine-map`,
`identity-matrix`, `matrix-product`, `transpose`, `rotation-matrix`, `projection-matrix`, `kernel`,
`image`, `rank`. The legacy `basis-vectors` merges into `standard-basis` (Vectors). `determinant`
moves to Determinants with the skill.

Practice needs a `matrix` answer kind: a grid of small MathLive fields whose shape the problem
gives (checked entry by entry, with a per-entry issue code), since typing a `bmatrix` in one field
is fiddly. Shape questions ("what size is $AB$?") ask for $m$ and $n$ as numbers. `src/lib/math`
gets an $m \times n$ matrix module (`matN.ts`: product, transpose, power, rank by exact fractions)
with tests; practice answers are verified with it and, independently, by applying the maps to
vectors.

| #   | Item                            | Kind       | Skills                                     | Content                                                                                                                                                                                                                                                               | Status |
| --- | ------------------------------- | ---------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | linear-maps                     | explore    | linear-maps                                | A map moves every point; the two rules drawn (sum of images is image of sum, scaled likewise); grid stays straight, parallel, evenly spaced, origin fixed; maps that fail: a shift, a bend ($x^2$), $T(\mathbf{0}) \ne \mathbf{0}$; a collapse that is still linear   | draft  |
| 2   | matrix-transformations (legacy) | explore    | matrix-columns, linear-maps                | Revised: $\mathbf{x} = x\hat{\imath} + y\hat{\jmath}$ so $T(\mathbf{x}) = xT(\hat{\imath}) + yT(\hat{\jmath})$; the columns; reading a matrix from a picture and drawing one from a matrix; presets; determinant steps removed                                        | draft  |
| 3   | matrix-vector-product           | lesson     | matrix-vector                              | $A\mathbf{x}$ as a combination of columns and as row dot products, $m \times n$ shapes ($\mathbb{R}^n \to \mathbb{R}^m$), $I$, linearity of $A\mathbf{x}$ proved, a $1 \times n$ matrix as $\mathbf{w} \cdot \mathbf{x}$, a layer $W\mathbf{x} + \mathbf{b}$ (affine) | draft  |
| 4   | practice-matrix-vector          | practice   | linear-maps, matrix-columns, matrix-vector | Products (2D, 3D, non-square), matrix from a described map, image from images of a basis, is this map linear (find the failing rule's witness), nutrients and store totals, a layer's output                                                                          | draft  |
| 5   | gallery-of-maps                 | explore    | standard-maps                              | Rotation by $\theta$ (columns from the unit circle), reflection across a line, shear, scaling, projection onto a line; what each keeps (lengths, angles, areas, orientation) and loses                                                                                | draft  |
| 6   | composition                     | explore    | matrix-multiplication                      | One map after another (the legacy backlog item): the grid moved twice, the product's columns as $A$ applied to $B$'s columns; $AB \ne BA$ shown with a rotation and a shear; two rotations commute                                                                    | draft  |
| 7   | matrix-multiplication           | lesson     | matrix-multiplication                      | Column by column, row times column, shapes, associativity from composition (no index pushing), $I$, powers, transpose rules; sparse $AB$ as a join and a group by; two linear layers are one                                                                          | draft  |
| 8   | practice-matrix-products        | practice   | standard-maps, matrix-multiplication       | Products and shapes, powers of a rotation, composing described maps (rotate then reflect), matrices of standard maps, transposes, a product from a table join                                                                                                         | draft  |
| 9   | maps-in-3d                      | explore    | maps-in-3d                                 | $3 \times 3$ maps on a 3D grid; rotations about the axes; non-square maps: $\mathbb{R}^3 \to \mathbb{R}^2$ (the stage's own orthographic camera) and $\mathbb{R}^2 \to \mathbb{R}^3$ (a sheet placed in space)                                                        | draft  |
| 10  | kernel-and-image-preview        | explore    | kernel-and-image                           | What a map sends to $\mathbf{0}$ (a subspace) and what it reaches (the span of the columns); rank as the dimension of the image; collapse in 2D and 3D; inputs that differ by a kernel vector share an output                                                         | draft  |
| 11  | practice-maps                   | practice   | maps-in-3d, kernel-and-image               | 3D rotation and projection matrices, kernel vectors (find one), image dimension (rank), is $\mathbf{b}$ reachable, short proofs (kernel and image are subspaces, $T(\mathbf{0}) = \mathbf{0}$)                                                                        | draft  |
| 12  | checkpoint                      | checkpoint | all                                        | Problems from items 4, 8 and 11 plus a self-graded proof: a composition of linear maps is linear, so $AB$ is its matrix                                                                                                                                               | draft  |

**Real scenarios** (only where they add meaning):

- Item 1: unit conversion (meters to feet) is linear; Celsius to Fahrenheit, $F = 1.8C + 32$, is
  not: doubling the temperature does not double it, the shift breaks both rules. Leads to "affine".
- Item 2: italic type is a shear (upright letters slanted, baselines kept). Otherwise none.
- Item 3: Vectors' food mix as a matrix: columns are foods A and B in (protein, carbs), $\mathbf{x}$
  the servings; the column picture is the mix, the row picture computes each nutrient. A price
  table times a basket gives one total per store. The exam score $\mathbf{w} \cdot \mathbf{x} + b$
  from Vectors grows into several outputs, $W\mathbf{x} + \mathbf{b}$.
- Item 5: a shadow at noon as projection onto the ground; a mirror; image rotation.
- Item 6: photo editing: rotate then stretch differs from stretch then rotate.
- Item 7: sales quantities (store by product) times prices and weights (product by measure) as SQL:
  `JOIN` on product, `SUM(q * p)` grouped by store and measure; storing only nonzero entries as
  (row, column, value) rows is how sparse matrices are kept (COO). Two layers without an
  activation collapse to $W_2W_1$.
- Item 9: an aircraft or drone yaw as a rotation about the vertical axis; the 3D stage itself draws
  by a $2 \times 3$ projection.
- Item 10: a shadow loses the light's direction (the kernel); a data table with a column equal to the
  sum of two others (Vectors' multicollinearity): weights that differ by a kernel vector give the
  same predictions, so the data cannot tell them apart.
- Practice: nutrients, store totals, a layer's output, a join's totals; the rest is plain math.

**Batches.** 1: items 1 to 4, with the folder rename and redirects, the legacy revision (and
Vectors revision item 6), the `matrix` answer kind and `matN.ts`. 2: items 5 to 8. 3: items 9 to
12 (3D). Each batch is one session.

**Review decisions (2026-10-25).**

1. The `matrix` answer kind is a grid of fields with the shape given.
2. The legacy item's two determinant steps (`area`, `sign`) and its determinant section leave it
   in batch 1. The Determinants unit (next) teaches them in depth. Nothing is taken back: the
   gallery says in words what a map does to areas and orientation, and its last sentence points
   ahead ("Determinants measures this with one number"). The owner's rule for later units: a
   reframing is fine when the earlier item says explicitly that a later unit extends the idea.
