import type { Item, Unit } from '@/catalog/types'
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

/** Whether an item counts as done, from what the learner did or from their override. */
export const isItemComplete = (item: Item, p: ItemProgress | undefined): boolean => {
  if (!p) return false
  if (p.manual) return p.manual === 'done'
  if (item.kind === 'practice' || item.kind === 'checkpoint') return false // defined in phase 2B
  const c = parts(item, p)
  return c.stepsVisited === c.steps && c.checksCorrect === c.checks
}

export const itemProgress = (item: Item, p: ItemProgress | undefined): ItemProgressInfo => {
  if (isItemComplete(item, p)) return { state: 'done', fraction: 1, detail: 'Done' }
  const c = parts(item, p)
  const total = c.steps + c.checks
  const fraction = total ? (c.stepsVisited + c.checksCorrect) / total : 0
  if (!p || fraction === 0) return { state: 'not-started', fraction: 0, detail: 'Not started' }
  const detail = [
    c.steps ? `${c.stepsVisited} of ${c.steps} steps` : '',
    c.checks ? `${c.checksCorrect} of ${c.checks} questions` : '',
  ]
    .filter(Boolean)
    .join(', ')
  return { state: 'in-progress', fraction, detail: `In progress: ${detail}` }
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
