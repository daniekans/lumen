import { useState } from 'react'
import { clamp, lerpVec, type Vec2 } from '@/lib/math'
import { pagesOfCells, type Layout } from '@/lib/storage'
import { alpha, vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Overlay,
  Stage,
  TextLabel,
  useCoords,
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const COLUMNS = ['id', 'day', 'city', 'total']
const ROWS: readonly (readonly string[])[] = [
  ['1', 'Mon', 'LIS', '30'],
  ['2', 'Mon', 'OSL', '12'],
  ['3', 'Mon', 'REC', '45'],
  ['4', 'Tue', 'LIS', '8'],
  ['5', 'Tue', 'REC', '20'],
  ['6', 'Wed', 'OSL', '17'],
  ['7', 'Wed', 'LIS', '26'],
  ['8', 'Wed', 'REC', '11'],
]
const NEW_ROW = ['9', 'Thu', 'OSL', '23']
const N = ROWS.length
const C = COLUMNS.length
const PER_PAGE = 4

const CW = 46
const CH = 30
const TABLE: Vec2 = [40, 150]
const DISK: Vec2 = [40, 490]
const PAGE_W = PER_PAGE * CW
const PAGE_GAP = 18
const LINE_H = 92

type Place = 'table' | Layout

/** Top-left corner of page `k`: four pages to a line. */
const pageAt = (k: number): Vec2 => [
  DISK[0] + (k % 4) * (PAGE_W + PAGE_GAP),
  DISK[1] + Math.floor(k / 4) * LINE_H,
]

const slotOf = (layout: Layout, i: number, j: number) => (layout === 'row' ? i * C + j : j * N + i)

/** Top-left corner of the cell for row `i`, column `j` in a place. */
const cellAt = (place: Place, i: number, j: number): Vec2 => {
  if (place === 'table') return [TABLE[0] + j * CW, TABLE[1] + i * CH]
  const slot = slotOf(place, i, j)
  const [x, y] = pageAt(Math.floor(slot / PER_PAGE))
  return [x + (slot % PER_PAGE) * CW, y]
}

/** Where the inserted row goes: one new page in a row layout, a new page per column otherwise. */
const newCellAt = (layout: Layout, j: number): Vec2 => {
  const [x, y] = pageAt(layout === 'row' ? N : N + j)
  return [x + (layout === 'row' ? j * CW : 0), y]
}

const STEPS = [
  'table',
  'row-layout',
  'row-scan',
  'column-layout',
  'column-scan',
  'lookup',
  'insert',
] as const
type StepId = (typeof STEPS)[number]

const stepPlace: Record<StepId, Place> = {
  table: 'table',
  'row-layout': 'row',
  'row-scan': 'row',
  'column-layout': 'column',
  'column-scan': 'column',
  lookup: 'column',
  insert: 'row',
}

const query: Partial<Record<StepId, string>> = {
  'row-scan': 'SELECT SUM(total) FROM sales',
  'column-scan': 'SELECT SUM(total) FROM sales',
  lookup: 'SELECT * FROM sales WHERE id = 6',
  insert: "INSERT INTO sales VALUES (9, 'Thu', 'OSL', 23)",
}

const all = (f: (k: number) => [number, number], n: number) =>
  Array.from({ length: n }, (_, k) => f(k))

/** Cells a step's query needs. */
const neededCells = (step: StepId): [number, number][] =>
  step === 'row-scan' || step === 'column-scan'
    ? all((i) => [i, 3], N)
    : step === 'lookup'
      ? all((j) => [5, j], C)
      : []

const pagesRead = (step: StepId, layout: Layout) =>
  step === 'insert'
    ? layout === 'row'
      ? [N]
      : all((j) => [N + j, 0], C).map(([k]) => k)
    : pagesOfCells(N, C, neededCells(step), layout, PER_PAGE)

const smooth = (p: number) => p * p * (3 - 2 * p)

function Cell({
  at,
  text,
  state,
  opacity = 1,
}: {
  at: Vec2
  text: string
  state: 'idle' | 'needed' | 'faded'
  opacity?: number
}) {
  const c = useCoords()
  const [x, y] = c.toPx(at)
  const u = c.unit
  return (
    <g
      style={{
        opacity: state === 'faded' ? 0.35 * opacity : opacity,
        transition: 'opacity var(--dur-slow) var(--ease-out)',
      }}
    >
      <rect
        x={x + 2 * u}
        y={y + 2 * u}
        width={(CW - 4) * u}
        height={(CH - 4) * u}
        rx={4 * u}
        style={{
          fill: state === 'needed' ? alpha(vc.blue, 0.45) : 'var(--bg-elevated)',
          stroke: state === 'needed' ? vc.blue : vc.gridStrong,
          transition: 'fill var(--dur-slow), stroke var(--dur-slow)',
        }}
        strokeWidth={1.25}
      />
      <text
        x={x + (CW / 2) * u}
        y={y + (CH / 2) * u}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: vc.fg, fontSize: 12 * u, fontFamily: 'var(--font-mono)' }}
      >
        {text}
      </text>
    </g>
  )
}

function PageFrame({ k, read, opacity = 1 }: { k: number; read: boolean; opacity?: number }) {
  const c = useCoords()
  const u = c.unit
  const [x, y] = c.toPx(pageAt(k))
  return (
    <g style={{ opacity, transition: 'opacity var(--dur-slow)' }}>
      <rect
        x={x - 3 * u}
        y={y - 3 * u}
        width={(PAGE_W + 6) * u}
        height={(CH + 6) * u}
        rx={6 * u}
        style={{
          fill: read ? alpha(vc.yellow, 0.14) : 'transparent',
          stroke: read ? vc.yellow : vc.grid,
          transition: 'fill var(--dur-slow), stroke var(--dur-slow)',
        }}
        strokeWidth={read ? 1.75 : 1}
        strokeDasharray={read ? undefined : `${4 * u} ${3 * u}`}
      />
      <text
        x={x}
        y={y - 10 * u}
        style={{
          fill: read ? vc.yellow : vc.subtle,
          fontSize: 10 * u,
          fontFamily: 'var(--font-mono)',
        }}
      >
        {`page ${k + 1}`}
      </text>
    </g>
  )
}

export default function RowVsColumnar() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '') ? (id as StepId) : 'table'
  const [choice, setChoice] = useState<Layout | null>(null)
  const [from, setFrom] = useState<Place>('table')
  const [to, setTo] = useState<Place>('table')
  const [t, setT] = useState(1)
  const seq = useSequence()

  const go = (place: Place) => {
    setFrom(t < 1 ? 'table' : to)
    setTo(place)
    if (place === 'table') {
      seq.cancel()
      setT(1)
      return
    }
    setT(0)
    seq.run(({ tween }) => tween(0, 1, { duration: 1.8, onUpdate: setT }))
  }

  useStepEffect(
    Object.fromEntries(
      STEPS.map((s) => [
        s,
        () => {
          setChoice(null)
          if (stepPlace[s] !== to) go(stepPlace[s])
        },
      ]),
    ),
  )

  const pick = (layout: Layout) => {
    setChoice(layout)
    if (layout !== to) go(layout)
  }

  const layout: Layout | null = to === 'table' ? null : to
  const needed = neededCells(step)
  const isNeeded = (i: number, j: number) => needed.some(([a, b]) => a === i && b === j)
  const read = layout ? pagesRead(step, layout) : []
  const hasQuery = query[step] !== undefined
  const inserting = step === 'insert'
  const settled = t >= 1

  const progress = (i: number, j: number) => {
    const order = to === 'table' ? 0 : slotOf(to, i, j) / (N * C - 1)
    return smooth(clamp((t - 0.45 * order) / 0.55, 0, 1))
  }

  const pageCount = inserting ? (layout === 'row' ? N + 1 : N + C) : (N * C) / PER_PAGE
  const rowPages = pagesRead(step, 'row').length
  const colPages = pagesRead(step, 'column').length

  return (
    <>
      <Stage
        domain={{ x: [20, 830], y: [60, 710] }}
        yUp={false}
        ariaLabel="A table of eight rows and four columns at the top, and its values written below into pages of four, either row by row or column by column"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {hasQuery && settled ? (
                <>
                  <Readout
                    label={inserting ? 'pages written, rows' : 'pages read, rows'}
                    value={rowPages}
                    color={layout === 'row' ? vc.yellow : undefined}
                  />
                  <Readout
                    label={inserting ? 'pages written, columns' : 'pages read, columns'}
                    value={colPages}
                    color={layout === 'column' ? vc.yellow : undefined}
                  />
                </>
              ) : (
                <>
                  <Readout label="values" value={N * C} />
                  <Readout label="values per page" value={PER_PAGE} />
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <TextLabel at={[TABLE[0], 96]} align="start" size={13} mono color={vc.fg}>
          {query[step] ?? (layout ? `${layout} layout` : 'sales')}
        </TextLabel>

        {/* The table, which stays in place while its values are copied to pages. */}
        {COLUMNS.map((name, j) => (
          <TextLabel key={name} at={[TABLE[0] + j * CW + CW / 2, TABLE[1] - 12]} size={11} mono>
            {name}
          </TextLabel>
        ))}
        {ROWS.map((row, i) =>
          row.map((v, j) => (
            <Cell
              key={`t${i},${j}`}
              at={cellAt('table', i, j)}
              text={v}
              state={isNeeded(i, j) ? 'needed' : layout ? 'faded' : 'idle'}
            />
          )),
        )}
        {NEW_ROW.map((v, j) => (
          <Cell
            key={`tn${j}`}
            at={[TABLE[0] + j * CW, TABLE[1] + N * CH + 8]}
            text={v}
            state="needed"
            opacity={inserting ? 1 : 0}
          />
        ))}

        {/* Pages on disk. */}
        <g style={{ opacity: layout ? 1 : 0.5, transition: 'opacity var(--dur-slow)' }}>
          <TextLabel at={[DISK[0], DISK[1] - 40]} align="start" size={11} uppercase>
            storage
          </TextLabel>
          {Array.from({ length: N + C }, (_, k) => (
            <PageFrame
              key={k}
              k={k}
              read={settled && read.includes(k)}
              opacity={k < pageCount ? 1 : 0}
            />
          ))}
        </g>

        {/* Copies of the values, flying from the table (or the previous layout) to their slots. */}
        {layout &&
          ROWS.map((row, i) =>
            row.map((v, j) => {
              const p = progress(i, j)
              const at = lerpVec(cellAt(from, i, j), cellAt(to, i, j), p)
              const quiet = hasQuery && settled && !inserting && !isNeeded(i, j)
              const onReadPage = read.includes(Math.floor(slotOf(layout, i, j) / PER_PAGE))
              return (
                <Cell
                  key={`d${i},${j}`}
                  at={at}
                  text={v}
                  state={
                    settled && isNeeded(i, j) ? 'needed' : quiet && !onReadPage ? 'faded' : 'idle'
                  }
                  opacity={from === 'table' ? clamp(p * 4, 0, 1) : 1}
                />
              )
            }),
          )}
        {layout &&
          NEW_ROW.map((v, j) => (
            <Cell
              key={`dn${j}`}
              at={newCellAt(layout, j)}
              text={v}
              state="needed"
              opacity={inserting && settled ? 1 : 0}
            />
          ))}
      </Stage>

      <VizControls>
        {layout ? (
          <SegmentedControl
            label="Layout"
            value={choice ?? layout}
            onChange={pick}
            options={[
              { value: 'row', label: 'Row layout' },
              { value: 'column', label: 'Column layout' },
            ]}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            Eight rows, four columns, pages of four values
          </span>
        )}
      </VizControls>
    </>
  )
}
