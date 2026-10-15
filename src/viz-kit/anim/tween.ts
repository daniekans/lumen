import { cubicBezier, linear, type Easing } from '@/lib/math'

export type EaseSpec = readonly [number, number, number, number] | 'linear'

export interface TweenHandle {
  stop: () => void
  /** Resolves with true when the tween completes and false when it is stopped. */
  finished: Promise<boolean>
}

const easings = new Map<string, Easing>()
const toEasing = (spec: EaseSpec): Easing => {
  if (spec === 'linear') return linear
  const key = spec.join(',')
  let e = easings.get(key)
  if (!e) easings.set(key, (e = cubicBezier(...spec)))
  return e
}

/**
 * Animates a number on requestAnimationFrame. The clock starts at the first frame rather than at
 * the call, so a busy frame (layout work, a route change) cannot make the tween skip ahead.
 * Kept independent from UI animation libraries on purpose: visualization timing must not depend on
 * their frame loop.
 */
export const tween = (
  from: number,
  to: number,
  { duration, ease, onUpdate }: { duration: number; ease: EaseSpec; onUpdate: (v: number) => void },
): TweenHandle => {
  const easing = toEasing(ease)
  let raf = 0
  let start: number | null = null
  let resolve!: (done: boolean) => void
  const finished = new Promise<boolean>((r) => (resolve = r))
  const frame = (now: number) => {
    start ??= now
    const p = duration <= 0 ? 1 : Math.min(1, (now - start) / (duration * 1000))
    onUpdate(from + (to - from) * easing(p))
    if (p < 1) raf = requestAnimationFrame(frame)
    else resolve(true)
  }
  raf = requestAnimationFrame(frame)
  return {
    stop: () => {
      cancelAnimationFrame(raf)
      resolve(false)
    },
    finished,
  }
}
