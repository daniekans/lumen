import { bucketOf, bucketSizes, pairsCompared } from '@/lib/partitioning'
import { alpha, vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Chip,
  Overlay,
  SqlLabel,
  Stage,
  TextLabel,
  useAnimatedValue,
  useCoords,
  useStepEffect,
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const CUSTOMERS = Array.from({ length: 8 }, (_, i) => 1001 + i)
/** The customer of each order, orders 1 to 16. */
const ORDERS = [
  1004, 1001, 1007, 1002, 1005, 1001, 1008, 1004, 1003, 1006, 1002, 1008, 1004, 1007, 1005, 1001,
]

const STEPS = [
  'pairs',
  'matches',
  'hash-both',
  'shuffle',
  'bucketed',
  'more-buckets',
  'different-counts',
] as const
type StepId = (typeof STEPS)[number]
const after = (step: StepId, from: StepId) => STEPS.indexOf(step) >= STEPS.indexOf(from)

/** Orders down the left, customers across the top, one cell per pair. */
const X0 = 214
const Y0 = 162
const CW = 44
const RH = 26
const GAP = 10
const ORDER_X = 40
const KEY_X = 88
const BUCKET_X = 150

/**
 * Positions of items sorted by group, with a gap between groups, or in their own order when
 * `groups` is undefined. `rank` orders the groups (so 0 and 4 can sit side by side).
 */
const place = (
  count: number,
  size: number,
  groups?: readonly number[],
  rank: (g: number) => number = (g) => g,
) => {
  if (!groups) return Array.from({ length: count }, (_, i) => i * size)
  const order = [...Array(count).keys()].sort(
    (a, b) => rank(groups[a]!) - rank(groups[b]!) || groups[a]! - groups[b]! || a - b,
  )
  const at = Array<number>(count)
  let pos = 0
  order.forEach((i, k) => {
    if (k > 0 && groups[i] !== groups[order[k - 1]!]) pos += GAP
    at[i] = pos
    pos += size
  })
  return at
}

/** The extent of each group along one axis: [start, end] in the placed coordinates. */
const extents = (at: readonly number[], groups: readonly number[], size: number) => {
  const m = new Map<number, [number, number]>()
  at.forEach((p, i) => {
    const g = groups[i]!
    const [s, e] = m.get(g) ?? [Infinity, -Infinity]
    m.set(g, [Math.min(s, p), Math.max(e, p + size)])
  })
  return m
}

function Cell({ x, y, state }: { x: number; y: number; state: 'off' | 'compared' | 'match' }) {
  const c = useCoords()
  const u = c.unit
  const [px, py] = c.toPx([x + 3, y + 3])
  return (
    <rect
      x={px}
      y={py}
      width={(CW - 6) * u}
      height={(RH - 6) * u}
      rx={3 * u}
      style={{
        fill: state === 'off' ? 'none' : alpha(vc.blue, state === 'match' ? 0.45 : 0.22),
        stroke: state === 'match' ? vc.yellow : state === 'compared' ? vc.blue : vc.grid,
        transition: 'fill var(--dur-slow), stroke var(--dur-slow)',
      }}
      strokeWidth={state === 'match' ? 2 : 1}
    />
  )
}

function Frame({
  x,
  y,
  w,
  h,
  opacity,
}: {
  x: number
  y: number
  w: number
  h: number
  opacity: number
}) {
  const c = useCoords()
  const u = c.unit
  const [px, py] = c.toPx([x - 3, y - 3])
  return (
    <rect
      x={px}
      y={py}
      width={(w + 6) * u}
      height={(h + 6) * u}
      rx={5 * u}
      style={{ fill: 'none', stroke: vc.gridStrong, opacity }}
      strokeWidth={1.25}
    />
  )
}

export default function BucketedJoins() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '') ? (id as StepId) : 'pairs'
  const [nPick, setNPick] = useVizParam<'4' | '8'>('n', '8')
  useStepEffect(Object.fromEntries(STEPS.map((s) => [s, () => setNPick('8')])))

  const hashed = after(step, 'hash-both')
  const nOrders = step === 'different-counts' ? 8 : step === 'more-buckets' ? Number(nPick) : 4
  const nCustomers = step === 'different-counts' ? 4 : nOrders
  const ob = ORDERS.map((k) => bucketOf(k, nOrders))
  const cb = CUSTOMERS.map((k) => bucketOf(k, nCustomers))
  // Customers bucket k meets orders buckets with the same remainder modulo the smaller count.
  const small = Math.min(nOrders, nCustomers)
  const meets = (i: number, j: number) => !hashed || ob[i]! % small === cb[j]! % small

  const rowAt = place(ORDERS.length, RH, hashed ? ob : undefined, (g) => g % small)
  const colAt = place(CUSTOMERS.length, CW, hashed ? cb : undefined)
  const pos = useAnimatedValue([...rowAt, ...colAt], { duration: 1.1 })
  const rowY = (i: number) => Y0 + pos[i]!
  const colX = (j: number) => X0 + pos[ORDERS.length + j]!
  const settled = pos.every((p, k) => p === [...rowAt, ...colAt][k])

  const showMatches = after(step, 'matches')
  const compared = ORDERS.reduce((s, _, i) => s + CUSTOMERS.filter((_, j) => meets(i, j)).length, 0)
  const matches = ORDERS.length
  const frames = useAnimatedValue(hashed && settled ? 1 : 0, { duration: 0.4 })

  const rowExt = extents(rowAt, ob, RH)
  const colExt = extents(colAt, cb, CW)
  // Tasks: one per bucket of the smaller count; its rows are the orders buckets that meet it.
  const tasks = Array.from({ length: small }, (_, k) => {
    const rows = [...rowExt].filter(([g]) => g % small === k).map(([, e]) => e)
    const col = [...colExt].find(([g]) => g % small === k)?.[1]
    return { k, rows, col }
  })

  const shuffled = step === 'shuffle' ? ORDERS.length + CUSTOMERS.length : 0
  const sizesNote =
    hashed && nOrders === nCustomers
      ? `${pairsCompared(bucketSizes(ORDERS, nOrders), bucketSizes(CUSTOMERS, nCustomers))}`
      : String(compared)

  return (
    <>
      <Stage
        domain={{ x: [20, 900], y: [4, 660] }}
        yUp={false}
        ariaLabel="A grid with a cell for every pair of an order and a customer. Sorted by bucket, the matching pairs fall into blocks on the diagonal, the only pairs a bucketed join compares"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="orders $a$" value={ORDERS.length} />
              <Readout label="customers $b$" value={CUSTOMERS.length} />
              <Readout
                label="pairs compared"
                value={hashed ? `$\\sum a_k b_k = ${sizesNote}$` : `$ab = ${compared}$`}
                color={vc.blue}
              />
              {showMatches && <Readout label="matches" value={matches} color={vc.yellow} />}
              {after(step, 'shuffle') && (
                <Readout
                  label="rows shuffled"
                  value={shuffled}
                  hint="Rows sent over the network to the worker of their bucket before the join."
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <SqlLabel at={[ORDER_X, 22]}>SELECT * FROM orders o JOIN customers c</SqlLabel>
        <SqlLabel at={[ORDER_X, 44]}>ON o.customer_id = c.id</SqlLabel>

        <TextLabel at={[ORDER_X + 20, Y0 - 16]} size={11} mono>
          order
        </TextLabel>
        <TextLabel at={[KEY_X + 26, Y0 - 16]} size={11} mono>
          cust
        </TextLabel>
        <TextLabel at={[BUCKET_X + 24, Y0 - 16]} size={11} mono opacity={hashed ? 1 : 0}>
          {`mod ${nOrders}`}
        </TextLabel>
        <TextLabel at={[X0 - 16, 81]} align="end" size={11} mono>
          id
        </TextLabel>
        <TextLabel at={[X0 - 16, 109]} align="end" size={11} mono opacity={hashed ? 1 : 0}>
          {`mod ${nCustomers}`}
        </TextLabel>

        {ORDERS.map((k, i) => (
          <g key={i}>
            <Chip x={ORDER_X} y={rowY(i) + 2} width={40} height={RH - 4} text={`o${i + 1}`} />
            <Chip
              x={KEY_X}
              y={rowY(i) + 2}
              width={52}
              height={RH - 4}
              text={String(k)}
              fill="none"
              stroke="none"
            />
            <Chip
              x={BUCKET_X}
              y={rowY(i) + 2}
              width={48}
              height={RH - 4}
              text={String(ob[i])}
              fill="none"
              stroke="none"
              opacity={hashed ? 1 : 0}
            />
          </g>
        ))}
        {CUSTOMERS.map((k, j) => (
          <g key={k}>
            <Chip x={colX(j) + 2} y={70} width={CW - 4} height={22} text={String(k)} />
            <Chip
              x={colX(j) + 2}
              y={98}
              width={CW - 4}
              height={22}
              text={String(cb[j])}
              fill="none"
              stroke="none"
              opacity={hashed ? 1 : 0}
            />
          </g>
        ))}

        {ORDERS.map((key, i) =>
          CUSTOMERS.map((cust, j) => (
            <Cell
              key={`${i},${j}`}
              x={colX(j)}
              y={rowY(i)}
              state={showMatches && key === cust ? 'match' : meets(i, j) ? 'compared' : 'off'}
            />
          )),
        )}

        {tasks.map(({ k, rows, col }) =>
          col
            ? rows.map(([r0, r1], m) => (
                <g key={`${k}-${m}`}>
                  <Frame
                    x={X0 + col[0]}
                    y={Y0 + r0}
                    w={col[1] - col[0]}
                    h={r1 - r0}
                    opacity={frames}
                  />
                  {m === 0 && (
                    <TextLabel
                      at={[X0 + 8 * CW + 7 * GAP + 30, Y0 + (r0 + rows.at(-1)![1]) / 2]}
                      align="start"
                      size={11}
                      mono
                      opacity={frames * (after(step, 'shuffle') ? 1 : 0)}
                    >
                      {`task ${k}`}
                    </TextLabel>
                  )}
                </g>
              ))
            : null,
        )}
      </Stage>

      <VizControls>
        {step === 'more-buckets' ? (
          <SegmentedControl
            label="Buckets"
            value={nPick}
            onChange={setNPick}
            options={[
              { value: '4', label: 'n = 4' },
              { value: '8', label: 'n = 8' },
            ]}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            {step === 'bucketed' || step === 'different-counts'
              ? 'Each table stored by bucket'
              : 'Sixteen orders, eight customers'}
          </span>
        )}
      </VizControls>
    </>
  )
}
