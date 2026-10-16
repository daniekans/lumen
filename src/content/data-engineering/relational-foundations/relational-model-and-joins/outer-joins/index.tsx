import { useState } from 'react'
import { joinOn, type JoinKind } from '@/lib/relational'
import { vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  JoinGrid,
  Overlay,
  RelationTable,
  Stage,
  TextLabel,
  TransposedHeader,
  useStepEffect,
  useVizStep,
  VizControls,
  type PairState,
} from '@/viz-kit'
import {
  COL_W,
  CUSTOMERS,
  customerColumns,
  customers,
  GRID,
  GRID_BOTTOM,
  ORDERS_HEADER,
  orderLines,
  orders,
  RESULT,
  resultCells,
  resultColumns,
  ROW_H,
  SQL_Y,
} from '../shop'

type Kind = Extract<JoinKind, 'inner' | 'left' | 'right' | 'full' | 'anti'>

const sql: Record<Kind, [string, string?]> = {
  inner: ['customers c JOIN orders o', 'ON c.id = o.customer_id'],
  left: ['customers c LEFT JOIN orders o', 'ON c.id = o.customer_id'],
  right: ['customers c RIGHT JOIN orders o', 'ON c.id = o.customer_id'],
  full: ['customers c FULL JOIN orders o', 'ON c.id = o.customer_id'],
  anti: ['customers c LEFT JOIN orders o ON c.id = o.customer_id', 'WHERE o.order_id IS NULL'],
}

const customerRows = customers.map((c) => ({ id: c.id }))
const orderRows = orders.map((o) => ({ id: o.customer }))
const matches = (kind: JoinKind) => joinOn(customerRows, orderRows, kind, 'id', 'id')

const matched = new Set(matches('inner').map((p) => `${p.left},${p.right}`))
const leftAlone = matches('anti').map((p) => p.left!)
const rightAlone = matches('right')
  .filter((p) => p.left === null)
  .map((p) => p.right!)

export default function OuterJoins() {
  const { id } = useVizStep()
  const [kind, setKind] = useState<Kind>('inner')

  useStepEffect({
    inner: () => setKind('inner'),
    left: () => setKind('left'),
    right: () => setKind('right'),
    full: () => setKind('full'),
    anti: () => setKind('anti'),
  })

  const keepsLeft = kind === 'left' || kind === 'full' || kind === 'anti'
  const keepsRight = kind === 'right' || kind === 'full'
  // The anti join is computed as a left join, then filtered to the padded rows.
  const pairs = kind === 'anti' ? matches('anti') : matches(kind)
  const padded = pairs.filter((p) => p.left === null || p.right === null).length

  const state = (i: number, j: number): PairState =>
    matched.has(`${i},${j}`) ? (kind === 'anti' ? 'dim' : 'match') : 'off'

  // On the first step, point at what the inner join loses.
  const lost = id === 'inner'

  return (
    <>
      <Stage
        domain={{ x: [40, 780], y: [40, 740] }}
        yUp={false}
        ariaLabel="The grid of customer and order pairs, with NULL-padded cells for rows that have no match, and the result of the chosen join"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="matched" value={kind === 'anti' ? 0 : matched.size} color={vc.blue} />
              <Readout label="padded" value={padded} color={vc.yellow} />
              <Readout label="rows" value={pairs.length} />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <TransposedHeader
          {...ORDERS_HEADER}
          title="orders"
          lines={orderLines}
          highlight={keepsRight || lost ? rightAlone : []}
        />
        <RelationTable
          {...CUSTOMERS}
          columns={customerColumns}
          color={vc.yellow}
          rows={customers.map((c, i) => ({
            id: c.id,
            cells: [c.id, c.name],
            state: leftAlone.includes(i) && (keepsLeft || lost) ? 'active' : 'idle',
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
          padRows={keepsLeft ? leftAlone : []}
          padCols={keepsRight ? rightAlone : []}
        />

        {sql[kind].map((line, k) => (
          <TextLabel
            key={k}
            at={[CUSTOMERS.x, SQL_Y - 10 + k * 20]}
            align="start"
            size={13}
            mono
            color={vc.fg}
          >
            {line ?? ''}
          </TextLabel>
        ))}

        <RelationTable
          {...RESULT}
          y={RESULT.y + 10}
          title="result"
          columns={resultColumns}
          color={vc.yellow}
          rows={pairs.map((p) => ({
            id: `${p.left}-${p.right}`,
            cells: resultCells(p.left, p.right),
            state: p.left === null || p.right === null ? 'active' : 'idle',
          }))}
        />
      </Stage>

      <VizControls>
        <SegmentedControl
          label="Join"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'inner', label: 'Inner' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'full', label: 'Full' },
            { value: 'anti', label: 'Anti' },
          ]}
        />
      </VizControls>
    </>
  )
}
