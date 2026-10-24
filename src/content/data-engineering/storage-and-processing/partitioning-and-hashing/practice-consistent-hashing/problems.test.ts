import { describe, expect, it } from 'vitest'
import type { Problem } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems } from './problems'

type Data = Readonly<Record<string, number>>

const value = (a: Problem['answer']) => (a.kind === 'number' ? a.value : NaN)
const chosen = (a: Problem['answer']) => (a.kind === 'choice' ? a.options[a.correct] : '')

/** The owner by walking up from the position one step at a time, wrapping from 99 to 0. */
const walk = (position: number, nodes: Readonly<Record<string, number>>) => {
  for (let s = 0; s < 100; s++) {
    const p = (position + s) % 100
    const hit = Object.entries(nodes).find(([, at]) => at === p)
    if (hit) return hit[0]
  }
  throw new Error('empty ring')
}

const nodesOf = (d: Data, names: readonly string[]) =>
  Object.fromEntries(names.map((n) => [n, d[n]!]))

describe('Practice: consistent hashing problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d: Data = (p.data ?? {}) as Data
      const a = p.answer
      const four = nodesOf(d, ['A', 'B', 'C', 'D'])
      switch (g.id) {
        case 'ring-owner':
          expect(chosen(a)).toBe(walk(d.key!, four))
          break
        case 'join-moved': {
          const five = { ...four, E: d.e! }
          let moved = 0
          for (let i = 0; i < d.count!; i++) {
            const k = d[`k${i}`]!
            const to = walk(k, five)
            if (walk(k, four) !== to) {
              expect(to).toBe('E')
              moved++
            }
          }
          expect(value(a)).toBe(moved)
          break
        }
        case 'leave-receiver': {
          // Every position the leaving node owned now walks to one node; that node is the answer.
          const name = 'ABCD'[d.leaving!]!
          const rest = Object.fromEntries(Object.entries(four).filter(([n]) => n !== name))
          const receivers = new Set<string>()
          for (let pos = 0; pos < 100; pos++)
            if (walk(pos, four) === name) receivers.add(walk(pos, rest))
          expect([...receivers]).toEqual([chosen(a)])
          break
        }
        case 'arc-share': {
          const name = 'ABCD'[d.node!]!
          let owned = 0
          for (let pos = 0; pos < 100; pos++) if (walk(pos, four) === name) owned++
          expect(value(a)).toBe(owned)
          break
        }
        case 'expected-moved': {
          // Count the hash values of one full period that move, then scale to the keys.
          const n = d.n!
          let moved = 0
          const period = n * (n + 1)
          for (let h = 0; h < period; h++) if (h % n !== h % (n + 1)) moved++
          const share = d.modulo ? moved / period : 1 / (n + 1)
          expect(value(a)).toBeCloseTo(d.keys! * share, 9)
          expect(Number.isInteger(value(a))).toBe(true)
          break
        }
        case 'stays-count': {
          let stays = 0
          for (let h = 0; h < d.total!; h++) if (h % d.n! === h % d.m!) stays++
          expect(value(a)).toBe(stays)
          break
        }
        default:
          throw new Error(`No verification for ${g.id}`)
      }
    })
  })
})
