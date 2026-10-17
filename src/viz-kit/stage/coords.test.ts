import { describe, expect, it } from 'vitest'
import { clampView, createCoords, identityView, panViewBy, zoomViewAt, type Domain } from './coords'

const domain: Domain = { x: [-2, 6], y: [-1, 4] }
const insets = { top: 32, right: 32, bottom: 112, left: 32 }
const at = (v = identityView, yUp = true) => createCoords(domain, 800, 600, insets, yUp, v)

describe('stage view', () => {
  it('is the plain fit for the identity view', () => {
    const c = at()
    expect(c.zoom).toBe(1)
    expect(c.unit).toBeCloseTo(Math.min(736 / 8, 456 / 5), 9)
  })

  it.each([true, false])('keeps the point under the cursor fixed while zooming (yUp %s)', (yUp) => {
    let v = identityView
    for (const [f, px, py] of [
      [1.7, 120, 80],
      [0.6, 640, 500],
      [3, 400, 300],
    ] as const) {
      const before = at(v, yUp)
      const m = before.fromPx(px, py)
      v = zoomViewAt(v, before, domain, f, px, py)
      const after = at(v, yUp)
      expect(after.unit).toBeCloseTo(before.unit * f, 9)
      const [x, y] = after.toPx(m)
      expect(x).toBeCloseTo(px, 6)
      expect(y).toBeCloseTo(py, 6)
    }
  })

  it.each([true, false])('moves the content with the pointer while panning (yUp %s)', (yUp) => {
    const v0 = { zoom: 2, pan: [0.5, -0.25] as const }
    const before = at({ zoom: v0.zoom, pan: [...v0.pan] }, yUp)
    const p = before.toPx([1, 2])
    const after = at(panViewBy({ zoom: 2, pan: [0.5, -0.25] }, before, 37, -21), yUp)
    const q = after.toPx([1, 2])
    expect(q[0] - p[0]).toBeCloseTo(37, 6)
    expect(q[1] - p[1]).toBeCloseTo(-21, 6)
  })

  it('clamps the zoom and keeps the center near the domain', () => {
    expect(clampView({ zoom: 100, pan: [0, 0] }, domain).zoom).toBe(10)
    expect(clampView({ zoom: 0.01, pan: [0, 0] }, domain).zoom).toBe(0.25)
    expect(clampView({ zoom: 1, pan: [50, -50] }, domain).pan).toEqual([8, -5])
  })
})
