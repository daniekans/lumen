import { useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { duration as defaultDuration, ease as easings } from '@/styles/motion'
import { tween as rafTween, type EaseSpec } from './tween'

class Cancelled extends Error {}

export interface TweenOptions {
  duration?: number
  ease?: EaseSpec
  onUpdate: (value: number) => void
}

export interface SequenceContext {
  /** Animates a number from `from` to `to`. Resolves when done, throws internally if cancelled. */
  tween: (from: number, to: number, options: TweenOptions) => Promise<void>
  /** Pauses the sequence for `seconds`. */
  wait: (seconds: number) => Promise<void>
  /** True once the sequence has been superseded or the component unmounted. */
  isCancelled: () => boolean
}

/**
 * Runs async animation scripts with cancellation. Starting a new run cancels the previous one,
 * and unmounting cancels everything, so scripts can be written as plain sequential code:
 *
 *   seq.run(async ({ tween, wait }) => {
 *     await tween(0, 1, { onUpdate: setT })
 *     await wait(0.2)
 *   })
 */
export const useSequence = () => {
  const reduced = useReducedMotion() ?? false
  const token = useRef(0)
  const stops = useRef(new Set<() => void>())
  const [running, setRunning] = useState(false)

  const cancel = useCallback(() => {
    token.current++
    stops.current.forEach((stop) => stop())
    stops.current.clear()
    setRunning(false)
  }, [])

  useEffect(() => cancel, [cancel])

  const run = useCallback(
    async (script: (ctx: SequenceContext) => Promise<void>) => {
      cancel()
      const mine = token.current
      const isCancelled = () => token.current !== mine
      const guard = () => {
        if (isCancelled()) throw new Cancelled()
      }
      const ctx: SequenceContext = {
        isCancelled,
        tween: (from, to, { duration = defaultDuration.viz, ease = easings.inOut, onUpdate }) =>
          new Promise<void>((resolve, reject) => {
            guard()
            if (reduced || duration === 0) {
              onUpdate(to)
              resolve()
              return
            }
            const handle = rafTween(from, to, { duration, ease, onUpdate })
            const stop = () => handle.stop()
            stops.current.add(stop)
            void handle.finished.then((done) => {
              stops.current.delete(stop)
              if (done && !isCancelled()) resolve()
              else reject(new Cancelled())
            })
          }),
        wait: (seconds) =>
          new Promise<void>((resolve, reject) => {
            guard()
            const id = window.setTimeout(
              () => {
                stops.current.delete(stop)
                resolve()
              },
              reduced ? 0 : seconds * 1000,
            )
            const stop = () => {
              window.clearTimeout(id)
              reject(new Cancelled())
            }
            stops.current.add(stop)
          }),
      }
      setRunning(true)
      try {
        await script(ctx)
      } catch (e) {
        if (!(e instanceof Cancelled)) throw e
      } finally {
        if (!isCancelled()) setRunning(false)
      }
    },
    [cancel, reduced],
  )

  return { run, cancel, running }
}
