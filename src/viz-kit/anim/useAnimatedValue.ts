import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { lerpArray } from '@/lib/math'
import { duration as defaultDuration, ease as easings } from '@/styles/motion'
import { tween } from './tween'

interface Options {
  duration?: number
  ease?: readonly [number, number, number, number]
}

/**
 * Returns a value that eases toward `target` whenever it changes. Works for a number or a fixed
 * length number array (points, matrices, weight lists). Interrupting mid-flight starts from the
 * current value, so rapid changes stay smooth.
 */
export function useAnimatedValue<T extends number | readonly number[]>(
  target: T,
  options: Options = {},
): T {
  const { duration = defaultDuration.viz, ease = easings.inOut } = options
  const reduced = useReducedMotion() ?? false
  const [value, setValue] = useState<T>(target)
  const current = useRef<T>(target)
  const key = typeof target === 'number' ? String(target) : (target as readonly number[]).join(',')

  useEffect(() => {
    const from = current.current
    const to = target
    if (reduced) return
    const handle = tween(0, 1, {
      duration,
      ease,
      onUpdate: (t) => {
        const next = (
          typeof to === 'number'
            ? (from as number) + (to - (from as number)) * t
            : lerpArray(from as readonly number[], to as readonly number[], t)
        ) as T
        current.current = next
        setValue(next)
      },
    })
    return () => handle.stop()
    // `key` captures the content of `target`; the reference itself may change every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, duration, reduced])

  return reduced ? target : value
}
