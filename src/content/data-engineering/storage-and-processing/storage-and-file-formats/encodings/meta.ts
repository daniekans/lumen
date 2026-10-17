import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Encodings',
  summary:
    'A column holds values of one type, often repeated or close together. Dictionary codes, bit packing, run-length and delta encodings use that to store the same column in far fewer bytes.',
  tags: ['encoding', 'dictionary', 'bit packing', 'run-length', 'RLE', 'delta', 'Parquet'],
  level: 'core',
  order: 4,
  skills: ['encoding'],
  steps: [
    {
      id: 'plain',
      title: 'A column as text',
      caption:
        'A column of $16$ cities, stored as plain text, takes $86$ bytes. Only $d = 4$ different values appear in it.',
    },
    {
      id: 'dictionary',
      title: 'Dictionary codes',
      caption:
        'Write each distinct value once, in a dictionary, and replace every value with its position there: a code from $0$ to $3$. With one byte per code the column takes $21 + 16 = 37$ bytes.',
    },
    {
      id: 'bit-packing',
      title: 'Bit packing',
      caption:
        'Codes from $0$ to $d - 1$ need only $\\lceil \\log_2 d \\rceil$ bits, here $2$, so the $16$ codes fit in $4$ bytes. Drag $d$: each doubling of $d$ adds one bit.',
    },
    {
      id: 'runs',
      title: 'Runs',
      caption:
        'A run is a stretch of equal neighbors. Run-length encoding stores each run once, as a value and a count. In this order the column has $15$ runs, almost one per value, so it gains nothing.',
    },
    {
      id: 'sorted',
      title: 'Sorting makes runs',
      caption:
        'Sorted, the column has one run per distinct value: $4$ pairs describe all $16$ values. Parquet writes dictionary codes with a mix of run-length and bit packing, so sorted columns shrink the most.',
    },
    {
      id: 'delta',
      title: 'Deltas',
      caption:
        'Timestamps are large numbers, $64$ bits each, but close to their neighbors. Delta encoding stores the first value, then each difference: here at most $7$, which fits in $3$ bits.',
    },
  ],
})
