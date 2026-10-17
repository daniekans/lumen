import { useState } from 'react'
import { clamp, fmt, secantSlope } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Button, Divider } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, ToggleField } from '@/ui/molecules'
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
  VizControls,
} from '@/viz-kit'

const f = (x: number) => 0.1 * x ** 3 - 0.8 * x ** 2 + 1.6 * x + 1
const df = (x: number) => 0.3 * x ** 2 - 1.6 * x + 1.6

const X_MIN = 0
const X_MAX = 6
const H_MIN = 0.001

export default function DerivativeAsLimit() {
  const [x0, setX0] = useState(1.2)
  const [h, setH] = useState(2.2)
  const [tangent, setTangent] = useState(false)
  const [derivative, setDerivative] = useState(false)
  const seq = useSequence()

  const tangentOpacity = useAnimatedValue(tangent ? 1 : 0, { duration: 0.6 })
  const derivativeOpacity = useAnimatedValue(derivative ? 1 : 0, { duration: 0.8 })

  const animateH = (to: number, duration = 1.6) =>
    seq.run(({ tween }) => tween(h, to, { duration, onUpdate: setH }))

  useStepEffect({
    secant: () => {
      setTangent(false)
      setDerivative(false)
      animateH(2.2, 0.9)
    },
    shrink: () => {
      setTangent(false)
      setDerivative(false)
      animateH(0.6, 1.8)
    },
    limit: () => {
      setDerivative(false)
      void animateH(H_MIN, 2).then(() => setTangent(true))
    },
    function: () => {
      setTangent(true)
      setDerivative(true)
      animateH(H_MIN, 0.8)
    },
  })

  const setHManually = (v: number) => {
    seq.cancel()
    setH(clamp(v, H_MIN, X_MAX - x0))
  }

  const P = [x0, f(x0)] as const
  const Q = [x0 + h, f(x0 + h)] as const
  const corner = [Q[0], P[1]] as const
  const slope = secantSlope(f, x0, h)
  const triangleOpacity = clamp((h - 0.12) / 0.35, 0, 1)

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-0.6, 6.6], y: [-1.1, 4.4] }}
        ariaLabel="Graph of f with a secant line through P and Q"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="$x_0$" value={fmt(x0)} />
              <Readout label="$h$" value={fmt(h, 3)} />
              <Readout
                label="secant slope $\Delta y / h$"
                value={fmt(slope, 3)}
                color={vc.yellow}
              />
              <Readout label="$f'(x_0)$" value={fmt(df(x0), 3)} color={vc.teal} />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {derivativeOpacity > 0.01 && (
          <>
            <FunctionPlot
              f={df}
              color={vc.teal}
              width={2}
              dash="6 6"
              opacity={derivativeOpacity * 0.8}
            />
            <Segment
              from={P}
              to={[x0, df(x0)]}
              color={vc.teal}
              width={1}
              dash="2 4"
              opacity={derivativeOpacity * 0.6}
            />
            <Point at={[x0, df(x0)]} color={vc.teal} r={4.5} />
            <MathLabel
              at={[x0, df(x0)]}
              tex="f'(x_0)"
              color={vc.teal}
              anchor="se"
              opacity={derivativeOpacity}
              size={15}
            />
          </>
        )}

        <FunctionPlot f={f} color={vc.blue} />
        <MathLabel at={[5.9, f(5.9)]} tex="f(x)" color={vc.blue} anchor="nw" offset={12} />

        <g style={{ opacity: triangleOpacity }}>
          <Segment from={P} to={corner} color={vc.fg} width={1.25} dash="4 5" opacity={0.7} />
          <Segment from={corner} to={Q} color={vc.fg} width={1.25} dash="4 5" opacity={0.7} />
        </g>
        <MathLabel
          at={[(P[0] + Q[0]) / 2, P[1]]}
          tex="h"
          anchor={Q[1] >= P[1] ? 's' : 'n'}
          opacity={triangleOpacity}
          size={15}
        />
        <MathLabel
          at={[Q[0], (P[1] + Q[1]) / 2]}
          tex="\Delta y"
          anchor="e"
          opacity={triangleOpacity}
          size={15}
        />

        <Segment
          from={P}
          to={[x0 + 1, f(x0) + df(x0)]}
          extend
          color={vc.teal}
          width={2}
          opacity={tangentOpacity}
        />
        <Segment
          from={P}
          to={Q}
          extend
          color={vc.yellow}
          width={2}
          opacity={1 - tangentOpacity * 0.6}
        />

        <Point at={Q} color={vc.yellow} r={6} onDrag={([x]) => setHManually(x - x0)} label="Q" />
        <MathLabel at={Q} tex="Q" color={vc.yellow} anchor="nw" opacity={triangleOpacity} />
        <Point
          at={P}
          color={vc.fg}
          r={6}
          onDrag={([x]) => setX0(clamp(x, X_MIN, X_MAX - h))}
          label="P"
        />
        <MathLabel at={P} tex="P" anchor="nw" />
      </Stage>

      <VizControls>
        <LabeledSlider
          label="$h$"
          value={h}
          onChange={setHManually}
          min={H_MIN}
          max={3}
          step={0.001}
          color={vc.yellow}
          format={(v) => fmt(v, 3)}
        />
        <Button onClick={() => animateH(H_MIN, 2.2)} disabled={h <= H_MIN * 1.01}>
          Let h → 0
        </Button>
        <Divider />
        <ToggleField label="Tangent" checked={tangent} onChange={setTangent} color={vc.teal} />
        <ToggleField
          label="$f'(x)$"
          checked={derivative}
          onChange={setDerivative}
          color={vc.teal}
        />
      </VizControls>
    </>
  )
}
