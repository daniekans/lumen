import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useHighlightScope } from './highlight'

/*
 * Code that moves with the visual. An item drives the highlighted line of its step's code from
 * its animation with `useCodeFocus(line)`; the code panel reads it with `useCodeFocusLine()`.
 * The line changes every frame while a tween runs, so it lives in a small store outside React
 * state: only the code view that shows it re-renders, not the page.
 */

type Listener = () => void

interface FocusStore {
  get: () => number | null
  set: (line: number | null) => void
  subscribe: (listener: Listener) => () => void
}

const createFocusStore = (): FocusStore => {
  let line: number | null = null
  const listeners = new Set<Listener>()
  return {
    get: () => line,
    set: (next) => {
      if (next === line) return
      line = next
      listeners.forEach((l) => l())
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

const CodeFocusContext = createContext<FocusStore | null>(null)

/** Holds the driven code line of the item page, between the visualization and the code panel. */
export function CodeFocusScope({ children }: { children: ReactNode }) {
  const [store] = useState(createFocusStore)
  return createElement(CodeFocusContext.Provider, { value: store }, children)
}

const noStore: FocusStore = { get: () => null, set: () => {}, subscribe: () => () => {} }

/**
 * The line an item drives (1-based, fractional while it glides), or null when the step's own
 * highlight applies. For the code panel.
 */
export const useCodeFocusLine = () => {
  const store = useContext(CodeFocusContext) ?? noStore
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

export interface CodeFocusOptions {
  /**
   * A hover key to light while the line is focused: the names linked to it in the code and its
   * shape on the stage glow together, as when the learner hovers them. A hover by the learner
   * wins; the key is cleared when it changes, when the line is null, and on unmount.
   */
  key?: string | null
}

/**
 * Drives the highlight of the active step's code from the visualization: `line` is the line of
 * the step's first block (1-based, as in `code.mdx`), fractional values glide between lines,
 * and null hands the highlight back to the block (`{n}` or `focus=`). Pass a value derived from
 * the animation (a tween's progress), so the code follows the motion frame by frame. Does
 * nothing outside an item page.
 */
export function useCodeFocus(line: number | null, { key = null }: CodeFocusOptions = {}) {
  const store = useContext(CodeFocusContext)
  const highlight = useHighlightScope()
  useEffect(() => {
    store?.set(line)
  }, [store, line])
  useEffect(() => () => store?.set(null), [store])

  // The key is set only over no hover, and cleared only while it is still the one set here.
  const glow = line === null ? null : key
  const set = highlight?.set
  const active = highlight?.active ?? null
  const owned = useRef<string | null>(null)
  useEffect(() => {
    if (!set) return
    if (glow && active === null) {
      owned.current = glow
      set(glow)
    } else if (owned.current && owned.current !== glow) {
      if (active === owned.current) set(null)
      owned.current = null
    }
  }, [set, glow, active])
  useEffect(
    () => () => {
      if (owned.current) set?.(null)
    },
    [set],
  )
}
