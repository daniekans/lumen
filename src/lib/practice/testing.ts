import katex from 'katex'
import { expect } from 'vitest'
import { texMacros } from '../texMacros'
import { answerTex } from './answers'
import { checkAnswer } from './check'
import type { Problem, ProblemGenerator } from './problems'
import { createRng } from './rng'

/** Built from its code point so formatters cannot turn it into a literal character. */
const EM_DASH = new RegExp(String.fromCharCode(0x2014))

const texSegments = (text: string) =>
  [...text.matchAll(/\$\$([^$]+)\$\$|\$([^$]+)\$/g)].map((m) => m[1] ?? m[2]!)

/** TeX already rendered without errors. Seeds repeat many strings, and rendering dominates the run. */
const rendered = new Set<string>()

const assertTex = (text: string, where: string) => {
  for (const tex of texSegments(text)) {
    if (rendered.has(tex)) continue
    expect(
      () => katex.renderToString(tex, { throwOnError: true, macros: texMacros() }),
      `${where}: ${tex}`,
    ).not.toThrow()
    rendered.add(tex)
  }
  expect(text, `${where} contains an em dash`).not.toMatch(EM_DASH)
}

/**
 * Checks every generator over many seeds: generation is deterministic, all TeX renders, and the
 * stored answer is accepted by the checker. `verify` adds an independent check of the answer.
 */
export const testProblemSet = (
  problems: readonly ProblemGenerator[],
  verify?: (generator: ProblemGenerator, problem: Problem) => void,
  seeds = 150,
) => {
  const ids = problems.map((p) => p.id)
  expect(new Set(ids).size, 'duplicate generator ids').toBe(ids.length)
  for (const g of problems) {
    for (let seed = 1; seed <= seeds; seed++) {
      const p = g.generate(createRng(seed))
      expect(g.generate(createRng(seed)), `${g.id} is not deterministic`).toEqual(p)
      const where = `${g.id} seed ${seed}`
      assertTex(p.prompt, where)
      for (const h of p.hints ?? []) assertTex(h, `${where} hint`)
      expect(p.solution.length, `${where} has no solution`).toBeGreaterThan(0)
      for (const s of p.solution) assertTex(s, `${where} solution`)
      const a = p.answer
      if (a.kind === 'choice') {
        expect(a.correct, where).toBeGreaterThanOrEqual(0)
        expect(a.correct, where).toBeLessThan(a.options.length)
        expect(new Set(a.options).size, `${where} repeats an option`).toBe(a.options.length)
        a.options.forEach((o) => assertTex(o, `${where} option`))
        expect(checkAnswer(a, { choice: a.correct }).verdict).toBe('correct')
      } else if (a.kind !== 'self') {
        const tex = answerTex(a)!
        expect(
          () => katex.renderToString(tex, { throwOnError: true, macros: texMacros() }),
          `${where} answer`,
        ).not.toThrow()
        expect(checkAnswer(a, { tex }).verdict, `${where} rejects its own answer ${tex}`).toBe(
          'correct',
        )
      }
      verify?.(g, p)
    }
  }
}
