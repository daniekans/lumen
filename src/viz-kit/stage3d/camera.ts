import { createContext, useContext } from 'react'
import { cross3, dot3, length3, normalize3, type Vec2, type Vec3 } from '@/lib/math'

/**
 * An orbit camera looking at the origin, with $z$ up. `azimuth` turns around the $z$-axis and
 * `elevation` tilts toward the top (both in radians); `zoom` scales the picture.
 */
export interface Camera {
  azimuth: number
  elevation: number
  zoom: number
}

/** The usual textbook view: $x$ toward the viewer and to the left, $y$ to the right, $z$ up. */
export const defaultCamera: Camera = { azimuth: 0.55, elevation: 0.38, zoom: 1 }

export const CAMERA_LIMITS = {
  /** Just short of straight down and straight up, where the screen's up direction flips. */
  elevation: 1.45,
  zoom: { min: 0.4, max: 4 },
} as const

export const clampCamera = (c: Camera): Camera => ({
  azimuth: c.azimuth,
  elevation: Math.min(CAMERA_LIMITS.elevation, Math.max(-CAMERA_LIMITS.elevation, c.elevation)),
  zoom: Math.min(CAMERA_LIMITS.zoom.max, Math.max(CAMERA_LIMITS.zoom.min, c.zoom)),
})

/** Radians of orbit per pixel of drag. */
export const ORBIT_RATE = 0.008

/** Turns the camera for a drag of (dx, dy) pixels: the scene follows the pointer. */
export const orbitBy = (c: Camera, dx: number, dy: number): Camera =>
  clampCamera({
    ...c,
    azimuth: c.azimuth - dx * ORBIT_RATE,
    elevation: c.elevation + dy * ORBIT_RATE,
  })

/**
 * The screen axes of a camera as unit vectors in space: `right` and `up` span the picture, and
 * `toward` points from the origin to the viewer. The three are orthonormal and right-handed
 * (right × up = toward).
 */
export interface ScreenFrame {
  right: Vec3
  up: Vec3
  toward: Vec3
}

export const screenFrame = ({ azimuth: a, elevation: e }: Camera): ScreenFrame => {
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const ce = Math.cos(e)
  const se = Math.sin(e)
  return {
    right: [-sa, ca, 0],
    up: [-se * ca, -se * sa, ce],
    toward: [ce * ca, ce * sa, se],
  }
}

/**
 * How much the far side of a scene fades: a point at the back of the scene's radius is drawn at
 * `1 - DEPTH_CUE` of its opacity. An orthographic picture has no shrinking with distance, so
 * without this cue the eye reads a far edge as wider than a near one of the same length.
 */
export const DEPTH_CUE = 0.55

/**
 * Orthographic projection: a point's screen position is its components along `right` and `up`,
 * in the same units as space, so parallel lines stay parallel and equal steps stay equal.
 * `depth` grows toward the viewer, and `cue` turns it into an opacity factor (1 in front).
 */
export interface Projection {
  camera: Camera
  frame: ScreenFrame
  /** Radius of the scene around the origin, which sets the range of the depth cue. */
  radius: number
  project: (p: Vec3) => Vec2
  depth: (p: Vec3) => number
  cue: (p: Vec3) => number
}

export const createProjection = (camera: Camera, radius = 4): Projection => {
  const frame = screenFrame(camera)
  const depth = (p: Vec3) => dot3(p, frame.toward)
  return {
    camera,
    frame,
    radius,
    project: (p) => [dot3(p, frame.right), dot3(p, frame.up)],
    depth,
    cue: (p) => {
      const back = Math.min(1, Math.max(0, (radius - depth(p)) / (2 * radius)))
      return 1 - DEPTH_CUE * back
    },
  }
}

/** Standard views, keeping the zoom: from above ($x$ right, $y$ up), the front ($x$ right, $z$ up) and the side ($y$ right, $z$ up). */
export const standardViews = {
  top: { azimuth: -Math.PI / 2, elevation: CAMERA_LIMITS.elevation },
  front: { azimuth: -Math.PI / 2, elevation: 0 },
  side: { azimuth: 0, elevation: 0 },
} as const satisfies Record<string, Omit<Camera, 'zoom'>>

/** The point that moved by (dx, dy) screen units from `p`, staying at the same depth. */
export const moveOnScreen = (p: Vec3, frame: ScreenFrame, dx: number, dy: number): Vec3 => [
  p[0] + frame.right[0] * dx + frame.up[0] * dy,
  p[1] + frame.right[1] * dx + frame.up[1] * dy,
  p[2] + frame.right[2] * dx + frame.up[2] * dy,
]

export const ProjectionContext = createContext<Projection | null>(null)

export const useProjection = () => {
  const ctx = useContext(ProjectionContext)
  if (!ctx) throw new Error('useProjection must be used inside <Stage3D>')
  return ctx
}

/**
 * The point of the plane through `point` with normal `normal` that sits under the screen position
 * (sx, sy), or null when the plane is seen edge on. In an orthographic view every screen position
 * is a line along `toward`, and this is where that line meets the plane.
 */
export const screenToPlane = (
  frame: ScreenFrame,
  sx: number,
  sy: number,
  normal: Vec3,
  point: Vec3,
): Vec3 | null => {
  const nt = dot3(normal, frame.toward)
  if (Math.abs(nt) < 0.05 * length3(normal)) return null
  const t =
    (dot3(normal, point) - sx * dot3(normal, frame.right) - sy * dot3(normal, frame.up)) / nt
  return [
    sx * frame.right[0] + sy * frame.up[0] + t * frame.toward[0],
    sx * frame.right[1] + sy * frame.up[1] + t * frame.toward[1],
    sx * frame.right[2] + sy * frame.up[2] + t * frame.toward[2],
  ]
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
 * A camera at `azimuth` that sees the plane with normal `n` edge on, so the plane shows as a line
 * and vectors in it lie along that line. A vertical plane is seen from its own side instead.
 */
export const edgeOnCamera = (n: Vec3, azimuth: number, zoom = 1): Camera => {
  if (Math.abs(n[2]) < 1e-9) return { azimuth: Math.atan2(-n[0], n[1]), elevation: 0, zoom }
  const ca = Math.cos(azimuth)
  const sa = Math.sin(azimuth)
  // The view direction (cos e cos a, cos e sin a, sin e) is perpendicular to n.
  return { azimuth, elevation: Math.atan(-(n[0] * ca + n[1] * sa) / n[2]), zoom }
}
