export interface Complex {
  readonly re: number
  readonly im: number
}

export const complex = (re: number, im: number): Complex => ({ re, im })
export const cAdd = (a: Complex, b: Complex): Complex => complex(a.re + b.re, a.im + b.im)
export const cMul = (a: Complex, b: Complex): Complex =>
  complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
export const cAbs = (a: Complex) => Math.hypot(a.re, a.im)
export const cArg = (a: Complex) => Math.atan2(a.im, a.re)
export const cPolar = (r: number, theta: number): Complex =>
  complex(r * Math.cos(theta), r * Math.sin(theta))
export const cConj = (a: Complex): Complex => complex(a.re, -a.im)

/** Formats as "a + bi" with a fixed number of decimals. */
export const cFormat = (a: Complex, digits = 2) => {
  const re = a.re.toFixed(digits)
  const im = Math.abs(a.im).toFixed(digits)
  return `${re} ${a.im < 0 ? '-' : '+'} ${im}i`
}
