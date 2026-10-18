/** log_b x, the power b must be raised to in order to give x. */
export const logBase = (b: number, x: number) => Math.log(x) / Math.log(b)

/**
 * Growth factor after time t at a yearly rate r compounded n times a year: (1 + r/n)^(nt).
 * n = Infinity is continuous compounding, e^(rt).
 */
export const compoundFactor = (r: number, n: number, t = 1) =>
  n === Infinity ? Math.exp(r * t) : (1 + r / n) ** (n * t)

/** Time for a b^x process to multiply by `factor` (2 for doubling, 1/2 for a half-life). */
export const timeToMultiply = (b: number, factor: number) => logBase(b, factor)
