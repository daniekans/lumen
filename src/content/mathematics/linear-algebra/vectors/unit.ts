import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Vectors and linear combinations',
  description:
    'Vectors as arrows and as lists of numbers, addition and scaling, linear combinations, length and distance, the dot product, span and independence, lines and planes, and coordinates in a basis.',
  order: 1,
  skills: [
    {
      id: 'vector-arithmetic',
      title: 'Add, subtract and scale vectors, as arrows and componentwise',
    },
    { id: 'vector-length', title: 'Find lengths, unit vectors and distances' },
    {
      id: 'linear-combinations',
      title: 'Form linear combinations and find the weights that reach a target',
    },
    {
      id: 'dot-product',
      title: 'Compute dot products, angles and projections, and test for orthogonality',
    },
    {
      id: 'span-and-independence',
      title: 'Describe a span and decide whether vectors are linearly independent',
    },
    {
      id: 'lines-and-planes',
      title: 'Write lines and planes in parametric and normal form',
    },
  ],
  terms: [
    {
      id: 'vector',
      title: 'Vector',
      tex: '\\mathbf{v} = (v_1, v_2, \\ldots, v_n)',
      summary:
        'An ordered list of $n$ numbers, its components. In $\\mathbb{R}^2$ and $\\mathbb{R}^3$ it is drawn as an arrow from the origin to the point with those coordinates; moving the arrow without turning or stretching it gives the same vector.',
      introducedIn: 'vectors',
    },
    {
      id: 'real-coordinate-space',
      title: 'Real coordinate space',
      tex: '\\mathbb{R}^n',
      summary:
        'The set of all vectors with $n$ real components. $\\mathbb{R}^2$ is the plane, $\\mathbb{R}^3$ is space, and a row of a table with $n$ numeric columns is a vector in $\\mathbb{R}^n$.',
      introducedIn: 'vectors',
    },
    {
      id: 'scalar',
      title: 'Scalar',
      tex: 'c\\mathbf{v}',
      summary:
        'A single real number, as opposed to a vector. Multiplying $\\mathbf{v}$ by a scalar $c$ multiplies every component by $c$: the arrow stretches by $\\lvert c \\rvert$ and reverses when $c < 0$.',
      introducedIn: 'vectors',
    },
    {
      id: 'zero-vector',
      title: 'Zero vector',
      tex: '\\mathbf{0}',
      summary:
        'The vector whose components are all $0$. Adding it changes nothing, and $0\\mathbf{v} = \\mathbf{0}$ for every $\\mathbf{v}$. It has length $0$ and no direction.',
      introducedIn: 'vectors',
    },
    {
      id: 'linear-combination',
      title: 'Linear combination',
      tex: 'a\\mathbf{v} + b\\mathbf{w}',
      summary:
        'A sum of scalar multiples of vectors, such as $a\\mathbf{v} + b\\mathbf{w}$ or $c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k$. The scalars are the weights.',
      introducedIn: 'linear-combinations',
    },
    {
      id: 'vector-length',
      title: 'Length of a vector',
      tex: '\\lVert \\mathbf{v} \\rVert = \\sqrt{v_1^2 + \\cdots + v_n^2}',
      summary:
        'The length of the arrow, from the Pythagorean theorem applied one component at a time. Also called the norm (precisely, the Euclidean norm).',
      introducedIn: 'vector-algebra',
    },
    {
      id: 'unit-vector',
      title: 'Unit vector',
      tex: '\\frac{\\mathbf{v}}{\\lVert \\mathbf{v} \\rVert}',
      summary:
        'A vector of length $1$. Dividing a nonzero vector by its length gives the unit vector in its direction.',
      introducedIn: 'vector-algebra',
    },
    {
      id: 'vector-distance',
      title: 'Distance between vectors',
      tex: '\\lVert \\mathbf{w} - \\mathbf{v} \\rVert',
      summary:
        'The length of the difference: the distance between the tips of $\\mathbf{v}$ and $\\mathbf{w}$ drawn from the origin.',
      introducedIn: 'vector-algebra',
    },
    {
      id: 'triangle-inequality',
      title: 'Triangle inequality',
      tex: '\\lVert \\mathbf{v} + \\mathbf{w} \\rVert \\le \\lVert \\mathbf{v} \\rVert + \\lVert \\mathbf{w} \\rVert',
      summary:
        'One side of a triangle is never longer than the other two together. Equality holds exactly when one vector is a nonnegative multiple of the other.',
      introducedIn: 'vector-algebra',
    },
    {
      id: 'dot-product',
      title: 'Dot product',
      tex: '\\mathbf{v} \\cdot \\mathbf{w} = v_1 w_1 + \\cdots + v_n w_n',
      summary:
        'The sum of the products of matching components, a number. It equals $\\lVert \\mathbf{v} \\rVert \\lVert \\mathbf{w} \\rVert \\cos\\theta$, and $\\mathbf{v} \\cdot \\mathbf{v} = \\lVert \\mathbf{v} \\rVert^2$. Also called the inner product.',
      introducedIn: 'dot-product',
    },
    {
      id: 'scalar-projection',
      title: 'Scalar projection',
      tex: '\\frac{\\mathbf{v} \\cdot \\mathbf{w}}{\\lVert \\mathbf{v} \\rVert}',
      summary:
        'The signed length of the shadow of $\\mathbf{w}$ on the line through $\\mathbf{v}$, negative when the shadow points away from $\\mathbf{v}$. The shadow as a vector is $\\frac{\\mathbf{v} \\cdot \\mathbf{w}}{\\mathbf{v} \\cdot \\mathbf{v}}\\,\\mathbf{v}$.',
      introducedIn: 'dot-product',
    },
    {
      id: 'orthogonal',
      title: 'Orthogonal vectors',
      tex: '\\mathbf{v} \\cdot \\mathbf{w} = 0',
      summary:
        'Vectors whose dot product is $0$. Nonzero orthogonal vectors are perpendicular; the zero vector is orthogonal to every vector.',
      introducedIn: 'dot-product',
    },
    {
      id: 'cauchy-schwarz',
      title: 'Cauchy-Schwarz inequality',
      tex: '\\lvert \\mathbf{v} \\cdot \\mathbf{w} \\rvert \\le \\lVert \\mathbf{v} \\rVert \\lVert \\mathbf{w} \\rVert',
      summary:
        'The dot product never exceeds the product of the lengths in absolute value, with equality exactly when one vector is a multiple of the other. It makes the angle between vectors in $\\mathbb{R}^n$ well defined.',
      introducedIn: 'dot-product',
    },
    {
      id: 'span',
      title: 'Span',
      tex: '\\operatorname{span}\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}',
      summary:
        'The set of all linear combinations of the vectors. It always contains $\\mathbf{0}$; in space it is the origin, a line, a plane or all of space.',
      introducedIn: 'span-and-independence',
    },
    {
      id: 'linear-dependence',
      title: 'Linearly dependent',
      tex: 'c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}',
      summary:
        'Vectors are linearly dependent when some combination with weights not all zero gives $\\mathbf{0}$. Equivalently, one of them is a combination of the others and adds nothing to the span.',
      introducedIn: 'span-and-independence',
    },
    {
      id: 'linear-independence',
      title: 'Linearly independent',
      summary:
        'Vectors are linearly independent when only the combination with every weight $0$ gives $\\mathbf{0}$. Then every vector in their span has exactly one set of weights.',
      introducedIn: 'span-and-independence',
    },
    {
      id: 'parametric-line',
      title: 'Parametric line',
      tex: '\\mathbf{p} + t\\mathbf{v}',
      summary:
        'The points $\\mathbf{p} + t\\mathbf{v}$ for all numbers $t$: the line through $\\mathbf{p}$ along $\\mathbf{v} \\ne \\mathbf{0}$. With two directions, $\\mathbf{p} + s\\mathbf{v} + t\\mathbf{w}$ is a plane.',
      introducedIn: 'lines-and-planes',
    },
    {
      id: 'normal-vector',
      title: 'Normal vector',
      tex: '\\mathbf{n} \\cdot (\\mathbf{x} - \\mathbf{p}) = 0',
      summary:
        'A nonzero vector orthogonal to every direction in a plane. The plane through $\\mathbf{p}$ with normal $\\mathbf{n}$ is $n_1 x + n_2 y + n_3 z = \\mathbf{n} \\cdot \\mathbf{p}$.',
      introducedIn: 'lines-and-planes',
    },
  ],
})
