import { useState } from 'react'
import { clamp, fmt, secantSlope, zoomedStep } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Button, Divider, Tex } from '@/ui/atoms'
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
  useStepStart,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const f = (x: number) => 0.1 * x ** 3 - 0.8 * x ** 2 + 1.6 * x + 1
const df = (x: number) => 0.3 * x ** 2 - 1.6 * x + 1.6

const X_MIN = 0
const X_MAX = 6
const H_MIN = 0.001
/** The unzoomed view. Zooming scales it around P. */
const VIEW = { x: [-0.6, 6.6], y: [-1.1, 4.4] } as const
/** Largest zoom, as a power of ten. */
const MAX_ZOOM = 2.2

export default function DerivativeAsLimit() {
  const { id } = useVizStep()
  const [x0, setX0] = useState(1.2)
  const [h, setH] = useState(2.2)
  // Magnification around P, as a power of ten: 10^s.
  const [s, setS] = useState(0)
  const [tangent, setTangent] = useState(false)
  const [derivative, setDerivative] = useState(false)
  const seq = useSequence()
  const start = useStepStart({ h, s })

  const tangentOpacity = useAnimatedValue(tangent ? 1 : 0, { duration: 0.6 })
  const derivativeOpacity = useAnimatedValue(derivative ? 1 : 0, { duration: 0.8 })

  /** Moves h to `to` and the zoom back to 1, together. */
  const animateH = (from: { h: number; s: number }, to: number, duration = 1.6) =>
    seq.run(({ tween }) =>
      Promise.all([
        tween(from.h, to, { duration, onUpdate: setH }),
        from.s > 0 ? tween(from.s, 0, { duration: 1, onUpdate: setS }) : undefined,
      ]).then(() => undefined),
    )

  useStepEffect({
    secant: (run) => {
      setTangent(false)
      setDerivative(false)
      animateH(start(run), 2.2, 0.9)
    },
    shrink: (run) => {
      setTangent(false)
      setDerivative(false)
      animateH(start(run), 0.6, 1.8)
    },
    limit: (run) => {
      setDerivative(false)
      void animateH(start(run), H_MIN, 2).then(() => setTangent(true))
    },
    zoom: (run) => {
      setTangent(true)
      setDerivative(false)
      setH(H_MIN)
      const from = run.replay ? 0 : start(run).s
      seq.run(({ tween }) => tween(from, 2, { duration: 3, onUpdate: setS }))
    },
    notation: (run) => {
      setTangent(true)
      setDerivative(true)
      animateH(start(run), H_MIN, 0.8)
    },
  })

  const setHManually = (v: number) => {
    seq.cancel()
    setH(clamp(v, H_MIN, X_MAX - x0))
  }
  const setZoom = (v: number) => {
    seq.cancel()
    setS(v)
  }

  const P = [x0, f(x0)] as const
  const Q = [x0 + h, f(x0 + h)] as const
  const corner = [Q[0], P[1]] as const
  const slope = secantSlope(f, x0, h)
  const triangleOpacity = clamp((h - 0.12) / 0.35, 0, 1)
  const m = df(x0)
  const k = P[1] - m * x0

  const z = 10 ** s
  const zoomed = (v: readonly [number, number] | readonly number[], c: number) =>
    [c + (v[0]! - c) / z, c + (v[1]! - c) / z] as const
  const domain = { x: zoomed(VIEW.x, P[0]), y: zoomed(VIEW.y, P[1]) }
  // At a large zoom the curve and the tangent overlap, so the tangent is drawn under the curve.
  const showZoom = id === 'zoom'
  const gridStep = zoomedStep(1, z)

  return (
    <>
      <Stage
        zoomable
        domain={domain}
        ariaLabel="Graph of f with a secant line through P and Q"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="$x_0$" value={fmt(x0)} />
              {!showZoom && (
                <>
                  <Readout label="$h = \Delta x$" value={fmt(h, 3)} />
                  <Readout
                    label="secant slope $\frac{\Delta y}{h}$"
                    value={fmt(slope, 3)}
                    color={vc.yellow}
                  />
                </>
              )}
              <Readout
                label={id === 'notation' ? "$f'(x_0) = \\frac{dy}{dx}$" : "$f'(x_0)$"}
                value={fmt(m, 3)}
                color={vc.teal}
              />
              {(id === 'limit' || showZoom) && (
                <Readout
                  label="tangent"
                  value={
                    <Tex>{`y = ${fmt(m, 2)}x ${k < 0 ? '-' : '+'} ${fmt(Math.abs(k), 2)}`}</Tex>
                  }
                  color={vc.teal}
                  hint="$y = f(x_0) + f'(x_0)(x - x_0)$, multiplied out."
                />
              )}
              {showZoom && (
                <Readout
                  label="zoom"
                  value={`×${fmt(z, z < 10 ? 1 : 0)}`}
                  hint="How much the picture is magnified around $P$."
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid step={gridStep} />
        <Axes step={gridStep} />

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
              to={[x0, m]}
              color={vc.teal}
              width={1}
              dash="2 4"
              opacity={derivativeOpacity * 0.6}
            />
            <Point at={[x0, m]} color={vc.teal} r={4.5} />
            <MathLabel
              at={[x0, m]}
              tex="f'(x_0)"
              color={vc.teal}
              anchor="se"
              opacity={derivativeOpacity}
              size={15}
            />
          </>
        )}

        {showZoom && (
          <Segment
            from={P}
            to={[x0 + 1, f(x0) + m]}
            extend
            color={vc.teal}
            width={6}
            opacity={tangentOpacity * 0.45}
          />
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

        {!showZoom && (
          <>
            <Segment
              from={P}
              to={[x0 + 1, f(x0) + m]}
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
            <Point
              at={Q}
              color={vc.yellow}
              r={6}
              onDrag={([x]) => setHManually(x - x0)}
              label="Q"
            />
            <MathLabel at={Q} tex="Q" color={vc.yellow} anchor="nw" opacity={triangleOpacity} />
          </>
        )}
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
        {showZoom ? (
          <LabeledSlider
            label="zoom"
            value={s}
            onChange={setZoom}
            min={0}
            max={MAX_ZOOM}
            step={0.01}
            format={(v) => `×${fmt(10 ** v, 10 ** v < 10 ? 1 : 0)}`}
          />
        ) : (
          <>
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
            <Button onClick={() => animateH({ h, s }, H_MIN, 2.2)} disabled={h <= H_MIN * 1.01}>
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
          </>
        )}
      </VizControls>
    </>
  )
}
