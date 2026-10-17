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

export const VizRuntimeContext = createContext<VizRuntimeValue | null>(null)

export const useVizRuntime = () => {
  const ctx = useContext(VizRuntimeContext)
  if (!ctx) throw new Error('Visualization hooks must be used inside <VizRuntimeProvider>')
  return ctx
}
