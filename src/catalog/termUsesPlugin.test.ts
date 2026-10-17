import { describe, expect, it } from 'vitest'
import { scanTermIds } from './termUsesPlugin'

describe('scanTermIds', () => {
  it('finds ids in order of first appearance, once each', () => {
    const mdx = `A <Term id="domain">domain</Term>, a <Term id='range' /> and the
<Term  id="domain">domain</Term> again. <Terms id="x"> is not a term.`
    expect(scanTermIds(mdx)).toEqual(['domain', 'range'])
  })
})
