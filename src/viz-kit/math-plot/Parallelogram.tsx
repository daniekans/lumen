import { add, angle, apply, length, turnAngle, type Mat2, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import { Path } from './Path'

/**
 * A polyline in stage units with a filled arrowhead at its last point, sized in pixels. Used for
 * turn arcs in the plane and, through a projection, in space.
 */
export function ArrowPath({
  points,
  color = vc.fg,
  width = 2,
  opacity = 1,
  head = 9,
}: {
  points: readonly Vec2[]
  color?: string
  width?: number
  opacity?: number
  /** Arrowhead length in pixels. */
  head?: number
}) {
  const c = useCoords()
  const px = points.map((p) => c.toPx(p))
  if (px.length < 2) return null
  const tip = px[px.length - 1]!
  // The direction at the tip, from a point a few pixels back along the path.
  let k = px.length - 2
  while (k > 0 && Math.hypot(tip[0] - px[k]![0], tip[1] - px[k]![1]) < head) k--
  const back = px[k]!
  const len = Math.hypot(tip[0] - back[0], tip[1] - back[1])
  if (len < 1) return null
  const [ux, uy] = [(tip[0] - back[0]) / len, (tip[1] - back[1]) / len]
  const h = Math.min(head, len)
  const [bx, by] = [tip[0] - ux * h, tip[1] - uy * h]
  const hw = h * 0.45
  const d = px.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join('')
  return (
    <g pointerEvents="none" style={{ opacity }}>
      <path
        d={d}
        style={{ stroke: color, fill: 'none' }}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M${tip[0]},${tip[1]}L${bx - uy * hw},${by + ux * hw}L${bx + uy * hw},${by - ux * hw}Z`}
        style={{ fill: color, stroke: color }}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </g>
  )
}

/**
 * The turn from `from` to `to` (the shorter way) as an arc with an arrowhead, around `center`.
 * Counterclockwise for a positive determinant, clockwise for a negative one, so the sign of an
 * area can be read without color. Nothing is drawn when the vectors are parallel.
 */
export function TurnArc({
  from,
  to,
  center = [0, 0],
  r = 0.45,
  color = vc.fg,
  width = 2,
  opacity = 1,
}: {
  from: Vec2
  to: Vec2
  center?: Vec2
  /** Radius in stage units; kept below half the shorter vector. */
  r?: number
  color?: string
  width?: number
  opacity?: number
}) {
  const turn = turnAngle(from, to)
  const radius = Math.min(r, 0.5 * length(from), 0.5 * length(to))
  if (Math.abs(turn) < 0.05 || Math.abs(turn) > Math.PI - 0.05 || radius < 0.05) return null
  const a0 = angle(from)
  const n = Math.max(8, Math.ceil(Math.abs(turn) * 16))
  const points = Array.from({ length: n + 1 }, (_, k): Vec2 => {
    const t = a0 + (turn * k) / n
    return [center[0] + radius * Math.cos(t), center[1] + radius * Math.sin(t)]
  })
  return <ArrowPath points={points} color={color} width={width} opacity={opacity} />
}

/**
 * The parallelogram spanned by `u` and `v` from `origin`, filled, with an optional turn arc from
 * `u` to `v` at the origin corner.
 */
export function Parallelogram({
  u,
  v,
  origin = [0, 0],
  color = vc.yellow,
  fillOpacity = 0.22,
  stroke = true,
  dash,
  arc = false,
  opacity = 1,
}: {
  u: Vec2
  v: Vec2
  origin?: Vec2
  color?: string
  fillOpacity?: number
  /** Draws the outline in the same color. */
  stroke?: boolean
  dash?: string
  /** Draws the turn from u to v at the origin corner. */
  arc?: boolean
  opacity?: number
}) {
  const corners = [origin, add(origin, u), add(add(origin, u), v), add(origin, v)]
  return (
    <g pointerEvents="none" style={{ opacity }}>
      <Path
        points={corners}
        closed
        color={stroke ? color : 'none'}
        width={stroke ? 1.5 : 0}
        dash={dash}
        fill={color}
        fillOpacity={fillOpacity}
      />
      {arc && <TurnArc from={u} to={v} center={origin} color={color} />}
    </g>
  )
}

/**
 * The letter F as strokes in a unit box: upright, 1 tall and 0.6 wide, with its corner at the
 * origin. Its mirror image reads backwards, so it shows whether a map keeps orientation.
 */
const LETTER_F: readonly (readonly Vec2[])[] = [
  [
    [0, 0],
    [0, 1],
    [0.6, 1],
  ],
  [
    [0, 0.55],
    [0.45, 0.55],
  ],
]

/**
 * The letter F placed at `origin` with height `size`, moved by the matrix `m`. With `ghost` the
 * unmoved letter is drawn dashed behind it.
 */
export function LetterF({
  m,
  origin = [0, 0],
  size = 1,
  ghost = false,
  color = vc.fg,
  width = 4,
  opacity = 1,
}: {
  m: Mat2
  origin?: Vec2
  size?: number
  ghost?: boolean
  color?: string
  width?: number
  opacity?: number
}) {
  const strokes = LETTER_F.map((s) => s.map((p): Vec2 => add(origin, [p[0] * size, p[1] * size])))
  return (
    <g pointerEvents="none">
      {ghost &&
        strokes.map((s, k) => (
          <Path
            key={`ghost-${k}`}
            points={s}
            color={color}
            width={2}
            dash="4 5"
            opacity={0.3 * opacity}
          />
        ))}
      {strokes.map((s, k) => (
        <Path
          key={k}
          points={s.map((p) => apply(m, p))}
          color={color}
          width={width}
          opacity={opacity}
        />
      ))}
    </g>
  )
}
