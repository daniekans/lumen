import { useState } from 'react'
import { partitionBy, prunedPaths, type Filter, type Row } from '@/lib/partitioning'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
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

/** Days 1 to 4 with 7, 5, 6 and 6 rows, and every (day, city) pair present. */
const DATA: readonly [number, string, number][] = [
  [3, 'OSL', 42],
  [1, 'LIS', 17],
  [4, 'REC', 88],
  [2, 'OSL', 35],
  [1, 'REC', 61],
  [3, 'LIS', 23],
  [2, 'LIS', 74],
  [4, 'OSL', 50],
  [1, 'OSL', 19],
  [3, 'REC', 66],
  [4, 'LIS', 31],
  [1, 'LIS', 92],
  [2, 'REC', 27],
  [3, 'OSL', 58],
  [1, 'REC', 45],
  [4, 'REC', 13],
  [2, 'OSL', 80],
  [3, 'LIS', 39],
  [1, 'OSL', 64],
  [4, 'LIS', 22],
  [3, 'REC', 97],
  [1, 'LIS', 48],
  [2, 'LIS', 36],
  [4, 'OSL', 71],
]
const ROWS: readonly Row[] = DATA.map(([day, city, amount]) => ({ day, city, amount }))
const N = ROWS.length
const COLUMNS = ['day', 'city', 'amount'] as const
const DAYS = [1, 2, 3, 4]
const T0 = 2

const BY_DAY = partitionBy(ROWS, ['day'])
const BY_DAY_CITY = partitionBy(ROWS, ['day', 'city'])

/** Position of each row (by index in ROWS) when the rows are listed partition by partition. */
const positions = (parts: Map<string, Row[]>) => {
  const at = Array<number>(N)
  let k = 0
  for (const rows of parts.values()) for (const r of rows) at[ROWS.indexOf(r)] = k++
  return at
}
const AT_DAY = positions(BY_DAY)
const AT_DAY_CITY = positions(BY_DAY_CITY)

/** Layout: folder names on the left, cells to their right. */
const X0 = 360
const Y0 = 100
const CW = 58
const CH = 19
const DAY_GAP = 16
const CITY_GAP = 8
const DAY_LABEL_X = X0 - 110
const CITY_LABEL_X = X0 - 14

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Top of row position `p` in the plain, day and day/city layouts. */
const yPlain = (p: number) => Y0 + p * CH
const yGrouped = (p: number, parts: Map<string, Row[]>, cityGap: boolean) => {
  let k = 0
  let y = Y0
  let lastDay: string | undefined
  for (const [path, rows] of parts) {
    const day = path.split('/')[0]
    if (lastDay !== undefined) y += day === lastDay ? (cityGap ? CITY_GAP : 0) : DAY_GAP
    lastDay = day
    if (p < k + rows.length) return y + (p - k) * CH
    y += rows.length * CH
    k += rows.length
  }
  return y
}

const STEPS = [
  'table',
  'partition',
  'path',
  'prune',
  'other-column',
  'two-levels',
  'small-files',
] as const
type StepId = (typeof STEPS)[number]
const after = (step: StepId, from: StepId) => STEPS.indexOf(step) >= STEPS.indexOf(from)

type CellState = 'idle' | 'read' | 'match' | 'faded'

function Cell({
  x,
  y,
  width,
  text,
  state,
}: {
  x: number
  y: number
  width: number
  text: string
  state: CellState
}) {
  const c = useCoords()
  const u = c.unit
  const [px, py] = c.toPx([x, y])
  const read = state === 'read' || state === 'match'
  const shown = width / CW
  if (shown < 0.02) return null
  return (
    <g
      style={{
        opacity: (state === 'faded' ? 0.3 : 1) * shown,
        transition: 'opacity var(--dur-slow) var(--ease-out)',
      }}
    >
      <rect
        x={px + 2 * u}
        y={py + 1.5 * u}
        width={Math.max(0, width - 4) * u}
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
        x={px + (width / 2) * u}
        y={py + (CH / 2) * u}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: vc.fg, fontSize: 11 * u, fontFamily: 'var(--font-mono)' }}
      >
        {text}
      </text>
    </g>
  )
}

/** A folder: a frame around a block of rows. */
function Folder({
  x,
  y,
  width,
  height,
  pad,
  stroke,
  opacity,
}: {
  x: number
  y: number
  width: number
  height: number
  pad: number
  stroke: string
  opacity: number
}) {
  const c = useCoords()
  const u = c.unit
  const [px, py] = c.toPx([x, y])
  return (
    <rect
      x={px - pad * u}
      y={py - pad * u}
      width={(width + 2 * pad) * u}
      height={(height + 2 * pad) * u}
      rx={(3 + pad) * u}
      style={{
        fill: 'none',
        stroke,
        opacity,
        transition: 'opacity var(--dur-slow), stroke var(--dur-slow)',
      }}
      strokeWidth={1.25}
    />
  )
}

export default function PartitioningByKey() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '') ? (id as StepId) : 'table'
  const [t, setT] = useState(T0)
  useStepEffect(Object.fromEntries(STEPS.map((s) => [s, () => setT(T0)])))

  const split = useAnimatedValue(after(step, 'partition') ? 1 : 0, { duration: 1.2 })
  const nested = useAnimatedValue(after(step, 'two-levels') ? 1 : 0, { duration: 1 })
  const dayW = useAnimatedValue(after(step, 'path') ? 0 : CW)
  const cityW = useAnimatedValue(after(step, 'two-levels') ? 0 : CW)
  const settled = (split === 0 || split === 1) && (nested === 0 || nested === 1)
  const twoLevels = after(step, 'two-levels')

  const rowY = (i: number) =>
    lerp(
      lerp(yPlain(i), yGrouped(AT_DAY[i]!, BY_DAY, false), split),
      yGrouped(AT_DAY_CITY[i]!, BY_DAY_CITY, true),
      nested,
    )
  const widths = [dayW, cityW, CW]
  const colX = (j: number) => X0 + widths.slice(0, j).reduce((s, w) => s + w, 0)
  const blockW = dayW + cityW + CW

  const parts = twoLevels ? BY_DAY_CITY : BY_DAY
  const filter: Filter | undefined =
    step === 'table' || step === 'prune'
      ? { day: t }
      : step === 'other-column' || step === 'two-levels'
        ? { city: 'OSL' }
        : undefined
  const partitioned = after(step, 'partition')
  const readPaths = filter
    ? partitioned
      ? prunedPaths(parts.keys(), filter)
      : [...parts.keys()]
    : []
  const readRows = new Set(readPaths.flatMap((p) => parts.get(p)!))
  const matches = (r: Row) =>
    filter !== undefined && Object.entries(filter).every(([c, v]) => r[c] === v)
  const matchCount = ROWS.filter(matches).length

  const cellState = (r: Row): CellState => {
    if (!filter || !settled) return 'idle'
    if (!readRows.has(r)) return 'faded'
    return matches(r) ? 'match' : 'read'
  }

  /** Top and height of the block of rows in a folder, from their current positions. */
  const extent = (rows: readonly Row[]) => {
    const ys = rows.map((r) => rowY(ROWS.indexOf(r)))
    const top = Math.min(...ys)
    return { top, height: Math.max(...ys) - top + CH }
  }

  const folderStroke = (paths: readonly string[]) =>
    filter && settled && !paths.some((p) => readPaths.includes(p))
      ? alpha(vc.gridStrong, 0.4)
      : vc.gridStrong
  const labelColor = (paths: readonly string[]) =>
    filter && settled && !paths.some((p) => readPaths.includes(p)) ? vc.subtle : vc.fg

  const folders = partitioned ? parts.size : 1
  const readouts: Record<StepId, [string, string | number, string?][]> = {
    table: [
      ['files read', '1 / 1', vc.blue],
      ['rows read', N, vc.blue],
      ['matching rows', matchCount, vc.yellow],
    ],
    partition: [
      ['folders', BY_DAY.size],
      ['rows', DAYS.map((d) => BY_DAY.get(`day=${d}`)!.length).join(' + ')],
    ],
    path: [
      ['folders', BY_DAY.size],
      ['columns in the files', '2 / 3'],
    ],
    prune: [],
    'other-column': [],
    'two-levels': [],
    'small-files': [
      ['folders', BY_DAY_CITY.size],
      ['rows per folder', `${N} / ${BY_DAY_CITY.size} = ${N / BY_DAY_CITY.size}`],
    ],
  }
  readouts.prune =
    readouts['other-column'] =
    readouts['two-levels'] =
      [
        ...(step === 'prune' ? [['$t$', t] as [string, number]] : []),
        ['folders read', `${readPaths.length} / ${folders}`, vc.blue],
        ['rows read', readRows.size, vc.blue],
        ['matching rows', matchCount, vc.yellow],
      ]

  const where = filter
    ? ` WHERE ${Object.entries(filter)
        .map(([c, v]) => (typeof v === 'number' ? `${c} = ${v}` : `${c} = '${v}'`))
        .join(' AND ')}`
    : ''
  const query = filter
    ? `SELECT SUM(amount) FROM sales${where}`
    : twoLevels
      ? 'sales/day=…/city=…/'
      : partitioned
        ? 'sales/day=…/'
        : 'sales/'

  return (
    <>
      <Stage
        domain={{ x: [20, 760], y: [30, 700] }}
        yUp={false}
        ariaLabel="A table of 24 sales rows that splits into folders by day, and then by city, with the folders a query reads highlighted"
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
        {filter ? (
          <SqlLabel at={[60, 56]} literalColor={vc.yellow}>
            {query}
          </SqlLabel>
        ) : (
          <TextLabel at={[60, 56]} align="start" size={13} mono color={vc.fg}>
            {query}
          </TextLabel>
        )}

        {COLUMNS.map((name, j) => (
          <TextLabel
            key={name}
            at={[colX(j) + widths[j]! / 2, Y0 - 12]}
            size={11}
            mono
            opacity={widths[j]! / CW}
          >
            {name}
          </TextLabel>
        ))}

        {/* The single file, then one folder per day, then one per day and city. */}
        <Folder
          x={X0}
          y={Y0}
          width={blockW}
          height={N * CH}
          pad={3}
          stroke={vc.gridStrong}
          opacity={1 - split}
        />
        {DAYS.map((d) => {
          const path = `day=${d}`
          const { top, height } = extent(BY_DAY.get(path)!)
          const inside = [...BY_DAY_CITY.keys()].filter((p) => p.startsWith(`${path}/`))
          return (
            <g key={d}>
              <Folder
                x={X0}
                y={top}
                width={blockW}
                height={height}
                pad={3 + 3 * nested}
                stroke={folderStroke(twoLevels ? inside : [path])}
                opacity={split * (twoLevels ? 0.6 : 1)}
              />
              <TextLabel
                at={[DAY_LABEL_X, top + height / 2]}
                align="end"
                size={12}
                mono
                opacity={split}
                color={labelColor(twoLevels ? inside : [path])}
              >
                {`${path}/`}
              </TextLabel>
            </g>
          )
        })}
        {[...BY_DAY_CITY].map(([path, rows]) => {
          const { top, height } = extent(rows)
          return (
            <g key={path}>
              <Folder
                x={X0}
                y={top}
                width={blockW}
                height={height}
                pad={2}
                stroke={folderStroke([path])}
                opacity={nested}
              />
              <TextLabel
                at={[CITY_LABEL_X, top + height / 2]}
                align="end"
                size={11}
                mono
                opacity={nested}
                color={labelColor([path])}
              >
                {`${path.split('/')[1]}/`}
              </TextLabel>
            </g>
          )
        })}

        {ROWS.map((r, i) =>
          COLUMNS.map((c, j) => (
            <Cell
              key={`${i},${c}`}
              x={colX(j)}
              y={rowY(i)}
              width={widths[j]!}
              text={String(r[c])}
              state={cellState(r)}
            />
          )),
        )}
      </Stage>

      <VizControls>
        {step === 'prune' ? (
          <LabeledSlider
            label="$t$"
            value={t}
            onChange={(v) => setT(Math.round(v))}
            min={1}
            max={4}
            step={1}
            format={(v) => String(Math.round(v))}
            color={vc.yellow}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            Twenty-four sales over four days in three cities
          </span>
        )}
      </VizControls>
    </>
  )
}
