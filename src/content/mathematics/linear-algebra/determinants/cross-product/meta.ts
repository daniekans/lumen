import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'The cross product',
  summary:
    'For fixed $\\mathbf{v}$ and $\\mathbf{w}$ in space, the volume $\\det[\\mathbf{v}\\ \\mathbf{w}\\ \\mathbf{x}]$ is a dot product $\\mathbf{p} \\cdot \\mathbf{x}$ with one vector, and that vector is $\\mathbf{v} \\times \\mathbf{w}$: perpendicular to both, as long as the area they span, right-handed. Its components, the triple product, the plane through three points and torque.',
  tags: [
    'cross product',
    'triple product',
    'right-hand rule',
    'normal vector',
    'torque',
    'duality',
    '3D',
  ],
  level: 'core',
  order: 7,
  skills: ['cross-product'],
  steps: [
    {
      id: 'volume',
      title: 'Volume as a function',
      caption:
        'Fix $\\mathbf{v}$ and $\\mathbf{w}$ and let the third column vary: $f(\\mathbf{x}) = \\det[\\mathbf{v}\\ \\mathbf{w}\\ \\mathbf{x}]$ is the signed volume of the box on $\\mathbf{v}$, $\\mathbf{w}$, $\\mathbf{x}$. It is the base area times the height of $\\mathbf{x}$ above the base, so moving $\\mathbf{x}$ along the sheet parallel to the base changes nothing. Drag $\\mathbf{x}$.',
      check: {
        kind: 'number',
        prompt:
          'For fixed $\\mathbf{v}$, $\\mathbf{w}$: $f(\\mathbf{x}) = 4$ and $f(\\mathbf{y}) = -1$. What is $f(2\\mathbf{x} + 3\\mathbf{y})$?',
        answer: 5,
        explanation:
          'The determinant is linear in its third column (rule 2), so $f(2\\mathbf{x} + 3\\mathbf{y}) = 2f(\\mathbf{x}) + 3f(\\mathbf{y}) = 8 - 3 = 5$.',
      },
    },
    {
      id: 'one-vector',
      title: 'A dot product with one vector',
      caption:
        'A linear function of $\\mathbf{x}$ is a $1 \\times 3$ matrix: $f(\\mathbf{x}) = \\mathbf{p} \\cdot \\mathbf{x}$, with $\\mathbf{p} = (f(\\hat{\\imath}), f(\\hat{\\jmath}), f(\\hat{k}))$. Watch $\\mathbf{x}$ visit $\\hat{\\imath}$, $\\hat{\\jmath}$ and $\\hat{k}$. That one vector $\\mathbf{p}$ is the cross product $\\mathbf{v} \\times \\mathbf{w}$.',
      check: {
        kind: 'number',
        prompt:
          '$\\mathbf{v} = (2, 0, 0)$ and $\\mathbf{w} = (0, 3, 0)$. What is $f(\\hat{k}) = \\det[\\mathbf{v}\\ \\mathbf{w}\\ \\hat{k}]$, the third component of $\\mathbf{v} \\times \\mathbf{w}$?',
        answer: 6,
        explanation:
          'The box on $(2, 0, 0)$, $(0, 3, 0)$, $(0, 0, 1)$ is a rectangular box $2 \\times 3 \\times 1$, right-handed: volume $6$.',
      },
    },
    {
      id: 'geometry',
      title: 'Perpendicular, with the area as length',
      caption:
        '$\\mathbf{p} \\cdot \\mathbf{v} = \\det[\\mathbf{v}\\ \\mathbf{w}\\ \\mathbf{v}] = 0$ (two equal columns), and the same for $\\mathbf{w}$: $\\mathbf{p}$ is perpendicular to the base. Its length is the area of the base, and $\\mathbf{v}, \\mathbf{w}, \\mathbf{p}$ are right-handed. Drag the tips of $\\mathbf{v}$ and $\\mathbf{w}$; when they are parallel, $\\mathbf{p} = \\mathbf{0}$.',
      check: {
        kind: 'number',
        prompt: 'What is the length of $(3, 0, 0) \\times (1, 2, 0)$?',
        answer: 6,
        explanation:
          'It is the area of the parallelogram on the two vectors: base $3$ along the $x$-axis, height $2$, area $6$.',
      },
    },
    {
      id: 'order',
      title: 'The order matters',
      caption:
        'Swapping the columns flips the sign of every volume, so $\\mathbf{w} \\times \\mathbf{v} = -\\mathbf{v} \\times \\mathbf{w}$: the turn from the first vector to the second reverses, and the right hand points the other way.',
      check: {
        kind: 'choice',
        prompt: 'What is $\\hat{\\jmath} \\times \\hat{\\imath}$?',
        options: ['$\\hat{k}$', '$-\\hat{k}$', '$\\mathbf{0}$', '$\\hat{\\imath}$'],
        answer: 1,
        explanation:
          '$\\hat{\\imath} \\times \\hat{\\jmath} = \\hat{k}$ (the unit square, right-handed with $\\hat{k}$), so $\\hat{\\jmath} \\times \\hat{\\imath} = -\\hat{k}$.',
      },
    },
    {
      id: 'components',
      title: 'The components',
      caption:
        'Expanding $\\det[\\mathbf{v}\\ \\mathbf{w}\\ \\mathbf{x}]$ along its third column gives each component of $\\mathbf{p}$ as a $2 \\times 2$ determinant of the other two coordinates: $\\mathbf{v} \\times \\mathbf{w} = (v_2w_3 - v_3w_2,\\ v_3w_1 - v_1w_3,\\ v_1w_2 - v_2w_1)$. Drag $\\mathbf{v}$ and $\\mathbf{w}$.',
      check: {
        kind: 'number',
        prompt: 'What is the second component of $(1, 2, 3) \\times (4, 5, 6)$?',
        answer: 6,
        explanation: '$v_3w_1 - v_1w_3 = 3 \\cdot 4 - 1 \\cdot 6 = 6$.',
      },
    },
    {
      id: 'triple',
      title: 'The triple product',
      caption:
        '$\\mathbf{x} \\cdot (\\mathbf{v} \\times \\mathbf{w}) = \\det[\\mathbf{v}\\ \\mathbf{w}\\ \\mathbf{x}]$: the area $|\\mathbf{v} \\times \\mathbf{w}|$ times the height of $\\mathbf{x}$ along $\\mathbf{v} \\times \\mathbf{w}$. It is $0$ exactly when the three vectors lie in one plane. Drag $\\mathbf{x}$.',
      check: {
        kind: 'number',
        prompt:
          'What is the volume of the box with edges $(1, 0, 0)$, $(0, 2, 0)$ and $(1, 1, 3)$?',
        answer: 6,
        explanation:
          '$(1, 0, 0) \\times (0, 2, 0) = (0, 0, 2)$, and $(1, 1, 3) \\cdot (0, 0, 2) = 6$: base area $2$, height $3$.',
      },
    },
    {
      id: 'plane',
      title: 'The plane through three points',
      caption:
        'The edges $\\mathbf{q} - \\mathbf{p}$ and $\\mathbf{r} - \\mathbf{p}$ lie in the plane, so $\\mathbf{n} = (\\mathbf{q} - \\mathbf{p}) \\times (\\mathbf{r} - \\mathbf{p})$ is a normal, and the plane is $\\mathbf{n} \\cdot \\mathbf{x} = \\mathbf{n} \\cdot \\mathbf{p}$. 3D graphics computes a normal for every triangle of a mesh this way. Drag the points.',
      check: {
        kind: 'number',
        prompt:
          'The plane through $(1, 0, 0)$, $(0, 2, 0)$ and $(0, 0, 3)$ is $6x + 3y + cz = 6$. Find $c$.',
        answer: 2,
        explanation:
          '$\\mathbf{n} = (-1, 2, 0) \\times (-1, 0, 3) = (6, 3, 2)$, and $\\mathbf{n} \\cdot (1, 0, 0) = 6$. So $c = 2$.',
      },
    },
    {
      id: 'torque',
      title: 'Torque',
      caption:
        'A force $\\mathbf{F}$ at the end of a wrench handle $\\mathbf{r}$ turns the bolt with torque $\\boldsymbol{\\tau} = \\mathbf{r} \\times \\mathbf{F}$, in newton meters, along the bolt. Its size is $|\\mathbf{r}||\\mathbf{F}|\\sin\\theta$: a longer handle gives more, and a push along the handle gives none.',
      check: {
        kind: 'number',
        prompt:
          'A force of $40$ newtons pushes at a right angle to a wrench handle $0.25$ meters long. How many newton meters of torque does it give?',
        answer: 10,
        explanation:
          '$|\\boldsymbol{\\tau}| = 0.25 \\cdot 40 \\cdot \\sin 90^\\circ = 10$ newton meters.',
      },
    },
  ],
})
