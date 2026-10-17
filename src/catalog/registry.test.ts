import { describe, expect, it } from 'vitest'
import { catalog, catalogProblems } from './registry'

describe('content catalog', () => {
  it('builds without problems (unknown skills, terms or items)', () => {
    expect(catalog.items.length).toBeGreaterThan(0)
    expect(catalogProblems).toEqual([])
  })
})
