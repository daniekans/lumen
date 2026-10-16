export const SKILL_STATUSES = ['new', 'practiced', 'proficient', 'mastered'] as const
export type SkillStatus = (typeof SKILL_STATUSES)[number]

export const statusLabel: Record<SkillStatus, string> = {
  new: 'New',
  practiced: 'Practiced',
  proficient: 'Proficient',
  mastered: 'Mastered',
}

export interface SkillProgress {
  status: SkillStatus
  /** `manual` when the learner set it; it then wins over anything practice suggests. */
  source: 'suggested' | 'manual'
  updatedAt: string
}

export interface ItemProgress {
  /** Ids of the steps the learner has opened. */
  visitedSteps: string[]
  /** Ids of the steps whose check was answered correctly at least once. */
  correctChecks: string[]
  lastVisitedAt: string
  /** Learner override of the derived completion. */
  manual?: 'done' | 'not-done'
  /** Practice items: answers given across all sessions. */
  practice?: { attempts: number; correct: number }
  /** Checkpoints: scores from 0 to 1. */
  checkpoint?: { last: number; best: number }
}

/** Everything persisted about the learner. Bump `version` and add a migration when it changes. */
export interface ProgressData {
  version: 1
  skills: Record<string, SkillProgress>
  items: Record<string, ItemProgress>
  lastItemId?: string
  lastExportAt?: string
}

export const CURRENT_VERSION = 1 as const
