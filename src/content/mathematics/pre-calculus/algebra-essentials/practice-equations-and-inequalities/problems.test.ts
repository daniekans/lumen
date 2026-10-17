import { describe, expect, it } from 'vitest'
import { evaluateTex, type Answer } from '@/lib/practice'
import { testProblemSet } from '@/lib/practice/testing'
import { problems, type Op } from './problems'

const EPS = 1e-9

/** A relation between two numbers, with equality up to rounding. */
const holds = (lhs: number, op: Op, rhs: number) => {
  const equal = Math.abs(lhs - rhs) < EPS * Math.max(1, Math.abs(rhs))
  if (op === '<') return lhs < rhs && !equal
  if (op === '>') return lhs > rhs && !equal
  if (op === '\\leq') return lhs < rhs || equal
  return lhs > rhs || equal
}

interface Piece {
  from: number
  to: number
  closedFrom: boolean
  closedTo: boolean
}

const endValue = (s: string) =>
  s === '\\infty' ? Infinity : s === '-\\infty' ? -Infinity : evaluateTex(s, {})!

/** Parses interval notation such as (-\infty, 2] \cup (\frac{7}{3}, \infty) or \varnothing. */
const parseSet = (option: string): Piece[] => {
  const body = option.slice(1, -1).trim()
  if (body === '\\varnothing') return []
  return body.split('\\cup').map((part) => {
    const p = part.trim()
    const [a, b] = p.slice(1, -1).split(', ')
    return {
      from: endValue(a!.trim()),
      to: endValue(b!.trim()),
      closedFrom: p.startsWith('['),
      closedTo: p.endsWith(']'),
    }
  })
}

const member = (set: Piece[], x: number) =>
  set.some(
    (i) =>
      (x > i.from + EPS || (Math.abs(x - i.from) < EPS && i.closedFrom)) &&
      (x < i.to - EPS || (Math.abs(x - i.to) < EPS && i.closedTo)),
  )

/** Every endpoint of every option, the midpoints between them and far points on both sides. */
const samples = (sets: Piece[][]) => {
  const ends = [
    ...new Set(
      sets
        .flat()
        .flatMap((i) => [i.from, i.to])
        .filter(Number.isFinite),
    ),
  ].sort((u, v) => u - v)
  const mids = ends.slice(1).map((e, i) => (e + ends[i]!) / 2)
  return [-1000, ...ends, ...mids, 1000, ...ends.map((e) => e - 0.25), ...ends.map((e) => e + 0.25)]
}

/** The correct option agrees with the inequality everywhere; every other option disagrees somewhere. */
const checkSets = (answer: Answer, solves: (x: number) => boolean) => {
  if (answer.kind !== 'choice') throw new Error('expected a choice')
  const sets = answer.options.map(parseSet)
  const xs = samples(sets)
  sets.forEach((set, i) => {
    const agrees = xs.every((x) => member(set, x) === solves(x))
    expect(agrees, answer.options[i]).toBe(i === answer.correct)
  })
}

const opOf = (prompt: string) =>
  (['\\leq', '\\geq', '<', '>'] as const).find((o) => prompt.includes(` ${o} `))!

const listValues = (a: Answer) => {
  if (a.kind !== 'list') throw new Error('expected a list')
  return a.values
}

describe('equation and inequality problems', () => {
  it('generate valid problems with independently verified answers', () => {
    testProblemSet(problems, (g, p) => {
      const d = p.data ?? {}
      const a = p.answer
      const value = a.kind === 'number' ? a.value : NaN
      switch (g.id) {
        case 'linear-equation':
          expect(d.a! * value + d.b!).toBeCloseTo(d.c! * value + d.d!, 9)
          break
        case 'quadratic-equation':
        case 'quadratic-formula': {
          const xs = listValues(a)
          expect(xs).toHaveLength(2)
          expect(Math.abs(xs[0]! - xs[1]!)).toBeGreaterThan(EPS)
          for (const x of xs) expect(x * x + d.b! * x + d.c!).toBeCloseTo(0, 9)
          break
        }
        case 'rational-equation': {
          // The answer satisfies the equation, and the other root of the quadratic is excluded.
          const [r, A, c] = [d.r!, d.a!, d.c!]
          const lhs = (x: number) => (x * x + c) / (x - A)
          const rhs = (x: number) => ((r + A) * x + c - r * A) / (x - A)
          expect(value).toBe(r)
          expect(lhs(r)).toBeCloseTo(rhs(r), 9)
          expect(Number.isFinite(lhs(A))).toBe(false)
          break
        }
        case 'radical-equation': {
          const [m, k] = [d.m!, d.k!]
          expect(Math.sqrt(value + k)).toBeCloseTo(value + m, 9)
          // The squared equation's other root fails the original.
          const B = 2 * m - 1
          const C = m * m - k
          const roots = [-1, 1].map((s) => (-B + s * Math.sqrt(B * B - 4 * C)) / 2)
          const others = roots.filter((x) => Math.abs(x - value) > EPS)
          expect(others).toHaveLength(1)
          expect(Math.abs(Math.sqrt(others[0]! + k) - (others[0]! + m))).toBeGreaterThan(1e-6)
          break
        }
        case 'linear-inequality': {
          const op = opOf(p.prompt)
          checkSets(a, (x) => holds(d.a! * x + d.b!, op, d.c!))
          break
        }
        case 'quadratic-inequality': {
          const op = opOf(p.prompt)
          checkSets(a, (x) => holds((x - d.p!) * (x - d.q!), op, 0))
          break
        }
        case 'rational-inequality': {
          const op = opOf(p.prompt)
          checkSets(a, (x) => Math.abs(x - d.q!) > EPS && holds((x - d.p!) / (x - d.q!), op, 0))
          break
        }
        case 'abs-equation': {
          const xs = listValues(a)
          expect(xs).toHaveLength(2)
          for (const x of xs) expect(Math.abs(d.a! * x + d.b!)).toBeCloseTo(d.c!, 9)
          break
        }
        case 'abs-inequality': {
          const op = opOf(p.prompt)
          checkSets(a, (x) => holds(Math.abs(d.k! * x - d.k! * d.a!), op, d.k! * d.r!))
          break
        }
        default:
          throw new Error(`no check for ${g.id}`)
      }
    })
  })
})
