import { clear, createStore, get, set } from 'idb-keyval'
import type { ProgressData } from './types'

/**
 * Where progress is persisted. The app only talks to this interface, so a server-backed
 * implementation can replace the local one later without touching components.
 */
export interface ProgressStore {
  load: () => Promise<unknown>
  save: (data: ProgressData) => Promise<void>
  clear: () => Promise<void>
}

const KEY = 'progress'

export const createLocalStore = (): ProgressStore => {
  const db = createStore('lumen', 'learner')
  return {
    load: () => get(KEY, db),
    save: (data) => set(KEY, data, db),
    clear: () => clear(db),
  }
}

/** In-memory store for tests and for browsers where IndexedDB is unavailable. */
export const createMemoryStore = (): ProgressStore => {
  let value: unknown
  return {
    load: async () => value,
    save: async (data) => {
      value = structuredClone(data)
    },
    clear: async () => {
      value = undefined
    },
  }
}
