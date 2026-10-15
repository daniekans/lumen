import type { Item, Unit } from '@/catalog/types'
import type { ItemProgress, ProgressData, SkillStatus } from './types'

/** Whether an item counts as done, from what the learner did or from their override. */
export const isItemComplete = (item: Item, p: ItemProgress | undefined): boolean => {
  if (!p) return false
  if (p.manual) return p.manual === 'done'
  const steps = item.steps ?? []
  const visited = new Set(p.visitedSteps)
  const allVisited = steps.length === 0 ? true : steps.every((s) => visited.has(s.id))
  if (item.kind === 'lesson') {
    const correct = new Set(p.correctChecks)
    return allVisited && steps.every((s) => !s.check || correct.has(s.id))
  }
  // Practice and checkpoint completion is defined with the practice engine (phase 2B).
  return item.kind === 'explore' ? allVisited : false
}

export const skillStatus = (data: ProgressData, key: string): SkillStatus =>
  data.skills[key]?.status ?? 'new'

export interface UnitSummary {
  itemsDone: number
  itemsTotal: number
  /** Number of the unit's skills in each status. */
  skills: Record<SkillStatus, number>
  /** 0 to 1, for progress indicators. Skills count when there are any, otherwise items. */
  fraction: number
}

const statusWeight: Record<SkillStatus, number> = {
  new: 0,
  practiced: 1 / 3,
  proficient: 2 / 3,
  mastered: 1,
}

export const unitSummary = (unit: Unit, data: ProgressData): UnitSummary => {
  const itemsDone = unit.items.filter((i) => isItemComplete(i, data.items[i.id])).length
  const skills: Record<SkillStatus, number> = { new: 0, practiced: 0, proficient: 0, mastered: 0 }
  let weight = 0
  for (const s of unit.skills) {
    const status = skillStatus(data, s.key)
    skills[status]++
    weight += statusWeight[status]
  }
  const itemsFraction = unit.items.length ? itemsDone / unit.items.length : 0
  const skillsFraction = unit.skills.length ? weight / unit.skills.length : 0
  // Both count: finishing the items and raising the skills each move the indicator.
  const fraction = unit.skills.length ? (itemsFraction + skillsFraction) / 2 : itemsFraction
  return { itemsDone, itemsTotal: unit.items.length, skills, fraction }
}
