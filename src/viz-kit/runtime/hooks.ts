import {
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { useVizRuntime, VizRuntimeContext, type VizActivity } from './context'
import { readQuery, writeQuery } from './query'

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
 * When the page opened with parameters from the URL, the opening step's handler is skipped.
 */
export const useStepEffect = (handlers: Partial<Record<string, () => void>>) => {
  const { id } = useVizStep()
  const { urlParams, activity } = useVizRuntime()
  const { replays } = useActivity(activity)
  const ref = useRef(handlers)
  const opening = useRef(id)
  const left = useRef(false)
  const lastReplays = useRef(replays)
  useEffect(() => {
    ref.current = handlers
  })
  useEffect(() => {
    if (!id) return
    const replay = replays !== lastReplays.current
    lastReplays.current = replays
    if (id !== opening.current) left.current = true
    if (!replay && !left.current && urlParams.found()) return
    ref.current[id]?.()
  }, [id, urlParams, replays])
}

/** The activity snapshot, re-rendering when it changes. */
export const useActivity = (activity: VizActivity) =>
  useSyncExternalStore(activity.subscribe, activity.snapshot)

/** How a parameter is written in the query string. `decode` returns undefined for bad input. */
export interface ParamCodec<T> {
  encode: (value: T) => string
  decode: (text: string) => T | undefined
}

const numberCodec: ParamCodec<number> = {
  encode: (v) => String(+v.toFixed(4)),
  decode: (t) => (t.trim() !== '' && Number.isFinite(+t) ? +t : undefined),
}
const booleanCodec: ParamCodec<boolean> = {
  encode: (v) => (v ? '1' : '0'),
  decode: (t) => (t === '1' ? true : t === '0' ? false : undefined),
}
const stringCodec: ParamCodec<string> = { encode: (v) => v, decode: (t) => t }

const defaultCodec = (initial: unknown) =>
  typeof initial === 'number'
    ? numberCodec
    : typeof initial === 'boolean'
      ? booleanCodec
      : stringCodec

/**
 * Numbers joined by underscores, for a group of values kept in one parameter (commas would be
 * escaped in the URL): `p=0.5_-2_1_0`.
 */
export const numbersCodec = <K extends string>(
  keys: readonly K[],
): ParamCodec<Record<K, number>> => ({
  encode: (v) => keys.map((k) => numberCodec.encode(v[k])).join('_'),
  decode: (t) => {
    const parts = t.split('_').map(numberCodec.decode)
    if (parts.length !== keys.length || parts.some((v) => v === undefined)) return undefined
    return Object.fromEntries(keys.map((k, i) => [k, parts[i]])) as Record<K, number>
  },
})

/**
 * State that is also kept in the query string (`?name=value`), so a link opens the same view.
 * Use it for the values a learner sets (sliders, toggles); the default value is left out of the
 * URL. Numbers, booleans and strings work as they are; other types pass a `codec`. Values that
 * only make sense together (a choice that changes what a slider means) belong in one parameter.
 */
export function useVizParam<T extends number | boolean | string>(
  name: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>]
export function useVizParam<T>(
  name: string,
  initial: T,
  codec: ParamCodec<T>,
): [T, Dispatch<SetStateAction<T>>]
export function useVizParam<T>(name: string, initial: T, codec?: ParamCodec<T>) {
  if (import.meta.env.DEV && name === 'step') throw new Error('"step" is reserved for the step')
  const runtime = useContext(VizRuntimeContext)
  const c = codec ?? (defaultCodec(initial) as unknown as ParamCodec<T>)
  const [value, setValue] = useState<T>(() => {
    const text = runtime && readQuery(name)
    const v = text == null ? undefined : c.decode(text)
    if (v === undefined) return initial
    runtime?.urlParams.mark()
    return v
  })
  const encoded = c.encode(value)
  const fallback = c.encode(initial)
  useEffect(() => {
    if (runtime) writeQuery(name, encoded === fallback ? null : encoded)
  }, [runtime, name, encoded, fallback])
  return [value, setValue] as const
}
