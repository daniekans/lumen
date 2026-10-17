export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const invLerp = (a: number, b: number, v: number) => (b === a ? 0 : (v - a) / (b - a))

export const remap = (v: number, from: [number, number], to: [number, number]) =>
  lerp(to[0], to[1], invLerp(from[0], from[1], v))

export const lerpArray = (a: readonly number[], b: readonly number[], t: number) =>
  a.map((v, i) => lerp(v, b[i] ?? v, t))

/** Evenly spaced samples over [a, b], inclusive. */
export const linspace = (a: number, b: number, n: number): number[] =>
  n <= 1 ? [a] : Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1))

export const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Rounds to a fixed number of decimals and avoids printing "-0". */
export const fmt = (v: number, digits = 2) => {
  const s = v.toFixed(digits)
  return Number(s) === 0 ? (0).toFixed(digits) : s
}

/**
 * Short form for reading a value: at most `digits` decimals, trailing zeros dropped, and a true
 * minus sign. `fmtShort(-0.5)` is "−0.5", `fmtShort(2.004)` is "2".
 */
export const fmtShort = (v: number, digits = 2) => {
  const n = Number(v.toFixed(digits))
  return n === 0 ? '0' : n < 0 ? `\u2212${-n}` : String(n)
}

/** Smallest "nice" step (1, 2 or 5 times a power of ten) of at least `raw`. */
export const niceStep = (raw: number) => {
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p
}

/**
 * A grid step for a zoomed view: `step` times a 1, 2 or 5 factor, so lines stay about as far
 * apart on screen as at zoom 1.
 */
export const zoomedStep = (step: number, zoom: number) =>
  zoom === 1 ? step : +(step * niceStep(1 / zoom)).toPrecision(12)

/** Decimal places that show every multiple of `step` exactly (1 for 0.5, 2 for 0.25). */
export const stepDigits = (step: number) => {
  for (let d = 0; d < 10; d++) if (Math.abs(+step.toFixed(d) - step) < 1e-12) return d
  return 10
}

/** Multiples of `step` inside [from, to]. */
export const ticks = (from: number, to: number, step: number) => {
  const out: number[] = []
  for (let v = Math.ceil(from / step) * step; v <= to + 1e-9; v += step) out.push(+v.toFixed(10))
  return out
}
