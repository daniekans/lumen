import { describe, expect, it } from 'vitest'
import { isChunkLoadError } from './errors'

describe('isChunkLoadError', () => {
  it('recognizes chunk load failures from Chromium, Safari and Firefox', () => {
    for (const m of [
      'Failed to fetch dynamically imported module: http://localhost/x.mdx',
      'Importing a module script failed.',
      'error loading dynamically imported module: https://x/y.js',
    ])
      expect(isChunkLoadError(new TypeError(m))).toBe(true)
  })
  it('ignores other errors', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
    expect(isChunkLoadError('Failed to fetch dynamically imported module')).toBe(false)
  })
})
