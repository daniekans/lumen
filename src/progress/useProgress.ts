import { create } from 'zustand'
import type { Unit } from '@/catalog/types'
import { emptyProgress, migrate } from './schema'
import { createLocalStore, createMemoryStore, type ProgressStore } from './storage'
import type { ItemProgress, ProgressData, SkillStatus } from './types'

interface ProgressState {
  data: ProgressData
  hydrated: boolean
  /** Set when loading or saving failed, so the settings panel can say so. */
  error?: string
  visitStep: (itemId: string, stepId: string | undefined) => void
  recordCheck: (itemId: string, stepId: string, correct: boolean) => void
  /** Forgets a check's answer, so the question can be answered fresh. */
  clearCheck: (itemId: string, stepId: string) => void
  setItemManual: (itemId: string, manual: ItemProgress['manual'] | undefined) => void
  setSkillStatus: (key: string, status: SkillStatus) => void
  /**
   * "I already know this unit": marks every item done and every skill mastered. With `known` false,
   * removes those choices again so progress reflects what was actually done.
   */
  setUnitKnown: (unit: Unit, known: boolean) => void
  /** Removes the learner's override so practice can suggest a status again. */
  clearSkillStatus: (key: string) => void
  exportJson: () => string
  importJson: (json: string) => void
  reset: () => void
}

const now = () => new Date().toISOString()

const touchItem = (data: ProgressData, itemId: string, edit: (p: ItemProgress) => ItemProgress) => {
  const prev = data.items[itemId] ?? { visitedSteps: [], correctChecks: [], lastVisitedAt: now() }
  return { ...data, items: { ...data.items, [itemId]: edit(prev) } }
}

const addUnique = (list: string[], value: string) =>
  list.includes(value) ? list : [...list, value]

export const useProgress = create<ProgressState>()((set, get) => ({
  data: emptyProgress(),
  hydrated: false,

  visitStep: (itemId, stepId) =>
    set(({ data }) => ({
      data: {
        ...touchItem(data, itemId, (p) => ({
          ...p,
          visitedSteps: stepId ? addUnique(p.visitedSteps, stepId) : p.visitedSteps,
          lastVisitedAt: now(),
        })),
        lastItemId: itemId,
      },
    })),

  recordCheck: (itemId, stepId, correct) =>
    correct
      ? set(({ data }) => ({
          data: touchItem(data, itemId, (p) => ({
            ...p,
            correctChecks: addUnique(p.correctChecks, stepId),
          })),
        }))
      : undefined,

  clearCheck: (itemId, stepId) =>
    set(({ data }) => ({
      data: touchItem(data, itemId, (p) => ({
        ...p,
        correctChecks: p.correctChecks.filter((id) => id !== stepId),
      })),
    })),

  setItemManual: (itemId, manual) =>
    set(({ data }) => ({
      data: touchItem(data, itemId, ({ manual: _old, ...p }) => (manual ? { ...p, manual } : p)),
    })),

  setSkillStatus: (key, status) =>
    set(({ data }) => ({
      data: {
        ...data,
        skills: { ...data.skills, [key]: { status, source: 'manual', updatedAt: now() } },
      },
    })),

  setUnitKnown: (unit, known) =>
    set(({ data }) => {
      const skills = { ...data.skills }
      let next = data
      for (const s of unit.skills) {
        if (known) skills[s.key] = { status: 'mastered', source: 'manual', updatedAt: now() }
        else delete skills[s.key]
      }
      for (const i of unit.items)
        next = touchItem(next, i.id, ({ manual: _old, ...p }) =>
          known ? { ...p, manual: 'done' } : p,
        )
      return { data: { ...next, skills } }
    }),

  clearSkillStatus: (key) =>
    set(({ data }) => {
      const { [key]: _removed, ...skills } = data.skills
      return { data: { ...data, skills } }
    }),

  exportJson: () => {
    const data = { ...get().data, lastExportAt: now() }
    set({ data })
    return JSON.stringify(data, null, 2)
  },

  importJson: (json) => set({ data: migrate(JSON.parse(json)) }),

  reset: () => set({ data: emptyProgress() }),
}))

let started = false

/**
 * Loads progress once and saves every change shortly after it happens. Call at app start.
 * Falls back to memory when IndexedDB is unavailable (private windows in some browsers).
 */
export const startProgressPersistence = (store: ProgressStore = safeLocalStore()) => {
  if (started) return
  started = true
  store
    .load()
    .then((raw) => useProgress.setState({ data: migrate(raw), hydrated: true }))
    .catch((e: unknown) =>
      useProgress.setState({ hydrated: true, error: e instanceof Error ? e.message : String(e) }),
    )
    .finally(() => {
      let timer: number | undefined
      useProgress.subscribe((state, prev) => {
        if (state.data === prev.data) return
        window.clearTimeout(timer)
        timer = window.setTimeout(() => {
          store.save(state.data).catch((e: unknown) => {
            useProgress.setState({ error: e instanceof Error ? e.message : String(e) })
          })
        }, 300)
      })
    })
}

const safeLocalStore = (): ProgressStore => {
  try {
    if (typeof indexedDB === 'undefined') return createMemoryStore()
    return createLocalStore()
  } catch {
    return createMemoryStore()
  }
}
