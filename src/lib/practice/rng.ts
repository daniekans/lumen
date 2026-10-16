import { mulberry32 } from '../math/random'

/** Seeded random source for problem generators. The same seed always yields the same problem. */
export interface Rng {
  /** Integer in [min, max], inclusive. */
  int: (min: number, max: number) => number
  /** Integer in [min, max] other than 0 (and other than the values in `exclude`). */
  nonZeroInt: (min: number, max: number, exclude?: readonly number[]) => number
  pick: <T>(items: readonly T[]) => T
  shuffle: <T>(items: readonly T[]) => T[]
  /** Float in [min, max). */
  float: (min: number, max: number) => number
  bool: () => boolean
}

export const createRng = (seed: number): Rng => {
  const next = mulberry32(seed)
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  return {
    int,
    nonZeroInt: (min, max, exclude = []) => {
      for (let i = 0; i < 1000; i++) {
        const v = int(min, max)
        if (v !== 0 && !exclude.includes(v)) return v
      }
      throw new Error(`No allowed integer in [${min}, ${max}]`)
    },
    pick: (items) => items[Math.floor(next() * items.length)]!,
    shuffle: (items) => {
      const a = [...items]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[a[i], a[j]] = [a[j]!, a[i]!]
      }
      return a
    },
    float: (min, max) => min + next() * (max - min),
    bool: () => next() < 0.5,
  }
}

/** A fresh seed for a new problem instance. */
export const randomSeed = () => Math.floor(Math.random() * 2 ** 31)
