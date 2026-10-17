import type { Answer, CheckResult, Response } from './answers'
import { createRng } from './rng'
import { evaluate, parseTex, variablesOf, type Node } from './texEval'

const parse = (tex: string): Node | undefined => {
  const trimmed = tex.trim()
  if (!trimmed) return undefined
  try {
    // A decimal comma (as typed in Portuguese, for example) reads as a decimal point.
    return parseTex(trimmed.replace(/(\d),(\d)/g, '$1.$2'))
  } catch {
    return undefined
  }
}

const value = (node: Node, values: Record<string, number> = {}) => {
  try {
    const v = evaluate(node, values)
    return Number.isFinite(v) ? v : undefined
  } catch {
    return undefined
  }
}

const toNumber = (node: Node | undefined) =>
  node && variablesOf(node).size === 0 ? value(node) : undefined

const close = (a: number, b: number, tolerance?: number) =>
  Math.abs(a - b) <= (tolerance ?? Math.max(1e-9, 1e-9 * Math.abs(b)))

/**
 * Two expressions are equivalent when they agree at enough random points of their common domain.
 * Points where either side is undefined (division by zero, log of a negative) are skipped.
 */
export const equivalent = (
  expected: Node,
  given: Node,
  ranges: Readonly<Record<string, readonly [number, number]>> = {},
): boolean | 'unknown-variable' => {
  // Variables of the expected answer, plus any declared in `ranges` (e.g. when the answer is a
  // constant but an equivalent form may still mention x).
  const vars = [...new Set([...variablesOf(expected), ...Object.keys(ranges)])]
  if ([...variablesOf(given)].some((v) => !vars.includes(v))) return 'unknown-variable'
  const rng = createRng(1234)
  let agreed = 0
  for (let i = 0; i < 60 && agreed < 8; i++) {
    const point = Object.fromEntries(
      vars.map((v) => {
        const [lo, hi] = ranges[v] ?? [-3, 3]
        return [v, rng.float(lo, hi)]
      }),
    )
    const a = value(expected, point)
    const b = value(given, point)
    if (a === undefined || b === undefined) continue
    if (Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(a))) return false
    agreed++
  }
  return agreed >= 5
}

/** Evaluates a TeX expression at the given variable values (used by tests and checks). */
export const evaluateTex = (tex: string, values: Record<string, number> = {}) => {
  const node = parse(tex)
  return node ? value(node, values) : undefined
}

/** Answers may start with "y =" (e.g. a tangent line); only the right-hand side is compared. */
const stripLhs = (tex: string) => tex.replace(/^\s*y\s*=/, '')

const unreadable: CheckResult = { verdict: 'invalid', issue: { kind: 'unreadable' } }

export const checkAnswer = (answer: Answer, response: Response): CheckResult => {
  switch (answer.kind) {
    case 'choice':
      return 'choice' in response
        ? { verdict: response.choice === answer.correct ? 'correct' : 'incorrect' }
        : unreadable
    case 'self':
      return 'self' in response ? { verdict: response.self ? 'correct' : 'incorrect' } : unreadable
    case 'number': {
      if (!('tex' in response)) return unreadable
      const node = parse(response.tex)
      if (!node) return unreadable
      const v = toNumber(node)
      if (v === undefined)
        return variablesOf(node).size
          ? { verdict: 'invalid', issue: { kind: 'not-a-number' } }
          : { verdict: 'invalid', issue: { kind: 'undefined-value' } }
      return { verdict: close(v, answer.value, answer.tolerance) ? 'correct' : 'incorrect' }
    }
    case 'list': {
      if (!('tex' in response)) return unreadable
      const items = response.tex
        .split(/,|;|\\,/)
        .filter((s) => s.trim())
        .map((s) => toNumber(parse(s)))
      if (items.length === 0 || items.some((v) => v === undefined))
        return { verdict: 'invalid', issue: { kind: 'list-format' } }
      const remaining = [...answer.values]
      for (const v of items as number[]) {
        const i = remaining.findIndex((r) => close(v, r, answer.tolerance))
        if (i < 0) return { verdict: 'incorrect' }
        remaining.splice(i, 1)
      }
      return remaining.length === 0
        ? { verdict: 'correct' }
        : {
            verdict: 'incorrect',
            issue: { kind: 'more-to-find', remaining: remaining.length },
          }
    }
    case 'expression': {
      if (!('tex' in response)) return unreadable
      const expected = parse(answer.tex)
      if (!expected) throw new Error(`Invalid expected answer: ${answer.tex}`)
      const given = parse(stripLhs(response.tex))
      if (!given) return unreadable
      const result = equivalent(expected, given, answer.ranges)
      if (result === 'unknown-variable') {
        const allowed = [
          ...new Set([...variablesOf(expected), ...Object.keys(answer.ranges ?? {})]),
        ]
        return {
          verdict: 'incorrect',
          issue: { kind: 'unknown-variable', allowed },
        }
      }
      return { verdict: result ? 'correct' : 'incorrect' }
    }
  }
}
