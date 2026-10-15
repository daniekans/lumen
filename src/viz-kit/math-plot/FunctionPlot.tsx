import { line } from 'd3-shape'
import { useMemo } from 'react'
import type { Fn } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import type { StrokeStyle } from './Path'

interface FunctionPlotProps extends StrokeStyle {
  f: Fn
  /** Restrict the x range. Defaults to the visible range. */
  domain?: readonly [number, number]
  samples?: number
}

/** Graph of y = f(x). Non-finite values break the curve instead of drawing spikes. */
export function FunctionPlot({
  f,
  domain,
  samples = 480,
  color = vc.blue,
  width = 2.5,
  opacity = 1,
  dash,
}: FunctionPlotProps) {
  const c = useCoords()
  const [a, b] = domain ?? c.view.x
  const d = useMemo(() => {
    const pts: [number, number][] = []
    for (let k = 0; k <= samples; k++) {
      const x = a + ((b - a) * k) / samples
      pts.push([x, f(x)])
    }
    const limit = (c.view.y[1] - c.view.y[0]) * 4
    return (
      line<[number, number]>()
        .defined(([, y]) => Number.isFinite(y) && Math.abs(y) < limit)
        .x(([x]) => c.x(x))
        .y(([, y]) => c.y(y))(pts) ?? ''
    )
  }, [f, a, b, samples, c])
  return (
    <path
      d={d}
      style={{ stroke: color, fill: 'none', opacity }}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeLinecap="round"
      strokeLinejoin="round"
      pointerEvents="none"
    />
  )
}
