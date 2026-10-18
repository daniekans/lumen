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
  ],
})
