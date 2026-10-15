import { createContext, useContext } from 'react'
import type { VizStep } from '@/catalog/types'

export interface VizRuntimeValue {
  steps: readonly VizStep[]
  stepIndex: number
  goToStep: (index: number) => void
  /** DOM node of the control dock. Visualizations portal their controls into it. */
  dock: HTMLElement | null
}

export const VizRuntimeContext = createContext<VizRuntimeValue | null>(null)

export const useVizRuntime = () => {
  const ctx = useContext(VizRuntimeContext)
  if (!ctx) throw new Error('Visualization hooks must be used inside <VizRuntimeProvider>')
  return ctx
}
