import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Partitioning, bucketing and hashing',
  description:
    'Splitting a table by key into partitions and buckets, what a query then skips, hash functions, skew, and consistent hashing.',
  order: 2,
  prerequisites: ['data-engineering/storage-and-processing/storage-and-file-formats'],
  skills: [
    {
      id: 'partitioning',
      title: 'Place rows in a partitioned layout and predict which partitions a filter prunes',
    },
    {
      id: 'partition-design',
      title: 'Count partitions and file sizes, and choose partition columns for a table',
    },
    { id: 'hashing', title: 'Assign keys to buckets with a hash, and compare hash and range' },
    { id: 'skew', title: 'Measure the load of each bucket and reduce skew' },
    { id: 'bucketing', title: 'Use bucketed tables to join without moving data' },
    { id: 'consistent-hashing', title: 'Predict which keys move when nodes join or leave' },
  ],
  terms: [
    {
      id: 'table-partition',
      title: 'Partition (of a table)',
      summary:
        'The rows that share the values of the partition columns, stored together, usually in a folder named after them, such as day=3. The partitions split the rows into disjoint parts that hold every row.',
      introducedIn: 'partitioning-by-key',
    },
    {
      id: 'partition-column',
      title: 'Partition column',
      summary:
        'A column whose values decide the partition of each row. Its value is written in the folder path, not in the data files.',
      introducedIn: 'partitioning-by-key',
    },
    {
      id: 'partition-pruning',
      title: 'Partition pruning',
      summary:
        'Skipping whole partitions because their path rules out the filter. It works only for filters on partition columns, and needs no file to be opened.',
      introducedIn: 'partitioning-by-key',
    },
    {
      id: 'small-files',
      title: 'Small files problem',
      summary:
        'Too many partitions, or too many writes, leave many files far below the target size. Each file costs a listing, an open and a footer read, so the overhead outgrows the data.',
      introducedIn: 'sizing-partitions',
    },
    {
      id: 'target-file-size',
      title: 'Target file size',
      tex: 'T',
      summary:
        'The file size a writer aims for, often a few hundred MB to $1$ GB. A partition of $S$ bytes is written as about $\\lceil S / T \\rceil$ files.',
      introducedIn: 'sizing-partitions',
    },
  ],
})
