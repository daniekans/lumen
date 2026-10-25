import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Matrix times vector',
  summary:
    '$A\\mathbf{x}$ two ways: a combination of the columns of $A$ with the components of $\\mathbf{x}$ as weights, and a list of dot products of the rows with $\\mathbf{x}$. An $m \\times n$ matrix maps $\\mathbb{R}^n$ to $\\mathbb{R}^m$; a one-row matrix is a dot product, and a layer $W\\mathbf{x} + \\mathbf{b}$ is affine.',
  tags: [
    'matrix',
    'matrix-vector product',
    'column picture',
    'row picture',
    'identity matrix',
    'affine map',
    'neural network layer',
  ],
  level: 'core',
  order: 3,
  skills: ['matrix-vector'],
  steps: [
    {
      id: 'columns',
      title: 'A combination of the columns',
      caption:
        '$A\\mathbf{x}$ takes $x_1$ of the first column and $x_2$ of the second, and adds them: $A\\mathbf{x} = x_1\\mathbf{a}_1 + x_2\\mathbf{a}_2$. This is $T(\\mathbf{x}) = x_1T(\\hat{\\imath}) + x_2T(\\hat{\\jmath})$ written with the matrix. Drag $\\mathbf{x}$.',
      check: {
        kind: 'number',
        prompt:
          'The columns of $A$ are $(1, 3)$ and $(2, -1)$, and $\\mathbf{x} = (2, 1)$. What is the second entry of $A\\mathbf{x}$?',
        answer: 5,
        explanation: '$A\\mathbf{x} = 2(1, 3) + 1(2, -1) = (4, 5)$, so the second entry is $5$.',
      },
    },
    {
      id: 'rows',
      title: 'Each entry from one row',
      caption:
        'Read the same product by rows: entry $i$ of $A\\mathbf{x}$ is the dot product of row $i$ of $A$ with $\\mathbf{x}$. The coordinates of $A\\mathbf{x}$, marked on the axes, are $\\mathbf{r}_1 \\cdot \\mathbf{x}$ and $\\mathbf{r}_2 \\cdot \\mathbf{x}$.',
      check: {
        kind: 'number',
        prompt:
          'Row $1$ of $A$ is $(4, -2)$ and $\\mathbf{x} = (3, 5)$. What is the first entry of $A\\mathbf{x}$?',
        answer: 2,
        explanation: '$(4, -2) \\cdot (3, 5) = 12 - 10 = 2$.',
      },
    },
    {
      id: 'food',
      title: 'Food as a matrix',
      caption:
        'The two foods of Vectors become the columns of $A$: food A has $20$ g of protein and $10$ g of carbs per serving, food B $5$ g and $20$ g. With $\\mathbf{x}$ the servings, the columns give the meal; each row gives one nutrient.',
      check: {
        kind: 'number',
        prompt: 'How many grams of protein are in $2$ servings of A and $3$ of B?',
        answer: 55,
        explanation: 'Row $1$ (protein) times the servings: $20 \\cdot 2 + 5 \\cdot 3 = 55$ g.',
      },
    },
    {
      id: 'shapes',
      title: 'Shapes',
      caption:
        'A matrix with $m$ rows and $n$ columns takes $\\mathbf{x}$ with $n$ components (one weight per column) and returns $m$ components (one per row). This $2 \\times 3$ matrix maps $\\mathbb{R}^3$ to the plane: three columns, three weights.',
      check: {
        kind: 'choice',
        prompt: 'A $3 \\times 5$ matrix $A$ gives a map $\\mathbf{x} \\mapsto A\\mathbf{x}$ from',
        options: ['$\\mathbb{R}^3$ to $\\mathbb{R}^5$', '$\\mathbb{R}^5$ to $\\mathbb{R}^3$'],
        answer: 1,
        explanation:
          'Five columns need five weights, so $\\mathbf{x}$ is in $\\mathbb{R}^5$; three rows give three entries, so $A\\mathbf{x}$ is in $\\mathbb{R}^3$.',
      },
    },
    {
      id: 'identity',
      title: 'The identity matrix',
      caption:
        'When the columns are $\\hat{\\imath}$ and $\\hat{\\jmath}$ themselves, $A\\mathbf{x} = x_1\\hat{\\imath} + x_2\\hat{\\jmath} = \\mathbf{x}$. This is the identity matrix $I$: the map that moves nothing.',
    },
    {
      id: 'dot',
      title: 'One row: a dot product',
      caption:
        'A matrix with one row $\\mathbf{w}$ returns one number, $\\mathbf{w} \\cdot \\mathbf{x}$. The exam score of Vectors, $\\mathbf{w} = (0.5, 0.3)$ for hours studied and slept, is such a map; the lines show inputs with equal output. Drag $\\mathbf{x}$.',
      check: {
        kind: 'number',
        prompt:
          'With $\\mathbf{w} = (0.5, 0.3)$, what does the $1 \\times 2$ matrix $\\begin{bmatrix} 0.5 & 0.3 \\end{bmatrix}$ give for $\\mathbf{x} = (8, 5)$?',
        answer: 5.5,
        explanation: '$0.5 \\cdot 8 + 0.3 \\cdot 5 = 4 + 1.5 = 5.5$.',
      },
    },
    {
      id: 'layer',
      title: 'A layer of a neural network',
      caption:
        "Several scores at once: each row of $W$ is one neuron's weights, and $\\mathbf{b}$ adds a constant to each. $W\\mathbf{x} + \\mathbf{b}$ is a linear map followed by a shift: the grid first moves by $W$ and keeps the origin, then slides by $\\mathbf{b}$, so the origin lands on $\\mathbf{b}$. The map is affine, not linear. Pick a stage to compare.",
      check: {
        kind: 'choice',
        prompt:
          'Is $\\mathbf{x} \\mapsto W\\mathbf{x} + \\mathbf{b}$ linear when $\\mathbf{b} \\ne \\mathbf{0}$?',
        options: ['Yes, $W$ is a matrix', 'No, it sends $\\mathbf{0}$ to $\\mathbf{b}$'],
        answer: 1,
        explanation:
          'A linear map sends $\\mathbf{0}$ to $\\mathbf{0}$, but $W\\mathbf{0} + \\mathbf{b} = \\mathbf{b} \\ne \\mathbf{0}$.',
      },
    },
  ],
})
