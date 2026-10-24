import { useSyncExternalStore } from 'react'

/*
 * The learner's choice of readout size: large readouts set their labels in a bigger font and
 * their math in display style, so long expressions and fractions are readable. Kept in
 * localStorage here (molecules do not depend on the app's UI store) and shared by every panel.
 */
const KEY = 'lumen:readouts-large'
const listeners = new Set<() => void>()

const read = () => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

let current = read()

export const setLargeReadouts = (on: boolean) => {
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

/** Whether readouts are shown large (off by default). */
export const useLargeReadouts = () => useSyncExternalStore(subscribe, () => current)

/** Sets every `$...$` in a label in display style, so fractions are full size. */
export const displayStyle = (text: string) =>
  text.replace(/\$([^$]+)\$/g, (_, tex: string) => `$\\displaystyle ${tex}$`)
