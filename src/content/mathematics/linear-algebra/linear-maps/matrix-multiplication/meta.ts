import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Matrix multiplication',
  summary:
    'Computing $AB$: column by column ($A$ times each column of $B$) and entry by entry (row $i$ of $A$ dotted with column $j$ of $B$); shapes; associativity from composition; the identity and powers; the transpose and $(AB)^T = B^TA^T$; a sparse product as a join and a group by; two linear layers are one.',
  tags: [
    'matrix multiplication',
    'matrix product',
    'row times column',
    'associativity',
    'transpose',
    'matrix power',
    'sparse matrix',
    'SQL join',
    'neural network layer',
  ],
  level: 'core',
  order: 7,
  skills: ['matrix-multiplication'],
  steps: [
    {
      id: 'columns',
      title: 'Column by column',
      caption:
        'Column $j$ of $AB$ is $A$ times column $j$ of $B$: the composite sends $\\mathbf{e}_j$ to $\\mathbf{b}_j$, then $A$ moves it. Each column is a matrix times a vector, as in the earlier lesson.',
      check: {
        kind: 'number',
        prompt:
          '$A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 3 \\end{bmatrix}$ and the first column of $B$ is $(1, -1)$. What is the second entry of the first column of $AB$?',
        answer: -3,
        explanation:
          'The first column of $AB$ is $A(1, -1) = 1(2, 0) + (-1)(1, 3) = (1, -3)$, so its second entry is $-3$.',
      },
    },
    {
      id: 'entries',
      title: 'Row times column',
      caption:
        'Read by rows, $A\\mathbf{b}_j$ gives entry $(i, j)$ of $AB$ as row $i$ of $A$ dotted with column $j$ of $B$. With $B$ above and $A$ to the left, the row and the column meet at the entry they make.',
      check: {
        kind: 'number',
        prompt:
          'Row $2$ of $A$ is $(3, -1, 2)$ and column $1$ of $B$ is $(1, 4, 2)$. What is entry $(2, 1)$ of $AB$?',
        answer: 3,
        explanation: '$3 \\cdot 1 + (-1) \\cdot 4 + 2 \\cdot 2 = 3 - 4 + 4 = 3$.',
      },
    },
    {
      id: 'shapes',
      title: 'Shapes',
      caption:
        'An $m \\times n$ matrix times an $n \\times p$ matrix is $m \\times p$. The inner sizes must agree: each row of $A$ has $n$ entries and each column of $B$ has $n$ entries. Change the sizes.',
      check: {
        kind: 'choice',
        prompt: '$A$ is $3 \\times 4$ and $B$ is $4 \\times 2$. What is the shape of $AB$?',
        options: ['$3 \\times 2$', '$4 \\times 4$', '$2 \\times 3$', '$AB$ is not defined'],
        answer: 0,
        explanation:
          'The inner sizes agree ($4$ and $4$), and $AB$ has the rows of $A$ and the columns of $B$: $3 \\times 2$. ($BA$ is not defined: $2 \\ne 3$.)',
      },
    },
    {
      id: 'associativity',
      title: 'Associativity',
      caption:
        'Both $(AB)C$ and $A(BC)$ apply $C$, then $B$, then $A$: the same map, so the same matrix. Products can be grouped either way, and written $ABC$. The order of the factors still matters.',
    },
    {
      id: 'powers',
      title: 'The identity and powers',
      caption:
        '$AI = IA = A$, and $A^k$ is $A$ applied $k$ times. For the rotation $R$ by $45^\\circ$, $R^k$ rotates by $k \\cdot 45^\\circ$, and $R^8 = I$. Move $k$.',
      check: {
        kind: 'number',
        prompt:
          '$R$ rotates the plane by $30^\\circ$. What is the smallest $k \\ge 1$ with $R^k = I$?',
        answer: 12,
        explanation: '$R^k$ rotates by $30k$ degrees, which is a full turn first at $k = 12$.',
      },
    },
    {
      id: 'transpose',
      title: 'The transpose',
      caption:
        'The transpose $A^T$ swaps rows and columns. Folding the whole layout across its diagonal turns $A$ into $A^T$ on top, $B$ into $B^T$ on the left, and $AB$ into $(AB)^T$: so $(AB)^T = B^TA^T$, with the order reversed.',
      check: {
        kind: 'choice',
        prompt: 'Which is $(AB)^T$?',
        options: ['$A^TB^T$', '$B^TA^T$'],
        answer: 1,
        explanation:
          'Entry $(i, j)$ of $(AB)^T$ is entry $(j, i)$ of $AB$: row $j$ of $A$ dotted with column $i$ of $B$, which is row $i$ of $B^T$ dotted with column $j$ of $A^T$.',
      },
    },
    {
      id: 'join',
      title: 'A product as a join',
      caption:
        "Quantities sold (store by product) times price and weight (product by measure) give each store's totals. Stored as rows (store, product, quantity), the zeros are not stored, and the product is a SQL join on the product followed by a sum grouped by store and measure.",
      check: {
        kind: 'number',
        prompt:
          'Store 2 sold $2$ cheeses at $4$ dollars and $5$ bags of rice at $2$ dollars. What is its revenue in dollars?',
        answer: 18,
        explanation:
          'Row 2 of the quantities times the price column: $2 \\cdot 4 + 5 \\cdot 2 = 18$. Apples ($0$ sold) add nothing, and a sparse table does not store them.',
      },
    },
    {
      id: 'layers',
      title: 'Two layers are one',
      caption:
        'Two linear layers in a row compute $W_2(W_1\\mathbf{x}) = (W_2W_1)\\mathbf{x}$: one matrix does the same. Without an activation between them, stacking layers adds nothing a single layer cannot do.',
      check: {
        kind: 'choice',
        prompt:
          'A network applies $W_1$ ($3 \\times 2$) and then $W_2$ ($2 \\times 3$), with no activation. Which single matrix gives the same outputs?',
        options: ['$W_1W_2$, which is $3 \\times 3$', '$W_2W_1$, which is $2 \\times 2$'],
        answer: 1,
        explanation:
          '$W_1$ acts first, so it is on the right: $W_2(W_1\\mathbf{x}) = (W_2W_1)\\mathbf{x}$, and a $2 \\times 3$ times a $3 \\times 2$ is $2 \\times 2$.',
      },
    },
  ],
})
