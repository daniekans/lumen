import { add3, apply3, colsOf, dot3, scale3, type MatN, type Vec3 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { useProjection } from './camera'
import { Path3D, Segment3D } from './primitives'

/** All lists of `n` whole numbers from -k to k. */
const offsets = (n: number, k: number): number[][] =>
  n === 0
    ? [[]]
    : offsets(n - 1, k).flatMap((o) => Array.from({ length: 2 * k + 1 }, (_, i) => [...o, i - k]))

/**
 * The grid of R^n moved by a 3 x n matrix `m` (n is 2 or 3): the lines through the whole-number
 * points with coordinates from -extent to extent, each drawn `reach` units both ways from its
 * middle and mapped into space. A 3 x 3 matrix moves the lattice of space; a 3 x 2 matrix places
 * the grid of the plane in space as a sheet. Lines a collapsing map squashes to a point vanish.
 */
export function MappedGrid3D({
  m,
  extent = 1,
  reach = extent + 0.6,
  color = vc.fg,
  opacity = 0.32,
  axisOpacity = 0.75,
}: {
  m: MatN
  extent?: number
  reach?: number
  color?: string
  opacity?: number
  /** Opacity of the lines through the origin (the images of the axes). */
  axisOpacity?: number
}) {
  const n = colsOf(m)
  const lines = Array.from({ length: n }, (_, axis) =>
    offsets(n - 1, extent).map((o) => {
      const at = (t: number) => {
        const p = [...o]
        p.splice(axis, 0, t)
        return apply3(m, p)
      }
      return { from: at(-reach), to: at(reach), axis: o.every((v) => v === 0) }
    }),
  ).flat()
  return (
    <g pointerEvents="none">
      {lines.map(({ from, to, axis }, k) => (
        <Segment3D
          key={k}
          from={from}
          to={to}
          color={color}
          width={axis ? 1.5 : 1}
          opacity={axis ? axisOpacity : opacity}
        />
      ))}
    </g>
  )
}

/** The corners of the unit cube's faces, by axis and side. */
const FACES = [0, 1, 2].flatMap((axis) =>
  [0, 1].map((side) => {
    const [u, v] = [(axis + 1) % 3, (axis + 2) % 3]
    const corner = (a: number, b: number) => {
      const c = [0, 0, 0]
      c[axis] = side
      c[u] = a
      c[v] = b
      return c
    }
    return [corner(0, 0), corner(1, 0), corner(1, 1), corner(0, 1)]
  }),
)

/**
 * The unit cube moved by a 3 x 3 matrix (a parallelepiped with the columns as edges), or the unit
 * square moved by a 3 x 2 matrix (a parallelogram). Of each pair of opposite faces the one farther
 * from the viewer is drawn first, which orders the faces of any parallelepiped correctly.
 */
export function Cell3D({
  m,
  color = vc.fg,
  fillOpacity = 0.12,
  opacity = 0.8,
}: {
  m: MatN
  color?: string
  fillOpacity?: number
  opacity?: number
}) {
  const { frame } = useProjection()
  const fill = alpha(color, fillOpacity)
  if (colsOf(m) === 2) {
    const square = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ].map((p) => apply3(m, p))
    return <Path3D points={square} closed color={color} width={1} opacity={opacity} fill={fill} />
  }
  const faces = FACES.map((corners) => corners.map((c) => apply3(m, c)))
  const depth = (f: Vec3[]) => dot3(scale3(f.reduce(add3), 0.25), frame.toward)
  const order = [0, 1, 2].flatMap((axis) => {
    const [a, b] = [2 * axis, 2 * axis + 1]
    return depth(faces[a]!) <= depth(faces[b]!) ? [a, b] : [b, a]
  })
  // The three far faces, then the three near ones.
  const sorted = [order[0]!, order[2]!, order[4]!, order[1]!, order[3]!, order[5]!]
  return (
    <g pointerEvents="none">
      {sorted.map((f) => (
        <Path3D
          key={f}
          points={faces[f]!}
          closed
          color={color}
          width={1}
          opacity={opacity}
          fill={fill}
        />
      ))}
    </g>
  )
}
