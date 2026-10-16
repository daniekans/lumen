import { describe, expect, it } from 'vitest'
import { answerTex } from './answers'
import { checkAnswer } from './check'
import { autoDifficulty, nextGenerator, suggestStatus, type Attempt } from './session'
import { createRng } from './rng'
import { frac, paren, poly, sum } from './tex'
import type { ProblemGenerator } from './problems'

const tex = (s: string) => ({ tex: s })

describe('checkAnswer', () => {
  it('accepts equal numbers in any written form', () => {
    const a = { kind: 'number', value: 0.5 } as const
    for (const s of ['0.5', '\\frac{1}{2}', '\\frac{2}{4}', '1/2', '0,5'])
      expect(checkAnswer(a, tex(s)).verdict).toBe('correct')
    expect(checkAnswer(a, tex('0.51')).verdict).toBe('incorrect')
    expect(checkAnswer({ kind: 'number', value: Math.SQRT2 }, tex('\\sqrt{2}')).verdict).toBe(
      'correct',
    )
  })

  it('rejects unreadable input and variables where a number is expected', () => {
    const a = { kind: 'number', value: 2 } as const
    expect(checkAnswer(a, tex('')).verdict).toBe('invalid')
    expect(checkAnswer(a, tex('2x')).verdict).toBe('invalid')
  })

  it('accepts equivalent expressions and rejects different ones', () => {
    const a = { kind: 'expression', tex: 'x^2+2x+1' } as const
    for (const s of ['(x+1)^2', '1+2x+x^2', 'x(x+2)+1'])
      expect(checkAnswer(a, tex(s)).verdict).toBe('correct')
    for (const s of ['x^2+2x', '(x-1)^2', 'x^2+2x+1.001'])
      expect(checkAnswer(a, tex(s)).verdict).toBe('incorrect')
    expect(
      checkAnswer(
        { kind: 'expression', tex: '1', ranges: { x: [-3, 3] } },
        tex('\\sin^2 x+\\cos^2 x'),
      ).verdict,
    ).toBe('correct')
    expect(checkAnswer({ kind: 'expression', tex: 'x+1' }, tex('\\frac{x^2-1}{x-1}')).verdict).toBe(
      'correct',
    )
  })

  it('flags variables that do not belong in the answer', () => {
    const r = checkAnswer({ kind: 'expression', tex: '2x' }, tex('2y'))
    expect(r.verdict).toBe('incorrect')
    expect(r.message).toMatch(/only x/)
  })

  it('checks unordered lists', () => {
    const a = { kind: 'list', values: [2, -3] } as const
    expect(checkAnswer(a, tex('-3, 2')).verdict).toBe('correct')
    expect(checkAnswer(a, tex('2')).message).toMatch(/more to find/)
    expect(checkAnswer(a, tex('2, 3')).verdict).toBe('incorrect')
  })

  it('checks choices and self-graded answers', () => {
    expect(
      checkAnswer({ kind: 'choice', options: ['a', 'b'], correct: 1 }, { choice: 1 }).verdict,
    ).toBe('correct')
    expect(checkAnswer({ kind: 'self' }, { self: false }).verdict).toBe('incorrect')
  })
})

describe('answerTex', () => {
  it('keeps short decimals and writes repeating ones as fractions', () => {
    expect(answerTex({ kind: 'number', value: 2.5 })).toBe('2.5')
    expect(answerTex({ kind: 'number', value: -5 / 9 })).toBe('-\\frac{5}{9}')
    expect(answerTex({ kind: 'list', values: [1 / 3, 4] })).toBe('\\frac{1}{3},\\ 4')
    expect(answerTex({ kind: 'number', value: Math.SQRT2 })).toBe('1.414214')
  })
})

describe('tex helpers', () => {
  it('formats polynomials and sums without awkward signs', () => {
    expect(poly([2, -3, 1])).toBe('2x^{2} - 3x + 1')
    expect(poly([1, 0, -1])).toBe('x^{2} - 1')
    expect(poly([-1, 1, 0])).toBe('-x^{2} + x')
    expect(poly([0, 0, 0])).toBe('0')
    expect(
      sum([
        [3, 'h'],
        [-1, ''],
      ]),
    ).toBe('3h - 1')
    expect(paren(-2)).toBe('(-2)')
    expect(frac(6, 4)).toBe('\\frac{3}{2}')
    expect(frac(-2, 6)).toBe('-\\frac{1}{3}')
    expect(frac(4, -2)).toBe('-2')
  })
})

describe('session', () => {
  const gen = (id: string, difficulty: 1 | 2 | 3): ProblemGenerator => ({
    id,
    skills: ['s'],
    difficulty,
    title: id,
    generate: () => ({ prompt: '', answer: { kind: 'self' }, solution: [] }),
  })
  const attempt = (correct: boolean, difficulty: 1 | 2 | 3 = 1, helped = false): Attempt => ({
    generatorId: 'g',
    skills: ['s'],
    difficulty,
    correct,
    helped,
  })

  it('raises difficulty after clean answers and lowers it after misses', () => {
    expect(autoDifficulty([])).toBe(1)
    expect(autoDifficulty([attempt(true), attempt(true)])).toBe(2)
    expect(autoDifficulty([attempt(true), attempt(true), attempt(false)])).toBe(1)
    expect(autoDifficulty([attempt(true), attempt(true, 1, true)])).toBe(1)
  })

  it('avoids repeating the last generator', () => {
    const gens = [gen('a', 1), gen('b', 1)]
    const rng = createRng(1)
    for (let i = 0; i < 20; i++) {
      const g = nextGenerator(gens, [{ ...attempt(true), generatorId: 'a' }], 1, rng)
      expect(g.id).toBe('b')
    }
  })

  it('suggests statuses from unaided results', () => {
    expect(suggestStatus([])).toBeUndefined()
    expect(suggestStatus([attempt(false)])).toBe('practiced')
    expect(suggestStatus([attempt(true), attempt(true), attempt(true, 2)])).toBe('proficient')
    expect(
      suggestStatus([attempt(true, 1, true), attempt(true, 2, true), attempt(true, 2, true)]),
    ).toBe('practiced')
    expect(
      suggestStatus([
        attempt(true),
        attempt(true, 2),
        attempt(true, 2),
        attempt(true, 3),
        attempt(true, 3),
      ]),
    ).toBe('mastered')
  })
})
