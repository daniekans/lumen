import { defineProblems, inlineCode } from '@/lib/practice'
import { pairsCompared, skewRatio } from '@/lib/partitioning'

/** A whole number with thin spaces between groups of three digits, for TeX. */
const big = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')

/** A number for TeX with at most two decimals and no trailing zeros. */
const dec = (x: number) => String(Number(x.toFixed(2)))

/** How the last digits of a number decide its remainder modulo n. */
const DIGIT_RULE: Record<number, string> = {
  4: '$100$ is a multiple of $4$, so only the last two digits matter.',
  5: '$10$ is a multiple of $5$, so only the last digit matters.',
  8: '$1000$ is a multiple of $8$, so only the last three digits matter.',
  10: 'The remainder modulo $10$ is the last digit.',
}

const KEY_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const

/** Workloads, and whether hash or range partitioning on the key serves them better. */
const LAYOUT_CASES = [
  {
    text: `Queries read one customer at a time, ${inlineCode('WHERE customer_id = 42')}.`,
    answer: 2,
    why: 'An equality filter finds one part in either layout: one bucket, or the one range that holds the key.',
  },
  {
    text: `Queries read a span of order ids, ${inlineCode('WHERE order_id BETWEEN 5000 AND 6000')}.`,
    answer: 1,
    why: 'Ranges keep neighboring ids in one or two parts. A hash scatters them over every bucket.',
  },
  {
    text: 'New rows arrive with ever larger ids, and writes should spread over all the parts.',
    answer: 0,
    why: 'By range, every new id falls in the last range, which takes all the writes. A hash spreads new keys like any others.',
  },
  {
    text: 'Two large tables are joined on the key, and both are to be split the same way without choosing bounds from the data.',
    answer: 0,
    why: 'The same hash and bucket count put equal keys in equal buckets, and the buckets are even on average with no bounds to pick.',
  },
  {
    text: 'Dashboards read the last seven days of events, filtered on the event time.',
    answer: 1,
    why: 'A time range keeps the last days together, so a few parts are read. Hashed times would put the week in every bucket.',
  },
] as const

const LAYOUTS = ['Hash', 'Range', 'Either: one part'] as const

export const problems = defineProblems([
  {
    id: 'bucket-of',
    title: 'The bucket of a hash',
    skills: ['hashing'],
    difficulty: 1,
    generate: (rng) => {
      const h = rng.int(1e8, 2 ** 32 - 1)
      const n = rng.pick([4, 5, 8, 10])
      const value = h % n
      const tail = h % (n === 8 ? 1000 : n === 4 ? 100 : 10)
      return {
        prompt: `A key hashes to $h = ${big(h)}$. Which of $n = ${n}$ buckets does it land in, numbered from $0$?`,
        answer: { kind: 'number', value },
        hints: ['The bucket is $h \\bmod n$, the remainder of $h$ divided by $n$.', DIGIT_RULE[n]!],
        solution: [
          DIGIT_RULE[n]!,
          `$${tail} = ${Math.floor(tail / n)} \\cdot ${n} + ${value}$, so $h \\bmod ${n} = ${value}$.`,
        ],
        data: { h, n },
      }
    },
  },
  {
    id: 'hash-or-range',
    title: 'Hash or range',
    skills: ['hashing'],
    difficulty: 2,
    generate: (rng) => {
      const kind = rng.int(0, LAYOUT_CASES.length - 1)
      const c = LAYOUT_CASES[kind]!
      return {
        prompt: `${c.text} Which partitioning of the key serves this best?`,
        answer: { kind: 'choice', options: LAYOUTS, correct: c.answer },
        hints: [
          'Hashing scatters neighboring keys and spreads new ones. Ranges keep neighbors together.',
        ],
        solution: [`${LAYOUTS[c.answer]}. ${c.why}`],
        data: { kind },
      }
    },
  },
  {
    id: 'skew-ratio',
    title: 'Skew ratio from key counts',
    skills: ['skew'],
    difficulty: 2,
    generate: (rng) => {
      const n = 4
      const count = rng.int(6, 8)
      const rows = Array.from({ length: count }, () => rng.int(1, 30) * 10)
      // Every bucket gets at least one key, so none is empty by construction.
      const buckets = rng.shuffle(
        Array.from({ length: count }, (_, i) => (i < n ? i : rng.int(0, n - 1))),
      )
      const loads = Array<number>(n).fill(0)
      rows.forEach((r, i) => (loads[buckets[i]!]! += r))
      const total = rows.reduce((s, r) => s + r, 0)
      const value = skewRatio(loads)
      const keys = KEY_NAMES.slice(0, count)
      return {
        prompt: `Keys ${keys.join(', ')} have ${rows.map((r) => `$${r}$`).join(', ')} rows and land in buckets ${buckets.map((b) => `$${b}$`).join(', ')} of $n = ${n}$. What is the skew ratio, the largest load over the mean load? Round to two decimals.`,
        answer: { kind: 'number', value, tolerance: 0.006 },
        hints: [
          'Add the rows of the keys in each bucket.',
          'The mean load is the total number of rows divided by $n$.',
        ],
        solution: [
          `Loads: ${loads.map((l, b) => `bucket $${b}$: $${l}$`).join(', ')}.`,
          `Mean: $\\frac{${total}}{${n}} = ${dec(total / n)}$.`,
          `Ratio: $\\frac{${Math.max(...loads)}}{${dec(total / n)}} \\approx ${dec(value)}$.`,
        ],
        data: {
          n,
          count,
          ...Object.fromEntries(rows.map((r, i) => [`r${i}`, r])),
          ...Object.fromEntries(buckets.map((b, i) => [`b${i}`, b])),
        },
      }
    },
  },
  {
    id: 'hot-key-bound',
    title: 'The bound a hot key sets',
    skills: ['skew'],
    difficulty: 1,
    generate: (rng) => {
      const pct = rng.pick([5, 10, 20, 25, 40])
      const n = rng.pick([8, 16, 20, 40, 64].filter((m) => (pct * m) / 100 >= 1))
      const value = (pct * n) / 100
      return {
        prompt: `One key holds $${pct}\\%$ of a table's rows. The table is hashed into $n = ${n}$ buckets. What is the smallest skew ratio (largest load over mean load) any hash function could give?`,
        answer: { kind: 'number', value },
        hints: [
          'All rows of a key land in one bucket, so that bucket holds at least those rows.',
          'Divide that by the mean load $N / n$.',
        ],
        solution: [
          `The bucket of the key holds at least $pN = ${pct / 100}N$ rows; the mean is $\\frac{N}{${n}}$.`,
          `$r \\geq pn = ${pct / 100} \\cdot ${n} = ${dec(value)}$, whatever the hash.`,
        ],
        data: { pct, n },
      }
    },
  },
  {
    id: 'salted-load',
    title: 'Largest load after salting',
    skills: ['skew'],
    difficulty: 3,
    generate: (rng) => {
      const n = rng.pick([8, 16])
      const salts = rng.pick([2, 4, 8].filter((s) => s <= n))
      const hot = salts * rng.int(3, 12) * 100
      const rest = n * rng.int(2, 10) * 100
      const value = hot / salts + rest / n
      return {
        prompt: `A table has one hot key with $${big(hot)}$ rows and $${big(rest)}$ other rows that spread evenly over $n = ${n}$ buckets. The hot key is salted with $S = ${salts}$ salts, its rows split evenly over the salts, and the salted keys land in different buckets. How many rows does the largest bucket hold?`,
        answer: { kind: 'number', value },
        hints: [
          'Each salted key holds $\\frac{1}{S}$ of the hot rows.',
          'A bucket with a salted key also holds its share of the other rows.',
        ],
        solution: [
          `Each salted key: $\\frac{${big(hot)}}{${salts}} = ${big(hot / salts)}$ rows. Other rows per bucket: $\\frac{${big(rest)}}{${n}} = ${big(rest / n)}$.`,
          `A bucket with a salted key holds $${big(hot / salts)} + ${big(rest / n)} = ${big(value)}$ rows, the largest load.`,
        ],
        data: { n, salts, hot, rest },
      }
    },
  },
  {
    id: 'join-pairs',
    title: 'Pairs in a bucketed join',
    skills: ['bucketing'],
    difficulty: 2,
    generate: (rng) => {
      const n = 4
      const a = Array.from({ length: n }, () => rng.int(1, 9) * 10)
      const b = Array.from({ length: n }, () => rng.int(1, 9))
      const value = pairsCompared(a, b)
      const sa = a.reduce((s, x) => s + x, 0)
      const sb = b.reduce((s, x) => s + x, 0)
      return {
        prompt: `Two tables are bucketed on the join key with the same hash and $n = ${n}$. Buckets $0$ to $3$ of the first hold ${a.map((x) => `$${x}$`).join(', ')} rows, those of the second ${b.map((x) => `$${x}$`).join(', ')}. How many pairs of rows does the join compare?`,
        answer: { kind: 'number', value },
        hints: [
          'Equal keys land in equal buckets, so bucket $k$ is joined only with bucket $k$.',
          'Bucket $k$ compares $a_k b_k$ pairs. Add them.',
        ],
        solution: [
          `$\\sum a_k b_k = ${a.map((x, k) => `${x} \\cdot ${b[k]}`).join(' + ')} = ${big(value)}$.`,
          `Without buckets: $${sa} \\cdot ${sb} = ${big(sa * sb)}$ pairs.`,
        ],
        data: {
          ...Object.fromEntries(a.map((x, k) => [`a${k}`, x])),
          ...Object.fromEntries(b.map((x, k) => [`b${k}`, x])),
        },
      }
    },
  },
  {
    id: 'buckets-meet',
    title: 'Which buckets meet',
    skills: ['bucketing', 'hashing'],
    difficulty: 2,
    generate: (rng) => {
      const small = rng.pick([2, 4])
      const large = small * rng.pick([2, 4])
      const j = rng.int(0, small - 1)
      const values = Array.from({ length: large / small }, (_, m) => j + m * small)
      return {
        prompt: `Customers are bucketed into $${small}$ buckets and orders into $${large}$, both by $h(\\text{customer\\_id}) \\bmod n$ with the same $h$. Which orders buckets can hold a match for customers bucket $${j}$? List them all.`,
        answer: { kind: 'list', values },
        hints: [
          `A key in orders bucket $k$ has $h \\bmod ${large} = k$. What is its $h \\bmod ${small}$?`,
          `$${small}$ divides $${large}$, so $h \\bmod ${small} = (h \\bmod ${large}) \\bmod ${small}$.`,
        ],
        solution: [
          `Orders bucket $k$ holds keys with $h \\bmod ${small} = k \\bmod ${small}$. Those equal to $${j}$: $k = ${values.join(', ')}$.`,
        ],
        data: { small, large, j },
      }
    },
  },
])
