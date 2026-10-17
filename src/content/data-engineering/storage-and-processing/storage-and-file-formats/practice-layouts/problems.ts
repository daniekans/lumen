import { defineProblems, inlineCode, tex, type Rng } from '@/lib/practice'
import { pagesFor, rowWidth, scanBytes, scanPages, valueOffset, type Column } from '@/lib/storage'

const PAGE = 8192

/** Columns a table can have besides its key, with fixed widths in bytes. */
const POOL: readonly Column[] = [
  { name: 'user_id', width: 8 },
  { name: 'created_at', width: 8 },
  { name: 'amount', width: 8 },
  { name: 'quantity', width: 4 },
  { name: 'store_id', width: 4 },
  { name: 'discount', width: 4 },
  { name: 'country', width: 2 },
  { name: 'status', width: 1 },
  { name: 'sku', width: 12 },
  { name: 'comment', width: 40 },
]

/** An `orders` table: the key and `extra` columns from the pool, in pool order. */
const schema = (rng: Rng, extra: number): Column[] => {
  const picked = rng.shuffle(POOL.map((_, i) => i)).slice(0, extra)
  return [{ name: 'order_id', width: 8 }, ...picked.sort((a, b) => a - b).map((i) => POOL[i]!)]
}

/** The schema as a two-column TeX array of names and widths. */
const schemaTex = (columns: readonly Column[]) =>
  `$$\\begin{array}{lr} ${tex.code('column')} & ${tex.code('bytes')} \\\\ \\hline ${columns.map((c) => `${tex.code(c.name)} & ${c.width} \\\\`).join(' ')} \\end{array}$$`

/** Widths as data entries w0, w1, ... plus the column count. */
const widthData = (columns: readonly Column[]) => ({
  c: columns.length,
  ...Object.fromEntries(columns.map((col, j) => [`w${j}`, col.width])),
})

/** A bit mask of the chosen column indexes, for tests. */
const maskOf = (columns: readonly Column[], chosen: readonly string[]) =>
  columns.reduce((m, col, j) => (chosen.includes(col.name) ? m | (1 << j) : m), 0)

/** Two or three non-key columns, in schema order. */
const pickColumns = (rng: Rng, columns: readonly Column[]) => {
  const names = rng
    .shuffle(columns.slice(1).map((c) => c.name))
    .slice(0, rng.int(2, Math.min(3, columns.length - 1)))
  return columns.filter((c) => names.includes(c.name)).map((c) => c.name)
}

const widthSum = (columns: readonly Column[]) => columns.map((c) => c.width).join(' + ')

const selectSql = (chosen: readonly string[]) =>
  inlineCode(`SELECT ${chosen.join(', ')} FROM orders`)

const layoutName = { row: 'a row layout', column: 'a column layout' } as const

const WORKLOADS = [
  {
    text: 'show one order with all its columns, given its order_id (an index gives the row position)',
    row: true,
  },
  { text: 'insert each new order as the customer checks out, one row at a time', row: true },
  { text: `compute ${inlineCode('SUM(amount)')} over every order`, row: false },
  {
    text: `compute ${inlineCode('SELECT country, SUM(amount) FROM orders GROUP BY country')} every night`,
    row: false,
  },
] as const

export const problems = defineProblems([
  {
    id: 'table-size',
    title: 'Size of a table',
    skills: ['layouts'],
    difficulty: 1,
    generate: (rng) => {
      const columns = schema(rng, rng.int(3, 6))
      const m = rng.int(2, 40)
      const w = rowWidth(columns)
      return {
        prompt: `The table ${inlineCode('orders')} has $${m}$ million rows and these fixed-width columns. How many megabytes does it hold, before compression? Take $1$ MB $= 10^6$ bytes. ${schemaTex(columns)}`,
        answer: { kind: 'number', value: m * w },
        hints: ['Add the widths to get the bytes of one row, then multiply by the number of rows.'],
        solution: [
          `One row: $W = ${widthSum(columns)} = ${w}$ bytes.`,
          `The table: $${m} \\cdot 10^6 \\cdot ${w} = ${m * w} \\cdot 10^6$ bytes, so $${m * w}$ MB.`,
        ],
        data: { m, ...widthData(columns) },
      }
    },
  },
  {
    id: 'scan-bytes',
    title: 'Bytes a scan reads',
    skills: ['scan-cost'],
    difficulty: 1,
    generate: (rng) => {
      const columns = schema(rng, rng.int(4, 7))
      const chosen = pickColumns(rng, columns)
      const layout = rng.bool() ? 'row' : 'column'
      const m = rng.int(5, 80)
      const value = scanBytes(m, columns, chosen, layout)
      const used = columns.filter((c) => chosen.includes(c.name))
      return {
        prompt: `${inlineCode('orders')} has $${m}$ million rows and is stored in ${layoutName[layout]}, uncompressed. How many MB does ${selectSql(chosen)} read? Take $1$ MB $= 10^6$ bytes. ${schemaTex(columns)}`,
        answer: { kind: 'number', value },
        hints: [
          'Which bytes can the layout skip? A row layout keeps every column of a row together.',
          'A row layout reads $N W$ bytes; a column layout reads $N$ times the widths of the selected columns.',
        ],
        solution:
          layout === 'row'
            ? [
                'In a row layout the selected values are spread over every page, so the scan reads the whole table.',
                `$W = ${widthSum(columns)} = ${rowWidth(columns)}$, and $${m} \\cdot ${rowWidth(columns)} = ${value}$ MB.`,
              ]
            : [
                'A column layout reads only the selected columns.',
                `$${m} \\cdot (${widthSum(used)}) = ${m} \\cdot ${rowWidth(used)} = ${value}$ MB.`,
              ],
        data: {
          m,
          row: layout === 'row' ? 1 : 0,
          mask: maskOf(columns, chosen),
          ...widthData(columns),
        },
      }
    },
  },
  {
    id: 'scan-fraction',
    title: 'Fraction of the bytes',
    skills: ['scan-cost'],
    difficulty: 2,
    generate: (rng) => {
      const columns = schema(rng, rng.int(5, 8))
      const chosen = pickColumns(rng, columns)
      const used = columns.filter((c) => chosen.includes(c.name))
      const w = rowWidth(columns)
      const s = rowWidth(used)
      const value = (100 * s) / w
      return {
        prompt: `A query runs ${selectSql(chosen)} on a table with the columns below. What percentage of the bytes read by a row layout does a column layout read? Give it to one decimal place. ${schemaTex(columns)}`,
        answer: { kind: 'number', value, tolerance: 0.05 },
        hints: [
          'The number of rows cancels: compare the bytes of one row.',
          'Column layout: the widths of the selected columns. Row layout: every width.',
        ],
        solution: [
          `Per row, the column layout reads $${widthSum(used)} = ${s}$ bytes and the row layout reads $W = ${w}$.`,
          `$100 \\cdot \\frac{${s}}{${w}} \\approx ${value.toFixed(1)}\\%$.`,
        ],
        data: { mask: maskOf(columns, chosen), ...widthData(columns) },
      }
    },
  },
  {
    id: 'row-pages',
    title: 'Pages of a row layout',
    skills: ['scan-cost'],
    difficulty: 2,
    generate: (rng) => {
      const columns = schema(rng, rng.int(3, 6))
      const n = rng.int(10, 400) * 100
      const w = rowWidth(columns)
      const value = pagesFor(n * w, PAGE)
      return {
        prompt: `${inlineCode('orders')} has $${n}$ rows, stored back to back in a row layout on pages of $${PAGE}$ bytes. How many pages does a full scan read? ${schemaTex(columns)}`,
        answer: { kind: 'number', value },
        hints: [
          'Find the bytes of the whole table first.',
          'A partly filled last page still has to be read: round up.',
        ],
        solution: [
          `$W = ${widthSum(columns)} = ${w}$ bytes, so the table holds $${n} \\cdot ${w} = ${n * w}$ bytes.`,
          `$\\left\\lceil \\frac{${n * w}}{${PAGE}} \\right\\rceil = ${value}$ pages.`,
        ],
        data: { n, ...widthData(columns) },
      }
    },
  },
  {
    id: 'column-pages',
    title: 'Pages of a column layout',
    skills: ['scan-cost'],
    difficulty: 2,
    generate: (rng) => {
      const columns = schema(rng, rng.int(4, 7))
      const chosen = pickColumns(rng, columns)
      const used = columns.filter((c) => chosen.includes(c.name))
      const n = rng.int(10, 400) * 100
      const value = scanPages(n, columns, chosen, 'column', PAGE)
      return {
        prompt: `${inlineCode('orders')} has $${n}$ rows in a column layout. Each column is stored on its own pages of $${PAGE}$ bytes. How many pages does ${selectSql(chosen)} read? ${schemaTex(columns)}`,
        answer: { kind: 'number', value },
        hints: [
          'Count the pages of each selected column separately, rounding up for each.',
          'A column of width $w$ takes $\\lceil N w / P \\rceil$ pages.',
        ],
        solution: [
          ...used.map(
            (c) =>
              `$${tex.code(c.name)}$: $\\left\\lceil \\frac{${n} \\cdot ${c.width}}{${PAGE}} \\right\\rceil = ${pagesFor(n * c.width, PAGE)}$ pages.`,
          ),
          `In all: $${used.map((c) => pagesFor(n * c.width, PAGE)).join(' + ')} = ${value}$ pages.`,
        ],
        data: { n, mask: maskOf(columns, chosen), ...widthData(columns) },
      }
    },
  },
  {
    id: 'lookup-pages',
    title: 'Fetching one row',
    skills: ['layouts', 'scan-cost'],
    difficulty: 1,
    generate: (rng) => {
      const columns = schema(rng, rng.int(4, 7))
      const all = rng.int(0, 2) === 0
      const chosen = all ? columns.map((c) => c.name) : pickColumns(rng, columns)
      const layout = rng.bool() ? 'row' : 'column'
      const value = layout === 'row' ? 1 : chosen.length
      const sql = all
        ? inlineCode('SELECT * FROM orders WHERE order_id = 7031')
        : inlineCode(`SELECT ${chosen.join(', ')} FROM orders WHERE order_id = 7031`)
      return {
        prompt: `An index gives the position of order $7031$, so no scan is needed. In ${layoutName[layout]} with pages of $${PAGE}$ bytes, how many pages does ${sql} read? Rows and values never straddle a page. ${schemaTex(columns)}`,
        answer: { kind: 'number', value },
        hints: ['Where do the values of one row sit in this layout?'],
        solution:
          layout === 'row'
            ? [
                'A row layout keeps the whole row together, so one page holds every value of it: $1$ page.',
              ]
            : [
                'A column layout stores each column on its own pages, so each selected column costs one page.',
                `$${chosen.length}$ column${chosen.length > 1 ? 's' : ''}, $${value}$ pages.`,
              ],
        data: { row: layout === 'row' ? 1 : 0, k: chosen.length },
      }
    },
  },
  {
    id: 'value-offset',
    title: 'Where a value lives',
    skills: ['layouts'],
    difficulty: 2,
    generate: (rng) => {
      const columns = schema(rng, rng.int(3, 5))
      const n = rng.int(2, 20) * 10
      const r = rng.int(1, n - 1)
      const j = rng.int(1, columns.length - 1)
      const layout = rng.bool() ? 'row' : 'column'
      const value = valueOffset(n, columns, r, j, layout)
      const before = columns.slice(0, j)
      const col = columns[j]!
      const w = rowWidth(columns)
      return {
        prompt: `${inlineCode('orders')} has $${n}$ rows, numbered from $0$, stored in ${layoutName[layout]} with no padding: ${layout === 'row' ? 'each row is its values in schema order, rows back to back' : 'each column is its values in row order, columns back to back in schema order'}. At what byte offset, counting from $0$, does the ${inlineCode(col.name)} value of row $${r}$ start? ${schemaTex(columns)}`,
        answer: { kind: 'number', value },
        hints:
          layout === 'row'
            ? [
                'Skip the whole rows before it, then the columns before it inside its row.',
                'Offset $= r \\cdot W + $ the widths of the earlier columns.',
              ]
            : [
                'Skip the whole columns before it, then the rows before it inside its column.',
                'Offset $= N \\cdot$ (widths of the earlier columns) $+ r \\cdot w$.',
              ],
        solution:
          layout === 'row'
            ? [
                `Rows $0$ to $${r - 1}$ take $${r} \\cdot ${w} = ${r * w}$ bytes ($W = ${w}$).`,
                `Inside row $${r}$, the earlier columns take $${widthSum(before)} = ${rowWidth(before)}$ bytes.`,
                `Offset: $${r * w} + ${rowWidth(before)} = ${value}$.`,
              ]
            : [
                `The earlier columns take $${n} \\cdot (${widthSum(before)}) = ${n * rowWidth(before)}$ bytes.`,
                `Inside $${tex.code(col.name)}$, rows $0$ to $${r - 1}$ take $${r} \\cdot ${col.width} = ${r * col.width}$ bytes.`,
                `Offset: $${n * rowWidth(before)} + ${r * col.width} = ${value}$.`,
              ],
        data: { n, r, j, row: layout === 'row' ? 1 : 0, ...widthData(columns) },
      }
    },
  },
  {
    id: 'choose-layout',
    title: 'Pick a layout',
    skills: ['layouts'],
    difficulty: 1,
    generate: (rng) => {
      const kind = rng.int(0, WORKLOADS.length - 1)
      const workload = WORKLOADS[kind]!
      const c = rng.int(12, 60)
      return {
        prompt: `A table ${inlineCode('orders')} has $${c}$ columns and tens of millions of rows. The main job is to ${workload.text}. Which layout reads or writes fewer pages for it?`,
        answer: {
          kind: 'choice',
          options: ['A row layout', 'A column layout'],
          correct: workload.row ? 0 : 1,
        },
        hints: ['Does the job touch many columns of few rows, or few columns of many rows?'],
        solution: workload.row
          ? [
              `The job touches whole rows, one at a time. A row layout keeps a row on one page; a column layout spreads it over $${c}$ columns, one page each.`,
            ]
          : [
              `The job reads one or two columns of every row. A column layout reads only those columns' pages; a row layout reads every page of all $${c}$ columns.`,
            ],
        data: { kind, c },
      }
    },
  },
])
