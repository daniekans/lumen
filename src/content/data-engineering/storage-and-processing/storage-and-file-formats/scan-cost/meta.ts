import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'What a scan costs',
  summary:
    'Draw a table as a rectangle, rows down and bytes across. A layout cuts it into pages, a query marks a region, and the cost is the number of pages the region touches.',
  tags: ['page', 'scan', 'projection', 'row store', 'column store', 'cost model', 'I/O'],
  level: 'core',
  order: 2,
  skills: ['layouts', 'scan-cost'],
  steps: [
    {
      id: 'area',
      title: 'A table is an area',
      caption:
        'Put the $N = 64$ rows down the side and the bytes of a row across: columns of widths $8, 8, 4, 8, 36$ make a row of $W = 64$ bytes. The table is an $N \\times W$ rectangle.',
      check: {
        kind: 'number',
        prompt: 'How many bytes does the table hold?',
        answer: 4096,
        explanation: '$N \\cdot W = 64 \\cdot 64 = 4096$ bytes, the area of the rectangle.',
      },
    },
    {
      id: 'row-pages',
      title: 'A row layout cuts across',
      caption:
        'Storage is read in pages of $P = 256$ bytes. Rows back to back fill each page with $256 / 64 = 4$ whole rows, so the pages are horizontal strips: $16$ of them.',
    },
    {
      id: 'row-query',
      title: 'A query is a region',
      caption:
        "SUM(amount) WHERE geo = 'PT' needs two columns of every row: two vertical bands. Every strip crosses them, so the row layout reads all $16$ pages.",
      check: {
        kind: 'number',
        prompt: 'How many bytes does the row layout read for this query?',
        answer: 4096,
        explanation:
          'Every page is touched, so the whole table is read: $16 \\cdot 256 = 4096$ bytes, to use $64 \\cdot 12 = 768$ of them.',
      },
    },
    {
      id: 'column-pages',
      title: 'A column layout cuts down',
      caption:
        'Here each column is stored on its own pages. A column of width $w$ needs $\\lceil N w / P \\rceil$ pages: $2, 2, 1, 2, 9$. Still $16$ pages in all, cut the other way.',
    },
    {
      id: 'column-query',
      title: 'The same region, fewer pages',
      caption:
        'The two bands now cover their own pages only. The scan reads the pages of geo and amount and nothing else.',
      check: {
        kind: 'number',
        prompt: 'How many pages does the column layout read?',
        answer: 3,
        explanation:
          '$\\lceil 64 \\cdot 4 / 256 \\rceil + \\lceil 64 \\cdot 8 / 256 \\rceil = 1 + 2 = 3$ pages, $768$ bytes: exactly the bytes the query uses.',
      },
    },
    {
      id: 'lookup',
      title: 'A single row is a thin strip',
      caption:
        'Fetching row $41$ with every column, when an index gives its position, is a horizontal line. It meets one strip in the row layout, and one page of every column in the column layout.',
      check: {
        kind: 'number',
        prompt: 'How many pages does the column layout read for this row?',
        answer: 5,
        explanation:
          'The line crosses each of the $5$ columns once, in a different page each time. The row layout reads $1$ page.',
      },
    },
    {
      id: 'wide',
      title: 'Wide tables',
      caption:
        'Analytical tables are wide and queries are narrow. With $200$ columns of $8$ bytes, a query that uses $3$ columns reads a sliver of a column layout and the whole of a row layout.',
      check: {
        kind: 'number',
        prompt: "What percentage of the row layout's bytes does the column layout read?",
        answer: 1.5,
        tolerance: 0.01,
        explanation:
          '$\\frac{3 \\cdot 8}{200 \\cdot 8} = \\frac{3}{200} = 1.5\\%$, whatever the number of rows. The row layout reads $100\\%$.',
      },
    },
  ],
})
