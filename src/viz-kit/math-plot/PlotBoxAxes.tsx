import type { PlotBox } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { MathLabel } from './MathLabel'
import { Segment } from './Segment'

interface Tick {
  at: number
  /** TeX for the label; defaults to the value. */
  tex?: string
}

interface PlotBoxAxesProps {
  box: PlotBox
  xTicks?: readonly (number | Tick)[]
  yTicks?: readonly (number | Tick)[]
  /** TeX names of the axes, drawn at their far ends. */
  xLabel?: string
  yLabel?: string
}

const asTick = (t: number | Tick): Tick => (typeof t === 'number' ? { at: t } : t)

/**
 * The two axes of a `plotBox` (bottom and left edges), with ticks at data values. Draw the
 * graph after it, with `box.curve` and `box.map`.
 */
export function PlotBoxAxes({ box, xTicks = [], yTicks = [], xLabel, yLabel }: PlotBoxAxesProps) {
  const [x0, x1] = box.x
  const [y0, y1] = box.y
  const tick = Math.min(box.size[0], box.size[1]) * 0.025
  const origin = box.map([x0, y0])
  return (
    <g>
      <Segment from={origin} to={box.map([x1, y0])} color={vc.muted} width={1.5} />
      <Segment from={origin} to={box.map([x0, y1])} color={vc.muted} width={1.5} />
      {xTicks.map(asTick).map((t, i) => {
        const p = box.map([t.at, y0])
        return (
          <g key={`x${i}`}>
            <Segment from={p} to={[p[0], p[1] - tick]} color={vc.muted} width={1.5} />
            <MathLabel
              at={p}
              tex={t.tex ?? String(t.at)}
              anchor="s"
              offset={8}
              size={14}
              color={vc.muted}
            />
          </g>
        )
      })}
      {yTicks.map(asTick).map((t, i) => {
        const p = box.map([x0, t.at])
        return (
          <g key={`y${i}`}>
            <Segment from={p} to={[p[0] - tick, p[1]]} color={vc.muted} width={1.5} />
            <MathLabel
              at={p}
              tex={t.tex ?? String(t.at)}
              anchor="w"
              offset={10}
              size={14}
              color={vc.muted}
            />
          </g>
        )
      })}
      {xLabel && <MathLabel at={box.map([x1, y0])} tex={xLabel} anchor="e" offset={10} />}
      {yLabel && <MathLabel at={box.map([x0, y1])} tex={yLabel} anchor="n" offset={8} />}
    </g>
  )
}
