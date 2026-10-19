import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ease } from '@/styles/motion'
import { tween } from './tween'

/** Seconds a new arrow takes to grow from its tail. */
const GROW_DURATION = 0.5

/** 0 to 1 over the first moments after mounting, or 1 at once when `enabled` is false. */
export const useGrowIn = (enabled = true) => {
  const reduced = useReducedMotion() ?? false
  const animate = enabled && !reduced
  const [t, setT] = useState(animate ? 0 : 1)
  useEffect(() => {
    if (!animate) return
    const handle = tween(0, 1, { duration: GROW_DURATION, ease: ease.out, onUpdate: setT })
    return () => handle.stop()
  }, [animate])
  return t
}
