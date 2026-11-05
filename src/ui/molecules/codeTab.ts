import { useSyncExternalStore } from 'react'

/*
 * The learner's last chosen tab in `CodeTabs` (such as "PyTorch"), remembered per browser and
 * shared by every item: a block whose tabs include it opens on it. Kept in localStorage, like
 * the readout size.
 */
const KEY = 'lumen:code-tab'
const listeners = new Set<() => void>()

const read = () => {
  try {
    return localStorage.getItem(KEY) ?? undefined
  } catch {
    return undefined
  }
}

let current = read()

export const setCodeTab = (label: string) => {
  current = label
  try {
    localStorage.setItem(KEY, label)
  } catch {
    /* ignore: the choice then lasts for this page only */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** The last chosen code tab, if any. */
export const useCodeTab = () => useSyncExternalStore(subscribe, () => current)
