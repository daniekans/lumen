import { describe, expect, it } from 'vitest'
import { polyEval } from '@/lib/math'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { ENDS, problems } from './problems'

const close = (a: number, b: number, eps = 1e-9) =>
  expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps * Math.max(1, Math.abs(b)))

/** The TeX inside $...$ of a prompt, by position. */
const texOf = (text: string, i = 0) => [...text.matchAll(/\$([^$]+)\$/g)][i]![1]!

/** Splits \frac{num}{den} with balanced braces. */
const splitFrac = (t: string) => {
  const body = t.slice(t.indexOf('frac{') + 4)
  const group = (s: string) => {
    let depth = 0
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '{') depth++
      if (s[i] === '}' && --depth === 0) return [s.slice(1, i), s.slice(i + 1)] as const
    }
    throw new Error(`unbalanced: ${s}`)
  }
  const [n, rest] = group(body)
  const [d] = group(rest)
  return [n, d] as const
}

/** f from the "f(x) = \frac{..}{..}" in a prompt, evaluated from its own TeX. */
const promptFn = (prompt: string) => {
  const t = texOf(prompt).replace(/^f\(x\) = /, '')
  const [n, d] = splitFrac(t)
  return (x: number) => evaluateTex(n, { x })! / evaluateTex(d, { x })!
}

const XS = [-7.3, -2.1, 0.4, 1.7, 5.9]

describe('polynomial and rational practice problems', () => {
  it('generate valid problems with correct answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'slope': {
          if (a.kind !== 'number') throw new Error('expected a number')
          close(a.value * (d.x2! - d.x1!), d.y2! - d.y1!)
          break
        }
        case 'line-through-points': {
          if (a.kind !== 'expression') throw new Error('expected an expression')
          close(evaluateTex(a.tex, { x: d.x1! })!, d.y1!)
          close(evaluateTex(a.tex, { x: d.x2! })!, d.y2!)
          break
        }
        case 'vertex-form': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const f = (x: number) => d.a! * x * x + d.b! * x + d.c!
          a.options.forEach((o, i) => {
            const diff = XS.map((x) => Math.abs(evaluateTex(o.slice(1, -1), { x })! - f(x)))
            if (i === a.correct) diff.forEach((v) => expect(v).toBeLessThan(1e-9))
            else expect(Math.max(...diff), o).toBeGreaterThan(1e-6)
          })
          break
        }
        case 'quadratic-extreme': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const f = (x: number) => evaluateTex(texOf(p.prompt).replace(/^f\(x\) = /, ''), { x })!
          // The value is attained, and no sampled value beats it.
          close(f(-d.b! / (2 * d.a!)), a.value)
          for (let x = -20; x <= 20; x += 0.01) {
            if (d.a! > 0) expect(f(x)).toBeGreaterThanOrEqual(a.value - 1e-9)
            else expect(f(x)).toBeLessThanOrEqual(a.value + 1e-9)
          }
          break
        }
        case 'end-behavior': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const t = texOf(p.prompt).replace(/^p\(x\) = /, '')
          const left = Math.sign(evaluateTex(t, { x: -1000 })!)
          const right = Math.sign(evaluateTex(t, { x: 1000 })!)
          const word = (s: number) => (s > 0 ? 'up' : 'down')
          const expected = ENDS[`${word(left)}-${word(right)}` as keyof typeof ENDS]
          expect(a.options[a.correct]).toBe(expected)
          break
        }
        case 'touching-zero': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const t = texOf(p.prompt).replace(/^p\(x\) = /, '')
          const f = (x: number) => evaluateTex(t, { x })!
          for (const r of [d.r1!, d.r2!, d.r3!]) {
            close(f(r), 0)
            const touches = Math.sign(f(r - 0.01)) === Math.sign(f(r + 0.01))
            expect(touches, `zero ${r}`).toBe(r === a.value)
          }
          break
        }
        case 'least-degree': {
          if (a.kind !== 'number') throw new Error('expected a number')
          // Smallest odd multiplicities for crossings and even ones for touches, by search.
          let best = Infinity
          const odd = [1, 3, 5]
          const even = [2, 4, 6]
          const sums = (k: number, from: number[]): number[] =>
            k === 0 ? [0] : from.flatMap((m) => sums(k - 1, from).map((s) => s + m))
          for (const c of sums(d.crosses!, odd))
            for (const t of sums(d.touches!, even)) best = Math.min(best, c + t)
          expect(a.value).toBe(best)
          break
        }
        case 'vertical-asymptotes': {
          if (a.kind !== 'list') throw new Error('expected a list')
          const t = texOf(p.prompt).replace(/^f\(x\) = /, '')
          const [n, den] = splitFrac(t)
          const found: number[] = []
          for (let x = -10; x <= 10; x++) {
            const dv = evaluateTex(den, { x })!
            const nv = evaluateTex(n, { x })!
            if (Math.abs(dv) < 1e-12 && Math.abs(nv) > 1e-12) found.push(x)
          }
          expect([...a.values].sort((u, v) => u - v)).toEqual(found)
          break
        }
        case 'hole': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const f = promptFn(p.prompt)
          expect(Number.isFinite(f(d.s!))).toBe(false)
          close(f(d.s! + 1e-7), a.value, 1e-5)
          close(f(d.s! - 1e-7), a.value, 1e-5)
          break
        }
        case 'horizontal-asymptote': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const f = promptFn(p.prompt)
          close(f(1e7), a.value, 1e-5)
          close(f(-1e7), a.value, 1e-5)
          break
        }
        case 'slant-asymptote': {
          if (a.kind !== 'expression') throw new Error('expected an expression')
          const f = promptFn(p.prompt)
          const line = (x: number) => evaluateTex(a.tex, { x })!
          // The gap shrinks like 1/x, and the denominator really does not divide the numerator.
          expect(Math.abs(f(1e5) - line(1e5))).toBeLessThan(1e-3)
          expect(Math.abs(f(1e5) - line(1e5))).toBeGreaterThan(0)
          const r = d.r!
          expect(Math.abs(polyEval([d.a!, d.t1!, d.t2!], r))).toBeGreaterThan(0)
          break
        }
        default:
          throw new Error(`no verification for ${g.id}`)
      }
    })
  })
})
