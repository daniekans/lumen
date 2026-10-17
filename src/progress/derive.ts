import type { Item, Unit } from '@/catalog/types'
import { msg } from '@/i18n'
import type { ItemProgress, ProgressData, SkillStatus } from './types'

/*
 * Two separate ideas, kept separate on purpose:
 * - Progress: how much of the content you have gone through (steps visited, checks answered).
 *   Progress rings show only this.
 * - Skill status: how well you know something (new to mastered). You set it, or practice suggests
 *   it. It never changes the rings.
 */

export type ItemState = 'not-started' | 'in-progress' | 'done'

export interface ItemProgressInfo {
  state: ItemState
  /** 0 to 1: share of steps visited and checks answered. 1 when done. */
  fraction: number
  /** Short description for tooltips, e.g. "2 of 4 steps". */
  detail: string
}

const parts = (item: Item, p: ItemProgress | undefined) => {
  const steps = item.steps ?? []
  const visited = new Set(p?.visitedSteps)
  const correct = new Set(p?.correctChecks)
  const checks = item.kind === 'lesson' ? steps.filter((s) => s.check) : []
  return {
    steps: steps.length,
    stepsVisited: steps.filter((s) => visited.has(s.id)).length,
    checks: checks.length,
    checksCorrect: checks.filter((s) => correct.has(s.id)).length,
  }
}

/** Correct answers needed before a practice item counts as done. */
export const PRACTICE_GOAL = 5
/** Checkpoint score (0 to 1) needed to pass. */
export const CHECKPOINT_PASS = 0.8

/** Whether an item counts as done, from what the learner did or from their override. */
export const isItemComplete = (item: Item, p: ItemProgress | undefined): boolean => {
  if (!p) return false
  if (p.manual) return p.manual === 'done'
  if (item.kind === 'practice') return (p.practice?.correct ?? 0) >= PRACTICE_GOAL
  if (item.kind === 'checkpoint') return (p.checkpoint?.best ?? 0) >= CHECKPOINT_PASS
  const c = parts(item, p)
  return c.stepsVisited === c.steps && c.checksCorrect === c.checks
}

export const itemProgress = (item: Item, p: ItemProgress | undefined): ItemProgressInfo => {
  if (isItemComplete(item, p)) return { state: 'done', fraction: 1, detail: msg.progress.done }
  if (item.kind === 'practice') {
    const correct = p?.practice?.correct ?? 0
    return correct === 0
      ? { state: 'not-started', fraction: 0, detail: msg.progress.notStarted }
      : {
          state: 'in-progress',
          fraction: correct / PRACTICE_GOAL,
          detail: msg.progress.inProgressDetail([
            msg.progress.correctAnswersOf(correct, PRACTICE_GOAL),
          ]),
        }
  }
  if (item.kind === 'checkpoint') {
    const best = p?.checkpoint?.best
    return best === undefined
      ? { state: 'not-started', fraction: 0, detail: msg.progress.notStarted }
      : {
          state: 'in-progress',
          fraction: best / CHECKPOINT_PASS,
          detail: msg.progress.bestScore(best, CHECKPOINT_PASS),
        }
  }
  const c = parts(item, p)
  const total = c.steps + c.checks
  const fraction = total ? (c.stepsVisited + c.checksCorrect) / total : 0
  if (!p || fraction === 0)
    return { state: 'not-started', fraction: 0, detail: msg.progress.notStarted }
  const detail = msg.progress.inProgressDetail([
    ...(c.steps ? [msg.progress.stepsOf(c.stepsVisited, c.steps)] : []),
    ...(c.checks ? [msg.progress.questionsOf(c.checksCorrect, c.checks)] : []),
  ])
  return { state: 'in-progress', fraction, detail }
}

export const skillStatus = (data: ProgressData, key: string): SkillStatus =>
  data.skills[key]?.status ?? 'new'

export interface UnitSummary {
  itemsDone: number
  itemsTotal: number
  /** Share of the unit's items that are done, for progress rings. */
  fraction: number
  /** Number of the unit's skills in each status. */
  skills: Record<SkillStatus, number>
}

export const unitSummary = (unit: Unit, data: ProgressData): UnitSummary => {
  const itemsDone = unit.items.filter((i) => isItemComplete(i, data.items[i.id])).length
  const skills: Record<SkillStatus, number> = { new: 0, practiced: 0, proficient: 0, mastered: 0 }
  for (const s of unit.skills) skills[skillStatus(data, s.key)]++
  return {
    itemsDone,
    itemsTotal: unit.items.length,
    fraction: unit.items.length ? itemsDone / unit.items.length : 0,
    skills,
  }
}

/** True when every item is marked done and every skill is mastered by the learner. */
export const isUnitMarkedKnown = (unit: Unit, data: ProgressData) =>
  unit.items.every((i) => data.items[i.id]?.manual === 'done') &&
  unit.skills.every((s) => data.skills[s.key]?.status === 'mastered')

/** The item to continue a unit with: the first one in order that is not done. */
export const nextItem = (unit: Unit, data: ProgressData): Item | undefined =>
  unit.items.find((i) => !isItemComplete(i, data.items[i.id]))

/** The unit to continue a course with: the first one with content that is not finished. */
export const nextUnit = <U extends Unit>(units: readonly U[], data: ProgressData): U | undefined =>
  units.find((u) => nextItem(u, data) !== undefined)
