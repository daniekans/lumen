import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Anatomy of a Parquet file',
  summary:
    'A Parquet file cuts a table into row groups, stores each column of a row group as a column chunk made of pages, and ends with a footer of statistics. A reader uses the footer to skip the row groups a filter rules out.',
  tags: [
    'Parquet',
    'row group',
    'column chunk',
    'page',
    'footer',
    'statistics',
    'predicate pushdown',
  ],
  level: 'core',
  order: 7,
  skills: ['parquet', 'scan-cost'],
  steps: [
    {
      id: 'table',
      title: 'A table to write',
      caption:
        'A table of $24$ sales with the columns day, city and amount. A Parquet file stores it so that a reader can fetch a few columns of a few rows without reading the rest.',
    },
    {
      id: 'row-groups',
      title: 'Row groups',
      caption:
        'First the rows are cut into row groups, here $4$ groups of $6$ rows. Real row groups hold tens or hundreds of megabytes, often a million rows or more.',
    },
    {
      id: 'column-chunks',
      title: 'Column chunks',
      caption:
        'Inside a row group each column is written as one column chunk, all its values together. The file is columnar within each row group: $4$ groups of $3$ columns make $12$ chunks.',
    },
    {
      id: 'pages',
      title: 'Pages',
      caption:
        'Each chunk is split into pages, here $3$ values each, often about $1$ MB in practice. A page is the unit that is encoded and compressed, and a dictionary-encoded chunk starts with a dictionary page.',
    },
    {
      id: 'footer',
      title: 'The footer',
      caption:
        'The footer, at the end of the file, holds the schema, where every column chunk starts, and statistics for each chunk: its min, max and number of NULLs. A reader reads the footer first.',
    },
    {
      id: 'projection',
      title: 'Projection',
      caption:
        'SELECT SUM(amount) needs one column, and the footer says where its chunks are. The reader fetches those $4$ chunks, $8$ of the $24$ pages, and nothing else.',
    },
    {
      id: 'pushdown',
      title: 'Predicate pushdown',
      caption:
        'Add WHERE day = $t$. A row group whose day range does not contain $t$ cannot match, so the reader skips it. Here every range is wide, so $t = 12$ skips nothing and the query reads $16$ pages. Drag $t$.',
    },
    {
      id: 'sorted',
      title: 'Sorting tightens the ranges',
      caption:
        'Sort the rows by day before writing. Each row group now covers a narrow range of days, and day = $12$ reads one row group: $4$ pages instead of $16$. Some days, such as $7$, read nothing.',
    },
  ],
})
