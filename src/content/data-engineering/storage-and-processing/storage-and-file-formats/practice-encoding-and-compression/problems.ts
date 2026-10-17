import { defineProblems, inlineCode, tex, type Rng } from '@/lib/practice'
import {
  bitsFor,
  codeBits,
  deltaEncode,
  entropy,
  information,
  packedBytes,
  runLengths,
} from '@/lib/storage'

/** Text columns of a fixed width in bytes, with a plausible range of distinct values. */
const TEXT_COLUMNS = [
  { name: 'country', width: 2, d: [20, 200] },
  { name: 'currency', width: 3, d: [10, 150] },
  { name: 'city', width: 16, d: [50, 3000] },
  { name: 'product_code', width: 12, d: [100, 5000] },
] as const

const pickColumn = (rng: Rng) => {
  const k = rng.int(0, TEXT_COLUMNS.length - 1)
  const col = TEXT_COLUMNS[k]!
  return { ...col, d: rng.int(col.d[0], col.d[1]) }
}

const STATUSES = ['paid', 'open', 'void', 'held'] as const

/** A sequence of statuses with some repeated neighbors. */
const statusSequence = (rng: Rng, length: number, kinds: number) => {
  const seq = [rng.int(0, kinds - 1)]
  while (seq.length < length) seq.push(rng.int(0, 2) === 0 ? rng.int(0, kinds - 1) : seq.at(-1)!)
  return seq
}

const seqData = (seq: readonly number[]) =>
  Object.fromEntries(seq.map((v, i) => [`s${i}`, v])) as Record<string, number>

const ENCODINGS = ['Dictionary', 'Run-length', 'Delta', 'None: store it plain'] as const

const COLUMN_CASES = [
  {
    text: `a ${inlineCode('country')} column with about $200$ distinct values, in no particular order`,
    best: 0,
    why: 'Few distinct values in random order: each value becomes an $8$ bit code instead of the text, but there are no long runs and the values are not numbers that climb.',
  },
  {
    text: `an ${inlineCode('event_time')} column of timestamps, sorted, a few milliseconds apart`,
    best: 2,
    why: 'Sorted numbers close together: the differences are small, so each needs only a few bits.',
  },
  {
    text: `a ${inlineCode('status')} column with $3$ values, sorted by status`,
    best: 1,
    why: 'Sorted, the column is $3$ runs: three (value, count) pairs describe every row.',
  },
  {
    text: `a ${inlineCode('session_token')} column of random $32$ character strings, all distinct`,
    best: 3,
    why: 'Every value is new and random: a dictionary would be as large as the column, there are no runs, and strings have no differences to take.',
  },
  {
    text: `an ${inlineCode('order_id')} column filled by an auto-increment counter, in insert order`,
    best: 2,
    why: 'Consecutive integers: every difference is $1$, so the deltas take almost no space.',
  },
] as const

const fixed = (v: number, places: number) => v.toFixed(places)

export const problems = defineProblems([
  {
    id: 'code-bits',
    title: 'Bits per code',
    skills: ['encoding'],
    difficulty: 1,
    generate: (rng) => {
      const d = rng.bool() ? rng.int(3, 300) : rng.int(300, 70000)
      const b = codeBits(d)
      return {
        prompt: `A column has $${d}$ distinct values. Each value is replaced by a dictionary code from $0$ to $${d - 1}$, and the codes are bit-packed. How many bits does each code take?`,
        answer: { kind: 'number', value: b },
        hints: [
          '$b$ bits can write $2^b$ different numbers.',
          'Find the smallest $b$ with $2^b \\geq d$, that is $\\lceil \\log_2 d \\rceil$.',
        ],
        solution: [
          `$2^{${b - 1}} = ${2 ** (b - 1)} < ${d} \\leq 2^{${b}} = ${2 ** b}$.`,
          `So $\\lceil \\log_2 ${d} \\rceil = ${b}$ bits per code.`,
        ],
        data: { d },
      }
    },
  },
  {
    id: 'dictionary-size',
    title: 'Size with a dictionary',
    skills: ['encoding'],
    difficulty: 2,
    generate: (rng) => {
      const col = pickColumn(rng)
      const n = rng.int(1, 200) * 1000
      const b = codeBits(col.d)
      const dictBytes = col.d * col.width
      const codeBytes = packedBytes(n, b)
      const value = dictBytes + codeBytes
      return {
        prompt: `The column ${inlineCode(col.name)} has $${n}$ rows of $${col.width}$ byte text values, $${col.d}$ of them distinct. It is stored as a dictionary of the distinct values plus one bit-packed code per row. How many bytes does it take?`,
        answer: { kind: 'number', value },
        hints: [
          'The dictionary holds each distinct value once.',
          `Each code takes $\\lceil \\log_2 ${col.d} \\rceil$ bits; there is one code per row.`,
        ],
        solution: [
          `Dictionary: $${col.d} \\cdot ${col.width} = ${dictBytes}$ bytes.`,
          `Codes: $\\lceil \\log_2 ${col.d} \\rceil = ${b}$ bits, so $\\frac{${n} \\cdot ${b}}{8} = ${codeBytes}$ bytes.`,
          `In all: $${dictBytes} + ${codeBytes} = ${value}$ bytes, against $${n * col.width}$ stored plain.`,
        ],
        data: { n, d: col.d, w: col.width },
      }
    },
  },
  {
    id: 'compression-ratio',
    title: 'Compression ratio',
    skills: ['encoding', 'compression'],
    difficulty: 2,
    generate: (rng) => {
      const col = pickColumn(rng)
      const n = rng.int(10, 500) * 1000
      const b = codeBits(col.d)
      const plain = n * col.width
      const stored = col.d * col.width + packedBytes(n, b)
      const value = plain / stored
      return {
        prompt: `The column ${inlineCode(col.name)} has $${n}$ rows of $${col.width}$ byte values with $${col.d}$ distinct. Dictionary encoding with bit-packed codes replaces the plain values. What is the compression ratio, plain size over stored size? Give two decimal places.`,
        answer: { kind: 'number', value, tolerance: 0.006 },
        hints: [
          'Plain: one full value per row. Stored: the dictionary plus one code per row.',
          'Codes take $\\lceil \\log_2 d \\rceil$ bits each.',
        ],
        solution: [
          `Plain: $${n} \\cdot ${col.width} = ${plain}$ bytes.`,
          `Stored: $${col.d} \\cdot ${col.width} + \\frac{${n} \\cdot ${b}}{8} = ${col.d * col.width} + ${packedBytes(n, b)} = ${stored}$ bytes.`,
          `Ratio: $\\frac{${plain}}{${stored}} \\approx ${fixed(value, 2)}$.`,
        ],
        data: { n, d: col.d, w: col.width },
      }
    },
  },
  {
    id: 'run-count',
    title: 'Counting runs',
    skills: ['encoding'],
    difficulty: 1,
    generate: (rng) => {
      const kinds = rng.int(2, 4)
      const seq = statusSequence(rng, rng.int(10, 14), kinds)
      const sorted = rng.int(0, 2) === 0
      const runs = runLengths(seq)
      const distinct = new Set(seq).size
      const value = sorted ? distinct : runs.length
      const shown = seq.map((s) => STATUSES[s]).join(', ')
      return {
        prompt: sorted
          ? `A column holds ${inlineCode(shown)}. After sorting it, how many runs does run-length encoding store?`
          : `A column holds, in this order, ${inlineCode(shown)}. How many runs does run-length encoding store?`,
        answer: { kind: 'number', value },
        hints: sorted
          ? ['Sorting puts equal values next to each other.']
          : [
              'A run is a maximal stretch of equal neighbors. A new run starts wherever a value differs from the one before it.',
            ],
        solution: sorted
          ? [
              `Sorted, each distinct value forms one run. The column has $${distinct}$ distinct values, so $${distinct}$ runs.`,
            ]
          : [
              `The runs are ${runs.map((r) => `${STATUSES[r.value]} $\\times ${r.length}$`).join(', ')}.`,
              `That is $${runs.length}$ runs for $${seq.length}$ values.`,
            ],
        data: { length: seq.length, sorted: sorted ? 1 : 0, ...seqData(seq) },
      }
    },
  },
  {
    id: 'rle-size',
    title: 'Run-length size',
    skills: ['encoding'],
    difficulty: 1,
    generate: (rng) => {
      const n = rng.int(1, 50) * 100000
      const d = rng.int(3, 40)
      const v = rng.pick([1, 2, 4, 8])
      const value = d * (v + 4)
      return {
        prompt: `A column of $${n}$ rows holds $${d}$ distinct values of $${v}$ byte${v > 1 ? 's' : ''} each. It is sorted, then run-length encoded, each run stored as the value plus a $4$ byte count. How many bytes does it take?`,
        answer: { kind: 'number', value },
        hints: ['How many runs does a sorted column have?'],
        solution: [
          `Sorted, the column has one run per distinct value: $${d}$ runs.`,
          `Each run takes $${v} + 4 = ${v + 4}$ bytes, so $${d} \\cdot ${v + 4} = ${value}$ bytes, against $${n * v}$ plain.`,
        ],
        data: { n, d, v },
      }
    },
  },
  {
    id: 'delta-bits',
    title: 'Bits per delta',
    skills: ['encoding'],
    difficulty: 2,
    generate: (rng) => {
      const start = 1760000000 + rng.int(0, 9999) * 1000
      const top = rng.pick([3, 7, 15, 31, 63, 100, 250])
      const steps = Array.from({ length: 5 }, () => rng.int(0, top))
      const ts = steps.reduce((acc, s) => [...acc, acc.at(-1)! + s], [start])
      const deltas = deltaEncode(ts).slice(1)
      const max = Math.max(...deltas)
      const b = bitsFor(max)
      return {
        prompt: `A sorted column of timestamps in seconds holds ${inlineCode(ts.join(', '))}. Delta encoding keeps the first value and bit-packs the differences, all with the same width, just large enough for the biggest one. How many bits does each difference take?`,
        answer: { kind: 'number', value: b },
        hints: [
          'Subtract each value from the next one.',
          'Numbers from $0$ to $m$ need $\\lceil \\log_2 (m + 1) \\rceil$ bits.',
        ],
        solution: [
          `The differences are $${deltas.join(', ')}$; the largest is $${max}$.`,
          max === 0
            ? 'All differences are $0$, which needs no bits at all.'
            : `$2^{${b - 1}} = ${2 ** (b - 1)} \\leq ${max} < 2^{${b}} = ${2 ** b}$, so $${b}$ bits.`,
        ],
        data: Object.fromEntries(ts.map((t, i) => [`t${i}`, t])),
      }
    },
  },
  {
    id: 'information',
    title: 'Information of a value',
    skills: ['compression'],
    difficulty: 1,
    generate: (rng) => {
      const t = rng.int(8, 14)
      const j = rng.int(0, t - 2)
      const total = 2 ** t
      const c = 2 ** j
      const value = information(c / total)
      const status = rng.pick(['refunded', 'disputed', 'expired', 'pending'])
      return {
        prompt: `In a column of $${total}$ rows, the value ${inlineCode(status)} appears $${c}$ time${c > 1 ? 's' : ''}. How many bits of information does one occurrence of it carry?`,
        answer: { kind: 'number', value },
        hints: ['Find its probability $p$ first.', 'Information is $\\log_2 \\frac{1}{p}$ bits.'],
        solution: [
          `$p = \\frac{${c}}{${total}} = \\frac{1}{${total / c}}$.`,
          `$\\log_2 ${total / c} = ${value}$ bits.`,
        ],
        data: { total, c },
      }
    },
  },
  {
    id: 'entropy',
    title: 'Entropy of a column',
    skills: ['compression'],
    difficulty: 2,
    generate: (rng) => {
      const k = rng.int(2, 4)
      const total = rng.pick([8, 16])
      // k positive counts that add up to total.
      const cuts = rng
        .shuffle(Array.from({ length: total - 1 }, (_, i) => i + 1))
        .slice(0, k - 1)
        .sort((a, b) => a - b)
      const counts = [...cuts, total].map((c, i) => c - ([0, ...cuts][i] ?? 0))
      const value = entropy(counts)
      const names = STATUSES.slice(0, k)
      const terms = counts.map((c) => `\\tfrac{${c}}{${total}} \\log_2 \\tfrac{${total}}{${c}}`)
      return {
        prompt: `A column of $${total}$ rows has these value counts. What is its entropy in bits per value? Give two decimal places. $$${tex.table(
          ['value', 'rows'],
          names.map((s, i) => [s, counts[i]!]),
        )}$$`,
        answer: { kind: 'number', value, tolerance: 0.006 },
        hints: [
          'Turn each count into a probability $p = \\frac{\\text{count}}{\\text{rows}}$.',
          '$H = \\sum p \\log_2 \\frac{1}{p}$.',
        ],
        solution: [
          `$H = ${terms.join(' + ')}$.`,
          `The terms are $${counts.map((c) => fixed((c / total) * information(c / total), 3)).join(' + ')} \\approx ${fixed(value, 2)}$ bits.`,
        ],
        data: { k, total, ...Object.fromEntries(counts.map((c, i) => [`c${i}`, c])) },
      }
    },
  },
  {
    id: 'choose-encoding',
    title: 'Pick an encoding',
    skills: ['encoding', 'compression'],
    difficulty: 1,
    generate: (rng) => {
      const kind = rng.int(0, COLUMN_CASES.length - 1)
      const c = COLUMN_CASES[kind]!
      const rows = rng.int(5, 90)
      return {
        prompt: `A table has $${rows}$ million rows. Which encoding shrinks ${c.text} the most?`,
        answer: { kind: 'choice', options: ENCODINGS, correct: c.best },
        hints: [
          'Ask three questions: are there few distinct values, are equal values next to each other, are the values numbers that change by small steps?',
        ],
        solution: [`${ENCODINGS[c.best]}. ${c.why}`],
        data: { kind },
      }
    },
  },
])
