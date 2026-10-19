import { useSyncExternalStore } from 'react'

/*
 * The learner's choice of whether 3D stages turn slowly while idle. Kept in localStorage by the
 * kit itself (the kit does not depend on the app's UI store), shared by every 3D stage.
 */
const KEY = 'lumen:sway'
const listeners = new Set<() => void>()

const read = () => {
  try {
    return localStorage.getItem(KEY) !== '0'
  } catch {
    return true
  }
}

let current = read()

export const setSwayPreference = (on: boolean) => {
  current = on
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    /* ignore: the choice then lasts for this page only */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Whether idle sway is on (the default). */
export const useSwayPreference = () => useSyncExternalStore(subscribe, () => current)
