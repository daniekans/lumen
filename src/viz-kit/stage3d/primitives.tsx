import {
  add3,
  cross3,
  fmtPoint3,
  length3,
  normalize3,
  scale3,
  type Vec2,
  type Vec3,
} from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { MathLabel, Path, Point, Segment, TextLabel, Vector } from '../math-plot'
import type { StrokeStyle } from '../math-plot/Path'
import { moveOnScreen, screenToPlane, useProjection } from './camera'

const ORIGIN: Vec3 = [0, 0, 0]

/** Arrow from `from` to `to` in space. The head is drawn on screen, so it always faces the viewer. */
export function Vector3D({
  to,
  from = ORIGIN,
  color = vc.fg,
  width = 3,
  opacity = 1,
  head,
}: {
  to: Vec3
  from?: Vec3
  color?: string
  width?: number
  opacity?: number
  head?: number
}) {
  const { project } = useProjection()
  return (
    <Vector
      from={project(from)}
      to={project(to)}
      color={color}
      width={width}
      opacity={opacity}
      head={head}
    />
  )
}

export function Segment3D({ from, to, ...stroke }: { from: Vec3; to: Vec3 } & StrokeStyle) {
  const { project } = useProjection()
  return <Segment from={project(from)} to={project(to)} {...stroke} />
}

/** The line through `through` along `direction`, drawn `reach` units each way. */
export function Line3D({
  through = ORIGIN,
  direction,
  reach = 8,
  ...stroke
}: { through?: Vec3; direction: Vec3; reach?: number } & StrokeStyle) {
  const d = normalize3(direction)
  if (length3(d) === 0) return null
  return (
    <Segment3D
      from={add3(through, scale3(d, -reach))}
      to={add3(through, scale3(d, reach))}
      {...stroke}
    />
  )
}

/** A polyline through points in space, or a polygon when `closed`, optionally filled. */
export function Path3D({
  points,
  closed = false,
  color = vc.fg,
  width = 1,
  opacity = 1,
  fill,
  dash,
}: { points: readonly Vec3[]; closed?: boolean; fill?: string } & StrokeStyle) {
  const { project } = useProjection()
  return (
    <Path
      points={points.map((p) => project(p))}
      closed={closed}
      color={color}
      width={width}
      opacity={opacity}
      fill={fill ?? 'none'}
      dash={dash}
    />
  )
}

/** Two unit vectors perpendicular to `normal` and to each other, spanning its plane. */
export const planeBasis = (normal: Vec3): [Vec3, Vec3] => {
  const n = normalize3(normal)
  // Any vector not parallel to n starts the basis; pick the axis n is least aligned with.
  const a: Vec3 =
    Math.abs(n[0]) <= Math.abs(n[1]) && Math.abs(n[0]) <= Math.abs(n[2])
      ? [1, 0, 0]
      : Math.abs(n[1]) <= Math.abs(n[2])
        ? [0, 1, 0]
        : [0, 0, 1]
  const e1 = normalize3(cross3(n, a))
  return [e1, cross3(n, e1)]
}

/**
 * A square patch of the plane through `point` with normal `normal`, `size` units from the
 * center to each side, with grid lines every `step` units. Pass `basis` to align the patch and
 * its grid with two directions of the plane (they need not be perpendicular).
 */
export function Plane3D({
  point = ORIGIN,
  normal,
  basis,
  size = 4,
  step = 1,
  color = vc.fg,
  fillOpacity = 0.1,
  gridOpacity = 0.25,
  opacity = 1,
}: {
  point?: Vec3
  normal?: Vec3
  basis?: readonly [Vec3, Vec3]
  size?: number
  step?: number
  color?: string
  fillOpacity?: number
  /** 0 hides the grid lines. */
  gridOpacity?: number
  opacity?: number
}) {
  const { project } = useProjection()
  const [u, v] = basis ??
    (normal ? planeBasis(normal) : null) ?? [
      [1, 0, 0],
      [0, 1, 0],
    ]
  const at = (s: number, t: number) => project(add3(point, add3(scale3(u, s), scale3(v, t))))
  const corners: Vec2[] = [at(-size, -size), at(size, -size), at(size, size), at(-size, size)]
  const n = Math.floor(size / step + 1e-9)
  const ks = Array.from({ length: 2 * n + 1 }, (_, i) => (i - n) * step)
  return (
    <g style={{ opacity }} pointerEvents="none">
      <Path
        points={corners}
        closed
        color={color}
        width={1}
        opacity={0.35}
        fill={alpha(color, fillOpacity)}
      />
      {gridOpacity > 0 &&
        ks.map((k) => (
          <g key={k}>
            <Segment
              from={at(k, -size)}
              to={at(k, size)}
              color={color}
              width={1}
              opacity={gridOpacity}
            />
            <Segment
              from={at(-size, k)}
              to={at(size, k)}
              color={color}
              width={1}
              opacity={gridOpacity}
            />
          </g>
        ))}
    </g>
  )
}

/** The grid of the floor plane z = 0, from -extent to extent. */
export function Grid3D({ extent = 4, step = 1 }: { extent?: number; step?: number }) {
  return (
    <Plane3D
      basis={[
        [1, 0, 0],
        [0, 1, 0],
      ]}
      size={extent}
      step={step}
      color={vc.fg}
      fillOpacity={0}
      gridOpacity={0.12}
      opacity={1}
    />
  )
}

const AXES: readonly { dir: Vec3; label: string }[] = [
  { dir: [1, 0, 0], label: 'x' },
  { dir: [0, 1, 0], label: 'y' },
  { dir: [0, 0, 1], label: 'z' },
]

/** The three coordinate axes from -extent to extent, with whole-number ticks and names. */
export function Axes3D({ extent = 4, ticks = true }: { extent?: number; ticks?: boolean }) {
  const { project } = useProjection()
  const ks = Array.from({ length: 2 * extent + 1 }, (_, i) => i - extent).filter((k) => k !== 0)
  return (
    <g pointerEvents="none">
      {AXES.map(({ dir, label }) => {
        const [dx, dy] = project(dir)
        const len = Math.hypot(dx, dy)
        // A tick is a short mark across the axis as it appears on screen.
        const nx = len > 1e-6 ? (-dy / len) * 0.08 : 0
        const ny = len > 1e-6 ? (dx / len) * 0.08 : 0
        const end = scale3(dir, extent + 0.6)
        return (
          <g key={label}>
            <Segment
              from={project(scale3(dir, -extent))}
              to={project(scale3(dir, extent + 0.4))}
              color={vc.axis}
              width={1.5}
            />
            {ticks &&
              len > 0.2 &&
              ks.map((k) => {
                const [px, py] = project(scale3(dir, k))
                return (
                  <Segment
                    key={k}
                    from={[px - nx, py - ny]}
                    to={[px + nx, py + ny]}
                    color={vc.axis}
                    width={1.5}
                  />
                )
              })}
            <TextLabel at={project(end)} color={vc.muted} size={13}>
              {label}
            </TextLabel>
          </g>
        )
      })}
    </g>
  )
}

/** KaTeX label at a point in space. */
export function MathLabel3D({
  at,
  ...rest
}: { at: Vec3 } & Omit<Parameters<typeof MathLabel>[0], 'at'>) {
  const { project } = useProjection()
  return <MathLabel at={project(at)} {...rest} />
}

/**
 * A point in space, optionally draggable. A drag moves it on the plane given by `dragPlane`
 * (a normal, through the point's current position unless `point` is given), or parallel to
 * the screen when there is none or the plane is seen edge on. Hovering shows (x, y, z).
 */
export function Point3D({
  at,
  onDrag,
  dragPlane,
  coords = true,
  ...rest
}: {
  at: Vec3
  onDrag?: (p: Vec3) => void
  dragPlane?: { normal: Vec3; point?: Vec3 }
  coords?: boolean
  color?: string
  r?: number
  hollow?: boolean
  label?: string
}) {
  const { project, frame } = useProjection()
  const here = project(at)
  const drag =
    onDrag &&
    (([sx, sy]: Vec2) => {
      const onPlane =
        dragPlane && screenToPlane(frame, sx, sy, dragPlane.normal, dragPlane.point ?? at)
      onDrag(onPlane ?? moveOnScreen(at, frame, sx - here[0], sy - here[1]))
    })
  return <Point at={here} onDrag={drag} coords={coords ? () => fmtPoint3(at) : false} {...rest} />
}

/** Dashed drop lines from a point to the floor and along the floor to the axes, to read its coordinates. */
export function DropLines3D({ at, color = vc.muted }: { at: Vec3; color?: string }) {
  const floor: Vec3 = [at[0], at[1], 0]
  return (
    <>
      <Segment3D from={at} to={floor} color={color} width={1.25} dash="3 5" />
      <Segment3D from={floor} to={[at[0], 0, 0]} color={color} width={1.25} dash="3 5" />
      <Segment3D from={floor} to={[0, at[1], 0]} color={color} width={1.25} dash="3 5" />
    </>
  )
}
