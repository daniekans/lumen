import type { Answer } from './answers'
import type { Rng } from './rng'

export type Difficulty = 1 | 2 | 3

/** One generated problem. Text fields accept inline $...$ and display $$...$$ TeX. */
export interface Problem {
  prompt: string
  answer: Answer
  /** Revealed one at a time, from a gentle nudge to nearly the method. */
  hints?: readonly string[]
  /** Worked solution, one line per step, shown after answering or giving up. */
  solution: readonly string[]
  /** The generated parameters. Not shown; used by tests to verify answers independently. */
  data?: Readonly<Record<string, number>>
}

export interface ProblemGenerator {
  /** Unique inside its problem set. */
  id: string
  /** Local skill ids of the unit this problem exercises. */
  skills: readonly string[]
  difficulty: Difficulty
  /** Short label shown while practicing, e.g. "Secant slope". */
  title: string
  generate: (rng: Rng) => Problem
}

export const defineProblems = <const T extends readonly ProblemGenerator[]>(problems: T): T =>
  problems
