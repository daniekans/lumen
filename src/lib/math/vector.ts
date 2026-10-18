/** Vectors with any number of components, as plain arrays. `vec2.ts` has the 2D helpers for drawing. */
export type VecN = readonly number[]

const same = (a: VecN, b: VecN) => {
  if (a.length !== b.length) throw new Error(`Vector sizes differ: ${a.length} and ${b.length}`)
}

export const addN = (a: VecN, b: VecN): number[] => {
  same(a, b)
  return a.map((x, i) => x + b[i]!)
}
export const subN = (a: VecN, b: VecN): number[] => {
  same(a, b)
  return a.map((x, i) => x - b[i]!)
}
export const scaleN = (a: VecN, c: number): number[] => a.map((x) => x * c)
export const dotN = (a: VecN, b: VecN) => {
  same(a, b)
  return a.reduce((s, x, i) => s + x * b[i]!, 0)
}
/** Sum of the squared components, the square of the length. */
export const normSquaredN = (a: VecN) => dotN(a, a)
export const normN = (a: VecN) => Math.sqrt(normSquaredN(a))

/**
 * A square root of a whole number in simplest form, as [outside, inside]: 12 -> [2, 3]
 * (2√3), 9 -> [3, 1], 7 -> [1, 7].
 */
export const simplifySqrt = (n: number): [number, number] => {
  if (!Number.isInteger(n) || n < 0) throw new Error(`Not a whole number: ${n}`)
  let outside = 1
  let inside = n
  for (let k = 2; k * k <= inside; k++) {
    while (inside % (k * k) === 0) {
      inside /= k * k
      outside *= k
    }
  }
  return [outside, inside]
}
