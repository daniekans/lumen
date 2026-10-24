import { useState } from 'react'
import { clamp, derivative, fmt, type Vec2, tangentPiece } from '@/lib/math'
import { TAU } from '@/lib/math/trig'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Arc,
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
  useVizParam,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const VIEWS = {
  exp: [-3.2, 2.4, -1, 6.4],
  base: [-3, 3, -1.4, 6],
  circle: [-1.9, 1.9, -1.5, 1.5],
  sine: [-0.6, 7, -1.9, 1.9],
  log: [-2.4, 4.6, -2.4, 4.6],
  powers: [-0.4, 3.2, -0.8, 4],
} as const

/** Multiples of π/2 on the x-axis of the sine graph. */
const PI_TICKS: readonly [number, string][] = [
  [Math.PI / 2, '\\frac{\\pi}{2}'],
  [Math.PI, '\\pi'],
  [(3 * Math.PI) / 2, '\\frac{3\\pi}{2}'],
  [TAU, '2\\pi'],
]

export default function ExpLogAndTrigDerivatives() {
  const { id } = useVizStep()
  const [x, setX] = useState(0.6)
  const [b, setB] = useVizParam<number>('b', 2)
  const [theta, setTheta] = useState(0.9)
  const [dTheta, setDTheta] = useState(0.6)
  const [sx, setSx] = useState(1)
  const [lx, setLx] = useState(2)
  const [r, setR] = useVizParam<number>('r', 0.5)
  const [px, setPx] = useState(0.6)
  const [rx, setRx] = useState(1.2)
  const seq = useSequence()
  const start = useStepStart(dTheta)

  useStepEffect({
    exp: () => seq.cancel(),
    base: () => seq.cancel(),
    circle: (run) =>
      void seq.run(({ tween }) =>
        tween(run.replay ? start(run) : 0.8, 0.3, { duration: 2.4, onUpdate: setDTheta }),
      ),
    'sine-graph': () => seq.cancel(),
    log: () => seq.cancel(),
    'real-powers': () => seq.cancel(),
  })

  const view =
    id === 'base'
      ? VIEWS.base
      : id === 'circle'
        ? VIEWS.circle
        : id === 'sine-graph'
          ? VIEWS.sine
          : id === 'log'
            ? VIEWS.log
            : id === 'real-powers'
              ? VIEWS.powers
              : VIEWS.exp
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(view, { duration: 1.2 })

  const stopDTheta = (v: number) => {
    seq.cancel()
    setDTheta(v)
  }

  // e^x
  const E: Vec2 = [x, Math.exp(x)]
  const foot: Vec2 = [x - 1, 0]

  // b^x
  const bx = (t: number) => b ** t
  const lnb = Math.log(b)
  const dbx = (t: number) => lnb * b ** t
  const B: Vec2 = [px, bx(px)]
  const bTangent = tangentPiece(B, dbx(px), 0.9)
  const zeroTangent = tangentPiece([0, 1], lnb, 0.7)

  // the unit circle
  const P: Vec2 = [Math.cos(theta), Math.sin(theta)]
  const P1: Vec2 = [Math.cos(theta + dTheta), Math.sin(theta + dTheta)]
  const run: Vec2 = [P[0] - Math.sin(theta) * dTheta, P[1]]
  const step: Vec2 = [run[0], P[1] + Math.cos(theta) * dTheta]
  const stepOpacity = clamp((dTheta - 0.1) / 0.1, 0, 1)

  // sine graph
  const S: Vec2 = [sx, Math.sin(sx)]
  const sTangent = tangentPiece(S, Math.cos(sx), 0.9)

  // ln x and its mirror point on e^x
  const L: Vec2 = [lx, Math.log(lx)]
  const M: Vec2 = [Math.log(lx), lx]
  const lTangent = tangentPiece(L, 1 / lx, 0.9)
  const mTangent = tangentPiece(M, lx, 0.9)

  // x^r
  const xr = (t: number) => t ** r
  const dxr = (t: number) => r * t ** (r - 1)
  const R: Vec2 = [rx, xr(rx)]
  const rTangent = tangentPiece(R, dxr(rx), 0.8)

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Graphs of exponentials, logarithms and sine with their tangents, and the unit circle"
        overlay={
          <Overlay corner="top-right">
            {id === 'exp' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(x)} />
                <Readout label="height $e^x$" value={fmt(E[1], 3)} color={vc.blue} />
                <Readout
                  label="slope"
                  value={fmt(derivative(Math.exp, x), 3)}
                  color={vc.teal}
                  hint="Computed from a difference quotient with a tiny $h$, not from the formula."
                />
              </ReadoutPanel>
            )}
            {id === 'base' && (
              <ReadoutPanel>
                <Readout label="$b$" value={fmt(b, 2)} />
                <Readout
                  label="slope at $0$"
                  value={fmt(derivative(bx, 0), 3)}
                  color={vc.yellow}
                  hint="The limit of $\frac{b^h - 1}{h}$ as $h \to 0$."
                />
                <Readout label="$\ln b$" value={fmt(lnb, 3)} color={vc.yellow} />
                <Readout label="slope at $P$" value={fmt(derivative(bx, px), 3)} color={vc.teal} />
                <Readout label="$(\ln b)\,b^x$" value={fmt(dbx(px), 3)} color={vc.teal} />
              </ReadoutPanel>
            )}
            {id === 'circle' && (
              <ReadoutPanel>
                <Readout label="$\theta$" value={fmt(theta, 3)} color={vc.blue} />
                <Readout label="$\Delta\theta$" value={fmt(dTheta, 3)} color={vc.yellow} />
                <Readout
                  label="$\frac{\Delta \sin\theta}{\Delta\theta}$"
                  value={fmt((P1[1] - P[1]) / dTheta, 3)}
                />
                <Readout label="$\cos\theta$" value={fmt(P[0], 3)} color={vc.green} />
                <Readout
                  label="$\frac{\Delta \cos\theta}{\Delta\theta}$"
                  value={fmt((P1[0] - P[0]) / dTheta, 3)}
                />
                <Readout label="$-\sin\theta$" value={fmt(-P[1], 3)} color={vc.red} />
              </ReadoutPanel>
            )}
            {id === 'sine-graph' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(sx, 3)} />
                <Readout label="slope of $\sin$" value={fmt(derivative(Math.sin, sx), 3)} />
                <Readout label="$\cos x$" value={fmt(Math.cos(sx), 3)} color={vc.teal} />
              </ReadoutPanel>
            )}
            {id === 'log' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(lx, 2)} />
                <Readout
                  label="slope of $e^y$ at $Q$"
                  value={fmt(lx, 3)}
                  color={vc.blue}
                  hint="At $Q = (\ln x, x)$ the slope of $e^y$ is its height, $x$."
                />
                <Readout label="slope of $\ln$ at $P$" value={fmt(derivative(Math.log, lx), 3)} />
                <Readout label="$\frac{1}{x}$" value={fmt(1 / lx, 3)} color={vc.green} />
              </ReadoutPanel>
            )}
            {id === 'real-powers' && (
              <ReadoutPanel>
                <Readout label="$r$" value={fmt(r, 2)} />
                <Readout label="slope at $P$" value={fmt(derivative(xr, rx), 3)} />
                <Readout label="$rx^{r-1}$" value={fmt(dxr(rx), 3)} color={vc.teal} />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes labels={id !== 'sine-graph'} />

        {id === 'exp' && (
          <>
            <FunctionPlot f={Math.exp} color={vc.blue} />
            <Segment from={foot} to={E} extend color={vc.teal} width={2} />
            <Segment from={foot} to={[x, 0]} color={vc.yellow} width={3} />
            <Segment from={[x, 0]} to={E} color={vc.blue} width={1.5} dash="4 4" />
            <MathLabel at={[x - 0.5, 0]} tex="1" color={vc.yellow} anchor="s" />
            <MathLabel at={[x, E[1] / 2]} tex="e^x" color={vc.blue} anchor="e" />
            <MathLabel at={foot} tex="x - 1" anchor="n" offset={12} />
            <Point at={foot} color={vc.teal} r={4} coords={false} />
            <Point
              at={E}
              color={vc.blue}
              r={6}
              label="P"
              onDrag={([v]) => setX(clamp(v, -2.5, 1.8))}
            />
          </>
        )}

        {id === 'base' && (
          <>
            <FunctionPlot f={dbx} color={vc.teal} width={2} dash="6 6" />
            <FunctionPlot f={bx} color={vc.blue} />
            <Segment from={zeroTangent.from} to={zeroTangent.to} color={vc.yellow} width={2.5} />
            <MathLabel
              at={zeroTangent.from}
              tex="\text{slope } \ln b"
              color={vc.yellow}
              anchor="w"
            />
            <Point at={[0, 1]} color={vc.yellow} r={4} coords={false} />
            <Segment from={bTangent.from} to={bTangent.to} color={vc.teal} width={2.5} />
            <Point
              at={B}
              color={vc.blue}
              r={6}
              label="P"
              onDrag={([v]) => setPx(clamp(v, -2, 1.6))}
            />
          </>
        )}

        {id === 'circle' && (
          <>
            <Arc r={1} from={0} to={TAU} color={vc.muted} width={1.5} />
            <Arc r={0.28} from={0} to={theta} color={vc.blue} width={1.5} />
            <MathLabel
              at={[0.42 * Math.cos(theta / 2), 0.42 * Math.sin(theta / 2)]}
              tex="\theta"
              color={vc.blue}
            />
            <Segment from={[0, 0]} to={P} color={vc.blue} width={2} />
            <Arc r={1} from={theta} to={theta + dTheta} color={vc.yellow} width={4} />
            <Segment from={P} to={run} color={vc.red} width={2.5} />
            <Segment from={run} to={step} color={vc.green} width={2.5} />
            <Vector from={P} to={step} color={vc.teal} width={2} />
            <MathLabel
              at={[(P[0] + run[0]) / 2, P[1]]}
              tex="-\sin\theta\,\Delta\theta"
              color={vc.red}
              anchor="s"
              opacity={stepOpacity}
            />
            <MathLabel
              at={[run[0], (run[1] + step[1]) / 2]}
              tex="\cos\theta\,\Delta\theta"
              color={vc.green}
              anchor="w"
              opacity={stepOpacity}
            />
            <Point at={P1} color={vc.yellow} r={4} coords={false} />
            <Point
              at={P}
              color={vc.blue}
              r={6}
              label="P"
              coords={false}
              onDrag={([a, c]) => setTheta((Math.atan2(c, a) + TAU) % TAU)}
            />
          </>
        )}

        {id === 'sine-graph' && (
          <>
            {PI_TICKS.map(([t, tex], i) => (
              <MathLabel key={i} at={[t, 0]} tex={tex} color={vc.muted} anchor="se" offset={4} />
            ))}
            {[-1, 1].map((y, i) => (
              <MathLabel
                key={i}
                at={[0, y]}
                tex={String(y)}
                color={vc.muted}
                anchor="w"
                offset={6}
              />
            ))}
            <FunctionPlot f={Math.cos} color={vc.teal} width={2} dash="6 6" />
            <FunctionPlot f={Math.sin} color={vc.blue} />
            <Segment from={sTangent.from} to={sTangent.to} color={vc.teal} width={2.5} />
            <Segment from={S} to={[sx, Math.cos(sx)]} color={vc.muted} width={1} dash="2 4" />
            <Point at={[sx, Math.cos(sx)]} color={vc.teal} r={4.5} coords={false} />
            <Point
              at={S}
              color={vc.blue}
              r={6}
              label="P"
              onDrag={([v]) => setSx(clamp(v, 0, 6.6))}
            />
          </>
        )}

        {id === 'log' && (
          <>
            <Segment from={[-1, -1]} to={[1, 1]} extend color={vc.muted} width={1} dash="5 5" />
            <MathLabel at={[-1.6, -1.6]} tex="y = x" color={vc.muted} anchor="e" offset={14} />
            <FunctionPlot f={Math.exp} color={vc.blue} />
            <FunctionPlot f={Math.log} domain={[0.005, Infinity]} color={vc.green} />
            <MathLabel at={[1.3, Math.exp(1.3)]} tex="e^x" color={vc.blue} anchor="w" offset={12} />
            <MathLabel at={[4.2, Math.log(4.2)]} tex="\ln x" color={vc.green} anchor="s" />
            <Segment from={L} to={M} color={vc.muted} width={1} dash="2 4" />
            <Segment from={mTangent.from} to={mTangent.to} color={vc.teal} width={2.5} />
            <Segment from={lTangent.from} to={lTangent.to} color={vc.teal} width={2.5} />
            <Point at={M} color={vc.blue} r={5} label="Q" coords={false} />
            <Point
              at={L}
              color={vc.green}
              r={6}
              label="P"
              onDrag={([v]) => setLx(clamp(v, 0.15, 4.2))}
            />
          </>
        )}

        {id === 'real-powers' && (
          <>
            <FunctionPlot f={dxr} domain={[0.001, Infinity]} color={vc.teal} width={2} dash="6 6" />
            <FunctionPlot f={xr} domain={[0.001, Infinity]} color={vc.blue} />
            <Segment from={rTangent.from} to={rTangent.to} color={vc.teal} width={2.5} />
            <Point
              at={R}
              color={vc.blue}
              r={6}
              label="P"
              onDrag={([v]) => setRx(clamp(v, 0.2, 2.8))}
            />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'exp' && (
          <LabeledSlider
            label="$x$"
            value={x}
            onChange={setX}
            min={-2.5}
            max={1.8}
            step={0.01}
            color={vc.blue}
          />
        )}
        {id === 'base' && (
          <>
            <LabeledSlider label="$b$" value={b} onChange={setB} min={0.25} max={4} step={0.05} />
            <LabeledSlider
              label="$x$"
              value={px}
              onChange={(v) => setPx(clamp(v, -2, 1.6))}
              min={-2}
              max={1.6}
              step={0.01}
              color={vc.blue}
            />
          </>
        )}
        {id === 'circle' && (
          <>
            <LabeledSlider
              label="$\theta$"
              value={theta}
              onChange={setTheta}
              min={0}
              max={TAU}
              step={0.01}
              color={vc.blue}
            />
            <LabeledSlider
              label="$\Delta\theta$"
              value={dTheta}
              onChange={stopDTheta}
              min={0.02}
              max={1}
              step={0.01}
              color={vc.yellow}
            />
          </>
        )}
        {id === 'sine-graph' && (
          <LabeledSlider
            label="$x$"
            value={sx}
            onChange={setSx}
            min={0}
            max={6.6}
            step={0.01}
            color={vc.blue}
          />
        )}
        {id === 'log' && (
          <LabeledSlider
            label="$x$"
            value={lx}
            onChange={setLx}
            min={0.15}
            max={4.2}
            step={0.01}
            color={vc.green}
          />
        )}
        {id === 'real-powers' && (
          <>
            <LabeledSlider label="$r$" value={r} onChange={setR} min={-2} max={3} step={0.05} />
            <LabeledSlider
              label="$x$"
              value={rx}
              onChange={setRx}
              min={0.2}
              max={2.8}
              step={0.01}
              color={vc.blue}
            />
          </>
        )}
      </VizControls>
    </>
  )
}
