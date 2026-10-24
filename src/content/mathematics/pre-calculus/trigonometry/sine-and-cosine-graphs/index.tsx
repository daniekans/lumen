import { useState } from 'react'
import { fmt, sinusoid, sinusoidFeatures, TAU, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Arc,
  FunctionPlot,
  MathLabel,
  Overlay,
  Point,
  Segment,
  Stage,
  useSequence,
  useStepEffect,
  useStepStart,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const ARC = vc.yellow
const SIN = vc.teal
const COS = vc.blue
const TAN = vc.orange

/** Center of the unit circle, left of the graph. */
const O: Vec2 = [-1.4, 0]
const X_MAX = 7

const CIRCLE_STEPS = ['unroll', 'cosine', 'tangent']
const WAVE_STEPS = ['amplitude', 'shift']

/** Multiples of π/2 from 0 to 2π, with their TeX. */
const TICKS: [number, string][] = [
  [Math.PI / 2, '\\pi/2'],
  [Math.PI, '\\pi'],
  [(3 * Math.PI) / 2, '3\\pi/2'],
  [TAU, '2\\pi'],
]

export default function SineAndCosineGraphs() {
  const { id } = useVizStep()
  const [theta, setTheta] = useState(0)
  const [A, setA] = useState(1)
  const [B, setB] = useState(1)
  const [C, setC] = useState(0)
  const [D, setD] = useState(0)
  const seq = useSequence()
  const start = useStepStart(theta)

  const reset = () => {
    setA(1)
    setB(1)
    setC(0)
    setD(0)
  }

  useStepEffect({
    unroll: () => {
      reset()
      void seq.run(({ tween }) =>
        tween(0, TAU, { duration: 5, ease: 'linear', onUpdate: setTheta }),
      )
    },
    cosine: () => {
      reset()
      void seq.run(({ tween }) =>
        tween(0, TAU, { duration: 5, ease: 'linear', onUpdate: setTheta }),
      )
    },
    period: () => {
      reset()
      setTheta(TAU)
    },
    amplitude: () => {
      reset()
      void seq.run(async ({ tween, wait }) => {
        await tween(1, 2, { duration: 1.2, onUpdate: setA })
        await wait(0.4)
        await tween(1, 2, { duration: 1.2, onUpdate: setB })
      })
    },
    shift: () => {
      setA(2)
      setB(1)
      setC(0)
      setD(0)
      void seq.run(async ({ tween, wait }) => {
        await tween(0, 1, { duration: 1.2, onUpdate: setC })
        await wait(0.4)
        await tween(0, 1, { duration: 1.2, onUpdate: setD })
      })
    },
    tangent: (run) => {
      reset()
      const from = Math.min(Math.max(start(run), 0), TAU)
      void seq.run(({ tween }) =>
        tween(from === TAU ? 0 : from, 1, { duration: 1.2, onUpdate: setTheta }),
      )
    },
  })

  const isCircle = CIRCLE_STEPS.includes(id ?? '')
  const isWave = WAVE_STEPS.includes(id ?? '')
  const [c, s] = [Math.cos(theta), Math.sin(theta)]
  const P: Vec2 = [O[0] + c, O[1] + s]
  const traced = id === 'period' ? TAU : theta
  const wave = { A, B, C: id === 'shift' ? C : 0, D: id === 'shift' ? D : 0 }
  const features = sinusoidFeatures(wave)
  const tan = Math.tan(theta)
  const tanOk = Math.abs(c) > 1e-3
  const T: Vec2 = [O[0] + 1, Math.max(-3, Math.min(3, tan))]

  const stop = () => seq.cancel()
  const dragP = (p: Vec2) => {
    stop()
    const a = Math.atan2(p[1] - O[1], p[0] - O[0])
    setTheta(a < 0 ? a + TAU : a)
  }

  const domain: { x: [number, number]; y: [number, number] } = isWave
    ? { x: [-0.8, X_MAX], y: [-3.3, 3.3] }
    : id === 'tangent'
      ? { x: [-2.6, X_MAX], y: [-3, 3] }
      : { x: [-2.6, X_MAX], y: [-1.9, 1.9] }

  const asymptotes = [Math.PI / 2, (3 * Math.PI) / 2]

  return (
    <>
      <Stage
        domain={domain}
        ariaLabel="The unit circle on the left and the graphs of sine, cosine and tangent on the right, with the arc unrolled onto the x-axis"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {isWave ? (
                <>
                  <Readout
                    label="$y$"
                    value={
                      <Tex>
                        {id === 'shift'
                          ? `${fmt(A, 2)} \\sin(${fmt(B, 2)}(x - ${fmt(C, 2)})) + ${fmt(D, 2)}`
                          : `${fmt(A, 2)} \\sin(${fmt(B, 2)}x)`}
                      </Tex>
                    }
                    color={SIN}
                  />
                  <Readout label="amplitude $\lvert A \rvert$" value={fmt(features.amplitude, 2)} />
                  <Readout
                    label="period $\frac{2\pi}{\lvert B \rvert}$"
                    value={fmt(features.period, 3)}
                  />
                  {id === 'shift' && (
                    <Readout
                      label="max, min"
                      value={`${fmt(features.max, 2)}, ${fmt(features.min, 2)}`}
                      hint="$D + \lvert A \rvert$ and $D - \lvert A \rvert$."
                    />
                  )}
                </>
              ) : (
                <>
                  <Readout label="$\theta$" value={fmt(theta, 3)} color={ARC} />
                  <Readout label="$\sin\theta$" value={fmt(s, 3)} color={SIN} />
                  {id !== 'unroll' && (
                    <Readout label="$\cos\theta$" value={fmt(c, 3)} color={COS} />
                  )}
                  {id === 'tangent' && (
                    <Readout
                      label="$\tan\theta$"
                      value={tanOk ? fmt(tan, 3) : 'undefined'}
                      color={TAN}
                      hint="The slope of the radius: $\frac{\sin\theta}{\cos\theta}$."
                    />
                  )}
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        {/* Axes with ticks at multiples of π/2. */}
        <Segment from={[domain.x[0], 0]} to={[X_MAX, 0]} color={vc.axis} width={1.25} />
        <Segment from={[0, domain.y[0]]} to={[0, domain.y[1]]} color={vc.axis} width={1.25} />
        {TICKS.map(([x, tex]) => (
          <g key={tex}>
            <Segment from={[x, domain.y[0]]} to={[x, domain.y[1]]} color={vc.grid} width={1} />
            <MathLabel at={[x, 0]} tex={tex} color={vc.muted} anchor="se" offset={4} />
          </g>
        ))}
        {[-1, 1].map((y) => (
          <g key={y}>
            <Segment from={[0, y]} to={[X_MAX, y]} color={vc.grid} width={1} />
            <MathLabel at={[0, y]} tex={String(y)} color={vc.muted} anchor="w" offset={6} />
          </g>
        ))}

        {isCircle && (
          <>
            <Segment from={[O[0] - 1.2, 0]} to={[O[0] + 1.2, 0]} color={vc.axis} width={1} />
            <Segment from={[O[0], -1.2]} to={[O[0], 1.2]} color={vc.axis} width={1} />
            <Arc center={O} r={1} from={0} to={TAU} color={vc.muted} width={1.5} />
            <Arc center={O} r={1} from={0} to={theta} color={ARC} width={3.5} />
            <Segment from={O} to={P} color={vc.fg} width={1.5} />
          </>
        )}

        {(id === 'unroll' || id === 'cosine') && (
          <>
            <Segment from={[0, 0]} to={[theta, 0]} color={ARC} width={3.5} />
            {id === 'unroll' ? (
              <>
                <Segment from={[P[0], 0]} to={P} color={SIN} width={2.5} />
                <Segment from={P} to={[theta, s]} color={SIN} width={1} dash="4 5" opacity={0.7} />
                <Segment from={[theta, 0]} to={[theta, s]} color={SIN} width={2.5} />
                <FunctionPlot
                  f={Math.sin}
                  domain={[0, Math.max(theta, 1e-3)]}
                  color={SIN}
                  width={2.5}
                />
              </>
            ) : (
              <>
                <FunctionPlot
                  f={Math.sin}
                  domain={[0, TAU]}
                  color={SIN}
                  width={1.5}
                  opacity={0.4}
                />
                <Segment from={O} to={[P[0], O[1]]} color={COS} width={2.5} />
                <Segment from={[theta, 0]} to={[theta, c]} color={COS} width={2.5} />
                <FunctionPlot
                  f={Math.cos}
                  domain={[0, Math.max(theta, 1e-3)]}
                  color={COS}
                  width={2.5}
                />
              </>
            )}
            <Point
              at={[theta, id === 'unroll' ? s : c]}
              color={id === 'unroll' ? SIN : COS}
              r={4}
              coords={false}
            />
          </>
        )}

        {id === 'period' && (
          <>
            <FunctionPlot f={Math.sin} color={SIN} width={2.5} />
            <FunctionPlot f={Math.cos} color={COS} width={2.5} />
            <Segment from={[0, -1.55]} to={[traced, -1.55]} color={vc.muted} width={1.25} />
            <Segment from={[0, -1.45]} to={[0, -1.65]} color={vc.muted} width={1.25} />
            <Segment from={[TAU, -1.45]} to={[TAU, -1.65]} color={vc.muted} width={1.25} />
            <MathLabel
              at={[Math.PI, -1.55]}
              tex="\text{period } 2\pi"
              color={vc.muted}
              anchor="n"
              offset={6}
            />
            <MathLabel at={[0.9, 1.25]} tex="\sin x" color={SIN} />
            <MathLabel at={[-0.5, 1.25]} tex="\cos x" color={COS} />
          </>
        )}

        {isWave && (
          <>
            <FunctionPlot f={Math.sin} color={vc.muted} width={1.25} dash="5 6" />
            {id === 'shift' && (
              <Segment from={[-0.8, D]} to={[X_MAX, D]} color={vc.purple} width={1.5} dash="6 5" />
            )}
            <FunctionPlot f={sinusoid(wave)} color={SIN} width={2.5} samples={1200} />
          </>
        )}

        {id === 'tangent' && (
          <>
            <Segment
              from={[O[0] + 1, -3]}
              to={[O[0] + 1, 3]}
              color={vc.muted}
              width={1}
              dash="4 5"
            />
            {tanOk && <Segment from={P} to={T} color={TAN} width={1.5} />}
            {tanOk && <Segment from={O} to={T} color={TAN} width={1.5} dash="3 4" />}
            {tanOk && Math.abs(tan) < 3 && <Point at={T} color={TAN} r={4} coords={false} />}
            {asymptotes.map((x) => (
              <Segment
                key={x}
                from={[x, -3]}
                to={[x, 3]}
                color={TAN}
                width={1}
                dash="5 6"
                opacity={0.5}
              />
            ))}
            <FunctionPlot
              f={(x) => (Math.abs(Math.tan(x)) > 3.2 ? NaN : Math.tan(x))}
              domain={[0, X_MAX]}
              breaks={asymptotes}
              color={TAN}
              width={2.5}
              samples={1600}
            />
            {tanOk && Math.abs(tan) < 3 && (
              <Point at={[theta, tan]} color={TAN} r={4} coords={false} />
            )}
          </>
        )}

        {isCircle && <Point at={P} color={ARC} label="P" onDrag={dragP} coords={false} />}
      </Stage>

      <VizControls>
        {isWave ? (
          <>
            <LabeledSlider
              label="$A$"
              value={A}
              onChange={(v) => (stop(), setA(v))}
              min={-2}
              max={2}
              step={0.05}
            />
            <LabeledSlider
              label="$B$"
              value={B}
              onChange={(v) => (stop(), setB(v))}
              min={0.25}
              max={3}
              step={0.05}
            />
            {id === 'shift' && (
              <>
                <LabeledSlider
                  label="$C$"
                  value={C}
                  onChange={(v) => (stop(), setC(v))}
                  min={-3}
                  max={3}
                  step={0.05}
                />
                <LabeledSlider
                  label="$D$"
                  value={D}
                  onChange={(v) => (stop(), setD(v))}
                  min={-1}
                  max={1}
                  step={0.05}
                />
              </>
            )}
          </>
        ) : (
          <LabeledSlider
            label="$\theta$"
            value={theta}
            onChange={(v) => (stop(), setTheta(v))}
            min={0}
            max={TAU}
            step={0.01}
            color={ARC}
          />
        )}
      </VizControls>
    </>
  )
}
