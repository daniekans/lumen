import { useId, type ReactNode } from 'react'
import {
  add3,
  dot3,
  fmtPoint3,
  length3,
  lerp3,
  normalize3,
  scale3,
  type Vec2,
  type Vec3,
} from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { MathLabel, Path, Point, Pulse, Segment, TextLabel, Vector } from '../math-plot'
import type { StrokeStyle } from '../math-plot/Path'
import { useCoords, useEmphasis } from '../stage'
import { moveOnScreen, planeBasis, screenToPlane, useProjection } from './camera'

const ORIGIN: Vec3 = [0, 0, 0]

/** Extra stroke width of a highlighted shape, in pixels. */
const EMPHASIS_WIDTH = 1.5
/** Width of the invisible stroke that catches the pointer on lines and arrows. */
const HIT_WIDTH = 14

/** An id usable in `url(#...)`: React's ids contain characters that SVG references reject. */
const useSvgId = () => `s3d${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

/** Pixel position of a point of space. */
const usePixels = () => {
  const { project } = useProjection()
  const c = useCoords()
  return (p: Vec3): Vec2 => c.toPx(project(p))
}

interface LineLookProps extends StrokeStyle {
  /** Highlight key: hovering the line lights it up, and readouts bound to it (`useHighlight`). */
  hoverKey?: string
}

/**
 * A line from `from` to `to` whose opacity follows the depth cue along its length, and fades out
 * over the outer `fadeEnds` fraction at each end (0 for a plain segment).
 */
function DepthLine({
  from,
  to,
  fadeEnds = 0,
  color = vc.fg,
  width = 2,
  opacity = 1,
  dash,
  hoverKey,
}: { from: Vec3; to: Vec3; fadeEnds?: number } & LineLookProps) {
  const { cue } = useProjection()
  const px = usePixels()
  const id = useSvgId()
  const { emphasis, hover, opacity: dim } = useEmphasis(hoverKey)
  const [x1, y1] = px(from)
  const [x2, y2] = px(to)
  if (Math.hypot(x2 - x1, y2 - y1) < 0.5) return null
  const ends = (t: number) => {
    if (fadeEnds <= 0) return 1
    const e = Math.min(t, 1 - t) / fadeEnds
    return e >= 1 ? 1 : e * e * (3 - 2 * e)
  }
  const stops = Array.from({ length: 13 }, (_, k) => {
    const t = k / 12
    return { t, a: cue(lerp3(from, to, t)) * ends(t) }
  })
  const w = emphasis === 'on' ? width + EMPHASIS_WIDTH : width
  return (
    <g style={{ opacity: opacity * dim }}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          {stops.map(({ t, a }) => (
            <stop key={t} offset={t} style={{ stopColor: color, stopOpacity: a }} />
          ))}
        </linearGradient>
      </defs>
      {emphasis === 'on' && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={`url(#${id})`}
          strokeWidth={w + 6}
          strokeOpacity={0.2}
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#${id})`}
        strokeWidth={w}
        strokeDasharray={dash}
        strokeLinecap="round"
        pointerEvents="none"
      />
      {hover && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="transparent"
          strokeWidth={HIT_WIDTH}
          pointerEvents="stroke"
          {...hover}
        />
      )}
    </g>
  )
}

/**
 * Arrow from `from` to `to` in space. The head is drawn on screen, so it always faces the viewer;
 * the arrow fades with depth and grows from its tail when it first appears.
 */
export function Vector3D({
  to,
  from = ORIGIN,
  color = vc.fg,
  width = 3,
  opacity = 1,
  head,
  grow = true,
  hoverKey,
}: {
  to: Vec3
  from?: Vec3
  color?: string
  width?: number
  opacity?: number
  head?: number
  grow?: boolean
  hoverKey?: string
}) {
  const { project, cue } = useProjection()
  const px = usePixels()
  const { emphasis, hover, opacity: dim } = useEmphasis(hoverKey)
  const a = project(from)
  const b = project(to)
  const shade = opacity * dim * cue(lerp3(from, to, 0.5))
  const on = emphasis === 'on'
  const [x1, y1] = px(from)
  const [x2, y2] = px(to)
  return (
    <g>
      {on && (
        <Vector
          from={a}
          to={b}
          color={color}
          width={width + 7}
          opacity={0.18 * shade}
          head={(head ?? 13) + 5}
          grow={grow}
        />
      )}
      <Vector
        from={a}
        to={b}
        color={color}
        width={on ? width + EMPHASIS_WIDTH : width}
        opacity={shade}
        head={head}
        grow={grow}
      />
      {hover && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="transparent"
          strokeWidth={HIT_WIDTH}
          pointerEvents="stroke"
          {...hover}
        />
      )}
    </g>
  )
}

export function Segment3D({ from, to, ...look }: { from: Vec3; to: Vec3 } & LineLookProps) {
  return <DepthLine from={from} to={to} {...look} />
}

/**
 * The line through `through` along `direction`, drawn `reach` units each way and fading into the
 * distance at both ends, so it reads as going on forever.
 */
export function Line3D({
  through = ORIGIN,
  direction,
  reach = 10,
  ...look
}: { through?: Vec3; direction: Vec3; reach?: number } & LineLookProps) {
  const d = normalize3(direction)
  if (length3(d) === 0) return null
  return (
    <DepthLine
      from={add3(through, scale3(d, -reach))}
      to={add3(through, scale3(d, reach))}
      fadeEnds={0.35}
      {...look}
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
  const { project, cue } = useProjection()
  if (points.length === 0) return null
  const center = scale3(points.reduce(add3), 1 / points.length)
  return (
    <Path
      points={points.map((p) => project(p))}
      closed={closed}
      color={color}
      width={width}
      opacity={opacity * cue(center)}
      fill={fill ?? 'none'}
      dash={dash}
    />
  )
}

/** Share of each side of a plane patch over which it fades out, by default. */
const EDGE_FADE = 0.15

/**
 * Masks that fade a plane patch p + s u + t v, with |s| and |t| up to `size`:
 * over the outer `edge` share of each side (so the patch reads as part of an endless plane, with
 * its shape kept), and toward the back (the depth cue). The gradients are drawn in the patch's own
 * coordinates (s, t) and carried to the screen by `gradientTransform`, which is exact because
 * the projection is affine. Returns null when the plane is seen edge on.
 */
function usePlaneMasks(center: Vec3, u: Vec3, v: Vec3, size: number, edge: number) {
  const { cue, frame: screen } = useProjection()
  const c = useCoords()
  const px = usePixels()
  const sId = useSvgId()
  const tId = useSvgId()
  const depthId = useSvgId()
  const p0 = px(center)
  const a = px(add3(center, u))
  const b = px(add3(center, v))
  const ax = a[0] - p0[0]
  const ay = a[1] - p0[1]
  const bx = b[0] - p0[0]
  const by = b[1] - p0[1]
  if (Math.abs(ax * by - ay * bx) < 1) return null
  const transform = `matrix(${ax} ${ay} ${bx} ${by} ${p0[0]} ${p0[1]})`
  // Depth is linear on the patch: its lines of equal depth are perpendicular to (gx, gy) in (s, t).
  const gx = dot3(u, screen.toward)
  const gy = dot3(v, screen.toward)
  const g = Math.hypot(gx, gy)
  const dir: Vec2 = g < 1e-9 ? [1, 0] : [gx / g, gy / g]
  const reach = size * Math.SQRT2
  const at = (k: number) => add3(center, add3(scale3(u, k * dir[0]), scale3(v, k * dir[1])))
  const box = { x: 0, y: 0, width: c.width, height: c.height }
  const edgeStops = (
    <>
      <stop offset={0} stopColor="black" />
      <stop offset={edge} stopColor="white" />
      <stop offset={1 - edge} stopColor="white" />
      <stop offset={1} stopColor="black" />
    </>
  )
  const mask = (id: string) => (
    <mask id={id} maskUnits="userSpaceOnUse" {...box}>
      <rect {...box} fill={`url(#${id}g)`} />
    </mask>
  )
  const defs: ReactNode = (
    <defs>
      <linearGradient
        id={`${sId}g`}
        gradientUnits="userSpaceOnUse"
        x1={-size}
        y1={0}
        x2={size}
        y2={0}
        gradientTransform={transform}
      >
        {edgeStops}
      </linearGradient>
      {mask(sId)}
      <linearGradient
        id={`${tId}g`}
        gradientUnits="userSpaceOnUse"
        x1={0}
        y1={-size}
        x2={0}
        y2={size}
        gradientTransform={transform}
      >
        {edgeStops}
      </linearGradient>
      {mask(tId)}
      <linearGradient
        id={`${depthId}g`}
        gradientUnits="userSpaceOnUse"
        x1={-reach * dir[0]}
        y1={-reach * dir[1]}
        x2={reach * dir[0]}
        y2={reach * dir[1]}
        gradientTransform={transform}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((k) => (
          <stop key={k} offset={k} stopColor="white" stopOpacity={cue(at(reach * (2 * k - 1)))} />
        ))}
      </linearGradient>
      {mask(depthId)}
    </defs>
  )
  return {
    defs,
    wrap: (body: ReactNode) => (
      <g mask={`url(#${sId})`}>
        <g mask={`url(#${tId})`}>
          <g mask={`url(#${depthId})`}>{body}</g>
        </g>
      </g>
    ),
  }
}

/**
 * A patch of the plane through `point` with normal `normal`, `size` units from the center to each
 * side, with grid lines every `step` units. Pass `basis` to align the patch and its grid with two
 * directions of the plane (they need not be perpendicular); then `size` and `step` count weights
 * of those directions. The patch keeps its shape and fades over the outer `fade` share of each
 * side (0 for hard edges), and toward the back.
 *
 * Hovering the patch only lights its readout row: planes are crossed all the time while orbiting.
 * Hovering that row highlights the plane.
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
  fade = EDGE_FADE,
  hoverKey,
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
  fade?: number
  hoverKey?: string
}) {
  const { project } = useProjection()
  const [u, v] = basis ??
    (normal ? planeBasis(normal) : null) ?? [
      [1, 0, 0],
      [0, 1, 0],
    ]
  const { emphasis, hover, opacity: dim } = useEmphasis(hoverKey, { quiet: true })
  const masks = usePlaneMasks(point, u, v, size, Math.max(fade, 1e-3))
  const at = (s: number, t: number) => project(add3(point, add3(scale3(u, s), scale3(v, t))))
  const corners: Vec2[] = [at(-size, -size), at(size, -size), at(size, size), at(-size, size)]
  const n = Math.floor(size / step + 1e-9)
  const ks = Array.from({ length: 2 * n + 1 }, (_, i) => (i - n) * step)
  const on = emphasis === 'on'
  const grid = on ? Math.min(1, gridOpacity * 1.4) : gridOpacity
  const soft = fade > 0 && masks
  const body = (
    <>
      <Path
        points={corners}
        closed
        color={color}
        width={soft ? 0 : 1}
        opacity={soft ? 1 : 0.35}
        fill={alpha(color, on ? Math.min(1, fillOpacity * 1.5) : fillOpacity)}
      />
      {gridOpacity > 0 &&
        ks.map((k) => (
          <g key={k}>
            <Segment from={at(k, -size)} to={at(k, size)} color={color} width={1} opacity={grid} />
            <Segment from={at(-size, k)} to={at(size, k)} color={color} width={1} opacity={grid} />
          </g>
        ))}
    </>
  )
  return (
    <g style={{ opacity: opacity * dim }}>
      {masks?.defs}
      <g pointerEvents="none">{soft ? masks.wrap(body) : body}</g>
      {hover && (
        <Path
          points={corners}
          closed
          width={0}
          fill="transparent"
          pointerEvents="fill"
          {...hover}
        />
      )}
    </g>
  )
}

/** The grid of the floor plane z = 0, from -extent to extent, fading into the distance. */
export function Grid3D({ extent = 4, step = 1 }: { extent?: number; step?: number }) {
  return (
    <Plane3D
      basis={[
        [1, 0, 0],
        [0, 1, 0],
      ]}
      size={extent * 1.25}
      step={step}
      color={vc.fg}
      fillOpacity={0}
      gridOpacity={0.16}
      fade={0.4}
    />
  )
}

const AXES: readonly { dir: Vec3; label: string }[] = [
  { dir: [1, 0, 0], label: 'x' },
  { dir: [0, 1, 0], label: 'y' },
  { dir: [0, 0, 1], label: 'z' },
]

/**
 * The three coordinate axes with whole-number ticks up to `extent` and their names. The lines go
 * on past the ticks and fade out, since the axes have no end.
 */
export function Axes3D({ extent = 4, ticks = true }: { extent?: number; ticks?: boolean }) {
  const { project, cue } = useProjection()
  const ks = Array.from({ length: 2 * extent + 1 }, (_, i) => i - extent).filter((k) => k !== 0)
  // The fade starts just past the last tick and takes FADE units.
  const FADE = 2.6
  const reach = extent + 0.4 + FADE
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
            <DepthLine
              from={scale3(dir, -reach)}
              to={scale3(dir, reach)}
              fadeEnds={FADE / (2 * reach)}
              color={vc.axis}
              width={1.5}
            />
            {ticks &&
              len > 0.2 &&
              ks.map((k) => {
                const p = scale3(dir, k)
                const [px, py] = project(p)
                return (
                  <Segment
                    key={k}
                    from={[px - nx, py - ny]}
                    to={[px + nx, py + ny]}
                    color={vc.axis}
                    width={1.5}
                    opacity={cue(p)}
                  />
                )
              })}
            <TextLabel at={project(end)} color={vc.muted} size={13} opacity={cue(end)}>
              {label}
            </TextLabel>
          </g>
        )
      })}
    </g>
  )
}

/** KaTeX label at a point in space, fading with depth like the shape it names. */
export function MathLabel3D({
  at,
  opacity = 1,
  hoverKey,
  ...rest
}: { at: Vec3; hoverKey?: string } & Omit<Parameters<typeof MathLabel>[0], 'at'>) {
  const { project, cue } = useProjection()
  const { opacity: dim } = useEmphasis(hoverKey)
  return <MathLabel at={project(at)} opacity={opacity * dim * cue(at)} {...rest} />
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
  hoverKey,
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
  hoverKey?: string
}) {
  const { project, frame, cue } = useProjection()
  const { hover, opacity: dim } = useEmphasis(hoverKey)
  const here = project(at)
  const drag =
    onDrag &&
    (([sx, sy]: Vec2) => {
      const onPlane =
        dragPlane && screenToPlane(frame, sx, sy, dragPlane.normal, dragPlane.point ?? at)
      onDrag(onPlane ?? moveOnScreen(at, frame, sx - here[0], sy - here[1]))
    })
  return (
    // Points fade less than lines with depth: they are handles and must stay easy to find.
    <g style={{ opacity: dim * (0.4 + 0.6 * cue(at)) }} {...hover}>
      <Point at={here} onDrag={drag} coords={coords ? () => fmtPoint3(at) : false} {...rest} />
    </g>
  )
}

/** A ring that expands once from a point of space each time `when` turns true (see `Pulse`). */
export function Pulse3D({ at, ...rest }: { at: Vec3 } & Omit<Parameters<typeof Pulse>[0], 'at'>) {
  const { project } = useProjection()
  return <Pulse at={project(at)} {...rest} />
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
