/** An interval of real numbers. Use -Infinity and Infinity for unbounded ends. */
export interface Interval {
  from: number
  to: number
  /** Whether `from` belongs to the interval. Ignored for infinite ends. */
  closedFrom?: boolean
  closedTo?: boolean
  /** TeX for the endpoints, when the plain number does not read well (fractions, roots). */
  fromTex?: string
  toTex?: string
}

const endTex = (v: number, tex: string | undefined) =>
  tex ?? (v === Infinity ? '\\infty' : v === -Infinity ? '-\\infty' : String(+v.toFixed(4)))

/** Interval notation: [-2, \infty), (-\infty, 1) \cup (1, \infty). A single point prints as {a}. */
export const intervalTex = (set: readonly Interval[]) => {
  if (set.length === 0) return '\\varnothing'
  return set
    .map((i) => {
      if (i.from === i.to) return `\\{${endTex(i.from, i.fromTex)}\\}`
      const open = i.closedFrom && Number.isFinite(i.from) ? '[' : '('
      const close = i.closedTo && Number.isFinite(i.to) ? ']' : ')'
      return `${open}${endTex(i.from, i.fromTex)}, ${endTex(i.to, i.toTex)}${close}`
    })
    .join(' \\cup ')
}

/** Whether `v` lies in any interval of the set. */
export const inIntervals = (set: readonly Interval[], v: number) =>
  set.some(
    (i) =>
      (v > i.from || (v === i.from && !!i.closedFrom)) &&
      (v < i.to || (v === i.to && !!i.closedTo)),
  )
