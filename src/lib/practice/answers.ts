/** What a correct answer looks like. Pure data, so problems can be generated and checked anywhere. */
export type Answer =
  | {
      kind: 'number'
      value: number
      /** Absolute tolerance. Defaults to a tiny relative tolerance (exact for practical purposes). */
      tolerance?: number
    }
  | {
      kind: 'expression'
      /** A correct answer in TeX. Any equivalent expression is accepted. */
      tex: string
      /** Sampling range for each variable. Defaults to [-3, 3]. */
      ranges?: Readonly<Record<string, readonly [number, number]>>
    }
  | {
      kind: 'list'
      /** Numbers in any order, e.g. the zeros of a polynomial. */
      values: readonly number[]
      tolerance?: number
    }
  | { kind: 'choice'; options: readonly string[]; correct: number }
  /** For proofs and long work: the learner compares with the solution and grades themselves. */
  | { kind: 'self' }

export type Verdict = 'correct' | 'incorrect' | 'invalid'

export interface CheckResult {
  verdict: Verdict
  /** Explanation for `invalid` (could not read the input) or a hint about the mistake. */
  message?: string
}

/** Answers from the input field are TeX (from the math field) or an option index for choices. */
export type Response = { tex: string } | { choice: number } | { self: boolean }

/** The answer written in TeX, for showing after a problem is solved or given up. */
export const answerTex = (a: Answer): string | undefined => {
  switch (a.kind) {
    case 'number':
      return formatNumber(a.value)
    case 'expression':
      return a.tex
    case 'list':
      return a.values.map(formatNumber).join(',\\ ')
    default:
      return undefined
  }
}

const formatNumber = (v: number) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(6)))
