import type { ReactNode } from 'react'

/** Tick label for a log10 axis: the tick at 3 reads 10³. Ticks between whole powers get none. */
export const powerOfTen = (v: number): ReactNode =>
  Number.isInteger(v) ? (
    <>
      10
      <tspan baselineShift="super" fontSize="0.8em">
        {v}
      </tspan>
    </>
  ) : null
