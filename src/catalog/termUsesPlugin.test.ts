import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { scanContent, scanTermIds } from './termUsesPlugin'

describe('scanTermIds', () => {
  it('finds ids in order of first appearance, once each', () => {
    const mdx = `A <Term id="domain">domain</Term>, a <Term id='range' /> and the
<Term  id="domain">domain</Term> again. <Terms id="x"> is not a term.`
    expect(scanTermIds(mdx)).toEqual(['domain', 'range'])
  })
})

describe('scanContent', () => {
  it('reads the explanation, then the code walkthrough, of each item', () => {
    const root = mkdtempSync(join(tmpdir(), 'lumen-terms-'))
    try {
      const dir = join(root, 'a', 'c', 'u', 'i')
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'code.mdx'), '<Term id="matrix">A</Term> <Term id="vector">v</Term>')
      writeFileSync(join(dir, 'explanation.mdx'), '<Term id="vector">vectors</Term>')
      expect(scanContent(root)).toEqual({ 'a/c/u/i': ['vector', 'matrix'] })
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
