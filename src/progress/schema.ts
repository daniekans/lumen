import { msg } from '@/i18n'
import {
  CURRENT_VERSION,
  SKILL_STATUSES,
  type CheckpointSheetState,
  type MixedPracticeState,
  type PracticeSessionState,
  type ProgressData,
} from './types'

export const emptyProgress = (): ProgressData => ({
  version: CURRENT_VERSION,
  skills: {},
  items: {},
})

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

const validResponse = (v: unknown) =>
  isRecord(v) && (typeof v.tex === 'string' || num(v.choice) || typeof v.self === 'boolean')

/** Sessions and sheets are rebuilt from seeds; anything malformed is dropped, not repaired. */
const validSession = (v: unknown): v is PracticeSessionState =>
  isRecord(v) &&
  Array.isArray(v.entries) &&
  typeof v.finished === 'boolean' &&
  (v.difficulty === 'auto' || [1, 2, 3].includes(v.difficulty as number)) &&
  v.entries.every(
    (e) =>
      isRecord(e) &&
      typeof e.generatorId === 'string' &&
      num(e.seed) &&
      typeof e.checked === 'boolean' &&
      num(e.hints) &&
      typeof e.solution === 'boolean' &&
      (e.response === undefined || validResponse(e.response)),
  )

const validSheet = (v: unknown): v is CheckpointSheetState =>
  isRecord(v) &&
  num(v.seed) &&
  typeof v.checked === 'boolean' &&
  typeof v.scored === 'boolean' &&
  isRecord(v.responses) &&
  Object.values(v.responses).every(validResponse) &&
  isRecord(v.selfGrades)

const validMixed = (v: unknown): v is MixedPracticeState =>
  isRecord(v) &&
  Array.isArray(v.units) &&
  v.units.every((u) => typeof u === 'string') &&
  typeof v.skipMastered === 'boolean' &&
  (v.session === undefined || validSession(v.session))

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [])

/**
 * Turns stored or imported JSON into valid current data. Unknown or malformed entries are dropped
 * instead of failing the whole load. Throws only when the input is not progress data at all.
 *
 * `rename` maps an item or unit id to where it lives now, so progress follows content that moved
 * (see `currentId` in the catalog). When an old and a new id both have an entry, the newer wins.
 */
export const migrate = (
  raw: unknown,
  rename: (id: string) => string = (id) => id,
): ProgressData => {
  if (raw === undefined || raw === null) return emptyProgress()
  if (!isRecord(raw) || typeof raw.version !== 'number') {
    throw new Error(msg.progress.importError.notProgress)
  }
  if (raw.version > CURRENT_VERSION) {
    throw new Error(msg.progress.importError.newerVersion)
  }
  // Version 1 is the first format. Future migrations go here, oldest first.
  const data = emptyProgress()
  if (isRecord(raw.skills))
    for (const [key, s] of Object.entries(raw.skills)) {
      if (!isRecord(s) || !SKILL_STATUSES.includes(s.status as never)) continue
      const hash = key.lastIndexOf('#')
      const target = hash < 0 ? key : `${rename(key.slice(0, hash))}${key.slice(hash)}`
      const updatedAt = typeof s.updatedAt === 'string' ? s.updatedAt : new Date(0).toISOString()
      if ((data.skills[target]?.updatedAt ?? '') > updatedAt) continue
      data.skills[target] = {
        status: s.status as ProgressData['skills'][string]['status'],
        source: s.source === 'suggested' ? 'suggested' : 'manual',
        updatedAt,
      }
    }
  if (isRecord(raw.items))
    for (const [id, it] of Object.entries(raw.items)) {
      if (!isRecord(it)) continue
      const target = rename(id)
      const lastVisitedAt =
        typeof it.lastVisitedAt === 'string' ? it.lastVisitedAt : new Date(0).toISOString()
      if ((data.items[target]?.lastVisitedAt ?? '') > lastVisitedAt) continue
      data.items[target] = {
        visitedSteps: strings(it.visitedSteps),
        correctChecks: strings(it.correctChecks),
        lastVisitedAt,
        ...(it.manual === 'done' || it.manual === 'not-done' ? { manual: it.manual } : {}),
        ...(isRecord(it.practice) && num(it.practice.attempts) && num(it.practice.correct)
          ? { practice: { attempts: it.practice.attempts, correct: it.practice.correct } }
          : {}),
        ...(isRecord(it.checkpoint) && num(it.checkpoint.last) && num(it.checkpoint.best)
          ? { checkpoint: { last: it.checkpoint.last, best: it.checkpoint.best } }
          : {}),
        ...(validSession(it.session) ? { session: it.session } : {}),
        ...(validSheet(it.sheet) ? { sheet: it.sheet } : {}),
      }
    }
  if (typeof raw.lastItemId === 'string') data.lastItemId = raw.lastItemId
  if (typeof raw.lastExportAt === 'string') data.lastExportAt = raw.lastExportAt
  if (validMixed(raw.mixed)) data.mixed = raw.mixed
  return data
}
