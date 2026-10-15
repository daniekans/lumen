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

/** Smallest "nice" step (1, 2 or 5 times a power of ten) of at least `raw`. */
export const niceStep = (raw: number) => {
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p
}

/** Multiples of `step` inside [from, to]. */
export const ticks = (from: number, to: number, step: number) => {
  const out: number[] = []
  for (let v = Math.ceil(from / step) * step; v <= to + 1e-9; v += step) out.push(+v.toFixed(10))
  return out
}
