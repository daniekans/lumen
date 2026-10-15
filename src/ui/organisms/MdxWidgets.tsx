import type { ReactNode } from 'react'
import { useVizRuntime } from '@/viz-kit/runtime'

/** Link in an explanation that jumps the visualization to a step: <StepLink step="limit">...</StepLink> */
export function StepLink({ step, children }: { step: string; children: ReactNode }) {
  const { steps, goToStep } = useVizRuntime()
  const index = steps.findIndex((s) => s.id === step)
  return (
    <button
      type="button"
      onClick={() => index >= 0 && goToStep(index)}
      style={{
        padding: 0,
        border: 0,
        background: 'none',
        color: 'var(--fg)',
        textDecoration: 'underline dotted',
        textUnderlineOffset: 3,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

/** Colored inline term that matches a color used in the visualization: <C c="blue">f(x)</C> */
export function C({ c, children }: { c: string; children: ReactNode }) {
  return <span style={{ color: `var(--viz-${c})`, fontWeight: 500 }}>{children}</span>
}
