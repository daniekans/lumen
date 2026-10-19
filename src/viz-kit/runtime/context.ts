import { createContext, useContext } from 'react'
import type { VizStep } from '@/catalog/types'

export interface VizRuntimeValue {
  steps: readonly VizStep[]
  stepIndex: number
  goToStep: (index: number) => void
  /** DOM node of the control dock. Visualizations portal their controls into it. */
  dock: HTMLElement | null
  /**
   * Whether a visualization parameter was read from the URL (`useVizParam`). If so, the opening step's
   * `useStepEffect` handler is then skipped, so it does not overwrite the linked view.
   */
  urlParams: UrlParams
  /** Whether a step's animation is playing, and replaying it (see `createActivity`). */
  activity: VizActivity
}

export interface UrlParams {
  /** Records that a parameter was read from the URL. */
  mark: () => void
  found: () => boolean
}

/** A fresh record for one item page. */
export const createUrlParams = (): UrlParams => {
  let found = false
  return { mark: () => void (found = true), found: () => found }
}

/**
 * What the visualization is doing, for the step header: sequences report when they run, so the
 * page can show that an animation is playing and offer to replay the step once it has finished.
 */
export interface VizActivity {
  /** A sequence started during step `stepIndex`. Call the returned function when it ends. */
  start: (stepIndex: number) => () => void
  /** Runs the active step's handler again (`useStepEffect` listens). */
  replay: () => void
  snapshot: () => ActivitySnapshot
  subscribe: (listener: () => void) => () => void
}

export interface ActivitySnapshot {
  /** Number of sequences running now. */
  running: number
  /** The step during which the last sequence started, or -1. */
  playedStep: number
  /** Increases on each replay. */
  replays: number
}

export const createActivity = (): VizActivity => {
  let snap: ActivitySnapshot = { running: 0, playedStep: -1, replays: 0 }
  const listeners = new Set<() => void>()
  const update = (next: Partial<ActivitySnapshot>) => {
    snap = { ...snap, ...next }
    listeners.forEach((l) => l())
  }
  return {
    start: (stepIndex) => {
      update({ running: snap.running + 1, playedStep: stepIndex })
      let ended = false
      return () => {
        if (ended) return
        ended = true
        update({ running: Math.max(0, snap.running - 1) })
      }
    },
    replay: () => update({ replays: snap.replays + 1 }),
    snapshot: () => snap,
    subscribe: (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
  }
}

export const VizRuntimeContext = createContext<VizRuntimeValue | null>(null)

export const useVizRuntime = () => {
  const ctx = useContext(VizRuntimeContext)
  if (!ctx) throw new Error('Visualization hooks must be used inside <VizRuntimeProvider>')
  return ctx
}
