import { useState } from 'react'
import { join, type Value } from '@/lib/relational'
import { vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  JoinGrid,
  Overlay,
  RelationTable,
  Stage,
  TextLabel,
  TransposedHeader,
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
  type PairState,
  SqlLabel,
} from '@/viz-kit'
import {
  COL_W,
  CUSTOMERS,
  customerColumns,
  customers,
  GRID,
  GRID_BOTTOM,
  GRID_RIGHT,
  ORDERS_HEADER,
  orderLines,
  orders,
  RESULT,
  resultCells,
  resultColumns,
  ROW_H,
  SQL_Y,
} from '../shop'

type Condition = 'eq' | 'lt' | 'ne'

const conditions: Record<Condition, { sql: string; test: (a: Value, b: Value) => boolean }> = {
  eq: { sql: 'c.id = o.customer_id', test: (a, b) => a !== null && b !== null && a === b },
  lt: { sql: 'c.id < o.customer_id', test: (a, b) => a !== null && b !== null && a < b },
  ne: { sql: 'c.id <> o.customer_id', test: (a, b) => a !== null && b !== null && a !== b },
}

const PAIRS = customers.length * orders.length
/** Results longer than this are summarized by their count instead of listed. */
const MAX_LISTED = 8

export default function JoinsAsProducts() {
  const { id } = useVizStep()
  const [sweep, setSweep] = useState(PAIRS)
  const [condition, setCondition] = useState<Condition>('eq')
  const seq = useSequence()

  useStepEffect({
    product: () => {
      setCondition('eq')
      seq.run(async () => setSweep(0))
    },
    condition: () => {
      setCondition('eq')
      seq.run(({ tween }) => tween(0, PAIRS, { duration: 2.4, onUpdate: setSweep }))
    },
    result: () => setCondition('eq'),
    'fan-out': () => setCondition('eq'),
    'null-keys': () => setCondition('eq'),
    theta: () => setCondition('lt'),
  })
  // Steps after the sweep always show every pair evaluated.
  const evaluated = id === 'product' ? 0 : id === 'condition' ? sweep : PAIRS

  const { sql, test } = conditions[condition]
  const passes = (i: number, j: number) => test(customers[i]!.id, orders[j]!.customer)
  const pairs = join(customers, orders, 'inner', (c, o) => test(c.id, o.customer))

  const fanOut = id === 'fan-out'
  const nullKeys = id === 'null-keys'
  const showResult = id !== 'product' && id !== 'condition'
  const listed = pairs.length <= MAX_LISTED

  const state = (i: number, j: number): PairState => {
    if (i * orders.length + j >= evaluated) return 'candidate'
    if (!passes(i, j)) return 'off'
    if (fanOut && i !== 0) return 'dim'
    return 'match'
  }
  const matchesOf = (i: number) => orders.filter((_, j) => passes(i, j)).length

  return (
    <>
      <Stage
        domain={{ x: [40, 780], y: [40, 740] }}
        yUp={false}
        ariaLabel="A grid with one cell for each pair of a customer and an order; the cells that satisfy the join condition become the rows of the result"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="pairs" value={PAIRS} />
              {id !== 'product' && (
                <Readout
                  label="rows"
                  value={id === 'condition' && sweep < PAIRS ? '…' : pairs.length}
                  color={vc.blue}
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <TransposedHeader
          {...ORDERS_HEADER}
          title="orders"
          lines={orderLines}
          highlight={nullKeys ? [4, 5] : []}
        />
        <RelationTable
          {...CUSTOMERS}
          columns={customerColumns}
          rows={customers.map((c, i) => ({
            id: c.id,
            cells: [c.id, c.name],
            state: fanOut ? (i === 0 ? 'active' : i === 2 ? 'dim' : 'idle') : 'idle',
            color: vc.blue,
          }))}
        />
        <TextLabel at={[CUSTOMERS.x, GRID_BOTTOM + 22]} align="start" uppercase size={11}>
          customers
        </TextLabel>

        <JoinGrid
          x={GRID.x}
          y={GRID.y}
          rows={customers.length}
          cols={orders.length}
          colWidth={COL_W}
          rowHeight={ROW_H}
          state={state}
        />

        {fanOut &&
          customers.map((c, i) => (
            <TextLabel
              key={c.id}
              at={[GRID_RIGHT + 30, GRID.y + (i + 0.5) * ROW_H]}
              size={13}
              mono
              color={i === 0 ? vc.blue : vc.subtle}
            >
              {`× ${matchesOf(i)}`}
            </TextLabel>
          ))}

        <SqlLabel at={[CUSTOMERS.x, SQL_Y]}>
          {id === 'product'
            ? 'customers c CROSS JOIN orders o'
            : `customers c JOIN orders o ON ${sql}`}
        </SqlLabel>

        <g style={{ opacity: showResult ? 1 : 0, transition: 'opacity var(--dur-slow)' }}>
          {listed ? (
            <RelationTable
              {...RESULT}
              title="result"
              columns={resultColumns}
              rows={pairs.map((p) => ({
                id: `${p.left}-${p.right}`,
                cells: resultCells(p.left, p.right),
                state: fanOut && p.left === 0 ? 'active' : 'idle',
                color: vc.blue,
              }))}
            />
          ) : (
            <TextLabel at={[RESULT.x, RESULT.y + 50]} align="start" size={14} color={vc.muted}>
              {`${pairs.length} rows, too many to list`}
            </TextLabel>
          )}
        </g>
      </Stage>

      <VizControls>
        {id === 'theta' ? (
          <SegmentedControl
            label="Condition"
            value={condition}
            onChange={setCondition}
            options={[
              { value: 'eq', label: 'c.id = o.customer_id' },
              { value: 'lt', label: 'c.id < o.customer_id' },
              { value: 'ne', label: 'c.id <> o.customer_id' },
            ]}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            {id === 'product' ? 'Every cell is a row' : 'Lit cells are rows of the result'}
          </span>
        )}
      </VizControls>
    </>
  )
}
