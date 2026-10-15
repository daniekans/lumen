/** JS mirror of the motion tokens in tokens.css, for `motion` and the viz-kit animators. */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const

export const duration = {
  fast: 0.14,
  base: 0.24,
  slow: 0.48,
  /** Default length of a visualization transition, in seconds. */
  viz: 0.9,
} as const

export const spring = {
  /** Panels and layout changes. */
  pane: { type: 'spring', stiffness: 380, damping: 38, mass: 0.9 },
  /** Small UI elements such as indicators. */
  snappy: { type: 'spring', stiffness: 520, damping: 40 },
  /** Visual elements that should settle softly. */
  soft: { type: 'spring', stiffness: 140, damping: 22 },
} as const
