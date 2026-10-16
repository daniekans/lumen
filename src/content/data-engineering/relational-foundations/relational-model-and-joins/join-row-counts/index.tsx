import { joinSize, valueCounts, type Value } from '@/lib/relational'
import { alpha, vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel } from '@/ui/molecules'
import { MathLabel, Overlay, Stage, useAnimatedValue, useCoords, useVizStep } from '@/viz-kit'

interface Dataset {
  a: Value[]
  b: Value[]
}

/** Values with no partner (5 in A, 4 in B) and a NULL on each side. */
const MIXED: Dataset = { a: [1, 1, 2, 3, 3, 3, 5, null], b: [1, 2, 2, 3, 3, 4, null] }
/** A.k is unique. */
const ONE_TO_MANY: Dataset = { a: [1, 2, 3, 4], b: [1, 1, 1, 2, 4, 4, 5] }
/** Duplicates on both sides. */
const MANY_TO_MANY: Dataset = { a: [1, 1, 1, 2, 2], b: [1, 1, 1, 1, 2, 2, 2] }

const U = 34
const GAP = 62
const BASE = 400

interface Block {
  label: string
  a: number
  b: number
  isNull: boolean
  x: number
  width: number
}

/** One block per key value (NULL last), laid out left to right. */
const layoutBlocks = ({ a, b }: Dataset): Block[] => {
  const ca = valueCounts(a)
  const cb = valueCounts(b)
  const keys = [...new Set([...ca.keys(), ...cb.keys()])].sort((x, y) => Number(x) - Number(y))
  const nullA = a.filter((v) => v === null).length
  const nullB = b.filter((v) => v === null).length
  const raw = [
    ...keys.map((k) => ({ label: String(k), a: ca.get(k) ?? 0, b: cb.get(k) ?? 0, isNull: false })),
    ...(nullA || nullB ? [{ label: 'NULL', a: nullA, b: nullB, isNull: true }] : []),
  ]
  let x = 0
  return raw.map((r) => {
    const width = Math.max(r.a, 1) * U
    const block = { ...r, x, width }
    x += width + GAP
    return block
  })
}

function Square({
  x,
  y,
  fill,
  stroke,
  dashed,
  opacity = 1,
  text,
}: {
  x: number
  y: number
  fill: string
  stroke: string
  dashed?: boolean
  opacity?: number
  text?: string
}) {
  const c = useCoords()
  const [px, py] = c.toPx([x, y])
  const s = (U - 6) * c.unit
  return (
    <g style={{ opacity, transition: 'opacity var(--dur-slow) var(--ease-out)' }}>
      <rect
        x={px + 3 * c.unit}
        y={py + 3 * c.unit}
        width={s}
        height={s}
        rx={4 * c.unit}
        style={{ fill, stroke }}
        strokeWidth={1.25}
        strokeDasharray={dashed ? `${4 * c.unit} ${3 * c.unit}` : undefined}
      />
      {text && (
        <text
          x={px + (U / 2) * c.unit}
          y={py + (U / 2) * c.unit}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: text === 'NULL' ? vc.subtle : vc.fg,
            fontSize: (text === 'NULL' ? 9 : 13) * c.unit,
            fontFamily: 'var(--font-mono)',
            fontStyle: text === 'NULL' ? 'italic' : undefined,
          }}
        >
          {text}
        </text>
      )}
    </g>
  )
}

const datasets: Record<string, Dataset> = {
  'one-to-many': ONE_TO_MANY,
  'many-to-many': MANY_TO_MANY,
}

export default function JoinRowCounts() {
  const { id } = useVizStep()
  const data = datasets[id ?? ''] ?? MIXED
  const blocks = layoutBlocks(data)
  const cellsOpacity = useAnimatedValue(id === 'per-key' ? 0 : 1, { duration: 0.8 })
  const left = id === 'left' || id === 'nulls'
  const padOpacity = useAnimatedValue(left ? 1 : 0, { duration: 0.6 })
  const focusNull = id === 'nulls'

  const inner = joinSize(data.a, data.b, 'inner')
  const leftSize = joinSize(data.a, data.b, 'left')
  const terms = blocks
    .filter((b) => !b.isNull)
    .map((b) => `${b.a} \\cdot ${b.b}`)
    .join(' + ')

  const formula =
    id === 'per-key'
      ? '\\text{value } k:\\quad a_k \\text{ rows in } A, \\quad b_k \\text{ rows in } B'
      : focusNull
        ? '\\text{NULL} = \\text{NULL} \\ \\text{is unknown, never true}'
        : left
          ? `|A \\text{ LEFT JOIN } B| = \\sum_k a_k \\max(b_k, 1) = ${inner} + ${leftSize - inner} = ${leftSize}`
          : `|A \\bowtie B| = \\sum_k a_k b_k = ${terms} = ${inner}`

  return (
    <Stage
      domain={{ x: [-110, 700], y: [150, 480] }}
      yUp={false}
      ariaLabel="One block per key value: a row of A's values along the bottom, B's values up the side, and a rectangle of joined rows between them"
      overlay={
        <Overlay corner="top-right">
          <ReadoutPanel>
            <Readout label="$|A|$" value={data.a.length} />
            <Readout label="$|B|$" value={data.b.length} />
            <Readout
              label={left ? 'left join rows' : 'join rows'}
              value={left ? leftSize : id === 'per-key' ? '?' : inner}
              color={left ? vc.yellow : vc.blue}
            />
          </ReadoutPanel>
        </Overlay>
      }
    >
      <MathLabel at={[295, 200]} tex={formula} size={18} />
      <MathLabel at={[-62, BASE + U / 2]} tex="A" color={vc.muted} />

      {blocks.map((blk) => {
        const dim = focusNull && !blk.isNull ? 0.3 : 1
        const padded = (blk.b === 0 || blk.isNull) && blk.a > 0
        return (
          <g
            key={`${id}-${blk.label}`}
            style={{ opacity: dim, transition: 'opacity var(--dur-slow)' }}
          >
            {Array.from({ length: blk.a }, (_, i) => (
              <Square
                key={`a${i}`}
                x={blk.x + i * U}
                y={BASE + 6}
                fill="var(--bg-elevated)"
                stroke={vc.gridStrong}
                text={blk.label}
              />
            ))}
            {Array.from({ length: blk.b }, (_, j) => (
              <Square
                key={`b${j}`}
                x={blk.x - U - 8}
                y={BASE - (j + 1) * U}
                fill="var(--bg-elevated)"
                stroke={vc.gridStrong}
                text={blk.label}
              />
            ))}
            {!blk.isNull &&
              Array.from({ length: blk.a }, (_, i) =>
                Array.from({ length: blk.b }, (_, j) => (
                  <Square
                    key={`c${i},${j}`}
                    x={blk.x + i * U}
                    y={BASE - (j + 1) * U}
                    fill={alpha(vc.blue, 0.55)}
                    stroke={vc.blue}
                    opacity={cellsOpacity}
                  />
                )),
              )}
            {padded &&
              Array.from({ length: blk.a }, (_, i) => (
                <Square
                  key={`p${i}`}
                  x={blk.x + i * U}
                  y={BASE - U}
                  fill={alpha(vc.yellow, 0.14)}
                  stroke={vc.yellow}
                  dashed
                  opacity={padOpacity}
                />
              ))}
            {id !== 'per-key' && (
              <MathLabel
                at={[blk.x + blk.width / 2, BASE + U + 30]}
                tex={
                  blk.isNull
                    ? '\\text{no match}'
                    : left && blk.b === 0
                      ? `${blk.a} \\cdot 1`
                      : `${blk.a} \\cdot ${blk.b}`
                }
                color={left && padded ? vc.yellow : vc.muted}
                size={14}
              />
            )}
          </g>
        )
      })}
      {blocks.length > 0 && (
        <MathLabel
          at={[blocks[0]!.x - U / 2 - 8, BASE - Math.max(blocks[0]!.b, 1) * U - 18]}
          tex="B"
          color={vc.muted}
        />
      )}
    </Stage>
  )
}
