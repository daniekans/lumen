import { describe, expect, it } from 'vitest'
import { evaluateTex } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

const close = (a: number, b: number, eps = 1e-9) =>
  expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps * Math.max(1, Math.abs(b)))

/** The TeX inside $...$ of a prompt, by position. */
const texOf = (text: string, i = 0) => [...text.matchAll(/\$([^$]+)\$/g)][i]![1]!

/** Both sides of the equation in a prompt, evaluated from its own TeX at x. */
const sides = (prompt: string, x: number) => {
  const [lhs, rhs] = texOf(prompt).split(' = ') as [string, string]
  return [evaluateTex(lhs, { x }), evaluateTex(rhs)] as const
}

const POINTS = [
  { x: 0.7, y: 2.3, z: 1.9 },
  { x: 3.1, y: 0.4, z: 5.2 },
  { x: 1.6, y: 7.5, z: 0.3 },
]

describe('exponential and logarithmic practice problems', () => {
  it('generate valid problems with correct answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      switch (g.id) {
        case 'evaluate-log':
        case 'combine-logs': {
          if (a.kind !== 'number') throw new Error('expected a number')
          // The prompt's own TeX evaluates to the answer.
          close(evaluateTex(texOf(p.prompt))!, a.value)
          if (g.id === 'evaluate-log') close(d.b! ** a.value, d.arg!)
          else close(d.b! ** a.value, (d.a! * d.d!) / d.c!)
          break
        }
        case 'expand-log': {
          if (a.kind !== 'choice') throw new Error('expected a choice')
          const truth = ({ x, y, z }: (typeof POINTS)[number]) =>
            Math.log((x ** d.m! * y ** d.n!) / z ** d.k!)
          a.options.forEach((o, i) => {
            const diff = POINTS.map((pt) => Math.abs(evaluateTex(o.slice(1, -1), pt)! - truth(pt)))
            if (i === a.correct) diff.forEach((v) => expect(v).toBeLessThan(1e-9))
            else expect(Math.max(...diff), o).toBeGreaterThan(1e-3)
          })
          break
        }
        case 'exponential-model': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const b = (d.y2! / d.y1!) ** (1 / (d.x2! - d.x1!))
          const coef = d.y1! / b ** d.x1!
          close(coef * b ** d.target!, a.value)
          break
        }
        case 'half-life': {
          if (a.kind !== 'number') throw new Error('expected a number')
          close(d.a0! * 0.5 ** (d.t! / d.h!), d.left!)
          close(a.value, p.prompt.includes('After how many hours') ? d.t! : d.left!)
          break
        }
        case 'continuous-growth': {
          if (a.kind !== 'number') throw new Error('expected a number')
          close(Math.log(a.value / d.p!), d.r! * d.t!)
          break
        }
        case 'doubling-time': {
          if (a.kind !== 'number') throw new Error('expected a number')
          close(d.continuous ? Math.exp(d.r! * a.value) : (1 + d.r!) ** a.value, 2)
          break
        }
        case 'solve-exponential':
        case 'solve-with-ln':
        case 'solve-log':
        case 'extraneous-log': {
          if (a.kind !== 'number') throw new Error('expected a number')
          const [lhs, rhs] = sides(p.prompt, a.value)
          close(lhs!, rhs!)
          if (g.id === 'extraneous-log') expect(sides(p.prompt, d.other!)[0]).toBeUndefined()
          break
        }
        default:
          throw new Error(`unverified generator ${g.id}`)
      }
    })
  })
})
