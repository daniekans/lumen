/**
 * Visualization palette as CSS variable references, so every visual follows the active theme.
 * Every hue in a visualization should carry a meaning; see docs/DESIGN.md (Palette rules).
 */
export const vc = {
  fg: 'var(--viz-fg)',
  muted: 'var(--fg-muted)',
  subtle: 'var(--fg-subtle)',
  grid: 'var(--viz-grid)',
  gridStrong: 'var(--viz-grid-strong)',
  axis: 'var(--viz-axis)',
  bg: 'var(--bg)',
  blue: 'var(--viz-blue)',
  yellow: 'var(--viz-yellow)',
  teal: 'var(--viz-teal)',
  red: 'var(--viz-red)',
  green: 'var(--viz-green)',
  purple: 'var(--viz-purple)',
  orange: 'var(--viz-orange)',
} as const

export type VizColor = (typeof vc)[keyof typeof vc]

/** Semantic roles. Prefer these over raw hues when the meaning is the point. */
export const role = {
  primary: vc.blue,
  secondary: vc.yellow,
  accent: vc.teal,
  positive: vc.blue,
  negative: vc.red,
  highlight: vc.yellow,
} as const

/** Mixes a palette color with transparency, e.g. `alpha(vc.blue, 0.2)`. */
export const alpha = (color: string, amount: number) =>
  `color-mix(in srgb, ${color} ${Math.round(amount * 100)}%, transparent)`
