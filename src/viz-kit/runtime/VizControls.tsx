import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useVizRuntime } from './context'

/**
 * Renders children inside the shared control dock, so every visualization gets the same
 * placement, styling and animation for its controls. Compose it from ui atoms and molecules.
 */
export function VizControls({ children }: { children: ReactNode }) {
  const { dock } = useVizRuntime()
  return dock ? createPortal(children, dock) : null
}
