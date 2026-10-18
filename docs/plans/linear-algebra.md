# Linear Algebra plan

Outline, threads and unit plans for Linear Algebra. Part of
[LEARNING_PLATFORM.md](../LEARNING_PLATFORM.md).

## Status

Outline drafted on 2026-10-18, **awaiting Daniel's review**. No unit is built until it is
approved. Open questions for the review are at the end of the outline.

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
need 3D stages. The first item that needs one is Vectors 6 (span in 3D). Phase 5 starts right
before that item (SVG projection first, see `ROADMAP.md`).

**Legacy item.** `matrix-transformations` (folder `linear-transformations/`) becomes item 2 of
Linear maps and matrices. Keep the visual (including `MatrixView`, which may move to `ui`), and
revise text, steps and its two skills to fit the unit. The determinant part moves to Determinants.
The folder `linear-transformations/` is renamed to `linear-maps/` (with a redirect).

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

### Open questions for the review

1. **Eight units, about 90 items.** Is the scope right, or should units 5 (Vector spaces) and 7
   (Orthogonality) be leaner?
2. **Dot product in unit 1** (for cosine similarity and the row picture early), revisited as
   duality in unit 7. The alternative (3Blue1Brown's order) introduces it only after maps.
3. **Phase 5 timing.** 3D first appears at Vectors 6. The alternative is to keep units 1 and 2 in
   the plane and gather 3D items into a later batch.
