import { describe, expect, it } from 'vitest'
import { createHoverRegistry } from './pointHover'

describe('createHoverRegistry', () => {
  it('finds the nearest registered point within the radius', () => {
    const r = createHoverRegistry()
    r.set('a', { px: [10, 10] })
    r.set('b', { px: [20, 10] })
    expect(r.nearest(12, 10)).toBe('a')
    expect(r.nearest(17, 10)).toBe('b')
    expect(r.nearest(100, 100)).toBeNull()
    r.set('a', null)
    expect(r.nearest(12, 10)).toBe('b')
  })
})
