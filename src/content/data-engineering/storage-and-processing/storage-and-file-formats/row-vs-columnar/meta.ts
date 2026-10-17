import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Rows or columns',
  summary:
    'Storage is one long sequence of bytes read in pages, so a table has to be written in some order. Row by row suits fetching and inserting whole rows; column by column suits reading a few columns of many rows.',
  tags: ['row store', 'column store', 'columnar', 'page', 'OLTP', 'OLAP', 'layout'],
  level: 'core',
  order: 1,
  skills: ['layouts'],
  steps: [
    {
      id: 'table',
      title: 'A table has no order on disk yet',
      caption:
        'A disk or a file is one sequence of bytes, read a page at a time. To store these $32$ values they have to go in some order. Here a page holds $4$ values.',
    },
    {
      id: 'row-layout',
      title: 'Row by row',
      caption:
        'A row layout writes the values of row 1, then row 2, and so on. With $4$ columns, each page holds exactly one row.',
    },
    {
      id: 'row-scan',
      title: 'Summing one column',
      caption:
        'SUM(total) needs one value from every row, so it touches all $8$ pages. Three quarters of the bytes it reads are columns it never uses.',
    },
    {
      id: 'column-layout',
      title: 'Column by column',
      caption:
        'A column layout writes every id, then every day, then every city, then every total. Each column fills $2$ pages.',
    },
    {
      id: 'column-scan',
      title: 'Read only the named columns',
      caption:
        'The same sum now reads $2$ pages instead of $8$. Switch the layout to compare. The values in a page also share one type, which helps compression later in the unit.',
    },
    {
      id: 'lookup',
      title: 'Fetching one row',
      caption:
        'SELECT * for id $6$ needs one whole row. A row layout finds it in $1$ page; a column layout reads one page per column, $4$ in all.',
    },
    {
      id: 'insert',
      title: 'Adding a row',
      caption:
        'A new row is one new page in a row layout, but a column layout writes into $4$ places, one per column. Transactional systems store rows; analytical engines store columns and load data in large batches.',
    },
  ],
})
