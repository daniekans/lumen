import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Vector algebra',
  summary:
    'Vectors add and scale component by component, which matches the arrows, and they obey eight rules of ordinary algebra. Length comes from the Pythagorean theorem, and with it unit vectors, distances and the triangle inequality.',
  tags: [
    'vector addition',
    'scalar multiplication',
    'vector space axioms',
    'length',
    'norm',
    'unit vector',
    'distance',
    'triangle inequality',
  ],
  level: 'core',
  order: 3,
  skills: ['vector-arithmetic', 'vector-length'],
  steps: [
    {
      id: 'componentwise',
      title: 'Component by component',
      caption:
        'Along the $x$-axis the first components of $\\mathbf{v}$ and $\\mathbf{w}$ stack up, and along the $y$-axis the second ones do. So $(v_1, v_2) + (w_1, w_2) = (v_1 + w_1, v_2 + w_2)$, and $c(v_1, v_2) = (cv_1, cv_2)$.',
      check: {
        kind: 'number',
        prompt: 'What is the second component of $2(3, -1) - (1, 4)$?',
        answer: -6,
        explanation: 'Work on second components only: $2 \\cdot (-1) - 4 = -6$.',
      },
    },
    {
      id: 'rules',
      title: 'The rules of the algebra',
      caption:
        'Because each component is an ordinary number, vectors inherit its rules. Grouping does not matter: $(\\mathbf{u} + \\mathbf{v}) + \\mathbf{w}$ and $\\mathbf{u} + (\\mathbf{v} + \\mathbf{w})$ end at the same tip. The explanation lists all eight rules.',
      check: {
        kind: 'choice',
        prompt:
          'Which equation fails for some vectors $\\mathbf{v}$, $\\mathbf{w}$ and numbers $c$, $d$?',
        options: [
          '$\\mathbf{v} + \\mathbf{w} = \\mathbf{w} + \\mathbf{v}$',
          '$c(\\mathbf{v} + \\mathbf{w}) = c\\mathbf{v} + c\\mathbf{w}$',
          '$(c + d)\\mathbf{v} = c\\mathbf{v} + d\\mathbf{v}$',
          '$\\mathbf{v} - \\mathbf{w} = \\mathbf{w} - \\mathbf{v}$',
        ],
        answer: 3,
        explanation:
          '$\\mathbf{w} - \\mathbf{v} = -(\\mathbf{v} - \\mathbf{w})$, the same arrow reversed. They are equal exactly when $\\mathbf{v} = \\mathbf{w}$.',
      },
    },
    {
      id: 'length',
      title: 'Length',
      caption:
        'The components are the legs of a right triangle, so $\\lVert \\mathbf{v} \\rVert = \\sqrt{v_1^2 + v_2^2}$. In $\\mathbb{R}^3$ the theorem is used twice and gives $\\sqrt{v_1^2 + v_2^2 + v_3^2}$; in $\\mathbb{R}^n$, the root of the sum of all squares. Drag the tip.',
      check: {
        kind: 'number',
        prompt: 'Find $\\lVert (2, -1, 2) \\rVert$.',
        answer: 3,
        explanation: '$\\sqrt{2^2 + (-1)^2 + 2^2} = \\sqrt{9} = 3$.',
      },
    },
    {
      id: 'scaled-length',
      title: 'Scaling scales the length',
      caption:
        'Every component of $c\\mathbf{v}$ is multiplied by $c$, so the sum of squares is multiplied by $c^2$ and the length by $\\sqrt{c^2} = \\lvert c \\rvert$: $\\lVert c\\mathbf{v} \\rVert = \\lvert c \\rvert \\lVert \\mathbf{v} \\rVert$. Move $c$.',
      check: {
        kind: 'number',
        prompt: 'If $\\lVert \\mathbf{v} \\rVert = 2.5$, what is $\\lVert -4\\mathbf{v} \\rVert$?',
        answer: 10,
        explanation:
          '$\\lvert -4 \\rvert \\cdot 2.5 = 10$. A negative factor reverses the arrow but cannot make it shorter than zero.',
      },
    },
    {
      id: 'unit-vector',
      title: 'Unit vectors',
      caption:
        'Dividing a nonzero $\\mathbf{v}$ by its length gives a vector of length $1$ in the same direction, its unit vector $\\hat{\\mathbf{v}}$. Every unit vector in the plane ends on the unit circle.',
      check: {
        kind: 'number',
        prompt:
          'What is the second component of the unit vector in the direction of $(3, -4)$? Give a decimal.',
        answer: -0.8,
        explanation:
          '$\\lVert (3, -4) \\rVert = 5$, so the unit vector is $(\\frac{3}{5}, -\\frac{4}{5}) = (0.6, -0.8)$.',
      },
    },
    {
      id: 'distance',
      title: 'Distance',
      caption:
        'The distance between the tips of $\\mathbf{v}$ and $\\mathbf{w}$ is the length of the arrow between them: $\\lVert \\mathbf{w} - \\mathbf{v} \\rVert$. In components it is the distance formula. Drag either tip.',
      check: {
        kind: 'number',
        prompt: 'Find the distance between $(1, 2)$ and $(7, 10)$.',
        answer: 10,
        explanation: 'The difference is $(6, 8)$, and $\\sqrt{36 + 64} = \\sqrt{100} = 10$.',
      },
    },
    {
      id: 'triangle',
      title: 'The triangle inequality',
      caption:
        'The direct path $\\mathbf{v} + \\mathbf{w}$ is never longer than going along $\\mathbf{v}$ and then $\\mathbf{w}$: $\\lVert \\mathbf{v} + \\mathbf{w} \\rVert \\le \\lVert \\mathbf{v} \\rVert + \\lVert \\mathbf{w} \\rVert$. The two lengths are equal when $\\mathbf{w}$ points the same way as $\\mathbf{v}$. Drag $\\mathbf{w}$.',
      check: {
        kind: 'choice',
        prompt:
          'When is $\\lVert \\mathbf{v} + \\mathbf{w} \\rVert = \\lVert \\mathbf{v} \\rVert + \\lVert \\mathbf{w} \\rVert$?',
        options: [
          'Always',
          'When one of them is a nonnegative multiple of the other',
          'When they are perpendicular',
          'Never',
        ],
        answer: 1,
        explanation:
          'The lengths add exactly when both arrows point the same way, or one of them is $\\mathbf{0}$: then the triangle is flat, with $\\mathbf{v} + \\mathbf{w}$ as long as the other two together. Perpendicular arrows give $\\sqrt{\\lVert \\mathbf{v} \\rVert^2 + \\lVert \\mathbf{w} \\rVert^2}$, which is smaller.',
      },
    },
  ],
})
