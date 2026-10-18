import { describe, expect, it } from 'vitest'
import { cross3, dot3, length3, type Vec3 } from '@/lib/math'
import {
  CAMERA_LIMITS,
  createProjection,
  defaultCamera,
  moveOnScreen,
  orbitBy,
  screenFrame,
  screenToPlane,
} from './camera'

const close = (a: readonly number[], b: readonly number[]) =>
  a.forEach((x, i) => expect(x).toBeCloseTo(b[i]!, 9))

describe('screen frame', () => {
  it.each([
    [0, 0],
    [0.55, 0.38],
    [-2, 1.2],
    [3, -0.9],
  ])('is orthonormal and right-handed (azimuth %s, elevation %s)', (azimuth, elevation) => {
    const { right, up, toward } = screenFrame({ azimuth, elevation, zoom: 1 })
    for (const v of [right, up, toward]) expect(length3(v)).toBeCloseTo(1, 9)
    expect(dot3(right, up)).toBeCloseTo(0, 9)
    expect(dot3(right, toward)).toBeCloseTo(0, 9)
    expect(dot3(up, toward)).toBeCloseTo(0, 9)
    close(cross3(right, up), toward)
  })

  it('looks along the x-axis with z up and y to the right at azimuth 0, elevation 0', () => {
    const { right, up, toward } = screenFrame({ azimuth: 0, elevation: 0, zoom: 1 })
    close(right, [0, 1, 0])
    close(up, [0, 0, 1])
    close(toward, [1, 0, 0])
  })

  it('keeps the z-axis pointing up on screen for every allowed elevation', () => {
    for (const elevation of [-CAMERA_LIMITS.elevation, 0, 0.7, CAMERA_LIMITS.elevation]) {
      const p = createProjection({ azimuth: 1, elevation, zoom: 1 })
      const [x, y] = p.project([0, 0, 1])
      expect(x).toBeCloseTo(0, 9)
      expect(y).toBeGreaterThan(0)
    }
  })
})

describe('projection', () => {
  const p = createProjection(defaultCamera)

  it('is linear, so parallel lines stay parallel', () => {
    const a: Vec3 = [1, -2, 0.5]
    const b: Vec3 = [-3, 0.25, 2]
    const [ax, ay] = p.project(a)
    const [bx, by] = p.project(b)
    close(p.project([2 * a[0] - b[0], 2 * a[1] - b[1], 2 * a[2] - b[2]]), [
      2 * ax - bx,
      2 * ay - by,
    ])
  })

  it('places the default view with x toward the viewer on the left and y on the right', () => {
    const [xx] = p.project([1, 0, 0])
    const [yx] = p.project([0, 1, 0])
    expect(xx).toBeLessThan(0)
    expect(yx).toBeGreaterThan(0)
    expect(p.depth([1, 0, 0])).toBeGreaterThan(0)
  })

  it('moves a point on screen without changing its depth', () => {
    const a: Vec3 = [0.5, 1, -1]
    const moved = moveOnScreen(a, p.frame, 0.3, -1.2)
    const [x0, y0] = p.project(a)
    close(p.project(moved), [x0 + 0.3, y0 - 1.2])
    expect(p.depth(moved)).toBeCloseTo(p.depth(a), 9)
  })
})

describe('orbit', () => {
  it('turns with the drag and stops short of the poles', () => {
    const c = orbitBy(defaultCamera, 100, 0)
    expect(c.azimuth).toBeLessThan(defaultCamera.azimuth)
    expect(orbitBy(defaultCamera, 0, 10_000).elevation).toBe(CAMERA_LIMITS.elevation)
    expect(orbitBy(defaultCamera, 0, -10_000).elevation).toBe(-CAMERA_LIMITS.elevation)
  })
})

describe('screen to plane', () => {
  const p = createProjection(defaultCamera)

  it('finds the point of the plane under a screen position', () => {
    const normal: Vec3 = [1, 2, -1]
    const point: Vec3 = [0.5, 0, 1]
    const hit = screenToPlane(p.frame, 1.3, -0.4, normal, point)!
    close(p.project(hit), [1.3, -0.4])
    expect(dot3(normal, hit)).toBeCloseTo(dot3(normal, point), 9)
  })

  it('gives up on a plane seen edge on', () => {
    expect(screenToPlane(p.frame, 1, 1, p.frame.right, [0, 0, 0])).toBeNull()
  })
})
