import { useState } from 'react'
import type { Vec2 } from '@/lib/math'
import { isKey, orphans, type Value } from '@/lib/relational'
import { vc } from '@/styles/viz-colors'
import { Button } from '@/ui/atoms'
import { Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  curveAt,
  Overlay,
  Path,
  RelationTable,
  Stage,
  tableLayout,
  TextLabel,
  useStepEffect,
  useVizStep,
  Vector,
  VizControls,
  type RowState,
  type TableColumn,
} from '@/viz-kit'

const customers = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Ben' },
  { id: 3, name: 'Caio' },
  { id: 4, name: 'Dara' },
]
const orders: { id: number; customer: number; amount: number }[] = [
  { id: 101, customer: 1, amount: 30 },
  { id: 102, customer: 2, amount: 12 },
  { id: 103, customer: 1, amount: 45 },
  { id: 104, customer: 4, amount: 8 },
  { id: 105, customer: 2, amount: 20 },
]
const ORPHAN = { id: 106, customer: 9, amount: 15 }

const customerColumns: TableColumn[] = [
  { label: 'id', width: 64, key: 'primary' },
  { label: 'name', width: 110 },
]
const orderColumns: TableColumn[] = [
  { label: 'order_id', width: 116, key: 'primary' },
  { label: 'customer_id', width: 140, key: 'foreign' },
  { label: 'amount', width: 96 },
]
const ROW_H = 36
const CUSTOMERS = { x: 110, y: 130, rowHeight: ROW_H }
const ORDERS = { x: 440, y: 130, rowHeight: ROW_H }
const cLayout = tableLayout({ ...CUSTOMERS, columns: customerColumns, titleHeight: 26 })
const oLayout = tableLayout({ ...ORDERS, columns: orderColumns, titleHeight: 26 })

type OnDelete = 'restrict' | 'cascade' | 'set-null'

/** A reference arrow from an order row to a point on the customers side. */
function Reference({
  from,
  to,
  color,
  opacity,
}: {
  from: Vec2
  to: Vec2
  color: string
  opacity: number
}) {
  const reach = (from[0] - to[0]) * 0.45
  const curve = {
    p0: from,
    p1: [from[0] - reach, from[1]] as Vec2,
    p2: [to[0] + reach, to[1]] as Vec2,
    p3: to,
  }
  const points = Array.from({ length: 25 }, (_, i) => curveAt(curve, (i / 24) * 0.94))
  return (
    <g style={{ opacity, transition: 'opacity var(--dur-slow) var(--ease-out)' }}>
      <Path points={points} color={color} width={1.75} />
      <Vector from={points[points.length - 1]!} to={to} color={color} width={1.75} head={9} />
    </g>
  )
}

export default function KeysAndReferences() {
  const { id } = useVizStep()
  const [duplicate, setDuplicate] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [onDelete, setOnDelete] = useState<OnDelete>('restrict')

  useStepEffect({
    'primary-key': () => {
      setDuplicate(true)
      setSelected(null)
    },
    'foreign-key': () => {
      setDuplicate(false)
      setSelected(null)
    },
    'many-to-one': () => {
      setDuplicate(false)
      setSelected(1)
    },
    'one-to-many': () => {
      setDuplicate(false)
      setSelected(3)
    },
    orphan: () => {
      setDuplicate(false)
      setSelected(null)
    },
    'on-delete': () => {
      setDuplicate(false)
      setSelected(null)
      setOnDelete('restrict')
    },
  })

  const showOrders = id !== 'primary-key'
  const choosing = id === 'many-to-one' || id === 'one-to-many'
  const orphanStep = id === 'orphan'
  const deleting = id === 'on-delete'
  const deleted = deleting && onDelete !== 'restrict'

  const customerRows = [
    ...customers.map((c) => ({ ...c, rowId: `c${c.id}` })),
    ...(duplicate ? [{ id: 2, name: 'Eva', rowId: 'dup' }] : []),
  ]
  const orderRows = [...orders, ...(orphanStep ? [ORPHAN] : [])]
  const referencing = (customerId: number) => orders.filter((o) => o.customer === customerId)

  /** The reference an order holds right now (NULL after "set NULL"). */
  const refOf = (o: (typeof orderRows)[number]): Value =>
    deleting && onDelete === 'set-null' && o.customer === 1 ? null : o.customer
  const orderGone = (o: (typeof orderRows)[number]) =>
    deleting && onDelete === 'cascade' && o.customer === 1

  const customerState = (c: (typeof customerRows)[number]): RowState => {
    if (c.rowId === 'dup') return 'error'
    if (deleting && c.id === 1) return onDelete === 'restrict' ? 'error' : 'idle'
    if (choosing) return c.id === selected ? 'active' : 'idle'
    return 'idle'
  }
  const orderState = (o: (typeof orderRows)[number]): RowState => {
    if (o.id === ORPHAN.id) return 'error'
    if (deleting && o.customer === 1) return onDelete === 'restrict' ? 'error' : 'idle'
    if (choosing && selected !== null) return o.customer === selected ? 'active' : 'dim'
    return 'idle'
  }

  const keyOk = isKey(customerRows, ['id'])
  const orphanCount = orphans(
    orderRows.map((o) => o.customer),
    customers.map((c) => c.id),
  ).length

  return (
    <>
      <Stage
        domain={{ x: [70, 820], y: [90, 500] }}
        yUp={false}
        ariaLabel="A customers table and an orders table, with an arrow from each order to its customer"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {id === 'primary-key' && (
                <Readout
                  label="id is unique"
                  value={keyOk ? 'yes' : 'no: rejected'}
                  color={keyOk ? vc.blue : vc.red}
                />
              )}
              {choosing && selected !== null && (
                <Readout
                  label={`orders of ${customers.find((c) => c.id === selected)?.name}`}
                  value={referencing(selected).length}
                  color={vc.yellow}
                />
              )}
              {(id === 'foreign-key' || orphanStep) && (
                <Readout
                  label="orphans"
                  value={orphanCount}
                  color={orphanCount ? vc.red : vc.blue}
                />
              )}
              {deleting && (
                <Readout
                  label="DELETE Ana"
                  value={
                    onDelete === 'restrict'
                      ? 'rejected'
                      : onDelete === 'cascade'
                        ? '3 rows gone'
                        : '1 row gone'
                  }
                  color={onDelete === 'restrict' ? vc.red : vc.blue}
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <RelationTable
          {...CUSTOMERS}
          title="customers"
          columns={customerColumns}
          color={vc.yellow}
          rows={customerRows.map((c) => ({
            id: c.rowId,
            cells: [c.id, c.name],
            state: customerState(c),
            opacity: deleted && c.id === 1 ? 0 : 1,
          }))}
          onRowClick={choosing ? (rowId) => setSelected(Number(String(rowId).slice(1))) : undefined}
        />

        <g style={{ opacity: showOrders ? 1 : 0, transition: 'opacity var(--dur-slow)' }}>
          <RelationTable
            {...ORDERS}
            title="orders"
            columns={orderColumns}
            color={vc.yellow}
            rows={orderRows.map((o) => ({
              id: o.id,
              cells: [o.id, refOf(o), o.amount],
              state: orderState(o),
              opacity: orderGone(o) ? 0 : 1,
            }))}
          />

          {orderRows.map((o, slot) => {
            const ref = refOf(o)
            const target = customers.findIndex((c) => c.id === ref)
            const from = oLayout.leftOf(slot)
            if (o.id === ORPHAN.id)
              return (
                <Reference
                  key={o.id}
                  from={from}
                  to={[cLayout.x + cLayout.width + 60, cLayout.bottom(customers.length) + 50]}
                  color={vc.red}
                  opacity={1}
                />
              )
            const hidden = ref === null || orderGone(o) || target < 0
            const highlighted = choosing && selected === o.customer
            const color = highlighted
              ? vc.yellow
              : deleting && o.customer === 1 && onDelete === 'restrict'
                ? vc.red
                : vc.blue
            return (
              <Reference
                key={o.id}
                from={from}
                to={cLayout.rightOf(Math.max(target, 0))}
                color={color}
                opacity={hidden ? 0 : choosing && selected !== null && !highlighted ? 0.18 : 1}
              />
            )
          })}
          {orphanStep && (
            <TextLabel
              at={[cLayout.x + cLayout.width + 40, cLayout.bottom(customers.length) + 74]}
              color={vc.red}
              size={13}
              mono
            >
              no customer 9
            </TextLabel>
          )}
        </g>

        {choosing &&
          customers.map((c, slot) => (
            <TextLabel
              key={c.id}
              at={[cLayout.x - 14, cLayout.rowCenterY(slot)]}
              align="end"
              size={13}
              color={c.id === selected ? vc.yellow : vc.subtle}
            >
              {String(referencing(c.id).length)}
            </TextLabel>
          ))}
      </Stage>

      <VizControls>
        {id === 'primary-key' && (
          <Button onClick={() => setDuplicate((d) => !d)}>
            {duplicate ? 'Remove the duplicate' : 'Insert (2, Eva)'}
          </Button>
        )}
        {deleting && (
          <SegmentedControl
            label="On delete"
            value={onDelete}
            onChange={setOnDelete}
            options={[
              { value: 'restrict', label: 'Restrict' },
              { value: 'cascade', label: 'Cascade' },
              { value: 'set-null', label: 'Set NULL' },
            ]}
          />
        )}
        {choosing && (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>Click a customer</span>
        )}
        {(id === 'foreign-key' || orphanStep) && (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            customer_id references customers.id
          </span>
        )}
      </VizControls>
    </>
  )
}
