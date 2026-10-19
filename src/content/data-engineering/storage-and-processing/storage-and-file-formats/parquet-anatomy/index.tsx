import { useState } from 'react'
import { type Vec2 } from '@/lib/math'
import { groupRanges, groupsRead, type Range } from '@/lib/storage'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  MathLabel,
  Overlay,
  Stage,
  TextLabel,
  useAnimatedValue,
  useCoords,
  useStepEffect,
  useVizStep,
  VizControls,
  SqlLabel,
} from '@/viz-kit'

const COLUMNS = ['day', 'city', 'amount'] as const
/** Days spread over the month, so every row group of the unsorted file has a wide range. */
const DAYS = [
  3, 27, 12, 8, 19, 2, 25, 6, 14, 1, 21, 10, 9, 28, 16, 4, 23, 12, 20, 5, 11, 26, 15, 24,
]
const CITIES = ['LIS', 'OSL', 'REC', 'TYO', 'OSL', 'LIS']
const AMOUNTS = [
  42, 17, 88, 35, 61, 23, 74, 50, 19, 66, 31, 92, 27, 58, 45, 13, 80, 39, 64, 22, 97, 48, 36, 71,
]
const N = DAYS.length
const ROWS: readonly (readonly string[])[] = DAYS.map((d, i) => [
  String(d),
  CITIES[(i * 5) % CITIES.length]!,
  String(AMOUNTS[i]),
])
const PER_GROUP = 6
const GROUPS = N / PER_GROUP
const PER_PAGE = 3
const PAGES_PER_CHUNK = PER_GROUP / PER_PAGE
const TOTAL_PAGES = GROUPS * COLUMNS.length * PAGES_PER_CHUNK
const T0 = 12

/** Position of each row after a stable sort by day. */
const SORTED_AT = (() => {
  const order = DAYS.map((d, i) => [d, i] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const at = Array<number>(N)
  order.forEach(([, i], k) => (at[i] = k))
  return at
})()
const SORTED_DAYS = [...DAYS].sort((a, b) => a - b)
const sortedValues = (values: readonly number[]) => {
  const out = Array<number>(N)
  values.forEach((v, i) => (out[SORTED_AT[i]!] = v))
  return out
}

const STATS: Record<'plain' | 'sorted', { day: Range[]; amount: Range[] }> = {
  plain: { day: groupRanges(DAYS, PER_GROUP), amount: groupRanges(AMOUNTS, PER_GROUP) },
  sorted: {
    day: groupRanges(SORTED_DAYS, PER_GROUP),
    amount: groupRanges(sortedValues(AMOUNTS), PER_GROUP),
  },
}

/** Layout: the file runs down the left, the footer statistics sit on the right. */
const X0 = 150
const Y0 = 110
const CW = 58
const CH = 19
const GROUP_GAP = 16
const PAGE_GAP = 8
const COL_GAP = 14
const STATS_X = 385

const STEPS = [
  'table',
  'row-groups',
  'column-chunks',
  'pages',
  'footer',
  'projection',
  'pushdown',
  'sorted',
] as const
type StepId = (typeof STEPS)[number]
const after = (step: StepId, from: StepId) => STEPS.indexOf(step) >= STEPS.indexOf(from)

type CellState = 'idle' | 'read' | 'match' | 'faded'

function Cell({ at, text, state }: { at: Vec2; text: string; state: CellState }) {
  const c = useCoords()
  const u = c.unit
  const [x, y] = c.toPx(at)
  const read = state === 'read' || state === 'match'
  return (
    <g
      style={{
        opacity: state === 'faded' ? 0.3 : 1,
        transition: 'opacity var(--dur-slow) var(--ease-out)',
      }}
    >
      <rect
        x={x + 2 * u}
        y={y + 1.5 * u}
        width={(CW - 4) * u}
        height={(CH - 3) * u}
        rx={3 * u}
        style={{
          fill: read ? alpha(vc.blue, 0.28) : 'var(--bg-elevated)',
          stroke: state === 'match' ? vc.yellow : read ? vc.blue : vc.gridStrong,
          transition: 'fill var(--dur-slow), stroke var(--dur-slow)',
        }}
        strokeWidth={state === 'match' ? 2 : 1}
      />
      <text
        x={x + (CW / 2) * u}
        y={y + (CH / 2) * u}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: vc.fg, fontSize: 11 * u, fontFamily: 'var(--font-mono)' }}
      >
        {text}
      </text>
    </g>
  )
}

/** A frame around a region of the stage, `pad` units outside it. */
function Frame({
  at,
  size,
  opacity,
  pad = 2,
  stroke = vc.gridStrong,
}: {
  at: Vec2
  size: Vec2
  opacity: number
  pad?: number
  stroke?: string
}) {
  const c = useCoords()
  const u = c.unit
  const [x, y] = c.toPx(at)
  return (
    <g style={{ opacity, transition: 'opacity var(--dur-slow)' }}>
      <rect
        x={x - pad * u}
        y={y - pad * u}
        width={(size[0] + 2 * pad) * u}
        height={(size[1] + 2 * pad) * u}
        rx={(3 + pad) * u}
        style={{ fill: 'none', stroke, transition: 'stroke var(--dur-slow)' }}
        strokeWidth={1.25}
      />
    </g>
  )
}

export default function ParquetAnatomy() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '') ? (id as StepId) : 'table'
  const [t, setT] = useState(T0)
  useStepEffect(Object.fromEntries(STEPS.map((s) => [s, () => setT(T0)])))

  const groupGap = useAnimatedValue(after(step, 'row-groups') ? GROUP_GAP : 0)
  const colGap = useAnimatedValue(after(step, 'column-chunks') ? COL_GAP : 0)
  const pageGap = useAnimatedValue(after(step, 'pages') ? PAGE_GAP : 0)
  const sortT = useAnimatedValue(step === 'sorted' ? 1 : 0, { duration: 1.2 })
  const settled = sortT === 0 || sortT === 1
  const sorted = step === 'sorted'
  const filtering = step === 'pushdown' || sorted
  const querying = step === 'projection' || filtering
  const showStats = after(step, 'footer') && settled

  const colX = (j: number) => X0 + j * (CW + colGap)
  const groupH = PER_GROUP * CH + pageGap
  const groupY = (g: number) => Y0 + g * (groupH + groupGap)
  /** Top of page `k` (from 0) inside a row group. */
  const pageY = (k: number) => k * (PER_PAGE * CH + pageGap)
  const posY = (p: number) => {
    const r = p % PER_GROUP
    return groupY(Math.floor(p / PER_GROUP)) + pageY(Math.floor(r / PER_PAGE)) + (r % PER_PAGE) * CH
  }
  const stackW = COLUMNS.length * CW + (COLUMNS.length - 1) * colGap
  const stackBottom = groupY(GROUPS - 1) + groupH

  const stats = STATS[sorted ? 'sorted' : 'plain']
  const read = filtering ? groupsRead(stats.day, { op: '=', value: t }) : [0, 1, 2, 3]
  const usedColumns: readonly number[] = filtering ? [0, 2] : step === 'projection' ? [2] : []
  const pagesRead = read.length * usedColumns.length * PAGES_PER_CHUNK
  const matches = filtering ? DAYS.filter((d) => d === t).length : 0

  const cellState = (row: number, j: number): CellState => {
    if (!querying || !settled) return 'idle'
    const group = Math.floor((sorted ? SORTED_AT[row]! : row) / PER_GROUP)
    if (!read.includes(group) || !usedColumns.includes(j)) return 'faded'
    return filtering && DAYS[row] === t && j !== 1 ? 'match' : 'read'
  }

  const readouts: Record<StepId, [string, string | number, string?][]> = {
    table: [
      ['rows', N],
      ['columns', COLUMNS.length],
    ],
    'row-groups': [
      ['row groups', GROUPS],
      ['rows per group', PER_GROUP],
    ],
    'column-chunks': [
      ['row groups', GROUPS],
      ['column chunks', GROUPS * COLUMNS.length],
    ],
    pages: [
      ['column chunks', GROUPS * COLUMNS.length],
      ['pages', TOTAL_PAGES],
    ],
    footer: [
      ['chunks with statistics', GROUPS * COLUMNS.length],
      ['pages', TOTAL_PAGES],
    ],
    projection: [
      ['column chunks read', `${GROUPS} / ${GROUPS * COLUMNS.length}`],
      ['pages read', `${pagesRead} / ${TOTAL_PAGES}`, vc.blue],
    ],
    pushdown: [
      ['$t$', t],
      ['row groups read', `${read.length} / ${GROUPS}`],
      ['pages read', `${pagesRead} / ${TOTAL_PAGES}`, vc.blue],
      ['matching rows', matches, vc.yellow],
    ],
    sorted: [],
  }
  readouts.sorted = readouts.pushdown

  const query =
    step === 'projection'
      ? 'SELECT SUM(amount) FROM sales'
      : filtering
        ? `SELECT SUM(amount) FROM sales WHERE day = ${t}`
        : 'sales.parquet'

  const range = (r: Range) => `[${r.min}, ${r.max}]`

  return (
    <>
      <Stage
        domain={{ x: [20, 760], y: [40, 730] }}
        yUp={false}
        ariaLabel="A Parquet file drawn as four row groups of six rows, each split into three column chunks of two pages, with a footer of min and max statistics per row group on the right"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {readouts[step].map(([l, v, color]) => (
                <Readout key={l} label={l} value={v} color={color} />
              ))}
            </ReadoutPanel>
          </Overlay>
        }
      >
        {querying ? (
          <SqlLabel at={[X0, 62]} literalColor={vc.yellow}>
            {query}
          </SqlLabel>
        ) : (
          <TextLabel at={[X0, 62]} align="start" size={13} mono color={vc.fg}>
            {query}
          </TextLabel>
        )}

        {COLUMNS.map((name, j) => (
          <TextLabel key={name} at={[colX(j) + CW / 2, Y0 - 12]} size={11} mono>
            {name}
          </TextLabel>
        ))}

        {/* Row group labels, column chunk frames and the page frames inside them. */}
        {Array.from({ length: GROUPS }, (_, g) => (
          <g key={g}>
            <TextLabel
              at={[X0 - 14, groupY(g) + groupH / 2]}
              align="end"
              size={11}
              mono
              opacity={after(step, 'row-groups') ? 1 : 0}
              color={filtering && settled && !read.includes(g) ? vc.subtle : vc.fg}
            >
              {`row group ${g + 1}`}
            </TextLabel>
            {COLUMNS.map((name, j) => (
              <Frame
                key={name}
                at={[colX(j), groupY(g)]}
                size={[CW, groupH]}
                pad={after(step, 'pages') ? 5 : 2}
                opacity={after(step, 'column-chunks') ? 1 : 0}
              />
            ))}
            {COLUMNS.flatMap((name, j) =>
              Array.from({ length: PAGES_PER_CHUNK }, (_, k) => (
                <Frame
                  key={`${name}${k}`}
                  at={[colX(j), groupY(g) + pageY(k)]}
                  size={[CW, PER_PAGE * CH]}
                  stroke={step === 'pages' ? vc.yellow : vc.gridStrong}
                  opacity={after(step, 'pages') ? 1 : 0}
                />
              )),
            )}
            {Array.from({ length: PAGES_PER_CHUNK }, (_, k) => (
              <TextLabel
                key={k}
                at={[
                  colX(COLUMNS.length - 1) + CW + 14,
                  groupY(g) + pageY(k) + (PER_PAGE * CH) / 2,
                ]}
                align="start"
                size={11}
                mono
                color={vc.yellow}
                opacity={step === 'pages' ? 1 : 0}
              >
                {`page ${k + 1}`}
              </TextLabel>
            ))}
          </g>
        ))}

        {/* The values, which slide into day order in the last step. */}
        {ROWS.map((row, i) => {
          const y = posY(i) + (posY(SORTED_AT[i]!) - posY(i)) * sortT
          return row.map((v, j) => (
            <Cell key={`${i},${j}`} at={[colX(j), y]} text={v} state={cellState(i, j)} />
          ))
        })}

        {/* The footer: a block at the end of the file, and the statistics it holds. */}
        <g
          style={{
            opacity: after(step, 'footer') ? 1 : 0,
            transition: 'opacity var(--dur-slow)',
          }}
        >
          <Frame
            at={[X0, stackBottom + 16]}
            size={[stackW, CH + 4]}
            opacity={1}
            stroke={vc.yellow}
          />
          <TextLabel at={[X0 + stackW / 2, stackBottom + 16 + (CH + 4) / 2]} size={11} mono>
            footer
          </TextLabel>
          <TextLabel at={[STATS_X, Y0 - 12]} align="start" size={11} uppercase>
            footer statistics
          </TextLabel>
          {Array.from({ length: GROUPS }, (_, g) => {
            const skipped = filtering && !read.includes(g)
            const y = groupY(g) + groupH / 2
            return (
              <g
                key={g}
                style={{ opacity: showStats ? 1 : 0, transition: 'opacity var(--dur-slow)' }}
              >
                <TextLabel
                  at={[STATS_X, y]}
                  align="start"
                  size={12}
                  mono
                  color={skipped ? vc.subtle : filtering ? vc.yellow : vc.fg}
                >
                  {`day ${range(stats.day[g]!)}`}
                </TextLabel>
                <TextLabel
                  at={[STATS_X + 100, y]}
                  align="start"
                  size={12}
                  mono
                  color={skipped ? vc.subtle : vc.fg}
                >
                  {`amount ${range(stats.amount[g]!)}`}
                </TextLabel>
                <TextLabel
                  at={[STATS_X + 225, y]}
                  align="start"
                  size={11}
                  uppercase
                  opacity={filtering ? 1 : 0}
                  color={skipped ? vc.subtle : vc.blue}
                >
                  {skipped ? 'skip' : 'read'}
                </TextLabel>
              </g>
            )
          })}
        </g>

        {(filtering || step === 'projection') && (
          <MathLabel
            at={[390, 714]}
            size={17}
            tex={
              filtering
                ? '\\text{skip a row group if } t < \\min \\text{ or } t > \\max'
                : `${GROUPS} \\text{ chunks} \\times ${PAGES_PER_CHUNK} \\text{ pages} = ${pagesRead} \\text{ pages}`
            }
          />
        )}
      </Stage>

      <VizControls>
        {filtering ? (
          <LabeledSlider
            label="$t$"
            value={t}
            onChange={(v) => setT(Math.round(v))}
            min={1}
            max={28}
            step={1}
            format={(v) => String(Math.round(v))}
            color={vc.yellow}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            Twenty-four rows, row groups of six, pages of three values
          </span>
        )}
      </VizControls>
    </>
  )
}
