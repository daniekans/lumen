import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Partitioning by a key',
  summary:
    'Split a table into folders by the value of a column, and a filter on that column reads one folder and skips the rest without opening them. Filters on other columns still read everything.',
  tags: ['partition', 'partition pruning', 'Hive layout', 'folder', 'data lake', 'set partition'],
  level: 'core',
  order: 1,
  skills: ['partitioning'],
  steps: [
    {
      id: 'table',
      title: 'One file',
      caption:
        'A sales table of $24$ rows in one file. A query for one day has to read the whole file to find its rows, even with Parquet statistics when the days are mixed.',
    },
    {
      id: 'partition',
      title: 'Split by day',
      caption:
        'Partition the table by day: each row goes to the folder of its day, day=1 to day=4. Every row lands in exactly one folder, so the folders split the rows into disjoint parts.',
    },
    {
      id: 'path',
      title: 'The value moves into the path',
      caption:
        'Inside day=2 every row has day $2$, so the files do not store the column. The folder name holds it, and a reader adds it back from the path.',
    },
    {
      id: 'prune',
      title: 'Partition pruning',
      caption:
        'WHERE day = $t$. The engine compares the filter with the folder names and reads one folder; the other three are never opened. Drag $t$.',
    },
    {
      id: 'other-column',
      title: 'A filter on another column',
      caption:
        "WHERE city = 'OSL'. Folder names say nothing about the city, so every folder is read. Partitioning helps only the filters on its columns.",
    },
    {
      id: 'two-levels',
      title: 'Day, then city',
      caption:
        "Partition by day and then by city: day=2/city=OSL. Now WHERE city = 'OSL' reads one subfolder per day, $4$ of $12$, and a filter on both reads one.",
    },
    {
      id: 'small-files',
      title: 'Finer is not free',
      caption:
        '$12$ folders for $24$ rows: two rows per file. Each file costs a listing, an open and a footer read, so a layout with tiny files spends its time on overhead. The next item sizes partitions.',
    },
  ],
})
