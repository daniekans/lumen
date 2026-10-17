import { defineProblems, inlineCode, tex, type Rng } from '@/lib/practice'
import {
  groupCount,
  groupsRead,
  groupsSpanned,
  rowWidth,
  type Column,
  type Predicate,
} from '@/lib/storage'

/** A whole number with thin spaces between groups of three digits, for TeX. */
const big = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')

const OPS = ['=', '<', '<=', '>', '>=', 'between'] as const

const predicateSql = (column: string, p: Predicate) =>
  p.op === 'between'
    ? `WHERE ${column} BETWEEN ${p.low} AND ${p.high}`
    : `WHERE ${column} ${p.op} ${p.value}`

/** Why a range is skipped or read, in words with TeX. */
const skipReason = (p: Predicate) =>
  ({
    '=': 'skip when $v < \\min$ or $v > \\max$',
    '<': 'skip when $\\min \\geq v$',
    '<=': 'skip when $\\min > v$',
    '>': 'skip when $\\max \\leq v$',
    '>=': 'skip when $\\max < v$',
    between: 'skip when $\\max < a$ or $\\min > b$',
  })[p.op]

/** Columns of an `events` table, fixed widths in bytes. */
const EVENTS: readonly Column[] = [
  { name: 'event_id', width: 8 },
  { name: 'event_date', width: 4 },
  { name: 'user_id', width: 8 },
  { name: 'country', width: 2 },
  { name: 'amount', width: 8 },
  { name: 'status', width: 1 },
  { name: 'device', width: 12 },
  { name: 'url', width: 60 },
]

const schemaTex = (columns: readonly Column[]) =>
  `$$\\begin{array}{lr} ${tex.code('column')} & ${tex.code('bytes')} \\\\ \\hline ${columns.map((c) => `${tex.code(c.name)} & ${c.width} \\\\`).join(' ')} \\end{array}$$`

const PARTS = ['The footer', 'A row group', 'A column chunk', 'A page'] as const

const PART_CASES = [
  {
    text: 'holds the min, max and NULL count of every column chunk, and where each chunk starts',
    part: 0,
    why: 'The footer, at the end of the file, holds the schema, the offset of every column chunk and their statistics.',
  },
  {
    text: 'is the unit that gets encoded and compressed',
    part: 3,
    why: 'Each column chunk is a sequence of pages, and each page is encoded (dictionary, run-length, delta) and compressed on its own.',
  },
  {
    text: 'holds all the values of one column for one horizontal slice of the table',
    part: 2,
    why: 'A column chunk is one column inside one row group.',
  },
  {
    text: 'is the horizontal slice of rows that the reader skips when the statistics rule out a filter',
    part: 1,
    why: 'Statistics are kept per column chunk, so the reader decides row group by row group whether any row can match.',
  },
  {
    text: 'is the first thing a reader fetches, before any data',
    part: 0,
    why: 'The reader reads the last bytes of the file to find the footer, then uses its offsets and statistics to plan which chunks to fetch.',
  },
] as const

const SORT_OPTIONS = [
  'Day filters skip most row groups, and the day column compresses better',
  'Day filters skip most row groups, but the file gets larger',
  'Nothing changes: the footer keeps statistics only for the whole file',
  'Queries read fewer columns',
] as const

const FORMATS = ['CSV', 'JSON lines', 'Avro', 'Parquet'] as const

const FORMAT_CASES = [
  {
    text: 'A 2 TB events table in a data lake. Nightly reports read 3 of its 80 columns and filter on the event date.',
    best: 3,
    why: 'Large, wide, read a few columns at a time with filters: column chunks give projection, footer statistics give pushdown.',
  },
  {
    text: 'A Kafka topic where a service writes one order at a time. Consumers need a typed schema that can gain fields over time.',
    best: 2,
    why: 'Avro writes rows in a compact binary form with a schema, and its schema evolution rules let fields be added safely. Records are written one at a time, which suits a row format.',
  },
  {
    text: 'A 500 row extract for a colleague who will open it in a spreadsheet.',
    best: 0,
    why: 'Small and meant for people and spreadsheets: plain CSV opens anywhere. Its lack of types and statistics does not matter at this size.',
  },
  {
    text: 'Responses from a web API with nested and optional fields, kept for a JavaScript app to read back record by record.',
    best: 1,
    why: 'Nested, irregular records read whole by an app: JSON lines keeps each record as it is, one per line.',
  },
  {
    text: 'A table that Spark and Trino query all day, mostly aggregating a few measures with filters on country and date.',
    best: 3,
    why: 'Analytical scans of a few columns with filters: Parquet reads only the needed column chunks and skips row groups by their statistics.',
  },
  {
    text: 'A landing area where a service appends each payment as it happens, compacted into larger files every night.',
    best: 2,
    why: 'Appending one record at a time suits a row format, and Avro keeps types and a schema. The nightly compaction can then write columnar files for analytics.',
  },
] as const

/** Footer ranges for `g` row groups, some overlapping. */
const footerRanges = (rng: Rng, g: number) =>
  Array.from({ length: g }, () => {
    const min = rng.int(0, 90) * 10
    return { min, max: min + rng.int(2, 40) * 10 }
  })

/** A predicate whose bounds often sit on a range boundary, where strict and loose comparisons differ. */
const randomPredicate = (rng: Rng, edges: readonly number[]): Predicate => {
  const op = rng.pick(OPS)
  const value = () => (rng.bool() ? rng.pick(edges) : rng.int(0, 130) * 10)
  if (op !== 'between') return { op, value: value() }
  const a = value()
  const b = value()
  return a === b ? { op, low: a, high: a + 50 } : { op, low: Math.min(a, b), high: Math.max(a, b) }
}

export const problems = defineProblems([
  {
    id: 'column-chunks',
    title: 'Row groups and chunks',
    skills: ['parquet'],
    difficulty: 1,
    generate: (rng) => {
      const r = rng.pick([250000, 500000, 1000000])
      const n = rng.int(11, 400) * 50000
      const c = rng.int(4, 40)
      const g = groupCount(n, r)
      return {
        prompt: `A table of $${big(n)}$ rows and $${c}$ columns is written to one Parquet file with row groups of $${big(r)}$ rows. How many column chunks does the file have?`,
        answer: { kind: 'number', value: g * c },
        hints: [
          'Count the row groups first. The last one may be only partly full.',
          'Every row group has one column chunk per column.',
        ],
        solution: [
          `Row groups: $\\left\\lceil \\frac{${big(n)}}{${big(r)}} \\right\\rceil = ${g}$.`,
          `Column chunks: $${g} \\cdot ${c} = ${g * c}$.`,
        ],
        data: { n, r, c },
      }
    },
  },
  {
    id: 'skip-count',
    title: 'Row groups skipped',
    skills: ['parquet'],
    difficulty: 2,
    generate: (rng) => {
      const g = rng.int(4, 6)
      const ranges = footerRanges(rng, g)
      const p = randomPredicate(
        rng,
        ranges.flatMap((r) => [r.min, r.max]),
      )
      const read = groupsRead(ranges, p)
      const value = g - read.length
      const skipped = ranges.flatMap((_, k) => (read.includes(k) ? [] : [k + 1]))
      const opIndex = OPS.indexOf(p.op)
      const bounds = p.op === 'between' ? { a: p.low, b: p.high } : { a: p.value, b: p.value }
      return {
        prompt: `The footer of a Parquet file has these statistics for the column ${inlineCode('amount')}. A query has ${inlineCode(predicateSql('amount', p))}. How many row groups can the reader skip without reading them? $$${tex.table(
          ['row_group', 'min', 'max'],
          ranges.map((r, k) => [k + 1, r.min, r.max]),
        )}$$`,
        answer: { kind: 'number', value },
        hints: [
          'A row group can be skipped only if no value between its min and max satisfies the filter.',
          p.op === 'between'
            ? `With $a = ${p.low}$ and $b = ${p.high}$: ${skipReason(p)}.`
            : `With $v = ${p.value}$: ${skipReason(p)}.`,
        ],
        solution: [
          p.op === 'between'
            ? `With $a = ${p.low}$ and $b = ${p.high}$, ${skipReason(p)}.`
            : `With $v = ${p.value}$, ${skipReason(p)}.`,
          skipped.length
            ? `That holds for row group${skipped.length > 1 ? 's' : ''} $${skipped.join(', ')}$: $${value}$ skipped, $${read.length}$ read.`
            : `It holds for none of them: every range could contain a match, so $0$ are skipped.`,
        ],
        data: {
          g,
          op: opIndex,
          ...bounds,
          ...Object.fromEntries(
            ranges.flatMap((r, k) => [
              [`min${k}`, r.min],
              [`max${k}`, r.max],
            ]),
          ),
        },
      }
    },
  },
  {
    id: 'pushdown-bytes',
    title: 'Bytes with pushdown',
    skills: ['parquet', 'scan-cost'],
    difficulty: 2,
    generate: (rng) => {
      const g = rng.int(8, 60)
      const k = rng.int(1, g - 1)
      const filter = rng.pick(['event_date', 'country', 'status'])
      const pool = EVENTS.filter((c) => c.name !== 'event_id')
      const selected = rng.shuffle(pool.map((c) => c.name)).slice(0, rng.int(1, 2))
      const needed = EVENTS.filter((c) => selected.includes(c.name) || c.name === filter)
      const w = rowWidth(needed)
      const read = g - k
      const value = read * w
      const select = selected.join(', ')
      return {
        prompt: `${inlineCode('events')} is one Parquet file of $${g}$ row groups with $1\\,000\\,000$ rows each. The query ${inlineCode(`SELECT ${select} FROM events WHERE ${filter} = ...`)} runs, and the footer statistics rule out $${k}$ row groups. Without compression, how many MB of column chunks does the reader fetch? Take $1$ MB $= 10^6$ bytes. ${schemaTex(EVENTS)}`,
        answer: { kind: 'number', value },
        hints: [
          'Which columns does the reader need? The filter column has to be read too, to test each row.',
          'Each row group read costs $10^6$ times the widths of the needed columns.',
        ],
        solution: [
          `Needed columns: ${needed.map((c) => inlineCode(c.name)).join(', ')}, so $${needed.map((c) => c.width).join(' + ')} = ${w}$ bytes per row.`,
          `Row groups read: $${g} - ${k} = ${read}$.`,
          `$${read} \\cdot 10^6 \\cdot ${w}$ bytes $= ${value}$ MB.`,
        ],
        data: {
          g,
          k,
          filter: EVENTS.findIndex((c) => c.name === filter),
          ...Object.fromEntries(
            selected.map((s, i) => [`s${i}`, EVENTS.findIndex((c) => c.name === s)]),
          ),
        },
      }
    },
  },
  {
    id: 'sorted-groups',
    title: 'Row groups of a sorted file',
    skills: ['parquet', 'scan-cost'],
    difficulty: 3,
    generate: (rng) => {
      const days = rng.pick([28, 30, 31])
      const perDay = rng.int(3, 18) * 50000
      const r = rng.pick([500000, 1000000])
      const between = rng.bool()
      const d1 = rng.int(1, days - (between ? 3 : 0))
      const d2 = between ? rng.int(d1 + 1, Math.min(days, d1 + 6)) : d1
      const first = (d1 - 1) * perDay
      const last = d2 * perDay - 1
      const value = groupsSpanned(first, last, r)
      const where = between ? `WHERE day BETWEEN ${d1} AND ${d2}` : `WHERE day = ${d1}`
      return {
        prompt: `A table holds $${big(perDay)}$ rows for each day from $1$ to $${days}$. It is sorted by ${inlineCode('day')} and written to Parquet with row groups of $${big(r)}$ rows. How many row groups does a query with ${inlineCode(where)} read?`,
        answer: { kind: 'number', value },
        hints: [
          'Sorted, the matching rows sit in one stretch. Find the positions of its first and last row (from $0$).',
          'Row $i$ is in row group $\\lfloor i / R \\rfloor$. A row group is read exactly when it holds a matching row.',
        ],
        solution: [
          `Days before ${d1}: $${d1 - 1}$, so the first matching row is $${d1 - 1} \\cdot ${big(perDay)} = ${big(first)}$ and the last is $${d2} \\cdot ${big(perDay)} - 1 = ${big(last)}$.`,
          `They are in row groups $\\lfloor ${big(first)} / ${big(r)} \\rfloor = ${Math.floor(first / r)}$ and $\\lfloor ${big(last)} / ${big(r)} \\rfloor = ${Math.floor(last / r)}$ (from $0$).`,
          `So $${Math.floor(last / r)} - ${Math.floor(first / r)} + 1 = ${value}$ row group${value > 1 ? 's' : ''}. Every other row group has a day range that excludes the filter.`,
        ],
        data: { days, perDay, r, d1, d2 },
      }
    },
  },
  {
    id: 'parquet-parts',
    title: 'Parts of a Parquet file',
    skills: ['parquet'],
    difficulty: 1,
    generate: (rng) => {
      const kind = rng.int(0, PART_CASES.length - 1)
      const c = PART_CASES[kind]!
      return {
        prompt: `Which part of a Parquet file ${c.text}?`,
        answer: { kind: 'choice', options: PARTS, correct: c.part },
        hints: [
          'From large to small: a file has row groups, a row group has one column chunk per column, a chunk has pages. The footer comes last.',
        ],
        solution: [`${PARTS[c.part]}. ${c.why}`],
        data: { kind },
      }
    },
  },
  {
    id: 'choose-format',
    title: 'Pick a file format',
    skills: ['parquet'],
    difficulty: 1,
    generate: (rng) => {
      const kind = rng.int(0, FORMAT_CASES.length - 1)
      const c = FORMAT_CASES[kind]!
      return {
        prompt: `${c.text} Which format fits best?`,
        answer: { kind: 'choice', options: FORMATS, correct: c.best },
        hints: [
          'Is the data written a record at a time or in large batches? Is it read whole, or a few columns of many rows? Who reads it?',
        ],
        solution: [`${FORMATS[c.best]}. ${c.why}`],
        data: { kind },
      }
    },
  },
  {
    id: 'sort-for-pushdown',
    title: 'Sorting and skipping',
    skills: ['parquet'],
    difficulty: 3,
    generate: (rng) => {
      const g = rng.int(20, 200)
      const days = rng.pick([30, 31])
      const options = rng.shuffle([...SORT_OPTIONS])
      const most = Math.ceil(g / days) + 1
      return {
        prompt: `A Parquet file has $${g}$ row groups, and rows arrive in random order of ${inlineCode('day')} (from $1$ to $${days}$), so every row group spans about the whole month. Most queries filter on one day. What does rewriting the file sorted by ${inlineCode('day')} change?`,
        answer: { kind: 'choice', options, correct: options.indexOf(SORT_OPTIONS[0]) },
        hints: [
          'After sorting, what is the day range of one row group?',
          'What happens to runs in the day column?',
        ],
        solution: [
          `${SORT_OPTIONS[0]}. Sorted, each row group covers a few consecutive days, so a filter on one day reads only the row groups whose range contains it: with equal days, at most $\\lceil \\frac{${g}}{${days}} \\rceil + 1 = ${most}$ instead of all $${g}$.`,
          'The day column becomes one run per day in each row group, so run-length encoding stores it in a few pairs. The columns a query reads do not change: that is projection, decided by the query.',
        ],
        data: { g, days },
      }
    },
  },
])
