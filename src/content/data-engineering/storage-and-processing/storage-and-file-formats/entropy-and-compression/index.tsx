import { type Vec2 } from '@/lib/math'
import { codeBits, entropy, information, runLengths } from '@/lib/storage'
import { alpha, vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel } from '@/ui/molecules'
import { MathLabel, Overlay, Stage, TextLabel, useCoords, useVizStep } from '@/viz-kit'

interface Distribution {
  names: readonly string[]
  counts: readonly number[]
  /** Prefix codes to show under the bar, when the step has them. */
  words?: readonly string[]
}

const NAMES = ['Lisbon', 'Oslo', 'Recife', 'Tokyo']
const CITY: Distribution = { names: NAMES, counts: [6, 4, 4, 2] }
const DISTRIBUTIONS: Record<string, Distribution> = {
  information: CITY,
  entropy: CITY,
  uniform: { names: NAMES, counts: [4, 4, 4, 4] },
  skewed: { names: NAMES, counts: [8, 4, 2, 2], words: ['0', '10', '110', '111'] },
}

/** The city column of the previous item, by initial, in its order and sorted. */
const COLUMN = 'LOLRTOLRRLTOLROL'.split('')
const SORTED = [...COLUMN].sort((a, b) => 'LORT'.indexOf(a) - 'LORT'.indexOf(b))

const SIZES: [string, number, string][] = [
  ['text', 86, vc.gridStrong],
  ['dictionary, 1 byte codes', 37, vc.blue],
  ['dictionary, 2 bit codes', 25, vc.blue],
  ['dictionary + entropy floor', 21 + 30.49 / 8, vc.yellow],
]

const BAR_X = 110
const BAR_W = 640

function Rect({
  at,
  size,
  fill,
  stroke,
  width = 1.25,
  rx = 4,
}: {
  at: Vec2
  size: Vec2
  fill: string
  stroke: string
  width?: number
  rx?: number
}) {
  const c = useCoords()
  const u = c.unit
  const [x, y] = c.toPx(at)
  return (
    <rect
      x={x}
      y={y}
      width={size[0] * u}
      height={size[1] * u}
      rx={rx * u}
      style={{ fill, stroke, transition: 'fill var(--dur-slow), stroke var(--dur-slow)' }}
      strokeWidth={width}
    />
  )
}

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2))

const fracTex = (c: number, total: number) => {
  let g = c
  let h = total
  while (h) [g, h] = [h, g % h]
  return `\\tfrac{${c / g}}{${total / g}}`
}

/** A stacked bar of probabilities, with the information of each value and a bits comparison. */
function DistributionView({ dist, step }: { dist: Distribution; step: string }) {
  const total = dist.counts.reduce((s, c) => s + c, 0)
  const h = entropy(dist.counts)
  const b = codeBits(dist.counts.length)
  const showAverage = step !== 'information'
  const scale = 440 / Math.max(b, h)
  const starts = dist.counts.map(
    (_, k) => BAR_X + (BAR_W * dist.counts.slice(0, k).reduce((a, c) => a + c, 0)) / total,
  )
  return (
    <>
      <TextLabel at={[BAR_X, 96]} align="start" size={12} mono color={vc.fg}>
        probability of each value
      </TextLabel>
      {dist.counts.map((c, k) => {
        const w = (BAR_W * c) / total
        const x0 = starts[k]!
        const bits = information(c / total)
        return (
          <g key={k}>
            <Rect
              at={[x0, 140]}
              size={[w, 44]}
              fill={alpha(vc.blue, 0.18 + 0.12 * (k % 2))}
              stroke={vc.blue}
            />
            <TextLabel at={[x0 + w / 2, 124]} size={12} mono color={vc.fg}>
              {dist.names[k]!}
            </TextLabel>
            <MathLabel at={[x0 + w / 2, 162]} tex={`p = ${fracTex(c, total)}`} size={15} />
            <MathLabel
              at={[x0 + w / 2, 206]}
              tex={`${fmt(bits)} \\text{ bit${bits === 1 ? '' : 's'}}`}
              size={14}
              color={vc.muted}
            />
            {dist.words && (
              <TextLabel at={[x0 + w / 2, 232]} size={13} mono color={vc.yellow}>
                {dist.words[k]!}
              </TextLabel>
            )}
          </g>
        )
      })}

      {dist.words && (
        <TextLabel at={[BAR_X - 12, 232]} align="end" size={12} mono color={vc.yellow}>
          code
        </TextLabel>
      )}
      <TextLabel at={[BAR_X - 12, 206]} align="end" size={12} mono>
        info
      </TextLabel>

      <g style={{ opacity: showAverage ? 1 : 0, transition: 'opacity var(--dur-slow)' }}>
        <TextLabel at={[BAR_X, 280]} align="start" size={12} mono>
          bits per value
        </TextLabel>
        <TextLabel at={[BAR_X + 118, 312]} align="end" size={12} mono color={vc.fg}>
          entropy H
        </TextLabel>
        <Rect
          at={[BAR_X + 130, 300]}
          size={[h * scale, 24]}
          fill={alpha(vc.blue, 0.4)}
          stroke={vc.blue}
        />
        <TextLabel at={[BAR_X + 140 + h * scale, 312]} align="start" size={12} mono color={vc.fg}>
          {h.toFixed(2)}
        </TextLabel>
        <TextLabel at={[BAR_X + 118, 348]} align="end" size={12} mono color={vc.fg}>
          {dist.words ? 'prefix code' : 'bit packing'}
        </TextLabel>
        <Rect
          at={[BAR_X + 130, 336]}
          size={[(dist.words ? h : b) * scale, 24]}
          fill={alpha(vc.yellow, 0.3)}
          stroke={vc.yellow}
        />
        <TextLabel
          at={[BAR_X + 140 + (dist.words ? h : b) * scale, 348]}
          align="start"
          size={12}
          mono
          color={vc.fg}
        >
          {(dist.words ? h : b).toFixed(2)}
        </TextLabel>
      </g>
    </>
  )
}

/** The column in its order and sorted, with its runs framed. */
function OrderView() {
  const cw = 34
  const x0 = BAR_X + 40
  const strip = (values: readonly string[], y: number, title: string) => {
    return (
      <g>
        <TextLabel at={[x0, y - 20]} align="start" size={12} mono color={vc.fg}>
          {`${title}: ${runLengths(values).length} runs`}
        </TextLabel>
        {values.map((v, i) => (
          <g key={i}>
            <Rect
              at={[x0 + i * cw + 2, y + 2]}
              size={[cw - 4, 26]}
              fill="var(--bg-elevated)"
              stroke={vc.gridStrong}
            />
            <TextLabel at={[x0 + i * cw + cw / 2, y + 15]} size={12} mono color={vc.fg}>
              {v}
            </TextLabel>
          </g>
        ))}
        {runLengths(values).map((r, k) => {
          const from = r.start
          return (
            <Rect
              key={k}
              at={[x0 + from * cw, y]}
              size={[r.length * cw, 30]}
              fill="none"
              stroke={vc.yellow}
              width={1.75}
              rx={6}
            />
          )
        })}
      </g>
    )
  }
  return (
    <>
      {strip(COLUMN, 130, 'in order')}
      {strip(SORTED, 240, 'sorted')}
      <TextLabel at={[x0, 320]} align="start" size={12} mono>
        same counts 6, 4, 4, 2 in both: same entropy
      </TextLabel>
    </>
  )
}

// Ids below 2^20, so plain they need 20 bits.
const IDS = Array.from({ length: 8 }, (_, k) => 700000 + k)
const ID_W = BAR_W / IDS.length

/** Many equally rare values: a bar cut into thin slices, and sorted ids with their deltas. */
function UniqueView() {
  const slices = 64
  const w = BAR_W / slices
  return (
    <>
      <TextLabel at={[BAR_X, 96]} align="start" size={12} mono color={vc.fg}>
        {'probability of each value (1,048,576 values, 64 drawn)'}
      </TextLabel>
      {Array.from({ length: slices }, (_, k) => (
        <Rect
          key={k}
          at={[BAR_X + k * w, 140]}
          size={[w, 44]}
          fill={alpha(vc.blue, 0.18 + 0.12 * (k % 2))}
          stroke={vc.blue}
          width={0.75}
          rx={1}
        />
      ))}
      <MathLabel
        at={[BAR_X + BAR_W / 2, 220]}
        tex="p = 2^{-20} \text{ for every value}"
        size={15}
      />
      {/* Sorted ids: the values carry 20 bits each, their differences almost none. */}
      {IDS.map((id, k) => (
        <g key={id}>
          <Rect
            at={[BAR_X + k * ID_W, 280]}
            size={[ID_W - 6, 28]}
            fill="var(--bg-elevated)"
            stroke={vc.gridStrong}
          />
          <TextLabel at={[BAR_X + k * ID_W + (ID_W - 6) / 2, 294]} size={12} mono color={vc.fg}>
            {String(id)}
          </TextLabel>
          <Rect
            at={[BAR_X + k * ID_W, 344]}
            size={[ID_W - 6, 28]}
            fill={alpha(vc.blue, 0.25)}
            stroke={vc.blue}
          />
          <TextLabel at={[BAR_X + k * ID_W + (ID_W - 6) / 2, 358]} size={12} mono color={vc.fg}>
            {k === 0 ? String(id) : `+${id - IDS[k - 1]!}`}
          </TextLabel>
        </g>
      ))}
      <TextLabel at={[BAR_X, 266]} align="start" size={12} mono>
        ids, sorted: 20 bits each
      </TextLabel>
      <TextLabel at={[BAR_X, 330]} align="start" size={12} mono>
        deltas: 1 bit each after the first
      </TextLabel>
    </>
  )
}

/** Sizes of the city column at each stage, in bytes. */
function SizesView() {
  const scale = 560 / 86
  return (
    <>
      <TextLabel at={[BAR_X, 96]} align="start" size={12} mono color={vc.fg}>
        bytes of the city column
      </TextLabel>
      {SIZES.map(([label, bytes, color], k) => {
        const y = 130 + k * 56
        return (
          <g key={label}>
            <TextLabel at={[BAR_X, y - 10]} align="start" size={12} mono>
              {label}
            </TextLabel>
            <Rect
              at={[BAR_X, y]}
              size={[bytes * scale, 24]}
              fill={alpha(color, 0.35)}
              stroke={color}
            />
            <TextLabel
              at={[BAR_X + bytes * scale + 10, y + 12]}
              align="start"
              size={12}
              mono
              color={vc.fg}
            >
              {bytes.toFixed(Number.isInteger(bytes) ? 0 : 1)}
            </TextLabel>
          </g>
        )
      })}
    </>
  )
}

const formulas: Record<string, string> = {
  information:
    '\\log_2 \\tfrac{1}{p}: \\quad \\log_2 \\tfrac{8}{3} \\approx 1.42, \\quad \\log_2 4 = 2, \\quad \\log_2 8 = 3',
  entropy:
    'H = \\tfrac{3}{8} \\log_2 \\tfrac{8}{3} + \\tfrac{1}{4} \\cdot 2 + \\tfrac{1}{4} \\cdot 2 + \\tfrac{1}{8} \\cdot 3 \\approx 1.91',
  uniform: 'H = 4 \\cdot \\tfrac{1}{4} \\log_2 4 = \\log_2 4 = 2',
  skewed:
    'H = \\tfrac{1}{2} \\cdot 1 + \\tfrac{1}{4} \\cdot 2 + \\tfrac{1}{8} \\cdot 3 + \\tfrac{1}{8} \\cdot 3 = 1.75',
  order:
    '16 \\cdot H \\approx 30.5 \\text{ bits}, \\quad 4 \\text{ runs} \\cdot 5 \\text{ bits} = 20 \\text{ bits}',
  cardinality: 'H = \\log_2 n = \\log_2 2^{20} = 20 \\text{ bits per value}',
  codecs: '\\text{ratio} = \\tfrac{86}{25} = 3.44',
}

export default function EntropyAndCompression() {
  const { id } = useVizStep()
  const step = id ?? 'information'
  const dist = DISTRIBUTIONS[step]

  const readouts: [string, string | number, string?][] = dist
    ? [
        ['distinct', dist.counts.length],
        ...(step === 'information'
          ? []
          : [['$H$', entropy(dist.counts).toFixed(2), vc.blue] as [string, string, string]]),
        ['bit packing', `${codeBits(dist.counts.length)} bits`],
      ]
    : step === 'order'
      ? [
          ['runs, in order', runLengths(COLUMN).length],
          ['runs, sorted', runLengths(SORTED).length, vc.yellow],
          ['$H$', entropy([6, 4, 4, 2]).toFixed(2), vc.blue],
        ]
      : step === 'cardinality'
        ? [
            ['distinct', '$2^{20}$'],
            ['$H$', '20 bits', vc.blue],
          ]
        : [
            ['text', '86 B'],
            ['encoded', '25 B', vc.blue],
            ['ratio', '3.44'],
          ]

  return (
    <Stage
      domain={{ x: [60, 900], y: [60, 470] }}
      yUp={false}
      ariaLabel="Probabilities of the values in a column as a stacked bar, the information of each value, and the entropy compared with the bits a code uses"
      overlay={
        <Overlay corner="top-right">
          <ReadoutPanel>
            {readouts.map(([l, v, color]) => (
              <Readout key={l} label={l} value={v} color={color} />
            ))}
          </ReadoutPanel>
        </Overlay>
      }
    >
      {dist ? (
        <DistributionView dist={dist} step={step} />
      ) : step === 'order' ? (
        <OrderView />
      ) : step === 'cardinality' ? (
        <UniqueView />
      ) : (
        <SizesView />
      )}
      <MathLabel at={[BAR_X + BAR_W / 2, 420]} tex={formulas[step] ?? ''} size={18} />
    </Stage>
  )
}
