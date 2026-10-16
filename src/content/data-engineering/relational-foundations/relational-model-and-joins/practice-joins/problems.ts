import { defineProblems, inlineCode, tex, type Rng } from '@/lib/practice'
import { encodeColumn, joinSize, valueCounts, type JoinKind, type Value } from '@/lib/relational'

const { tables } = tex

const NAMES = ['Ana', 'Ben', 'Caio', 'Dara', 'Eva', 'Femi', 'Gus', 'Hana', 'Ines']
const ON = 'ON c.id = o.customer_id'

interface Shop {
  ids: number[]
  refs: Value[]
}

/**
 * Customers with unique ids and orders that reference them. `lonely` customers get no orders;
 * an order may also reference a missing customer or hold NULL, when allowed.
 */
const shop = (rng: Rng, lonely: number, strays = true): Shop => {
  const ids = rng
    .shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
    .slice(0, rng.int(4, 5))
    .sort((a, b) => a - b)
  const busy = rng.shuffle(ids).slice(lonely)
  const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => !ids.includes(v))
  const refs: Value[] = Array.from({ length: rng.int(4, 6) }, () => rng.pick(busy))
  if (strays && rng.bool()) refs.push(rng.pick(missing))
  if (strays && rng.bool()) refs.push(null)
  return { ids, refs: rng.shuffle(refs) }
}

const shopTables = ({ ids, refs }: Shop) =>
  `$$${tables({ columns: ['id', 'name'], rows: ids.map((id) => [id, NAMES[id - 1]!]), title: 'customers c' }, { columns: ['order_id', 'customer_id'], rows: refs.map((r, i) => [101 + i, r]), title: 'orders o' })}$$`

const shopData = ({ ids, refs }: Shop) => ({
  ...encodeColumn('l', ids),
  ...encodeColumn('r', refs as (number | null)[]),
})

/** Matches per customer, as solution text: "1 → 2, 4 → 0". */
const perCustomer = ({ ids, refs }: Shop) => {
  const counts = valueCounts(refs)
  return ids.map((id) => `$${id} \\to ${counts.get(id) ?? 0}$`).join(', ')
}

/** Orders whose customer_id is NULL or names no customer. */
const strayCount = ({ ids, refs }: Shop) =>
  refs.filter((r) => r === null || !ids.includes(r as number)).length

const sql = inlineCode

const kindSql: Record<'inner' | 'left' | 'right' | 'full', string> = {
  inner: 'JOIN',
  left: 'LEFT JOIN',
  right: 'RIGHT JOIN',
  full: 'FULL JOIN',
}

const outerSolution = (s: Shop, kind: JoinKind) => {
  const inner = joinSize(s.ids, s.refs, 'inner')
  const lonely = s.ids.filter((id) => !s.refs.includes(id)).length
  const stray = strayCount(s)
  const lines = [`Matches per customer: ${perCustomer(s)}. That gives $${inner}$ matched rows.`]
  if (kind === 'left' || kind === 'full')
    lines.push(`Customers without orders: $${lonely}$, one padded row each.`)
  if (kind === 'right' || kind === 'full')
    lines.push(`Orders without a customer (NULL or a missing id): $${stray}$, one padded row each.`)
  lines.push(`Total: $${joinSize(s.ids, s.refs, kind)}$ rows.`)
  return lines
}

export const problems = defineProblems([
  {
    id: 'cross-count',
    title: 'Cross join',
    skills: ['inner-join'],
    difficulty: 1,
    generate: (rng) => {
      const m = rng.int(3, 40)
      const n = rng.int(2, 12)
      return {
        prompt: `A table ${inlineCode('sizes')} has $${m}$ rows and ${inlineCode('colors')} has $${n}$. How many rows does ${sql('SELECT * FROM sizes CROSS JOIN colors')} return?`,
        answer: { kind: 'number', value: m * n },
        hints: ['A cross join pairs every row of one table with every row of the other.'],
        solution: [
          `Every one of the $${m}$ rows meets each of the $${n}$: $${m} \\cdot ${n} = ${m * n}$.`,
        ],
        data: { m, n },
      }
    },
  },
  {
    id: 'inner-count',
    title: 'Inner join rows',
    skills: ['inner-join'],
    difficulty: 1,
    generate: (rng) => {
      const s = shop(rng, rng.int(0, 2))
      return {
        prompt: `How many rows does ${sql(`customers c JOIN orders o ${ON}`)} return? ${shopTables(s)}`,
        answer: { kind: 'number', value: joinSize(s.ids, s.refs, 'inner') },
        hints: [
          'Count, for each customer, the orders with that customer_id.',
          'NULL and ids with no customer match nothing.',
        ],
        solution: outerSolution(s, 'inner'),
        data: shopData(s),
      }
    },
  },
  {
    id: 'fan-out',
    title: 'Duplicates on both sides',
    skills: ['row-counts'],
    difficulty: 2,
    generate: (rng) => {
      const pick = () =>
        Array.from({ length: rng.int(3, 6) }, (): Value =>
          rng.int(0, 8) === 0 ? null : rng.int(1, 3),
        )
      let left = pick()
      let right = pick()
      // Make sure at least one key value repeats on both sides, which is the point of the problem.
      left = [...left, 2, 2]
      right = rng.shuffle([...right, 2])
      left = rng.shuffle(left)
      const a = valueCounts(left)
      const b = valueCounts(right)
      const keys = [1, 2, 3].filter((k) => a.has(k) || b.has(k))
      const value = joinSize(left, right, 'inner')
      return {
        prompt: `Neither column is unique. How many rows does ${sql('visits v JOIN carts c ON v.user_id = c.user_id')} return? $$${tables({ columns: ['user_id'], rows: left.map((v) => [v]), title: 'visits' }, { columns: ['user_id'], rows: right.map((v) => [v]), title: 'carts' })}$$`,
        answer: { kind: 'number', value },
        hints: [
          'Group by user_id. A value that appears $a$ times on the left and $b$ times on the right gives $a \\cdot b$ rows.',
          'NULL never matches.',
        ],
        solution: [
          ...keys.map(
            (k) =>
              `user_id $${k}$: $${a.get(k) ?? 0} \\cdot ${b.get(k) ?? 0} = ${(a.get(k) ?? 0) * (b.get(k) ?? 0)}$.`,
          ),
          `Sum: $${value}$ rows.`,
        ],
        data: {
          ...encodeColumn('l', left as (number | null)[]),
          ...encodeColumn('r', right as (number | null)[]),
        },
      }
    },
  },
  {
    id: 'left-count',
    title: 'Left join rows',
    skills: ['outer-join'],
    difficulty: 2,
    generate: (rng) => {
      const s = shop(rng, rng.int(1, 2))
      return {
        prompt: `How many rows does ${sql(`customers c LEFT JOIN orders o ${ON}`)} return? ${shopTables(s)}`,
        answer: { kind: 'number', value: joinSize(s.ids, s.refs, 'left') },
        hints: [
          'Start from the inner join, then add one row for each customer with no match.',
          'Orders without a customer do not appear in a left join from customers.',
        ],
        solution: outerSolution(s, 'left'),
        data: shopData(s),
      }
    },
  },
  {
    id: 'outer-count',
    title: 'Right and full joins',
    skills: ['outer-join'],
    difficulty: 3,
    generate: (rng) => {
      const s = shop(rng, rng.int(0, 2))
      // Always at least one stray order, so right and full joins differ from the inner join.
      if (strayCount(s) === 0) s.refs.push(null)
      const kind = rng.pick(['right', 'full'] as const)
      return {
        prompt: `How many rows does ${sql(`customers c ${kindSql[kind]} orders o ${ON}`)} return? ${shopTables(s)}`,
        answer: { kind: 'number', value: joinSize(s.ids, s.refs, kind) },
        hints: [
          kind === 'right'
            ? 'Every order appears: its matches, or one padded row.'
            : 'Every customer and every order appears at least once.',
          'Count the matched rows first, then the padded ones.',
        ],
        solution: outerSolution(s, kind),
        data: { ...shopData(s), full: kind === 'full' ? 1 : 0 },
      }
    },
  },
  {
    id: 'anti-list',
    title: 'Customers without orders',
    skills: ['outer-join'],
    difficulty: 2,
    generate: (rng) => {
      const s = shop(rng, rng.int(1, 2))
      const lonely = s.ids.filter((id) => !s.refs.includes(id))
      return {
        prompt: `List the ${inlineCode('c.id')} values returned by ${sql(`SELECT c.id FROM customers c LEFT JOIN orders o ${ON} WHERE o.order_id IS NULL`)}. ${shopTables(s)}`,
        answer: { kind: 'list', values: lonely },
        hints: [
          'In a left join, o.order_id is NULL only on padded rows.',
          'Padded rows belong to customers with no matching order.',
        ],
        solution: [
          `Matches per customer: ${perCustomer(s)}.`,
          `The customers with $0$ matches get a padded row and pass the filter: $${lonely.join(', ')}$.`,
        ],
        data: shopData(s),
      }
    },
  },
  {
    id: 'on-versus-where',
    title: 'Filter in ON or in WHERE',
    skills: ['row-counts', 'outer-join'],
    difficulty: 3,
    generate: (rng) => {
      const ids = [1, 2, 3, 4]
      const refs = Array.from({ length: rng.int(4, 6) }, () => rng.pick(ids))
      const paid = refs.map(() => rng.bool())
      if (!paid.includes(true)) paid[0] = true
      if (!paid.includes(false)) paid[paid.length - 1] = false
      const inOn = rng.bool()
      const matchesPaid = (id: number) => refs.filter((r, i) => r === id && paid[i]).length
      const value = inOn
        ? ids.reduce((s, id) => s + Math.max(1, matchesPaid(id)), 0)
        : ids.reduce((s, id) => s + matchesPaid(id), 0)
      const query = inOn
        ? `customers c LEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'paid'`
        : `customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.status = 'paid'`
      return {
        prompt: `How many rows does ${sql(query)} return? $$${tables({ columns: ['id'], rows: ids.map((v) => [v]), title: 'customers c' }, { columns: ['order_id', 'customer_id', 'status'], rows: refs.map((r, i) => [101 + i, r, paid[i] ? 'paid' : 'open']), title: 'orders o' })}$$`,
        answer: { kind: 'number', value },
        hints: [
          'A condition in ON decides which orders match; customers without a match are still padded.',
          'A condition in WHERE runs after the join and removes rows, padded ones included, since NULL = paid is not true.',
        ],
        solution: inOn
          ? [
              `Paid orders per customer: ${ids.map((id) => `$${id} \\to ${matchesPaid(id)}$`).join(', ')}.`,
              `Each customer gives its paid matches, or one padded row if it has none: $${value}$ rows.`,
            ]
          : [
              `Paid orders per customer: ${ids.map((id) => `$${id} \\to ${matchesPaid(id)}$`).join(', ')}.`,
              `WHERE drops open orders and padded rows, which leaves the paid matches: $${value}$ rows. The left join behaves like an inner join.`,
            ],
        data: {
          inOn: inOn ? 1 : 0,
          ...encodeColumn('r', refs),
          ...encodeColumn(
            'p',
            paid.map((x) => (x ? 1 : 2)),
          ),
        },
      }
    },
  },
  {
    id: 'count-bounds',
    title: 'What a key guarantees',
    skills: ['row-counts'],
    difficulty: 2,
    generate: (rng) => {
      const m = rng.int(5, 30)
      const n = rng.int(40, 200)
      const t = rng.int(0, 2)
      const templates = [
        {
          prompt: `${inlineCode('customers')} has $${m}$ rows and primary key ${inlineCode('id')}. ${inlineCode('orders')} has $${n}$ rows, and its ${inlineCode('customer_id')} is never NULL and always matches a customer. How many rows does ${sql(`orders o JOIN customers c ${ON}`)} return?`,
          options: [`Exactly $${n}$`, `Exactly $${m}$`, `Exactly $${m * n}$`, `At most $${m}$`],
          why: [
            'Because $\\texttt{id}$ is unique, each order matches at most one customer.',
            `Because every reference is valid, each order matches exactly one: $${n}$ rows.`,
          ],
        },
        {
          prompt: `${inlineCode('customers')} has $${m}$ rows and primary key ${inlineCode('id')}; ${inlineCode('orders')} has $${n}$ rows. What is certain about the row count of ${sql(`customers c LEFT JOIN orders o ${ON}`)}?`,
          options: [`At least $${m}$`, `Exactly $${n}$`, `At most $${m}$`, `Exactly $${m + n}$`],
          why: [
            'Each customer contributes its matching orders, or one padded row when it has none.',
            `So every customer gives at least one row: at least $${m}$. The exact count depends on the data.`,
          ],
        },
        {
          prompt: `Tables ${inlineCode('a')} ($${m}$ rows) and ${inlineCode('b')} ($${n}$ rows) are joined on a column that is unique in neither. What is the largest number of rows ${sql('a JOIN b ON a.k = b.k')} can return?`,
          options: [`$${m * n}$`, `$${m + n}$`, `$${n}$`, `$${m}$`],
          why: [
            'A key value with $a$ rows on one side and $b$ on the other gives $a \\cdot b$ rows, and the sum over values is at most the product of the table sizes.',
            `The maximum is reached when every row has the same value: $${m} \\cdot ${n} = ${m * n}$, the cross join.`,
          ],
        },
      ]
      const { prompt, options, why } = templates[t]!
      const order = rng.shuffle([0, 1, 2, 3])
      return {
        prompt,
        answer: {
          kind: 'choice',
          options: order.map((i) => options[i]!),
          correct: order.indexOf(0),
        },
        hints: ['Ask how many partners a single row can have on the other side.'],
        solution: why,
        data: { t, m, n },
      }
    },
  },
])
