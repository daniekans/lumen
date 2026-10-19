import { type Vec2 } from '@/lib/math'
import { pagesFor, rowWidth, scanPages, type Column, type Layout } from '@/lib/storage'
import { alpha, vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel } from '@/ui/molecules'
import { MathLabel, Overlay, Stage, TextLabel, useCoords, useVizStep } from '@/viz-kit'

const COLUMNS: Column[] = [
  { name: 'id', width: 8 },
  { name: 'ts', width: 8 },
  { name: 'geo', width: 4 },
  { name: 'amount', width: 8 },
  { name: 'note', width: 36 },
]
const N = 64
const P = 256
const W = rowWidth(COLUMNS)
const SCAN = ['geo', 'amount']
const LOOKUP_ROW = 41

/** Stage units per byte (across) and per row (down). */
const BX = 8
const RY = 5
const ORIGIN: Vec2 = [190, 130]

/** Left edge of column `j`, in bytes. */
const startOf = (j: number) => rowWidth(COLUMNS.slice(0, j))

interface PageRect {
  key: string
  /** Bytes across, as [from, to]. */
  x: [number, number]
  /** Rows down, as [from, to]; fractional when a page boundary falls inside a row. */
  y: [number, number]
  read: boolean
}

/** Every page of the table as a rectangle in (byte, row) space, flagged when the step reads it. */
const pageRects = (layout: Layout, step: string): PageRect[] => {
  if (layout === 'row') {
    const rowsPer = P / W
    return Array.from({ length: pagesFor(N * W, P) }, (_, k) => ({
      key: `r${k}`,
      x: [0, W],
      y: [k * rowsPer, Math.min(N, (k + 1) * rowsPer)],
      read:
        step === 'row-query' ||
        (step === 'lookup' && LOOKUP_ROW >= k * rowsPer && LOOKUP_ROW < (k + 1) * rowsPer),
    }))
  }
  return COLUMNS.flatMap((c, j) => {
    const rowsPer = P / c.width
    return Array.from({ length: pagesFor(N * c.width, P) }, (_, k) => {
      const y: [number, number] = [k * rowsPer, Math.min(N, (k + 1) * rowsPer)]
      return {
        key: `c${j},${k}`,
        x: [startOf(j), startOf(j) + c.width] as [number, number],
        y,
        read:
          (step === 'column-query' && SCAN.includes(c.name)) ||
          (step === 'lookup' && LOOKUP_ROW + 1 > y[0] && LOOKUP_ROW < y[1]),
      }
    })
  })
}

function Box({
  x,
  y,
  fill,
  stroke,
  width = 1,
}: {
  x: [number, number]
  y: [number, number]
  fill: string
  stroke: string
  width?: number
}) {
  const c = useCoords()
  const [x0, y0] = c.toPx([ORIGIN[0] + x[0] * BX, ORIGIN[1] + y[0] * RY])
  const [x1, y1] = c.toPx([ORIGIN[0] + x[1] * BX, ORIGIN[1] + y[1] * RY])
  return (
    <rect
      x={x0}
      y={y0}
      width={x1 - x0}
      height={y1 - y0}
      style={{ fill, stroke, transition: 'fill var(--dur-slow), stroke var(--dur-slow)' }}
      strokeWidth={width}
    />
  )
}

/** The wide table of the last step: 200 thin columns, three of them used. */
function WideTable() {
  const used = [23, 96, 161]
  const cols = 200
  const bw = (W * BX) / cols
  const c = useCoords()
  const [x0, y0] = c.toPx(ORIGIN)
  const [x1, y1] = c.toPx([ORIGIN[0] + W * BX, ORIGIN[1] + N * RY])
  return (
    <g>
      <rect
        x={x0}
        y={y0}
        width={x1 - x0}
        height={y1 - y0}
        style={{ fill: alpha(vc.yellow, 0.1), stroke: vc.yellow }}
        strokeWidth={1.25}
      />
      {used.map((u) => {
        const [bx] = c.toPx([ORIGIN[0] + u * bw, 0])
        return (
          <rect
            key={u}
            x={bx}
            y={y0}
            width={bw * c.unit}
            height={y1 - y0}
            style={{ fill: vc.blue, stroke: vc.blue }}
            strokeWidth={1}
          />
        )
      })}
    </g>
  )
}

const formulas: Record<string, string> = {
  area: `N \\times W = ${N} \\times ${W} = ${N * W} \\text{ bytes}`,
  'row-pages': `\\left\\lceil \\tfrac{NW}{P} \\right\\rceil = \\left\\lceil \\tfrac{${N * W}}{${P}} \\right\\rceil = ${pagesFor(N * W, P)} \\text{ pages}`,
  'row-query': `\\text{row layout: all } ${pagesFor(N * W, P)} \\text{ pages}, \\ ${N * W} \\text{ bytes}`,
  'column-pages': `\\left\\lceil \\tfrac{N w_j}{P} \\right\\rceil = ${COLUMNS.map((c) => pagesFor(N * c.width, P)).join(',\\ ')}`,
  'column-query': `\\left\\lceil \\tfrac{64 \\cdot 4}{256} \\right\\rceil + \\left\\lceil \\tfrac{64 \\cdot 8}{256} \\right\\rceil = 1 + 2 = ${scanPages(N, COLUMNS, SCAN, 'column', P)} \\text{ pages}`,
  lookup: `\\text{row layout: } 1 \\text{ page}, \\quad \\text{column layout: } ${COLUMNS.length} \\text{ pages}`,
  wide: '\\frac{3 \\cdot 8}{200 \\cdot 8} = 1.5\\%',
}

const layoutOf: Record<string, Layout> = {
  'row-pages': 'row',
  'row-query': 'row',
  'column-pages': 'column',
  'column-query': 'column',
  lookup: 'column',
}

export default function ScanCost() {
  const { id } = useVizStep()
  const step = id ?? 'area'
  const layout = layoutOf[step]
  const wide = step === 'wide'
  const pages = layout ? pageRects(layout, step) : []
  const read = pages.filter((p) => p.read).length
  const scanning = step === 'row-query' || step === 'column-query'

  return (
    <Stage
      domain={{ x: [60, 900], y: [40, 540] }}
      yUp={false}
      ariaLabel="A table drawn as a rectangle with rows down and bytes across, cut into pages by the layout, with the region a query needs highlighted"
      overlay={
        <Overlay corner="top-right">
          <ReadoutPanel>
            {wide ? (
              <>
                <Readout label="columns" value={200} />
                <Readout label="used" value={3} color={vc.blue} />
                <Readout label="bytes read" value="1.5%" color={vc.blue} />
              </>
            ) : layout ? (
              <>
                <Readout label="layout" value={layout} />
                <Readout label="pages" value={pages.length} />
                {(scanning || step === 'lookup') && (
                  <Readout label="pages read" value={read} color={vc.yellow} />
                )}
              </>
            ) : (
              <>
                <Readout label="$N$" value={`${N} rows`} />
                <Readout label="$W$" value={`${W} bytes`} />
              </>
            )}
          </ReadoutPanel>
        </Overlay>
      }
    >
      {wide ? (
        <>
          <WideTable />
          <TextLabel at={[ORIGIN[0], ORIGIN[1] - 14]} align="start" size={11} mono>
            200 columns of 8 B
          </TextLabel>
        </>
      ) : (
        <>
          {/* Column bands and their labels. */}
          {COLUMNS.map((c, j) => (
            <g key={c.name}>
              <Box
                x={[startOf(j), startOf(j) + c.width]}
                y={[0, N]}
                fill={
                  scanning && SCAN.includes(c.name) ? alpha(vc.blue, 0.4) : 'var(--bg-elevated)'
                }
                stroke={vc.gridStrong}
                width={1.25}
              />
              <TextLabel
                at={[ORIGIN[0] + (startOf(j) + c.width / 2) * BX, ORIGIN[1] - 26]}
                size={11}
                mono
                color={vc.fg}
              >
                {c.name}
              </TextLabel>
              <TextLabel
                at={[ORIGIN[0] + (startOf(j) + c.width / 2) * BX, ORIGIN[1] - 10]}
                size={10}
                mono
              >
                {`${c.width} B`}
              </TextLabel>
            </g>
          ))}
          {step === 'lookup' && (
            <Box
              x={[0, W]}
              y={[LOOKUP_ROW, LOOKUP_ROW + 1]}
              fill={vc.blue}
              stroke={vc.blue}
              width={1}
            />
          )}
          {pages.map((p) => (
            <Box
              key={p.key}
              x={p.x}
              y={p.y}
              fill={p.read ? alpha(vc.yellow, 0.16) : 'transparent'}
              stroke={p.read ? vc.yellow : vc.axis}
              width={p.read ? 1.5 : 0.75}
            />
          ))}
        </>
      )}

      <MathLabel
        at={[ORIGIN[0] - 50, ORIGIN[1] + (N * RY) / 2]}
        tex={wide ? 'N' : `N = ${N}`}
        color={vc.muted}
      />
      <MathLabel
        at={[ORIGIN[0] + (W * BX) / 2, ORIGIN[1] + N * RY + 28]}
        tex={wide ? 'W = 200 \\cdot 8 = 1600 \\text{ bytes}' : `W = ${W} \\text{ bytes}`}
        color={vc.muted}
      />
      <MathLabel
        at={[ORIGIN[0] + (W * BX) / 2, ORIGIN[1] + N * RY + 76]}
        tex={formulas[step] ?? ''}
        size={18}
      />
    </Stage>
  )
}
