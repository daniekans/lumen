import { defineProblems, type Rng } from '@/lib/practice'
import { arcShares, clockwise, ringOwner, type RingPoint } from '@/lib/partitioning'

/** Positions on a small ring, 0 to 99, so the problems work by hand. */
const SIZE = 100
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const

/** `count` distinct positions on the ring, in random order. */
const positions = (rng: Rng, count: number) =>
  rng.shuffle(Array.from({ length: SIZE }, (_, i) => i)).slice(0, count)

const ring = (at: readonly number[]): RingPoint[] =>
  at.map((p, i) => ({ node: NAMES[i]!, at: p })).sort((a, b) => a.at - b.at)

/** The node before a point, counterclockwise. */
const previous = (points: readonly RingPoint[], node: string) => {
  const i = points.findIndex((p) => p.node === node)
  return points[(i + points.length - 1) % points.length]!
}

const nodeList = (points: readonly RingPoint[]) =>
  points.map((p) => `${p.node} at $${p.at}$`).join(', ')

const RING_HINT =
  'A key belongs to the first node at or after its position, walking up and wrapping from $99$ to $0$.'

export const problems = defineProblems([
  {
    id: 'ring-owner',
    title: 'The owner of a key',
    skills: ['consistent-hashing'],
    difficulty: 1,
    generate: (rng) => {
      const at = positions(rng, 5)
      const points = ring(at.slice(0, 4))
      // About one key in four lands past the last node, so it wraps.
      const last = points.at(-1)!.at
      const key = rng.int(0, 3) === 0 && last < SIZE - 1 ? rng.int(last + 1, SIZE - 1) : at[4]!
      const owner = ringOwner(key, points)
      const wraps = key > last
      return {
        prompt: `A hash ring has positions $0$ to $99$. Nodes: ${nodeList(points)}. A key hashes to position $${key}$. Which node owns it?`,
        answer: { kind: 'choice', options: ['A', 'B', 'C', 'D'], correct: 'ABCD'.indexOf(owner) },
        hints: [RING_HINT],
        solution: [
          wraps
            ? `No node is at or after $${key}$ before the top, so the walk wraps to $0$ and the first node is ${owner} at $${points[0]!.at}$.`
            : `The first node at or after $${key}$ is ${owner}, at $${points.find((p) => p.node === owner)!.at}$.`,
        ],
        data: { key, ...Object.fromEntries(points.map((p) => [p.node, p.at])) },
      }
    },
  },
  {
    id: 'join-moved',
    title: 'Keys moved when a node joins',
    skills: ['consistent-hashing'],
    difficulty: 2,
    generate: (rng) => {
      const at = positions(rng, 15)
      const before = ring(at.slice(0, 4))
      const e = at[4]!
      const after = ring([...at.slice(0, 4), e])
      const keys = at.slice(5).sort((x, y) => x - y)
      const prev = previous(after, 'E')
      const moved = keys.filter((k) => ringOwner(k, before) !== ringOwner(k, after))
      return {
        prompt: `A hash ring has positions $0$ to $99$. Nodes: ${nodeList(before)}. Keys sit at ${keys.map((k) => `$${k}$`).join(', ')}. Node E joins at $${e}$. How many keys change owner?`,
        answer: { kind: 'number', value: moved.length },
        hints: [
          RING_HINT,
          'Only keys whose first node is now E move: those after the node before E, up to E.',
        ],
        solution: [
          `The node before E is ${prev.node} at $${prev.at}$, so E takes the keys after $${prev.at}$ up to $${e}$${prev.at > e ? ', wrapping past $99$' : ''}.`,
          moved.length === 0
            ? 'No key lies there, so no key moves.'
            : `Those are ${moved.map((k) => `$${k}$`).join(', ')}: $${moved.length}$ key${moved.length === 1 ? '' : 's'}, all to E.`,
        ],
        data: {
          e,
          ...Object.fromEntries(before.map((p) => [p.node, p.at])),
          ...Object.fromEntries(keys.map((k, i) => [`k${i}`, k])),
          count: keys.length,
        },
      }
    },
  },
  {
    id: 'leave-receiver',
    title: 'Where the keys of a leaving node go',
    skills: ['consistent-hashing'],
    difficulty: 1,
    generate: (rng) => {
      const points = ring(positions(rng, 4))
      const i = rng.int(0, 3)
      const leaving = points[i]!
      const next = points[(i + 1) % 4]!
      return {
        prompt: `A hash ring has positions $0$ to $99$. Nodes: ${nodeList(points)}. Node ${leaving.node} leaves. Which node takes over its keys?`,
        answer: {
          kind: 'choice',
          options: ['A', 'B', 'C', 'D'],
          correct: 'ABCD'.indexOf(next.node),
        },
        hints: [
          RING_HINT,
          `A key of ${leaving.node} walks on past $${leaving.at}$ to the next node.`,
        ],
        solution: [
          `The keys of ${leaving.node} lie just before $${leaving.at}$. Without it, the walk from each of them continues to the next node clockwise, ${next.node} at $${next.at}$${next.at < leaving.at ? ', after wrapping past $99$' : ''}. All of them go there.`,
        ],
        data: Object.fromEntries([
          ...points.map((p) => [p.node, p.at] as const),
          ['leaving', 'ABCD'.indexOf(leaving.node)],
        ]),
      }
    },
  },
  {
    id: 'arc-share',
    title: 'The share of a node',
    skills: ['consistent-hashing'],
    difficulty: 2,
    generate: (rng) => {
      const points = ring(positions(rng, 4))
      const node = rng.pick(points).node
      const prev = previous(points, node)
      const own = points.find((p) => p.node === node)!
      const value = Math.round(100 * arcShares(points, SIZE).get(node)!)
      return {
        prompt: `A hash ring has $100$ positions, $0$ to $99$. Nodes: ${nodeList(points)}. What percentage of the ring does node ${node} own?`,
        answer: { kind: 'number', value },
        hints: ['A node owns the positions after the node before it, up to and including its own.'],
        solution: [
          `The node before ${node} is ${prev.node} at $${prev.at}$. ${node} owns $${(prev.at + 1) % SIZE}$ to $${own.at}$${prev.at > own.at ? ', wrapping past $99$' : ''}: $(${own.at} - ${prev.at}) \\bmod 100 = ${clockwise(prev.at, own.at, SIZE)}$ positions, so $${value}\\%$.`,
        ],
        data: {
          node: 'ABCD'.indexOf(node),
          ...Object.fromEntries(points.map((p) => [p.node, p.at])),
        },
      }
    },
  },
  {
    id: 'expected-moved',
    title: 'Modulo or ring',
    skills: ['consistent-hashing', 'hashing'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.int(3, 9)
      const keys = (n + 1) * rng.int(2, 20) * 100
      const modulo = rng.bool()
      const value = modulo ? (keys * n) / (n + 1) : keys / (n + 1)
      const big = (x: number) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')
      return {
        prompt: modulo
          ? `$${big(keys)}$ keys are spread over $n = ${n}$ buckets by $h \\bmod n$, with a good hash. A bucket is added. About how many keys change bucket?`
          : `$${big(keys)}$ keys are spread over $${n}$ nodes on a hash ring with many virtual nodes each, so the shares are about even. A node joins and takes its fair share. About how many keys change node?`,
        answer: { kind: 'number', value },
        hints: modulo
          ? ['A key stays only if $h \\bmod n(n + 1) < n$.', 'So $\\frac{1}{n + 1}$ stay.']
          : ['On a ring, only the keys the new node takes move.'],
        solution: modulo
          ? [
              `$\\frac{n}{n + 1}$ of the keys move: $${big(keys)} \\cdot \\frac{${n}}{${n + 1}} = ${big(value)}$.`,
            ]
          : [
              `The new node takes $\\frac{1}{n + 1}$ of the keys and no other key moves: $\\frac{${big(keys)}}{${n + 1}} = ${big(value)}$.`,
            ],
        data: { n, keys, modulo: modulo ? 1 : 0 },
      }
    },
  },
  {
    id: 'stays-count',
    title: 'Hash values that stay',
    skills: ['hashing', 'consistent-hashing'],
    difficulty: 2,
    generate: (rng) => {
      const n = rng.int(2, 6)
      const doubling = rng.bool()
      const m = doubling ? 2 * n : n + 1
      const period = doubling ? m : n * m
      const blocks = rng.int(2, 5)
      const total = period * blocks
      const value = blocks * n
      return {
        prompt: `Keys go to bucket $h \\bmod n$. The bucket count changes from $${n}$ to $${m}$. Of the hash values $h = 0, 1, \\dots, ${total - 1}$, how many keep their bucket?`,
        answer: { kind: 'number', value },
        hints: [
          `Both remainders repeat every $${period}$ values. Find the values in one period where they agree.`,
        ],
        solution: [
          doubling
            ? `$h \\bmod ${m} = h \\bmod ${n}$ exactly when $h \\bmod ${m} < ${n}$: $${n}$ values in each period of $${period}$.`
            : `$h \\bmod ${n} = h \\bmod ${m}$ only for $h \\bmod ${period} < ${n}$: $${n}$ values in each period of $${period}$.`,
          `$${total}$ values are $${blocks}$ periods, so $${blocks} \\cdot ${n} = ${value}$ stay.`,
        ],
        data: { n, m, total },
      }
    },
  },
])
