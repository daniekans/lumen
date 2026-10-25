import { describe, expect, it } from 'vitest'
import { currentId } from './redirects'

describe('currentId', () => {
  it('follows redirects for items and for the units they sit in', () => {
    expect(currentId('calculus/derivative-as-limit')).toBe(
      'mathematics/calculus-1/derivatives/derivative-as-limit',
    )
    expect(currentId('mathematics/pre-calculus/linear-and-quadratic/some-item')).toBe(
      'mathematics/pre-calculus/polynomial-and-rational/some-item',
    )
    expect(currentId('mathematics/calculus-1/limits/continuity')).toBe(
      'mathematics/calculus-1/limits/continuity',
    )
  })

  it('follows a chain of moves and a skill that moved to another unit', () => {
    expect(currentId('linear-algebra/matrix-transformations')).toBe(
      'mathematics/linear-algebra/linear-maps/matrix-transformations',
    )
    expect(currentId('mathematics/linear-algebra/linear-transformations#determinant')).toBe(
      'mathematics/linear-algebra/determinants#determinant',
    )
  })
})
