import { bucketOf, hashInt, rangeBucketOf } from '@/lib/partitioning'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
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

/** Twelve customers, then six new ones that arrive in the range steps. */
const OLD = Array.from({ length: 12 }, (_, i) => 1001 + i)
const NEW = Array.from({ length: 6 }, (_, i) => 1013 + i)
const KEYS = [...OLD, ...NEW]
/** Ranges 1001 to 1003, 1004 to 1006, 1007 to 1009, and 1010 on. */
const RANGE_BOUNDS = [1004, 1007, 1010]
const RANGE_NAMES = ['1001–1003', '1004–1006', '1007–1009', '1010–']
const QUERY = [1007, 1009] as const
const N0 = 4
const KEY0 = 1005
const N_TRY = 5

const STEPS = ['keys', 'hash', 'modulo', 'same-key', 'change-n', 'range', 'range-query'] as const
type StepId = (typeof STEPS)[number]
const after = (step: StepId, from: StepId) => STEPS.indexOf(step) >= STEPS.indexOf(from)
type Layout = 'range' | 'hash'

/** Table on the left: key, h, part. Lanes (the buckets) on the right. */
const Y0 = 110
const RH = 28
const KEY_X = 40
const KEY_W = 64
const H_X = 116
const H_W = 124
const B_X = 252
const B_W = 56
const LX = 340
const LW = 410
const LANES_H = 18 * RH
const CHIP_W = 48
const CHIP_H = 22
const CHIP_X0 = LX + 84
const PER_ROW = Math.floor((LW - 84) / (CHIP_W + 4))

/** Thin spaces between groups of three digits. */
const digits = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** Lanes tall enough for `rows` rows of chips, within the table's height. */
const laneGeometry = (n: number, rows: number) => {
  const gap = 8
  const h = Math.min(rows * (CHIP_H + 4) + 14, (LANES_H - (n - 1) * gap) / n)
  return { h, top: (k: number) => Y0 + k * (h + gap) }
}

/** A lane: the frame of one bucket or range, with its name. */
function Lane({
  y,
  height,
  name,
  stroke,
  fill,
}: {
  y: number
  height: number
  name: string
  stroke: string
  fill: string
}) {
  const c = useCoords()
  const u = c.unit
  const [px, py] = c.toPx([LX, y])
  return (
    <g>
      <rect
        x={px}
        y={py}
        width={LW * u}
        height={height * u}
        rx={5 * u}
        style={{ fill, stroke, transition: 'fill var(--dur-slow), stroke var(--dur-slow)' }}
        strokeWidth={1.25}
      />
      <text
        x={px + 10 * u}
        y={py + Math.min(height / 2, 18) * u}
        dominantBaseline="central"
        style={{ fill: vc.muted, fontSize: 11 * u, fontFamily: 'var(--font-mono)' }}
      >
        {name}
      </text>
    </g>
  )
}

export default function HashPartitioning() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '') ? (id as StepId) : 'keys'
  const [key, setKey] = useVizParam<number>('key', KEY0)
  const [nTry, setNTry] = useVizParam<number>('n', N_TRY)
  const [layout, setLayout] = useVizParam<Layout>('layout', 'range')
  useStepEffect(
    Object.fromEntries(
      STEPS.map((s) => [
        s,
        () => {
          setKey(KEY0)
          setNTry(N_TRY)
          setLayout('range')
        },
      ]),
    ),
  )

  const ranged = after(step, 'range') && layout === 'range'
  const n = step === 'change-n' ? nTry : N0
  const withNew = after(step, 'range')
  const keys = withNew ? KEYS : OLD
  const partOf = (k: number) => (ranged ? rangeBucketOf(k, RANGE_BOUNDS) : bucketOf(k, n))
  const placed = after(step, 'modulo')

  // Chips fill each lane in key order, row by row.
  const fill = Array<number>(n).fill(0)
  for (const k of keys) fill[partOf(k)]!++
  const lanes = laneGeometry(n, Math.max(1, Math.ceil(Math.max(...fill) / PER_ROW)))
  const slot = new Map<number, [number, number]>()
  const seen = Array<number>(n).fill(0)
  for (const k of keys) {
    const p = partOf(k)
    const j = seen[p]!++
    const rows = Math.max(1, Math.floor((lanes.h - 8) / (CHIP_H + 4)))
    const row = Math.min(Math.floor(j / PER_ROW), rows - 1)
    const x = CHIP_X0 + (j % PER_ROW) * (CHIP_W + 4)
    const y = lanes.top(p) + (lanes.h - rows * (CHIP_H + 4) + 4) / 2 + row * (CHIP_H + 4)
    slot.set(k, [x, y])
  }
  const target = KEYS.flatMap((k, i) =>
    placed && slot.has(k) ? slot.get(k)! : [KEY_X + (KEY_W - CHIP_W) / 2, Y0 + i * RH + 3],
  )
  const pos = useAnimatedValue(target, { duration: 1.1 })
  const counts = fill

  const query = step === 'range-query'
  const inQuery = (k: number) => query && QUERY[0] <= k && k <= QUERY[1]
  const readParts = query ? new Set(keys.filter(inQuery).map(partOf)) : new Set<number>()
  const moved = OLD.filter((k) => bucketOf(k, N0) !== bucketOf(k, nTry)).length

  const chipStroke = (k: number) =>
    (step === 'same-key' && k === key) || inQuery(k) ? vc.yellow : vc.gridStrong
  const chipOpacity = (k: number) => {
    if (step === 'change-n') return bucketOf(k, N0) === bucketOf(k, nTry) ? 0.35 : 1
    if (query) return readParts.has(partOf(k)) ? 1 : 0.35
    return 1
  }
  const rowFocus = (k: number) => (step === 'same-key' ? (k === key ? 1 : 0.35) : 1)

  const hashShown = useAnimatedValue(after(step, 'hash') && !ranged ? 1 : 0)
  const partShown = useAnimatedValue(placed ? 1 : 0)
  const newShown = useAnimatedValue(withNew ? 1 : 0)

  const list = (xs: readonly number[]) => xs.join(', ')
  const hashCounts = (ks: readonly number[]) => {
    const c = Array<number>(N0).fill(0)
    for (const k of ks) c[bucketOf(k, N0)]!++
    return c
  }
  const rangeCounts = (ks: readonly number[]) => {
    const c = Array<number>(N0).fill(0)
    for (const k of ks) c[rangeBucketOf(k, RANGE_BOUNDS)]!++
    return c
  }

  const readouts: Record<StepId, [string, string | number, string?, string?][]> = {
    keys: [
      ['keys', OLD.length],
      ['parts $n$', N0],
    ],
    hash: [
      ['keys', OLD.length],
      ['values of $h$', '$0$ to $2^{32} - 1$'],
    ],
    modulo: [
      ['buckets $n$', N0],
      ['keys per bucket', list(counts)],
    ],
    'same-key': [
      ['key', key, vc.yellow],
      ['$h$', digits(hashInt(key))],
      ['bucket', bucketOf(key, N0), vc.yellow],
    ],
    'change-n': [
      ['buckets $n$', nTry],
      ['keys per bucket', list(counts)],
      [
        'keys moved',
        `${moved} / ${OLD.length}`,
        undefined,
        'Keys whose bucket differs from the one they had with $n = 4$, drawn in full.',
      ],
    ],
    range: [
      ['keys per part', list(counts)],
      [
        'new keys, range',
        list(rangeCounts(NEW)),
        undefined,
        'Parts that the six new customers $1013$ to $1018$ go to, by range.',
      ],
      ['new keys, hash', list(hashCounts(NEW)), undefined, 'The same keys, by $h \\bmod 4$.'],
    ],
    'range-query': [
      ['parts read', `${readParts.size} / ${N0}`, vc.blue],
      ['keys read', keys.filter((k) => readParts.has(partOf(k))).length, vc.blue],
      ['matching keys', keys.filter(inQuery).length, vc.yellow],
    ],
  }

  const laneName = (p: number) => (ranged ? RANGE_NAMES[p]! : `bucket ${p}`)
  const header = query
    ? null
    : ranged
      ? 'part = range of customer_id'
      : after(step, 'modulo')
        ? `bucket = h(customer_id) mod ${n}`
        : after(step, 'hash')
          ? 'h(customer_id)'
          : 'orders, split by customer_id'

  return (
    <>
      <Stage
        domain={{ x: [20, 760], y: [30, 640] }}
        yUp={false}
        ariaLabel="Customer keys with their hash values and buckets on the left, and the buckets as lanes on the right, holding the keys that land in each"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {readouts[step].map(([l, v, color, hint]) => (
                <Readout key={l} label={l} value={v} color={color} hint={hint} />
              ))}
            </ReadoutPanel>
          </Overlay>
        }
      >
        {query ? (
          <SqlLabel at={[KEY_X, 56]} literalColor={vc.yellow}>
            {`SELECT * FROM orders WHERE customer_id BETWEEN ${QUERY[0]} AND ${QUERY[1]}`}
          </SqlLabel>
        ) : (
          <TextLabel at={[KEY_X, 56]} align="start" size={13} mono color={vc.fg}>
            {header!}
          </TextLabel>
        )}

        <TextLabel at={[KEY_X + KEY_W / 2, Y0 - 14]} size={11} mono>
          customer_id
        </TextLabel>
        <TextLabel at={[H_X + H_W / 2, Y0 - 14]} size={11} mono opacity={hashShown}>
          h
        </TextLabel>
        <TextLabel at={[B_X + B_W / 2, Y0 - 14]} size={11} mono opacity={partShown}>
          {ranged ? 'part' : `h mod ${n}`}
        </TextLabel>

        {KEYS.map((k, i) => {
          const isNew = i >= OLD.length
          const shown = (isNew ? newShown : 1) * rowFocus(k)
          const y = Y0 + i * RH + 3
          const focus = chipStroke(k) === vc.yellow
          return (
            <g key={k}>
              <Chip
                x={KEY_X}
                y={y}
                width={KEY_W}
                height={CHIP_H}
                text={String(k)}
                stroke={focus ? vc.yellow : vc.gridStrong}
                strokeWidth={focus ? 2 : 1}
                opacity={shown}
              />
              <Chip
                x={H_X}
                y={y}
                width={H_W}
                height={CHIP_H}
                text={digits(hashInt(k))}
                fill="none"
                stroke="none"
                opacity={shown * hashShown}
              />
              <Chip
                x={B_X}
                y={y}
                width={B_W}
                height={CHIP_H}
                text={String(partOf(k))}
                fill="none"
                stroke="none"
                textColor={focus ? vc.yellow : vc.fg}
                opacity={shown * partShown}
              />
            </g>
          )
        })}

        {Array.from({ length: n }, (_, p) => {
          const read = readParts.has(p)
          return (
            <g key={`${n}-${p}`} style={{ opacity: partShown }}>
              <Lane
                y={lanes.top(p)}
                height={lanes.h}
                name={laneName(p)}
                stroke={read ? vc.blue : vc.gridStrong}
                fill={read ? alpha(vc.blue, 0.12) : 'none'}
              />
            </g>
          )
        })}

        {KEYS.map((k, i) => {
          const isNew = i >= OLD.length
          if (!placed || (isNew && !withNew)) return null
          const focus = chipStroke(k) === vc.yellow
          return (
            <Chip
              key={k}
              x={pos[2 * i]!}
              y={pos[2 * i + 1]!}
              width={CHIP_W}
              height={CHIP_H}
              text={String(k)}
              fill={isNew && step === 'range' ? alpha(vc.fg, 0.12) : 'var(--bg-elevated)'}
              stroke={focus ? vc.yellow : vc.gridStrong}
              strokeWidth={focus ? 2 : 1}
              opacity={chipOpacity(k)}
            />
          )
        })}
      </Stage>

      <VizControls>
        {step === 'same-key' ? (
          <LabeledSlider
            label="key"
            value={key}
            onChange={(v) => setKey(Math.round(v))}
            min={OLD[0]!}
            max={OLD.at(-1)!}
            step={1}
            format={(v) => String(Math.round(v))}
            color={vc.yellow}
          />
        ) : step === 'change-n' ? (
          <LabeledSlider
            label="$n$"
            value={nTry}
            onChange={(v) => setNTry(Math.round(v))}
            min={2}
            max={8}
            step={1}
            format={(v) => String(Math.round(v))}
          />
        ) : after(step, 'range') ? (
          <SegmentedControl
            label="Layout"
            value={layout}
            onChange={setLayout}
            options={[
              { value: 'range', label: 'Range' },
              { value: 'hash', label: 'Hash' },
            ]}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            Twelve customers in four buckets
          </span>
        )}
      </VizControls>
    </>
  )
}
