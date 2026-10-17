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
  /** x values where the curve must not be joined, such as vertical asymptotes. */
  breaks?: readonly number[]
}

/** Graph of y = f(x). Non-finite values break the curve instead of drawing spikes. */
export function FunctionPlot({
  f,
  domain,
  samples = 480,
  breaks,
  color = vc.blue,
  width = 2.5,
  opacity = 1,
  dash,
}: FunctionPlotProps) {
  const c = useCoords()
  const [a, b] = domain ?? c.view.x
  const breakKey = breaks?.join(',') ?? ''
  const d = useMemo(() => {
    const cuts = breakKey ? breakKey.split(',').map(Number) : []
    const pts: [number, number][] = []
    for (let k = 0; k <= samples; k++) {
      const x = a + ((b - a) * k) / samples
      const prev = pts.length ? pts[pts.length - 1]![0] : -Infinity
      // An undefined sample at each break splits the path there.
      for (const cut of cuts) if (cut > prev && cut <= x) pts.push([cut, NaN])
      pts.push([x, f(x)])
    }
    // Points far outside the view break the curve, so poles do not draw vertical spikes.
    const [y0, y1] = c.view.y
    const margin = (y1 - y0) * 4
    return (
      line<[number, number]>()
        .defined(([, y]) => Number.isFinite(y) && y > y0 - margin && y < y1 + margin)
        .x(([x]) => c.x(x))
        .y(([, y]) => c.y(y))(pts) ?? ''
    )
  }, [f, a, b, samples, c, breakKey])
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
