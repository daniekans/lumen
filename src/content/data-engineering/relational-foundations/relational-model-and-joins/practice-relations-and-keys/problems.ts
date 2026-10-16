import { defineProblems, inlineCode, tex, type Rng } from '@/lib/practice'
import { determines, encodeColumn, isKey, orphans, type Row } from '@/lib/relational'

const { code, table, tables } = tex

const NAMES = ['Ana', 'Ben', 'Caio', 'Dara', 'Eva', 'Femi', 'Gus', 'Hana']
const CITIES = ['Lisbon', 'Oslo', 'Recife', 'Lima', 'Kyoto', 'Accra']
const DEPTS = ['Sales', 'Data', 'Ops', 'Legal', 'HR', 'Design']

/** Rows as records, so the relational helpers can check them. */
const records = (columns: readonly string[], cols: readonly (readonly (string | number)[])[]) =>
  cols[0]!.map((_, r) => Object.fromEntries(columns.map((c, j) => [c, cols[j]![r]!])) as Row)

const transpose = <T>(cols: readonly (readonly T[])[]) =>
  cols[0]!.map((_, r) => cols.map((c) => c[r]!))

/** Pool indices, stored 1-based so 0 can mean NULL in problem data. */
const encodeIndices = (
  prefix: string,
  values: readonly (string | number)[],
  pool: readonly (string | number)[],
) =>
  encodeColumn(
    prefix,
    values.map((v) => pool.indexOf(v) + 1),
  )

/** Draws `n` values with replacement, forcing at least one repeat. */
const withRepeat = <T>(rng: Rng, pool: readonly T[], n: number) => {
  const out = Array.from({ length: n }, () => rng.pick(pool))
  if (new Set(out).size === n) out[rng.int(1, n - 1)] = out[0]!
  return out
}

/** Retries a random construction until it satisfies `ok`. Deterministic for a given rng. */
const until = <T>(make: () => T, ok: (t: T) => boolean) => {
  for (let i = 0; i < 500; i++) {
    const t = make()
    if (ok(t)) return t
  }
  throw new Error('No valid problem found')
}

export const problems = defineProblems([
  {
    id: 'product-size',
    title: 'Size of a product',
    skills: ['relations'],
    difficulty: 1,
    generate: (rng) => {
      const k = rng.pick([2, 3])
      const sizes = Array.from({ length: k }, () => rng.int(2, 6))
      const sets = ['A', 'B', 'C'].slice(0, k)
      const value = sizes.reduce((p, s) => p * s, 1)
      const given = sets.map((s, i) => `$|${s}| = ${sizes[i]}$`).join(', ')
      return {
        prompt: `Domains with ${given}. How many tuples does $${sets.join(' \\times ')}$ contain?`,
        answer: { kind: 'number', value },
        hints: ['A tuple picks one value from each domain, independently.'],
        solution: [
          `Each tuple chooses one element of each set, so the counts multiply.`,
          `$|${sets.join(' \\times ')}| = ${sizes.join(' \\cdot ')} = ${value}$.`,
        ],
        data: { k, ...encodeColumn('s', sizes) },
      }
    },
  },
  {
    id: 'relation-count',
    title: 'Number of relations',
    skills: ['relations'],
    difficulty: 2,
    generate: (rng) => {
      const m = rng.int(2, 3)
      const n = rng.int(2, 4)
      const value = 2 ** (m * n)
      return {
        prompt: `A set $A$ has $${m}$ elements and $B$ has $${n}$. How many different relations $R \\subseteq A \\times B$ are there, counting the empty one?`,
        answer: { kind: 'number', value },
        hints: [
          `First count the pairs in $A \\times B$.`,
          'A relation decides, for each pair, whether it belongs or not.',
        ],
        solution: [
          `$A \\times B$ has $${m} \\cdot ${n} = ${m * n}$ pairs.`,
          `Each pair is in $R$ or not, two choices per pair: $2^{${m * n}} = ${value}$ relations.`,
        ],
        data: { m, n },
      }
    },
  },
  {
    id: 'distinct-tuples',
    title: 'Cardinality of a relation',
    skills: ['relations'],
    difficulty: 1,
    generate: (rng) => {
      const d = rng.int(3, 5)
      const pairs = rng
        .shuffle(NAMES.slice(0, 4).flatMap((n) => CITIES.slice(0, 3).map((c) => [n, c] as const)))
        .slice(0, d)
      const extra = Array.from({ length: rng.int(1, 3) }, () => rng.pick(pairs))
      const rows = rng.shuffle([...pairs, ...extra])
      const repeatedSet = [...new Set(extra)]
      const repeated = repeatedSet.map(([n, c]) => `(${n}, ${c})`).join(', ')
      return {
        prompt: `Read this table as a relation, a set of tuples. What is its cardinality? $$${table(['name', 'city'], rows)}$$`,
        answer: { kind: 'number', value: d },
        hints: ['A set holds each element once, however often it is written.'],
        solution: [
          `The table has $${rows.length}$ rows, but ${repeated} ${repeatedSet.length === 1 ? 'appears' : 'appear'} more than once.`,
          `Counting each distinct tuple once gives $${d}$.`,
        ],
        data: {
          ...encodeIndices(
            'n',
            rows.map((r) => r[0]),
            NAMES,
          ),
          ...encodeIndices(
            'c',
            rows.map((r) => r[1]),
            CITIES,
          ),
        },
      }
    },
  },
  {
    id: 'key-column',
    title: 'Find the key',
    skills: ['keys'],
    difficulty: 1,
    generate: (rng) => {
      const columns = ['badge', 'name', 'dept', 'city']
      const pools: (string | number)[][] = [
        Array.from({ length: 90 }, (_, i) => i + 10),
        NAMES,
        DEPTS,
        CITIES,
      ]
      const n = 5
      const key = rng.int(0, columns.length - 1)
      const cols = pools.map((pool, j) =>
        j === key ? rng.shuffle(pool).slice(0, n) : withRepeat(rng, pool.slice(0, 4), n),
      )
      const rows = transpose(cols)
      const repeats = columns
        .filter((_, j) => j !== key)
        .map((c) => code(c))
        .join(', ')
      return {
        prompt: `Which single column is a key of this table? $$${table(columns, rows, 'staff')}$$`,
        answer: { kind: 'choice', options: columns.map(inlineCode), correct: key },
        hints: ['A key column has no repeated values and no NULLs.'],
        solution: [
          `$${repeats}$ each repeat a value, so two rows agree on them.`,
          `Every value of ${inlineCode(columns[key]!)} is different, so it identifies each row.`,
        ],
        data: {
          key,
          ...Object.assign({}, ...cols.map((c, j) => encodeIndices(`k${j}`, c, pools[j]!))),
        },
      }
    },
  },
  {
    id: 'composite-key',
    title: 'A key of two columns',
    skills: ['keys'],
    difficulty: 3,
    generate: (rng) => {
      const columns = ['student', 'course', 'term']
      const pools = [NAMES.slice(0, 3), ['SQL', 'Stats', 'Spark'], [1, 2]] as const
      const pairs = [
        [0, 1],
        [0, 2],
        [1, 2],
      ] as const
      const { rows, keyPairs } = until(
        () => {
          const rows = rng
            .shuffle(
              pools[0].flatMap((s) =>
                pools[1].flatMap((c) => pools[2].map((t) => [s, c, t] as const)),
              ),
            )
            .slice(0, 5)
          const recs = records(
            columns,
            columns.map((_, j) => rows.map((r) => r[j]!)),
          )
          const keyPairs = pairs.filter(([a, b]) => isKey(recs, [columns[a]!, columns[b]!]))
          const singleKey = columns.some((c) => isKey(recs, [c]))
          return { rows, keyPairs, singleKey }
        },
        (t) => !t.singleKey && t.keyPairs.length <= 1,
      )
      const label = ([a, b]: readonly [number, number]) =>
        `$(${code(columns[a]!)}, ${code(columns[b]!)})$`
      const options = [...pairs.map(label), 'Only all three columns together']
      const correct = keyPairs.length ? pairs.indexOf(keyPairs[0]!) : 3
      return {
        prompt: `No single column is a key of this table. Which smallest set of columns is? $$${table(columns, rows, 'enrollments')}$$`,
        answer: { kind: 'choice', options, correct },
        hints: [
          'For each pair of columns, look for two rows that agree on both.',
          'Rows are distinct, so all three columns together are always a key.',
        ],
        solution: [
          ...pairs
            .filter((p) => p !== keyPairs[0])
            .map((p) => `${label(p)} is not a key: two rows share the same values in it.`),
          keyPairs.length
            ? `${label(keyPairs[0]!)} has no repeated combination, so it is the key.`
            : 'No pair works, so the key needs all three columns.',
        ],
        data: {
          correct,
          ...Object.assign(
            {},
            ...columns.map((_, j) =>
              encodeIndices(
                `c${j}`,
                rows.map((r) => r[j]!),
                pools[j]!,
              ),
            ),
          ),
        },
      }
    },
  },
  {
    id: 'dependency',
    title: 'Which column determines another?',
    skills: ['keys'],
    difficulty: 2,
    generate: (rng) => {
      const columns = ['sku', 'category', 'supplier']
      const pools = [
        ['A1', 'A2', 'B1', 'B2', 'C1'],
        ['Tea', 'Rice', 'Soap'],
        ['Nord', 'Vale', 'Zen'],
      ]
      const fds = columns.flatMap((_, a) =>
        columns.flatMap((_, b) => (a === b ? [] : [[a, b] as const])),
      )
      const { cols, holding } = until(
        () => {
          const cols = pools.map((p) => Array.from({ length: 5 }, () => rng.pick(p.slice(0, 3))))
          const recs = records(columns, cols)
          const holding = fds.filter(([a, b]) => determines(recs, [columns[a]!], [columns[b]!]))
          return { cols, holding }
        },
        (t) => t.holding.length === 1,
      )
      const right = holding[0]!
      const fdTex = ([a, b]: readonly [number, number]) =>
        `$${code(columns[a]!)} \\to ${code(columns[b]!)}$`
      const wrong = rng.shuffle(fds.filter((f) => f !== right)).slice(0, 3)
      const options = rng.shuffle([right, ...wrong])
      return {
        prompt: `$X \\to Y$ means rows that agree on $X$ also agree on $Y$. Which dependency holds in this table? $$${table(columns, transpose(cols), 'products')}$$`,
        answer: { kind: 'choice', options: options.map(fdTex), correct: options.indexOf(right) },
        hints: [
          'To break $X \\to Y$, find two rows with the same $X$ and different $Y$.',
          'A dependency is a function from values of $X$ to values of $Y$.',
        ],
        solution: [
          ...wrong.map(
            (f) =>
              `${fdTex(f)} fails: some value of the left column appears with two different values on the right.`,
          ),
          `In ${fdTex(right)} every value on the left comes with a single value on the right.`,
        ],
        data: {
          a: right[0],
          b: right[1],
          ...Object.assign({}, ...cols.map((c, j) => encodeIndices(`c${j}`, c, pools[j]!))),
        },
      }
    },
  },
  {
    id: 'orphans',
    title: 'Broken references',
    skills: ['keys'],
    difficulty: 1,
    generate: (rng) => {
      const ids = rng
        .shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        .slice(0, 4)
        .sort((a, b) => a - b)
      const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => !ids.includes(v))
      const refs: (number | null)[] = Array.from({ length: 6 }, () => rng.pick(ids))
      const [a, b, c] = rng.shuffle([0, 1, 2, 3, 4, 5])
      refs[a!] = rng.pick(missing)
      if (rng.bool()) refs[b!] = rng.pick(missing)
      // A NULL reference is allowed, and a common trap.
      if (rng.bool()) refs[c!] = null
      const orderIds = refs.map((_, i) => 101 + i)
      const bad = orphans(refs, ids).map((i) => orderIds[i]!)
      return {
        prompt: `${inlineCode('orders.customer_id')} references ${inlineCode('customers.id')}. List the ${inlineCode('order_id')} of every order that breaks the foreign key. $$${tables({ columns: ['id'], rows: ids.map((v) => [v]), title: 'customers' }, { columns: ['order_id', 'customer_id'], rows: refs.map((r, i) => [orderIds[i]!, r]), title: 'orders' })}$$`,
        answer: { kind: 'list', values: bad },
        hints: [
          'Compare each customer_id with the list of ids.',
          'NULL means "no customer". It does not point at a missing one.',
        ],
        solution: [
          `The customer ids are $${ids.join(', ')}$.`,
          `${bad.map((o) => `$${o}$`).join(' and ')} ${bad.length === 1 ? 'references' : 'reference'} a customer that does not exist.${refs.includes(null) ? ' The NULL reference is allowed.' : ''}`,
        ],
        data: { ...encodeColumn('id', ids), ...encodeColumn('ref', refs) },
      }
    },
  },
  {
    id: 'on-delete',
    title: 'Cascade or set NULL',
    skills: ['keys'],
    difficulty: 2,
    generate: (rng) => {
      const ids = [1, 2, 3, 4]
      const refs: (number | null)[] = Array.from({ length: 6 }, () =>
        rng.int(0, 6) === 0 ? null : rng.pick(ids),
      )
      const target = rng.pick(refs.filter((r): r is number => r !== null))
      const hits = refs.filter((r) => r === target).length
      const cascade = rng.bool()
      const nulls = refs.filter((r) => r === null).length
      const value = cascade ? 1 + hits : nulls + hits
      const rule = cascade ? 'ON DELETE CASCADE' : 'ON DELETE SET NULL'
      return {
        prompt: `The foreign key is declared with ${inlineCode(rule)}. After ${inlineCode(`DELETE FROM customers WHERE id = ${target}`)}, ${cascade ? 'how many rows were deleted in total, from both tables?' : `how many orders have a NULL ${inlineCode('customer_id')}?`} $$${tables({ columns: ['id'], rows: ids.map((v) => [v]), title: 'customers' }, { columns: ['order_id', 'customer_id'], rows: refs.map((r, i) => [101 + i, r]), title: 'orders' })}$$`,
        answer: { kind: 'number', value },
        hints: [
          `Count the orders that reference customer $${target}$.`,
          cascade
            ? 'Cascade deletes those orders together with the customer.'
            : 'Set NULL keeps the orders and clears their reference. Orders that were NULL before stay NULL.',
        ],
        solution: [
          `$${hits}$ ${hits === 1 ? 'order references' : 'orders reference'} customer $${target}$.`,
          cascade
            ? `The customer and those orders are deleted: $1 + ${hits} = ${value}$ rows.`
            : `They become NULL, joining the $${nulls}$ already NULL: $${nulls} + ${hits} = ${value}$.`,
        ],
        data: { target, cascade: cascade ? 1 : 0, ...encodeColumn('ref', refs) },
      }
    },
  },
])
