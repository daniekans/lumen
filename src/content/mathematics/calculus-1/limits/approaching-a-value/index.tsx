import { useState } from 'react'
import { clamp, fmt, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
  Point,
  Segment,
  Stage,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  type ParamCodec,
  VizControls,
} from '@/viz-kit'

const A = 1
const L = 3

/** (x^3 - 1) / (x - 1), undefined at 1 and equal to x^2 + x + 1 everywhere else. */
const f = (x: number) => (x === A ? NaN : (x ** 3 - 1) / (x - 1))

type Fill = 'none' | 'other' | 'limit'
const FILL_VALUE: Record<Fill, number | undefined> = { none: undefined, other: 5, limit: L }
const fillCodec: ParamCodec<Fill> = {
  encode: (v) => v,
  decode: (t) => (t === 'none' || t === 'other' || t === 'limit' ? t : undefined),
}

const VIEWS = {
  wide: [-1, 3, -1, 8],
  zoom: [0.85, 1.15, 2.55, 3.45],
} as const

/** Smallest step the controls allow, so x never lands on 1. */
const MIN_STEP = 0.01

export default function ApproachingAValue() {
  const { id } = useVizStep()
  // The distance from 1 of the two inputs, as a power of ten: d = 10^s.
  const [s, setS] = useState(0)
  const [dx, setDx] = useState(1)
  const [fill, setFill] = useVizParam<Fill>('fill', 'other', fillCodec)
  const seq = useSequence()

  const shrink = (to: number) =>
    void seq.run(({ tween }) => tween(0, to, { duration: 2.4, onUpdate: setS }))

  useStepEffect({
    approach: () => shrink(-1.3),
    zoom: () => shrink(-1.6),
    'value-differs': () => {
      seq.cancel()
      setS(-0.7)
    },
    increments: () =>
      void seq.run(({ tween }) => tween(1.2, 0.3, { duration: 2.4, onUpdate: setDx })),
  })

  const view = id === 'zoom' ? VIEWS.zoom : VIEWS.wide
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(view, { duration: 1.2 })

  const d = 10 ** s
  const [xl, xr] = [A - d, A + d]
  const [yl, yr] = [f(xl), f(xr)]
  const filled = id === 'value-differs' ? FILL_VALUE[fill] : undefined

  const xp = A + dx
  const yp = f(xp)
  const dy = yp - L

  /** Dragging either input sets the common distance d, on the same log scale as the slider. */
  const moveInput = ([px]: Vec2) => {
    seq.cancel()
    setS(Math.log10(clamp(Math.abs(px - A), MIN_STEP, 1)))
  }
  const moveP = ([px]: Vec2) => {
    seq.cancel()
    const v = Math.round(clamp(px - A, -1, 1.5) * 100) / 100
    setDx(Math.abs(v) < MIN_STEP ? MIN_STEP * (px < A ? -1 : 1) : v)
  }

  const twoInputs = id !== 'increments'
  // Outputs are marked on the y-axis, or on the left edge when the zoomed view hides the axis.
  const outX = id === 'zoom' ? vx0 : 0

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Graph of (x cubed minus 1) over (x minus 1) with a hole at x = 1"
        overlay={
          <Overlay corner="top-left">
            {twoInputs && (
              <ReadoutPanel title="Near x = 1">
                <Readout
                  label="$f(x)$"
                  value={<Tex>{'\\frac{x^3 - 1}{x - 1}'}</Tex>}
                  color={vc.blue}
                />
                <Readout label="left $x$" value={fmt(xl, 4)} color={vc.yellow} />
                <Readout label="$f(x)$" value={fmt(yl, 4)} color={vc.teal} />
                <Readout label="right $x$" value={fmt(xr, 4)} color={vc.yellow} />
                <Readout label="$f(x)$" value={fmt(yr, 4)} color={vc.teal} />
                <Readout
                  label="$f(1)$"
                  value={filled === undefined ? 'undefined' : fmt(filled)}
                  hint={
                    filled === undefined
                      ? 'Substituting $x = 1$ gives $\\frac{0}{0}$, which has no value.'
                      : 'The value at $1$ was defined separately. The limit ignores it.'
                  }
                />
                <Readout
                  label="limit"
                  value={<Tex>{'\\lim_{x \\to 1} f(x) = 3'}</Tex>}
                  hint="For $x \neq 1$, $f(x) = x^2 + x + 1$, which is $3$ at $x = 1$."
                />
              </ReadoutPanel>
            )}
            {id === 'increments' && (
              <ReadoutPanel title="Increments">
                <Readout
                  label="$\Delta x$"
                  value={fmt(dx, 3)}
                  color={vc.yellow}
                  hint="The step from $1$ to $x$: $\Delta x = x - 1$."
                />
                <Readout
                  label="$\Delta y$"
                  value={fmt(dy, 4)}
                  color={vc.teal}
                  hint="The change in output: $\Delta y = f(x) - 3 = 3\Delta x + \Delta x^2$."
                />
                <Readout
                  label="$\frac{\Delta y}{\Delta x}$"
                  value={fmt(dy / dx, 4)}
                  hint="Rise over run from the hole to $P$: $3 + \Delta x$, which approaches $3$."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />
        <Segment from={[outX, L]} to={[A, L]} color={vc.teal} width={1.25} dash="4 5" />
        <FunctionPlot f={f} breaks={[A]} color={vc.blue} />
        <Point at={[A, L]} color={vc.blue} hollow coords={false} />

        {twoInputs &&
          [
            { x: xl, y: yl, label: 'left' },
            { x: xr, y: yr, label: 'right' },
          ].map((p) => (
            <g key={p.label}>
              <Segment from={[p.x, 0]} to={[p.x, p.y]} color={vc.yellow} width={1.25} dash="4 5" />
              <Segment from={[p.x, p.y]} to={[outX, p.y]} color={vc.teal} width={1.25} dash="2 5" />
              <Point at={[p.x, p.y]} color={vc.blue} r={4} />
              <Point at={[outX, p.y]} color={vc.teal} r={4} coords={false} />
              <Point at={[p.x, 0]} color={vc.yellow} label={`${p.label} x`} onDrag={moveInput} />
            </g>
          ))}

        {filled !== undefined && <Point at={[A, filled]} color={vc.blue} />}

        {id === 'increments' && (
          <>
            <Segment from={[A, L]} to={[xp, L]} color={vc.yellow} width={3} />
            <Segment from={[xp, L]} to={[xp, yp]} color={vc.teal} width={3} />
            <Segment from={[A, L]} to={[xp, yp]} color={vc.fg} width={1.25} dash="4 5" />
            <MathLabel
              at={[(A + xp) / 2, L]}
              tex="\Delta x"
              color={vc.yellow}
              anchor={dy >= 0 ? 's' : 'n'}
              offset={8}
            />
            <MathLabel
              at={[xp, (L + yp) / 2]}
              tex="\Delta y"
              color={vc.teal}
              anchor={dx >= 0 ? 'e' : 'w'}
              offset={8}
            />
            <Point at={[xp, yp]} color={vc.blue} label="P" onDrag={moveP} />
            <MathLabel at={[xp, yp]} tex="P" color={vc.blue} anchor="nw" offset={14} />
          </>
        )}
      </Stage>

      <VizControls>
        {twoInputs && (
          <LabeledSlider
            label="distance from $1$"
            value={s}
            onChange={(v) => {
              seq.cancel()
              setS(v)
            }}
            min={-2}
            max={0}
            step={0.01}
            format={(v) => fmt(10 ** v, 3)}
            color={vc.yellow}
          />
        )}
        {id === 'value-differs' && (
          <SegmentedControl
            label="Value at 1"
            value={fill}
            onChange={setFill}
            options={[
              { value: 'none', label: '$f(1)$ undefined' },
              { value: 'other', label: '$f(1) = 5$' },
              { value: 'limit', label: '$f(1) = 3$' },
            ]}
          />
        )}
        {id === 'increments' && (
          <LabeledSlider
            label="$\Delta x$"
            value={dx}
            onChange={(v) => {
              seq.cancel()
              setDx(Math.abs(v) < MIN_STEP ? MIN_STEP : v)
            }}
            min={-1}
            max={1.5}
            step={0.01}
            format={(v) => fmt(v)}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
