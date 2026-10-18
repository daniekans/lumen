import { describe, expect, it } from 'vitest'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

const close = (a: number, b: number) =>
  expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(1e-9 * Math.max(1, Math.abs(b)))

/** The components stored as name0, name1, ... in the problem data. */
const read = (data: Readonly<Record<string, number>>, name: string) => {
  const out: number[] = []
  for (let i = 0; `${name}${i}` in data; i++) out.push(data[`${name}${i}`]!)
  return out
}

const hypot = (xs: readonly number[]) => Math.sqrt(xs.reduce((s, x) => s + x * x, 0))

describe('vector arithmetic practice problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data!
      const a = p.answer
      switch (g.id) {
        case 'combination': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const v = read(d, 'v')
          const w = read(d, 'w')
          expect(a.values).toEqual(v.map((x, i) => d.a! * x + d.b! * w[i]!))
          break
        }
        case 'solve-for-vector': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const v = read(d, 'v')
          const w = read(d, 'w')
          a.values.forEach((x, i) => close(d.c! * x + v[i]!, w[i]!))
          break
        }
        case 'length': {
          if (a.kind !== 'expression') throw new Error('expected an expression')
          close(evaluateTex(a.tex)!, hypot(read(d, 'v')))
          break
        }
        case 'unit-vector': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const v = read(d, 'v')
          close(hypot(a.values), 1)
          // Same direction: a positive multiple of v.
          const k = hypot(v)
          a.values.forEach((x, i) => close(x * k, v[i]!))
          break
        }
        case 'distance': {
          if (a.kind !== 'expression') throw new Error('expected an expression')
          const pp = read(d, 'p')
          const q = read(d, 'q')
          close(evaluateTex(a.tex)!, hypot(q.map((x, i) => x - pp[i]!)))
          break
        }
        case 'missing-component': {
          if (a.kind !== 'list') throw new Error('expected a list')
          // The length stated in the prompt, read back from its TeX.
          const stated = evaluateTex(p.prompt.match(/\\rVert = ([^$]+)\$/)![1]!)!
          const rest = read(d, 'r')
          expect(a.values).toHaveLength(2)
          for (const k of a.values) close(hypot([k, ...rest]), stated)
          expect(a.values[0]).toBe(-a.values[1]!)
          break
        }
        case 'find-weights': {
          if (a.kind !== 'vector') throw new Error('expected a vector')
          const [wa, wb] = a.values as [number, number]
          const v = read(d, 'v')
          const w = read(d, 'w')
          const u = read(d, 'u')
          u.forEach((x, i) => close(wa * v[i]! + wb * w[i]!, x))
          expect(v[0]! * w[1]! - v[1]! * w[0]!).not.toBe(0)
          break
        }
        default:
          throw new Error(`untested generator ${g.id}`)
      }
    })
  })
})
