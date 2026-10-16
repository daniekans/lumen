import { useState } from 'react'
import { clamp, lerpVec, type Vec2 } from '@/lib/math'
import { createRng } from '@/lib/practice/rng'
import { alpha, vc } from '@/styles/viz-colors'
import { Button } from '@/ui/atoms'
import { Readout, ReadoutPanel } from '@/ui/molecules'
import {
  MathLabel,
  Overlay,
  RelationTable,
  Segment,
  Stage,
  tableLayout,
  TextLabel,
  useCoords,
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
  type TableColumn,
} from '@/viz-kit'

const names = ['Ana', 'Ben', 'Caio', 'Dara']
const cities = ['Lisbon', 'Oslo', 'Recife']

const nameY = (i: number) => 190 + i * 62
const cityX = (j: number) => 230 + j * 110
const cellAt = (i: number, j: number): Vec2 => [cityX(j), nameY(i)]
const GRID_X: [number, number] = [190, 490]

const columns: TableColumn[] = [
  { label: 'name', width: 130 },
  { label: 'city', width: 130 },
]
const TABLE = { x: 580, y: 120, rowHeight: 30 }
const layout = tableLayout({ ...TABLE, columns, titleHeight: 26 })

const cellKey = (i: number, j: number) => `${i},${j}`
const LIVES_IN = [cellKey(0, 0), cellKey(1, 2), cellKey(2, 2), cellKey(3, 1)]
/** Ana in a second city: the pair that makes the relation stop being a function of name. */
const SECOND_CITY = cellKey(0, 2)

/** A clickable cell of the product grid. */
function Cell({
  at,
  lit,
  visible,
  onClick,
}: {
  at: Vec2
  lit: boolean
  visible: number
  onClick?: () => void
}) {
  const c = useCoords()
  const [x, y] = c.toPx(at)
  const r = 10 * c.unit
  return (
    <g
      style={{ opacity: visible, cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
      pointerEvents={onClick ? 'auto' : 'none'}
    >
      <circle cx={x} cy={y} r={r * 2} fill="transparent" />
      <circle
        cx={x}
        cy={y}
        r={r}
        style={{
          fill: lit ? vc.blue : 'var(--bg-elevated)',
          stroke: lit ? vc.blue : vc.gridStrong,
          transition:
            'fill var(--dur-slow) var(--ease-out), stroke var(--dur-slow) var(--ease-out)',
        }}
        strokeWidth={1.5}
      />
    </g>
  )
}

/** A translucent band behind one row of the grid, marking a name with two cities. */
function RowBand({ i, color }: { i: number; color: string }) {
  const c = useCoords()
  const [x0, y0] = c.toPx([GRID_X[0] - 130, nameY(i) - 24])
  const [x1, y1] = c.toPx([GRID_X[1], nameY(i) + 24])
  return (
    <rect
      x={x0}
      y={y0}
      width={x1 - x0}
      height={y1 - y0}
      rx={8 * c.unit}
      fill={alpha(color, 0.14)}
    />
  )
}

export default function TablesAsRelations() {
  const { id } = useVizStep()
  const [chosen, setChosen] = useState<string[]>(LIVES_IN)
  const [t, setT] = useState(0)
  const [shuffle, setShuffle] = useState(0)
  const seq = useSequence()

  const fly = (to: number) =>
    seq.run(({ tween }) =>
      tween(t, to, { duration: 1.4 * Math.abs(to - t) + 0.01, onUpdate: setT }),
    )

  useStepEffect({
    domains: () => {
      setChosen(LIVES_IN)
      setShuffle(0)
      fly(0)
    },
    product: () => {
      setChosen(LIVES_IN)
      setShuffle(0)
      fly(0)
    },
    relation: () => {
      setShuffle(0)
      fly(0)
    },
    table: () => {
      setShuffle(0)
      fly(1)
    },
    order: () => {
      setShuffle((s) => s + 1)
      fly(1)
    },
    function: () => {
      setShuffle(0)
      setChosen([...LIVES_IN, SECOND_CITY])
      fly(1)
    },
  })

  const stepIndex = ['domains', 'product', 'relation', 'table', 'order', 'function'].indexOf(
    id ?? '',
  )
  const showCells = stepIndex >= 1
  const showLit = stepIndex >= 2
  const editable = stepIndex >= 2

  const toggle = (k: string) =>
    setChosen((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))

  // Tuples in grid order; the table shows them in this order unless shuffled.
  const tuples = [...chosen]
    .map((k) => k.split(',').map(Number) as [number, number])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const slots = shuffle
    ? createRng(shuffle * 7919).shuffle(tuples.map((_, i) => i))
    : tuples.map((_, i) => i)

  const perName = names.map((_, i) => tuples.filter(([n]) => n === i).length)
  const isFunction = perName.every((n) => n <= 1)
  const checking = id === 'function'

  const tableOpacity = clamp(t * 2.5, 0, 1)
  const rowOpacity = clamp((t - 0.7) / 0.3, 0, 1)

  return (
    <>
      <Stage
        domain={{ x: [80, 860], y: [80, 540] }}
        yUp={false}
        ariaLabel="A grid of name and city pairs; the chosen pairs become the rows of a table"
        overlay={
          stepIndex >= 1 && (
            <Overlay corner="top-right">
              <ReadoutPanel>
                <Readout label="$|N \times C|$" value={12} />
                {showLit && <Readout label="$|R|$" value={tuples.length} color={vc.blue} />}
                {stepIndex >= 3 && <Readout label="degree" value={2} />}
                {checking && (
                  <Readout
                    label="name → city"
                    value={isFunction ? 'function' : 'not a function'}
                    color={isFunction ? vc.blue : vc.red}
                  />
                )}
              </ReadoutPanel>
            </Overlay>
          )
        }
      >
        {checking &&
          perName.map((n, i) => (n > 1 ? <RowBand key={i} i={i} color={vc.red} /> : null))}

        {/* Grid lines of the product. */}
        <g style={{ opacity: showCells ? 1 : 0, transition: 'opacity var(--dur-slow)' }}>
          {names.map((_, i) => (
            <Segment
              key={i}
              from={[GRID_X[0], nameY(i)]}
              to={[GRID_X[1], nameY(i)]}
              color={vc.grid}
              width={1}
            />
          ))}
          {cities.map((_, j) => (
            <Segment
              key={j}
              from={[cityX(j), nameY(0) - 30]}
              to={[cityX(j), nameY(3) + 30]}
              color={vc.grid}
              width={1}
            />
          ))}
        </g>

        {names.map((n, i) => (
          <TextLabel
            key={n}
            at={[GRID_X[0] - 20, nameY(i)]}
            align="end"
            size={14}
            mono
            color={vc.fg}
          >
            {n}
          </TextLabel>
        ))}
        {cities.map((n, j) => (
          <TextLabel key={n} at={[cityX(j), nameY(0) - 50]} size={14} mono color={vc.fg}>
            {n}
          </TextLabel>
        ))}
        <MathLabel at={[GRID_X[0] - 60, nameY(3) + 62]} tex="N" color={vc.muted} />
        <MathLabel at={[cityX(1), nameY(0) - 82]} tex="C" color={vc.muted} />

        {names.map((_, i) =>
          cities.map((_, j) => {
            const k = cellKey(i, j)
            return (
              <Cell
                key={k}
                at={cellAt(i, j)}
                lit={showLit && chosen.includes(k)}
                visible={showCells ? 1 : 0}
                onClick={editable ? () => toggle(k) : undefined}
              />
            )
          }),
        )}

        <MathLabel
          at={[340, 510]}
          tex={
            stepIndex === 0
              ? 'N = \\{\\text{Ana}, \\text{Ben}, \\text{Caio}, \\text{Dara}\\}, \\quad C = \\{\\text{Lisbon}, \\text{Oslo}, \\text{Recife}\\}'
              : stepIndex === 1
                ? 'N \\times C = \\{(n, c) : n \\in N,\\ c \\in C\\}'
                : 'R \\subseteq N \\times C'
          }
          size={stepIndex === 0 ? 15 : 17}
        />

        <g style={{ opacity: tableOpacity }}>
          <RelationTable
            {...TABLE}
            title="lives_in"
            columns={columns}
            color={vc.blue}
            rows={tuples.map(([i, j], r) => ({
              id: cellKey(i, j),
              cells: [names[i]!, cities[j]!],
              slot: slots[r],
              opacity: rowOpacity,
              state: checking && perName[i]! > 1 ? 'error' : 'idle',
            }))}
          />
        </g>

        {/* Each chosen pair travels from its cell to its row. */}
        {t > 0.001 &&
          t < 0.999 &&
          tuples.map(([i, j], r) => {
            const target: Vec2 = [layout.x + layout.width / 2, layout.rowCenterY(slots[r]!)]
            return <FlyingDot key={cellKey(i, j)} at={lerpVec(cellAt(i, j), target, t)} t={t} />
          })}
      </Stage>

      <VizControls>
        {editable ? (
          <>
            {stepIndex >= 3 && (
              <Button onClick={() => setShuffle((s) => s + 1)}>Shuffle rows</Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setChosen(checking ? [...LIVES_IN, SECOND_CITY] : LIVES_IN)}
            >
              Reset pairs
            </Button>
          </>
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            {stepIndex === 0 ? 'Two sets of values' : 'Every pair of a name and a city'}
          </span>
        )}
      </VizControls>
    </>
  )
}

function FlyingDot({ at, t }: { at: Vec2; t: number }) {
  const c = useCoords()
  const [x, y] = c.toPx(at)
  return (
    <circle
      cx={x}
      cy={y}
      r={8 * c.unit}
      fill={vc.blue}
      opacity={clamp(Math.min(t * 6, (1 - t) * 4), 0, 1)}
      pointerEvents="none"
    />
  )
}
