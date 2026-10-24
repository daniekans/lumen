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
    {
      id: 'hash-function',
      title: 'Hash function',
      tex: 'h',
      summary:
        'A function that maps a key to a number in a fixed range, such as $0$ to $2^{32} - 1$, the same number for the same key and unrelated numbers for neighboring keys. Murmur3 is common in data engines.',
      introducedIn: 'hash-partitioning',
    },
    {
      id: 'hash-partitioning',
      title: 'Hash partitioning',
      summary:
        'Splitting rows into $n$ buckets by $h(k) \\bmod n$ of a key $k$. All rows of a key land in one bucket, and the buckets are even on average when there are many keys.',
      introducedIn: 'hash-partitioning',
    },
    {
      id: 'range-partitioning',
      title: 'Range partitioning',
      summary:
        'Splitting rows by intervals of a sorted key, such as ids $1$ to $1000$, $1001$ to $2000$. Neighboring keys stay together, so range filters read few parts, but growing keys all land in the last range.',
      introducedIn: 'hash-partitioning',
    },
    {
      id: 'data-skew',
      title: 'Skew',
      summary:
        'Uneven loads across partitions or tasks, measured by the skew ratio $\\max_j L_j / (N / n)$, the largest load over the mean. A stage takes about that many times longer than an even split.',
      introducedIn: 'skew',
    },
    {
      id: 'hot-key',
      title: 'Hot key',
      summary:
        'A key with a large share $p$ of the rows. All its rows land in one bucket, so the skew ratio is at least $pn$ for any hash, and more buckets make it worse.',
      introducedIn: 'skew',
    },
    {
      id: 'salting',
      title: 'Salting',
      summary:
        'Splitting a hot key into $S$ keys by pairing each row with a salt from $0$ to $S - 1$. Its rows spread over up to $S$ buckets; a join copies the other side of the key $S$ times.',
      introducedIn: 'skew',
    },
    {
      id: 'shuffle',
      title: 'Shuffle',
      summary:
        'Moving rows between workers so that rows with the same key end up together, usually to the worker of $h(k) \\bmod n$. Joins and aggregations on unbucketed data need one, and it is often the most expensive step.',
      introducedIn: 'bucketed-joins',
    },
    {
      id: 'bucketing',
      title: 'Bucketing (bucketed table)',
      summary:
        'Storing a table hash partitioned on a key into a fixed number of buckets, each in its own files. Tables bucketed alike on the join key join bucket $k$ with bucket $k$, with no shuffle.',
      introducedIn: 'bucketed-joins',
    },
    {
      id: 'rehashing',
      title: 'Rehashing',
      summary:
        'Moving keys to new buckets after the bucket count changes. With $h \\bmod n$, going from $n$ to $n + 1$ buckets moves $\\frac{n}{n + 1}$ of the keys; doubling moves half.',
      introducedIn: 'rehashing',
    },
    {
      id: 'consistent-hashing',
      title: 'Consistent hashing',
      summary:
        'Placing keys and nodes on a hash ring and giving each key to the next node clockwise. A node that joins or leaves moves only the keys of one arc, about $\\frac{1}{n + 1}$ of them.',
      introducedIn: 'consistent-hashing',
    },
    {
      id: 'hash-ring',
      title: 'Hash ring',
      summary:
        'The range of a hash, $0$ to $2^{32} - 1$, bent into a circle so that the largest value is next to $0$. Each node owns the arc that ends at its point.',
      introducedIn: 'consistent-hashing',
    },
    {
      id: 'virtual-node',
      title: 'Virtual node',
      summary:
        'One of $V$ points a node gets on a hash ring, by hashing its name with a suffix. A node owns many short arcs, so shares even out and a joining node draws keys from many nodes.',
      introducedIn: 'consistent-hashing',
    },
  ],
})
