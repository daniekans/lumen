import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * Linked hover between the drawing and the readouts. A visualization creates one with
 * `useHighlight()` and passes it to its stage; primitives with a `hoverKey` light up when that key
 * is active and dim when another one is, and readouts bound to the same key light up with them.
 *
 * Large shapes (planes) are passed over all the time while orbiting, so hovering them only
 * `hint`s: their readout row lights up and the drawing stays as it is. Hovering that row
 * highlights the shape fully.
 */
export interface Highlight {
  active: string | null
  /** A key whose readout row is lit without changing the drawing. */
  hint: string | null
  set: (key: string | null) => void
  setHint: (key: string | null) => void
  /** Props for a `Readout` that belongs to `key`. */
  bind: (key: string) => { highlighted: boolean; onHoverChange: (on: boolean) => void }
}

export const useHighlight = (): Highlight => {
  const [active, setActive] = useState<string | null>(null)
  const [hint, setHintState] = useState<string | null>(null)
  const set = useCallback((key: string | null) => setActive(key), [])
  const setHint = useCallback((key: string | null) => setHintState(key), [])
  return useMemo(
    () => ({
      active,
      hint,
      set,
      setHint,
      bind: (key: string) => ({
        highlighted: active === key || hint === key,
        onHoverChange: (on: boolean) => setActive((k) => (on ? key : k === key ? null : k)),
      }),
    }),
    [active, hint, set, setHint],
  )
}

export const HighlightContext = createContext<Highlight | null>(null)

/** How strongly to draw a shape: emphasized when its key is active, faded when another is. */
export type Emphasis = 'normal' | 'on' | 'dim'

/** Opacity factor of shapes while another one is highlighted. */
export const DIM_OPACITY = 0.3

/**
 * The emphasis of a shape with `key`, and pointer handlers that make hovering it highlight it
 * (or, with `quiet`, only light its readout row). Shapes without a key keep their normal look and
 * do not react.
 */
export const useEmphasis = (key?: string, { quiet = false }: { quiet?: boolean } = {}) => {
  const h = useContext(HighlightContext)
  const emphasis: Emphasis = !key || !h?.active ? 'normal' : h.active === key ? 'on' : 'dim'
  const hover =
    key && h
      ? quiet
        ? {
            onPointerEnter: () => h.setHint(key),
            onPointerLeave: () => h.hint === key && h.setHint(null),
          }
        : {
            onPointerEnter: () => h.set(key),
            onPointerLeave: () => h.active === key && h.set(null),
          }
      : undefined
  return { emphasis, hover, opacity: emphasis === 'dim' ? DIM_OPACITY : 1 }
}
