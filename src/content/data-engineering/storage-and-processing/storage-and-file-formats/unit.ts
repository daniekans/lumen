import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: 'Storage and file formats',
  description:
    'Row and column layouts, the pages a query reads, encodings and compression, and the anatomy of a Parquet file.',
  order: 1,
  prerequisites: [
    'data-engineering/relational-foundations/relational-model-and-joins',
    'mathematics/pre-calculus/exponential-and-logarithmic',
  ],
  skills: [
    {
      id: 'layouts',
      title: 'Place values in row and column layouts and match a layout to a workload',
    },
    { id: 'scan-cost', title: 'Count the bytes and pages a query reads' },
    { id: 'encoding', title: 'Size dictionary, bit-packed, run-length and delta encodings' },
    { id: 'compression', title: 'Relate entropy, order and cardinality to compression' },
    { id: 'parquet', title: 'Read a Parquet layout and predict what predicate pushdown skips' },
  ],
  terms: [
    {
      id: 'page',
      title: 'Page',
      summary:
        'The fixed-size block in which storage is read and written. Values that are neighbors in the byte sequence share a page, so a query costs about the pages it touches.',
      introducedIn: 'row-vs-columnar',
    },
    {
      id: 'row-layout',
      title: 'Row layout',
      tex: 'iC + j',
      summary:
        'Rows stored back to back (row-major order). Cheap for reading or writing whole rows, as transactional databases do; a scan of one column still reads every page.',
      introducedIn: 'row-vs-columnar',
    },
    {
      id: 'columnar-layout',
      title: 'Column layout',
      tex: 'jN + i',
      summary:
        'Each column stored on its own pages (column-major order). A scan reads only the columns it uses; one whole row touches $C$ places.',
      introducedIn: 'row-vs-columnar',
    },
    {
      id: 'encoding',
      title: 'Encoding',
      summary:
        'A lossless way of writing a column that uses its structure, such as repeated values or sorted numbers. The original values can always be read back.',
      introducedIn: 'encodings',
    },
    {
      id: 'dictionary-encoding',
      title: 'Dictionary encoding',
      summary:
        'List the $d$ distinct values once and replace each value with its position in that list.',
      introducedIn: 'encodings',
    },
    {
      id: 'bit-packing',
      title: 'Bit packing',
      tex: 'b = \\lceil \\log_2 d \\rceil',
      summary:
        'Writing codes from $0$ to $d - 1$ back to back with $b = \\lceil \\log_2 d \\rceil$ bits each, since $b$ bits can write $2^b$ numbers.',
      introducedIn: 'encodings',
    },
    {
      id: 'run-length-encoding',
      title: 'Run-length encoding',
      summary:
        'Storing each run, a maximal stretch of equal neighbors, as a pair (value, count). Sorted, a column with $d$ distinct values has exactly $d$ runs.',
      introducedIn: 'encodings',
    },
    {
      id: 'delta-encoding',
      title: 'Delta encoding',
      tex: '\\Delta_i = x_i - x_{i - 1}',
      summary:
        'Storing the first value and then the differences between neighbors. With largest difference $m$, each fits in $\\lceil \\log_2 (m + 1) \\rceil$ bits.',
      introducedIn: 'encodings',
    },
    {
      id: 'information-content',
      title: 'Information',
      tex: 'I = \\log_2 \\frac{1}{p}',
      summary:
        'The bits carried by a value that occurs with probability $p$. Rare values carry more: probability $\\frac{1}{8}$ gives $3$ bits.',
      introducedIn: 'entropy-and-compression',
    },
    {
      id: 'entropy',
      title: 'Entropy',
      tex: 'H = \\sum_k p_k \\log_2 \\frac{1}{p_k}',
      summary:
        'The average information of a value. No code that writes each value as its own bit string averages fewer than $H$ bits per value; $H \\leq \\log_2 d$, with equality when all $d$ values are equally likely.',
      introducedIn: 'entropy-and-compression',
    },
    {
      id: 'huffman-coding',
      title: 'Huffman coding',
      summary:
        'A code that gives common values short bit strings and rare values long ones. It stays within one bit of the entropy per value.',
      introducedIn: 'entropy-and-compression',
    },
    {
      id: 'column-cardinality',
      title: 'Cardinality of a column',
      summary:
        'The number of distinct values in a column. High cardinality raises the entropy and makes dictionaries as large as the column.',
      introducedIn: 'entropy-and-compression',
    },
    {
      id: 'codec',
      title: 'Compression codec',
      summary:
        'A general-purpose compressor applied to each page after encoding, such as Snappy and LZ4 (speed) or Zstd and gzip (size).',
      introducedIn: 'entropy-and-compression',
    },
    {
      id: 'compression-ratio',
      title: 'Compression ratio',
      tex: '\\frac{\\text{plain size}}{\\text{stored size}}',
      summary:
        'Plain size divided by stored size. Low cardinality and sorted data give high ratios.',
      introducedIn: 'entropy-and-compression',
    },
    {
      id: 'row-group',
      title: 'Row group',
      tex: 'G = \\left\\lceil \\frac{N}{R} \\right\\rceil',
      summary:
        'A horizontal slice of $R$ rows in a Parquet file. Row $i$, counted from $0$, is in row group $\\lfloor i / R \\rfloor$.',
      introducedIn: 'parquet-anatomy',
    },
    {
      id: 'column-chunk',
      title: 'Column chunk',
      summary:
        'The values of one column inside one row group, stored as a sequence of pages. A file has $G \\cdot C$ of them.',
      introducedIn: 'parquet-anatomy',
    },
    {
      id: 'parquet-footer',
      title: 'Parquet footer',
      summary:
        'Metadata at the end of a Parquet file: the schema, the offset of every column chunk, and per chunk the minimum, maximum and NULL count.',
      introducedIn: 'parquet-anatomy',
    },
    {
      id: 'predicate-pushdown',
      title: 'Predicate pushdown',
      summary:
        'Checking a filter against footer statistics before reading a row group. For `x = v` the group is skipped when $v < \\min$ or $v > \\max$.',
      introducedIn: 'parquet-anatomy',
    },
  ],
})
