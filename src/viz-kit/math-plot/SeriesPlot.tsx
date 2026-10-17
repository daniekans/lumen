import { niceStep, stepDigits, ticks, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Stage } from '../stage'
import { Path } from './Path'
import { Point } from './Point'
import { TextLabel } from './TextLabel'

/** Size of the plot box in stage units. */
const W = 16
const H = 9

interface SeriesPlotProps {
  /** One value per step, plotted at x = 0, 1, 2, ... */
  values: readonly number[]
  color?: string
  /** Fix the lower bound of the y range, e.g. 0 for a loss curve. */
  min?: number
  xLabel?: string
  yLabel?: string
  ariaLabel?: string
}

/**
 * A stage with a value over time and labeled axes, for the larger view of a sparkline. Stages keep one scale
 * on both axes, so the data is fitted into a fixed box and the tick labels
 * show data values.
 */
export function SeriesPlot({
  values,
  color = vc.fg,
  min,
  xLabel,
  yLabel,
  ariaLabel,
}: SeriesPlotProps) {
  if (values.length === 0) return null
  // At least ten steps wide, with whole-step ticks.
  const n = Math.max(10, values.length - 1)
  const lo = min ?? Math.min(...values)
  const hi = Math.max(lo + 1e-9, ...values)
  const xStep = Math.max(1, niceStep(n / 6))
  const yStep = niceStep((hi - lo) / 5)
  const xMax = Math.max(n, Math.ceil(n / xStep) * xStep)
  const yMax = lo + Math.ceil((hi - lo) / yStep) * yStep
  const at = (i: number, v: number): Vec2 => [(W * i) / xMax, (H * (v - lo)) / (yMax - lo)]
  const digits = stepDigits(yStep)
  const last = values.length - 1

  return (
    <Stage
      domain={{ x: [-1.6, W + 0.6], y: [-2, H + 1.2] }}
      insets={{ top: 24, right: 24, bottom: 24, left: 24 }}
      ariaLabel={ariaLabel}
    >
      {ticks(lo, yMax, yStep).map((v) => (
        <g key={`y${v}`}>
          <Path points={[at(0, v), at(xMax, v)]} color={vc.grid} width={1} />
          <TextLabel at={[-0.3, at(0, v)[1] - 0.12]} align="end" mono size={11}>
            {v.toFixed(digits)}
          </TextLabel>
        </g>
      ))}
      {ticks(0, xMax, xStep).map((i) => (
        <TextLabel key={`x${i}`} at={[at(i, lo)[0], -0.6]} mono size={11}>
          {String(i)}
        </TextLabel>
      ))}
      <Path points={[at(0, lo), at(xMax, lo)]} color={vc.axis} width={1.5} />
      <Path points={[at(0, lo), at(0, yMax)]} color={vc.axis} width={1.5} />
      {xLabel && (
        <TextLabel at={[W / 2, -1.4]} size={11} uppercase color={vc.subtle}>
          {xLabel}
        </TextLabel>
      )}
      {yLabel && (
        <TextLabel at={[0, H + 0.7]} size={11} uppercase color={vc.subtle} align="start">
          {yLabel}
        </TextLabel>
      )}
      <Path points={values.map((v, i) => at(i, v))} color={color} width={2} />
      <Point at={at(last, values[last]!)} color={color} r={3.5} />
    </Stage>
  )
}
