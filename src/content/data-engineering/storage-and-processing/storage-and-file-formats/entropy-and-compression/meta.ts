import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'lesson',
  title: 'Entropy and compression',
  summary:
    'How small can a column get? Information measures the surprise of one value, entropy averages it over the column, and that average is the floor for any code that writes values one at a time. Order and cardinality decide how close real encodings get.',
  tags: ['entropy', 'information', 'compression', 'Huffman', 'codec', 'Zstd', 'Snappy'],
  level: 'core',
  order: 5,
  skills: ['compression', 'encoding'],
  steps: [
    {
      id: 'information',
      title: 'Information is surprise',
      caption:
        'In the city column Lisbon has probability $\\frac{3}{8}$ and Tokyo $\\frac{1}{8}$. A value of probability $p$ carries $\\log_2 \\frac{1}{p}$ bits of information: rare values carry more.',
      check: {
        kind: 'number',
        prompt: 'How many bits of information does a value with probability $\\frac{1}{32}$ carry?',
        answer: 5,
        explanation:
          '$\\log_2 32 = 5$: it is as surprising as five fair coin flips coming up a given way.',
      },
    },
    {
      id: 'entropy',
      title: 'Entropy is the average',
      caption:
        'Weight each value by how often it occurs: $H = \\sum p \\log_2 \\frac{1}{p} \\approx 1.91$ bits. No code that writes values one at a time averages fewer bits. Bit packing uses $2$.',
      check: {
        kind: 'number',
        prompt:
          'At least how many bits does such a code need for all $16$ values? Give one decimal place.',
        answer: 30.5,
        tolerance: 0.06,
        explanation:
          '$16 \\cdot H = 16 \\cdot 1.906 \\approx 30.5$ bits, against $16 \\cdot 2 = 32$ for bit packing.',
      },
    },
    {
      id: 'uniform',
      title: 'Equal values carry the most',
      caption:
        'When all $d$ values are equally likely, every value carries $\\log_2 d$ bits and $H = \\log_2 d$, the largest entropy $d$ values can have. Here bit packing is already optimal.',
      check: {
        kind: 'number',
        prompt: 'What is the entropy of a column where $256$ values are equally likely?',
        answer: 8,
        explanation: '$H = \\log_2 256 = 8$ bits: one byte per value, and no code does better.',
      },
    },
    {
      id: 'skewed',
      title: 'Short codes for common values',
      caption:
        'With probabilities $\\frac{1}{2}, \\frac{1}{4}, \\frac{1}{8}, \\frac{1}{8}$ the entropy drops to $1.75$ bits. The codes $0$, $10$, $110$, $111$ give each value $\\log_2 \\frac{1}{p}$ bits and reach it exactly, as a Huffman code does.',
      check: {
        kind: 'number',
        prompt: 'What is the average length of these codes, in bits per value?',
        answer: 1.75,
        explanation:
          '$\\frac{1}{2} \\cdot 1 + \\frac{1}{4} \\cdot 2 + \\frac{1}{8} \\cdot 3 + \\frac{1}{8} \\cdot 3 = 1.75$. No code is shorter on average, because the lengths equal the information.',
      },
    },
    {
      id: 'order',
      title: 'Order is not counted',
      caption:
        'Entropy counts how often values occur, so sorting does not change it. Run-length encoding uses the order: sorted, the column is $4$ pairs of about $5$ bits, $20$ bits against $16 \\cdot H \\approx 30.5$, because neighbors are no longer independent.',
      check: {
        kind: 'choice',
        prompt: 'After sorting the city column, what is the entropy of its values?',
        options: [
          'Still about $1.91$ bits',
          '$0$ bits, since it is sorted',
          '$2$ bits',
          'About $0.25$ bits, $4$ runs for $16$ values',
        ],
        answer: 0,
        explanation:
          'Sorting keeps the counts $6, 4, 4, 2$, so $H$ is unchanged. Encodings that model order, such as run-length and delta, are what profit from it.',
      },
    },
    {
      id: 'cardinality',
      title: 'Unique values',
      caption:
        'A column of $n$ unique ids has $d = n$ and $H = \\log_2 n$: about $20$ bits per value for a million rows, and a dictionary as large as the column. Only order helps here, through deltas.',
      check: {
        kind: 'number',
        prompt: 'What is the entropy of a column of $2^{20}$ distinct values, each appearing once?',
        answer: 20,
        explanation:
          'Each value has probability $2^{-20}$, so it carries $20$ bits, and so does the average.',
      },
    },
    {
      id: 'codecs',
      title: 'Codecs on top',
      caption:
        'Formats encode each column first, then run a general codec (Snappy, LZ4, Zstd, gzip) over the encoded pages to remove the repetition that is left. The compression ratio is the plain size over the stored size.',
      check: {
        kind: 'number',
        prompt:
          'The city column goes from $86$ bytes of text to $25$ bytes with a dictionary and bit packing. What is the compression ratio? Give two decimal places.',
        answer: 3.44,
        tolerance: 0.006,
        explanation: '$86 / 25 = 3.44$: the encoded column is $3.44$ times smaller.',
      },
    },
  ],
})
