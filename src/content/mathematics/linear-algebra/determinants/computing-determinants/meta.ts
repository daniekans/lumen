import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Computing determinants',
  summary:
    '$ad - bc$ from the rules and from the picture; the rows span the same area as the columns ($\\det A^T = \\det A$); cofactor expansion along any row or column; the rule of Sarrus for $3 \\times 3$ only; triangular matrices; elimination and pivots; $n!$ against $n^3$; the area of a polygon from its corners.',
  tags: [
    'determinant',
    'cofactor expansion',
    'minor',
    'rule of Sarrus',
    'triangular matrix',
    'elimination',
    'shoelace formula',
    'polygon area',
  ],
  level: 'core',
  order: 4,
  skills: ['computing-determinants', 'determinant-rules'],
  steps: [
    {
      id: 'rules',
      title: '$ad - bc$ from the rules',
      caption:
        'Split each column along the axes: $(a, c) = a\\hat{\\imath} + c\\hat{\\jmath}$ and $(b, d) = b\\hat{\\imath} + d\\hat{\\jmath}$. Rule 2 gives four terms; the two with $\\hat{\\imath}$ twice or $\\hat{\\jmath}$ twice are $0$, $ad\\det[\\hat{\\imath}\\ \\hat{\\jmath}] = ad$ turns counterclockwise and $cb\\det[\\hat{\\jmath}\\ \\hat{\\imath}] = -bc$ clockwise. So $\\det A = ad - bc$.',
      check: {
        kind: 'number',
        prompt: 'Compute $\\det \\begin{bmatrix} 4 & 2 \\\\ 1 & 3 \\end{bmatrix}$.',
        answer: 10,
        explanation: '$ad - bc = 4 \\cdot 3 - 2 \\cdot 1 = 12 - 2 = 10$.',
      },
    },
    {
      id: 'picture',
      title: '$ad - bc$ from the picture',
      caption:
        'The parallelogram of $(a, c)$ and $(b, d)$ sits in a rectangle $(a + b)$ wide and $(c + d)$ tall. The corners outside it are two triangles of area $\\frac{ac}{2}$, two of area $\\frac{bd}{2}$ and two rectangles $bc$. What is left: $(a + b)(c + d) - ac - bd - 2bc = ad - bc$.',
    },
    {
      id: 'rows',
      title: 'Rows span the same area',
      caption:
        'The rows of $A$ span a different parallelogram with the same area: $\\det A^T = da - cb = \\det A$. Every rule about columns holds for rows too. Drag the tips of the columns.',
      check: {
        kind: 'number',
        prompt: '$A = \\begin{bmatrix} 1 & 4 \\\\ 2 & 3 \\end{bmatrix}$. Compute $\\det A^T$.',
        answer: -5,
        explanation:
          '$A^T = \\begin{bmatrix} 1 & 2 \\\\ 4 & 3 \\end{bmatrix}$, so $\\det A^T = 1 \\cdot 3 - 2 \\cdot 4 = -5$, the same as $\\det A = 1 \\cdot 3 - 4 \\cdot 2$.',
      },
    },
    {
      id: 'cofactor',
      title: 'Cofactor expansion',
      caption:
        'Split the first row into its three entries (rule 2, read on rows). Each term is an entry times the determinant of what is left when its row and column are removed (its minor), with signs $+, -, +$. A $3 \\times 3$ determinant becomes three $2 \\times 2$ ones.',
      check: {
        kind: 'number',
        prompt:
          'Compute $\\det \\begin{bmatrix} 1 & 2 & 0 \\\\ 3 & 1 & 2 \\\\ 0 & 1 & 1 \\end{bmatrix}$ by expanding along the first row.',
        answer: -7,
        explanation:
          '$1 \\cdot (1 \\cdot 1 - 2 \\cdot 1) - 2 \\cdot (3 \\cdot 1 - 2 \\cdot 0) + 0 = -1 - 6 = -7$.',
      },
    },
    {
      id: 'any-line',
      title: 'Along any row or column',
      caption:
        'The expansion works along any row or column, with the signs of a checkerboard: $(-1)^{i + j}$ for entry $(i, j)$. Every line gives the same number. A line with zeros saves work, since a zero entry kills its term. Pick a line.',
      check: {
        kind: 'number',
        prompt:
          'Compute $\\det \\begin{bmatrix} 3 & 0 & 0 \\\\ 2 & 1 & 5 \\\\ 4 & 0 & 2 \\end{bmatrix}$. Which line has the most zeros?',
        answer: 6,
        explanation:
          'Along the first row only the first term is left: $3 \\cdot \\det \\begin{bmatrix} 1 & 5 \\\\ 0 & 2 \\end{bmatrix} = 3 \\cdot 2 = 6$.',
      },
    },
    {
      id: 'sarrus',
      title: 'The rule of Sarrus, for 3 by 3 only',
      caption:
        'For a $3 \\times 3$ matrix, copy the first two columns to the right. The three diagonals going down add their products, the three going up subtract theirs. These are the six terms of the cofactor expansion. It does not extend: a $4 \\times 4$ determinant has $24$ terms, and diagonals give only $8$.',
      check: {
        kind: 'choice',
        prompt: 'Does the diagonal rule give the determinant of a $4 \\times 4$ matrix?',
        options: [
          'Yes, with four diagonals down and four up',
          'No: the determinant has $24$ terms and the diagonals give $8$',
        ],
        answer: 1,
        explanation:
          'Cofactor expansion of a $4 \\times 4$ gives $4 \\times 6 = 24$ products, one for each order of the columns. Eight diagonals miss sixteen of them.',
      },
    },
    {
      id: 'triangular',
      title: 'Triangular matrices',
      caption:
        'In a triangular matrix everything below (or above) the diagonal is $0$. Expanding along the first column leaves one term, again and again, so the determinant is the product of the diagonal.',
      check: {
        kind: 'number',
        prompt:
          'Compute $\\det \\begin{bmatrix} 2 & 5 & -1 \\\\ 0 & 3 & 7 \\\\ 0 & 0 & -1 \\end{bmatrix}$.',
        answer: -6,
        explanation: 'The product of the diagonal: $2 \\cdot 3 \\cdot (-1) = -6$.',
      },
    },
    {
      id: 'elimination',
      title: 'Elimination and pivots',
      caption:
        'Row operations reach a triangular matrix: a swap flips the sign, adding a multiple of one row to another keeps the determinant. Then $\\det A = \\pm$ the product of the pivots, with a minus for an odd number of swaps.',
      check: {
        kind: 'number',
        prompt:
          'Use elimination: compute $\\det \\begin{bmatrix} 1 & 2 & 1 \\\\ 2 & 5 & 3 \\\\ 1 & 3 & 4 \\end{bmatrix}$.',
        answer: 2,
        explanation:
          '$R_2 - 2R_1$ and $R_3 - R_1$ give rows $(0, 1, 1)$ and $(0, 1, 3)$; then $R_3 - R_2$ gives $(0, 0, 2)$. No swaps, so $\\det = 1 \\cdot 1 \\cdot 2 = 2$.',
      },
    },
    {
      id: 'cost',
      title: '$n!$ against $n^3$',
      caption:
        'Cofactor expansion of an $n \\times n$ matrix ends in $n!$ products; elimination takes about $n^3$ operations. On a logarithmic scale $n!$ curves away: for $n = 20$ it is about $2.4 \\times 10^{18}$ against $8000$. Move $n$.',
      check: {
        kind: 'choice',
        prompt: 'How does NumPy compute a determinant?',
        options: [
          'By cofactor expansion, which is exact',
          'By elimination (an LU factorization), about $n^3$ operations',
          'By the rule of Sarrus',
        ],
        answer: 1,
        explanation:
          'It factors $A$ by elimination and multiplies the pivots, with the sign of the row swaps. Cofactor expansion would take $n!$ products.',
      },
    },
    {
      id: 'polygon',
      title: 'The area of a polygon',
      caption:
        'A plot of land, surveyed by its corners. Each edge and the origin make a triangle of signed area $\\frac{1}{2}\\det[\\mathbf{p}_k\\ \\mathbf{p}_{k+1}]$; the triangles that reach outside the plot come back negative and cancel. The sum is the area (the shoelace formula). Drag the corners.',
      check: {
        kind: 'number',
        prompt:
          'A plot has corners $(0, 0)$, $(4, 0)$, $(5, 3)$, $(1, 4)$, in that order (in units of $10$ meters). What is its area in those units squared?',
        answer: 14.5,
        explanation:
          'Half the sum of $x_ky_{k+1} - x_{k+1}y_k$ over the edges: $\\frac{1}{2}(0 + 12 + 17 + 0) = 14.5$, that is $1450$ square meters.',
      },
    },
  ],
})
