import { useEffect, useRef } from 'react'
import { useVizRuntime } from './context'

/** The active narrative step, plus navigation helpers. */
export const useVizStep = () => {
  const { steps, stepIndex, goToStep } = useVizRuntime()
  return {
    index: stepIndex,
    count: steps.length,
    step: steps[stepIndex],
    id: steps[stepIndex]?.id,
    goTo: goToStep,
    next: () => goToStep(stepIndex + 1),
    prev: () => goToStep(stepIndex - 1),
  }
}

/**
 * Runs the handler registered for a step whenever that step becomes active, including on mount.
 * Handlers usually set state or start an animation sequence that brings the visual to that beat.
 */
export const useStepEffect = (handlers: Partial<Record<string, () => void>>) => {
  const { id } = useVizStep()
  const ref = useRef(handlers)
  useEffect(() => {
    ref.current = handlers
  })
  useEffect(() => {
    if (id) ref.current[id]?.()
  }, [id])
}
