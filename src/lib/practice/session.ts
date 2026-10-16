import type { Difficulty, ProblemGenerator } from './problems'
import type { Rng } from './rng'

export type DifficultyChoice = 'auto' | Difficulty

export interface Attempt {
  generatorId: string
  skills: readonly string[]
  difficulty: Difficulty
  correct: boolean
  /** Hints opened or the solution revealed before answering correctly. */
  helped: boolean
}

/**
 * Picks the next problem generator. In auto mode the difficulty follows recent results: start easy,
 * move up after two clean answers in a row, move down after a miss. Avoids repeating the previous
 * generator when another one is available.
 */
export const nextGenerator = (
  generators: readonly ProblemGenerator[],
  history: readonly Attempt[],
  choice: DifficultyChoice,
  rng: Rng,
): ProblemGenerator => {
  if (generators.length === 0) throw new Error('No problems to practice')
  const target = choice === 'auto' ? autoDifficulty(history) : choice
  const levels = [...new Set(generators.map((g) => g.difficulty))].sort()
  const level = levels.reduce(
    (best, d) => (Math.abs(d - target) < Math.abs(best - target) ? d : best),
    levels[0]!,
  )
  const pool = generators.filter((g) => g.difficulty === level)
  const last = history.at(-1)?.generatorId
  const fresh = pool.filter((g) => g.id !== last)
  return rng.pick(fresh.length ? fresh : pool)
}

export const autoDifficulty = (history: readonly Attempt[]): Difficulty => {
  let level: Difficulty = 1
  let streak = 0
  for (const a of history) {
    if (a.correct && !a.helped) {
      streak++
      if (streak >= 2 && level < 3) {
        level = (level + 1) as Difficulty
        streak = 0
      }
    } else {
      streak = 0
      if (!a.correct && level > 1) level = (level - 1) as Difficulty
    }
  }
  return level
}

export type SuggestedStatus = 'practiced' | 'proficient' | 'mastered'

/**
 * What a session's results suggest about a skill. Only a suggestion: the learner decides whether
 * to apply it. Unaided correct answers count; harder problems are needed for higher statuses.
 */
export const suggestStatus = (attempts: readonly Attempt[]): SuggestedStatus | undefined => {
  if (attempts.length === 0) return undefined
  const clean = attempts.filter((a) => a.correct && !a.helped)
  const accuracy = clean.length / attempts.length
  const hard = clean.filter((a) => a.difficulty === 3).length
  const medium = clean.filter((a) => a.difficulty >= 2).length
  if (clean.length >= 5 && accuracy >= 0.85 && hard >= 2) return 'mastered'
  if (clean.length >= 3 && accuracy >= 0.7 && medium >= 1) return 'proficient'
  return 'practiced'
}

/** Groups attempts by skill, for per-skill suggestions at the end of a session. */
export const attemptsBySkill = (attempts: readonly Attempt[]) => {
  const map = new Map<string, Attempt[]>()
  for (const a of attempts) for (const s of a.skills) map.set(s, [...(map.get(s) ?? []), a])
  return map
}
