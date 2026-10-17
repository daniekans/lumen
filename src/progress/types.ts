export const SKILL_STATUSES = ['new', 'practiced', 'proficient', 'mastered'] as const
export type SkillStatus = (typeof SKILL_STATUSES)[number]

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
  /** The practice session in progress, kept across visits until finished or restarted. */
  session?: PracticeSessionState
  /** The checkpoint sheet in progress, kept across visits until a new set is drawn. */
  sheet?: CheckpointSheetState
}

/** What the learner typed or chose. Plain JSON, so it can be stored and exported. */
export type StoredResponse = { tex: string } | { choice: number } | { self: boolean }

/** One problem of a practice session. The problem is regenerated from `generatorId` and `seed`. */
export interface SessionEntry {
  generatorId: string
  seed: number
  response?: StoredResponse
  /** Whether the current response has been checked (shows its feedback). */
  checked: boolean
  /** Set once, from the first real answer or from giving up. */
  outcome?: { correct: boolean; helped: boolean }
  hints: number
  solution: boolean
}

export interface PracticeSessionState {
  entries: SessionEntry[]
  difficulty: 'auto' | 1 | 2 | 3
  finished: boolean
}

export interface CheckpointSheetState {
  /** Seed the sheet's problems are generated from. */
  seed: number
  responses: Record<string, StoredResponse>
  checked: boolean
  selfGrades: Record<string, boolean>
  /** The score was stored in `checkpoint`; prevents counting the same sheet twice. */
  scored: boolean
}

/** Mixed practice: problems drawn from the practice items of several units. */
export interface MixedPracticeState {
  /** Unit ids the problems come from. */
  units: string[]
  /** Leave out problems whose skills are all mastered. */
  skipMastered: boolean
  session?: PracticeSessionState
}

/** Everything persisted about the learner. Bump `version` and add a migration when it changes. */
export interface ProgressData {
  version: 1
  skills: Record<string, SkillProgress>
  items: Record<string, ItemProgress>
  lastItemId?: string
  lastExportAt?: string
  mixed?: MixedPracticeState
}

export const CURRENT_VERSION = 1 as const
