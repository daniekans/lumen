import { useState } from 'react'
import { clamp, fmt, linePiece, tangentPiece, type Vec2 } from '@/lib/math'
import { TAU } from '@/lib/math/trig'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
  useAnimatedValue,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const VIEWS = {
  circle: [-8, 8, -6.4, 6.4],
  implicit: [-3.4, 3.4, -2.7, 2.7],
  inverse: [-4.2, 4.2, -3.4, 3.4],
  arctan: [-4.6, 4.6, -2.2, 2.2],
  logDiff: [-0.5, 2.5, -1.4, 3.4],
} as const

/**
 * A closed curve traced by `at(t)` for t in [t0, t0 + 2π], with a vertical tangent at t0 and
 * t0 + π, so each half is the graph of one function y(x).
 */
interface ImplicitCurve {
  at: (t: number) => Vec2
  /** Direction of travel, along the tangent. */
  velocity: (t: number) => Vec2
  /** The parameter of the curve point nearest a dragged point. */
  param: (p: Vec2) => number
  t0: number
  /** Where the equation is written. */
  labelAt: Vec2
}

const R = 5
const circle: ImplicitCurve = {
  at: (t) => [R * Math.cos(t), R * Math.sin(t)],
  velocity: (t) => [-Math.sin(t), Math.cos(t)],
  param: ([x, y]) => Math.atan2(y, x),
  t0: 0,
  labelAt: [-3.8, 3.8],
}

/** The same circle split at its horizontal tangents, so each half is a graph x(y). */
const circleInY: ImplicitCurve = { ...circle, t0: Math.PI / 2 }

/** x² + xy + y² = 3, an ellipse along the diagonals. */
const S3 = Math.sqrt(3)
const tilted: ImplicitCurve = {
  at: (t) => [Math.cos(t) + S3 * Math.sin(t), Math.cos(t) - S3 * Math.sin(t)],
  velocity: (t) => [-Math.sin(t) + S3 * Math.cos(t), -Math.sin(t) - S3 * Math.cos(t)],
  param: ([x, y]) => Math.atan2((x - y) / 2 / S3, (x + y) / 2),
  t0: Math.PI / 3,
  labelAt: [0.9, 1.6],
}

const tracePoints = (c: ImplicitCurve, from: number, to: number, n = 160): Vec2[] =>
  Array.from({ length: n + 1 }, (_, i) => c.at(from + ((to - from) * i) / n))

/** The half of the curve that contains parameter t: the local graph y(x) through that point. */
const localHalf = (c: ImplicitCurve, t: number): Vec2[] => {
  const k = Math.floor((t - c.t0) / Math.PI)
  return tracePoints(c, c.t0 + k * Math.PI, c.t0 + (k + 1) * Math.PI)
}

function CurveWithTangent({
  curve,
  t,
  setT,
  label,
}: {
  curve: ImplicitCurve
  t: number
  setT: (t: number) => void
  label: string
}) {
  const P = curve.at(t)
  const tangent = linePiece(P, curve.velocity(t), 1.6)
  return (
    <>
      <Path points={tracePoints(curve, 0, TAU, 240)} color={vc.muted} width={2} closed />
      <Path points={localHalf(curve, t)} color={vc.blue} width={3} />
      <MathLabel at={curve.labelAt} tex={label} anchor="ne" color={vc.muted} />
      <Point at={curve.at(curve.t0)} color={vc.muted} r={4} hollow coords={false} />
      <Point at={curve.at(curve.t0 + Math.PI)} color={vc.muted} r={4} hollow coords={false} />
      <Segment from={tangent.from} to={tangent.to} color={vc.teal} width={2.5} />
      <Point at={P} color={vc.blue} r={6} label="P" onDrag={(p) => setT(curve.param(p))} />
    </>
  )
}

/** The slope -num/den, or 'undefined' at a vertical tangent. */
const slopeText = (num: number, den: number) =>
  Math.abs(den) < 1e-6 ? 'undefined' : fmt(-num / den, 3)

/** f(x) = 0.2x³ + 0.5x + 1.5, increasing, so it has an inverse. */
const f = (x: number) => 0.2 * x ** 3 + 0.5 * x + 1.5
const df = (x: number) => 0.6 * x * x + 0.5

const arctanDerivative = (x: number) => 1 / (1 + x * x)
const xx = (x: number) => x ** x
const dxx = (x: number) => x ** x * (Math.log(x) + 1)

/** Normalizes an angle to [t0, t0 + 2π). */
const wrap = (t: number, t0: number) => t0 + ((((t - t0) % TAU) + TAU) % TAU)

export default function ImplicitAndInverse() {
  const { id } = useVizStep()
  const [theta, setTheta] = useState(Math.atan2(4, 3))
  const [phi, setPhi] = useState(TAU)
  const [s, setS] = useState(2.2)
  const [a, setA] = useState(0.6)
  const [ax, setAx] = useState(1)
  const [lx, setLx] = useState(1.5)

  const view =
    id === 'implicit'
      ? VIEWS.implicit
      : id === 'inverse'
        ? VIEWS.inverse
        : id === 'arctan'
          ? VIEWS.arctan
          : id === 'log-diff'
            ? VIEWS.logDiff
            : VIEWS.circle
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(view, { duration: 1.2 })

  const setCircleT = (t: number) => setTheta(wrap(t, circle.t0))
  const setTiltedT = (t: number) => setS(wrap(t, tilted.t0))
  const setPhiT = (t: number) => setPhi(wrap(t, circleInY.t0))
  const [cx, cy] = circle.at(theta)
  const [yx, yy] = circle.at(phi)
  const [ex, ey] = tilted.at(s)

  // Inverse: slope triangles of run h at P on f and, mirrored, at Q on its inverse.
  const fa = f(a)
  const m = df(a)
  const h = 0.8
  const tri: Vec2[] = [
    [a, fa],
    [a + h, fa],
    [a + h, fa + m * h],
  ]
  const mirrored = tri.map(([u, v]) => [v, u] as Vec2)
  const inverse = tracePoints(
    { at: (t) => [f(t), t], velocity: () => [1, 0], param: () => 0, t0: 0, labelAt: [0, 0] },
    -2.8,
    2.8,
  )

  const A: Vec2 = [ax, Math.atan(ax)]
  const L: Vec2 = [lx, xx(lx)]
  const dragA = (v: number) => setA(clamp(v, -2.2, 1.6))

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Curves given by equations with their tangent lines, a function reflected into its inverse, and the graphs of arctangent and x to the x"
        overlay={
          <Overlay corner="top-right">
            {id === 'circle' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(cx, 2)} />
                <Readout label="$y$" value={fmt(cy, 2)} />
                <Readout
                  label="$\frac{dy}{dx} = -\frac{x}{y}$"
                  value={slopeText(cx, cy)}
                  color={vc.teal}
                  hint="Undefined where $y = 0$: the tangent is vertical."
                />
              </ReadoutPanel>
            )}
            {id === 'in-y' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(yx, 2)} />
                <Readout label="$y$" value={fmt(yy, 2)} />
                <Readout
                  label="$\frac{dy}{dx} = -\frac{x}{y}$"
                  value={slopeText(yx, yy)}
                  hint="Undefined where $y = 0$: the tangent is vertical."
                />
                <Readout
                  label="$\frac{dx}{dy} = -\frac{y}{x}$"
                  value={slopeText(yy, yx)}
                  color={vc.teal}
                  hint="Undefined where $x = 0$, at the two hollow points: there the tangent is horizontal."
                />
              </ReadoutPanel>
            )}
            {id === 'implicit' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(ex, 2)} />
                <Readout label="$y$" value={fmt(ey, 2)} />
                <Readout
                  label="$\frac{dy}{dx} = -\frac{2x + y}{x + 2y}$"
                  value={slopeText(2 * ex + ey, ex + 2 * ey)}
                  color={vc.teal}
                  hint="Undefined where $x + 2y = 0$, at the two hollow points."
                />
              </ReadoutPanel>
            )}
            {id === 'inverse' && (
              <ReadoutPanel>
                <Readout label="$a$" value={fmt(a, 2)} color={vc.blue} />
                <Readout label="$f(a)$" value={fmt(fa, 3)} color={vc.purple} />
                <Readout label="$f'(a)$" value={fmt(m, 3)} color={vc.teal} />
                <Readout
                  label="$\left(f^{-1}\right)'(f(a))$"
                  value={fmt(1 / m, 3)}
                  color={vc.teal}
                  hint="The slope of the inverse at the mirrored point $Q$: $\frac{1}{f'(a)}$."
                />
              </ReadoutPanel>
            )}
            {id === 'arctan' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(ax, 2)} />
                <Readout label="$y = \arctan x$" value={fmt(A[1], 3)} color={vc.blue} />
                <Readout
                  label="$\frac{1}{1 + x^2}$"
                  value={fmt(arctanDerivative(ax), 3)}
                  color={vc.teal}
                  hint="Equal to $\cos^2 y$, since $\tan y = x$."
                />
              </ReadoutPanel>
            )}
            {id === 'log-diff' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(lx, 2)} />
                <Readout label="$x^x$" value={fmt(L[1], 3)} color={vc.blue} />
                <Readout label="$\ln x + 1$" value={fmt(Math.log(lx) + 1, 3)} />
                <Readout label="$x^x(\ln x + 1)$" value={fmt(dxx(lx), 3)} color={vc.teal} />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {id === 'circle' && (
          <CurveWithTangent curve={circle} t={theta} setT={setCircleT} label="x^2 + y^2 = 25" />
        )}
        {id === 'in-y' && (
          <CurveWithTangent curve={circleInY} t={phi} setT={setPhiT} label="x^2 + y^2 = 25" />
        )}
        {id === 'implicit' && (
          <CurveWithTangent curve={tilted} t={s} setT={setTiltedT} label="x^2 + xy + y^2 = 3" />
        )}

        {id === 'inverse' && (
          <>
            <Segment from={[-1, -1]} to={[1, 1]} extend color={vc.muted} width={1} dash="4 6" />
            <FunctionPlot f={f} color={vc.blue} />
            <Path points={inverse} color={vc.purple} width={2.5} />
            <MathLabel at={[1.3, f(1.3)]} tex="f" color={vc.blue} anchor="w" offset={12} />
            <MathLabel at={[f(1.3), 1.3]} tex="f^{-1}" color={vc.purple} anchor="s" offset={12} />
            <Path points={tri} closed color={vc.teal} width={1.5} fill={alpha(vc.teal, 0.2)} />
            <Path points={mirrored} closed color={vc.teal} width={1.5} fill={alpha(vc.teal, 0.2)} />
            <MathLabel at={[a + h / 2, fa]} tex="h" anchor="s" />
            <MathLabel at={[a + h, fa + (m * h) / 2]} tex="f'(a)\,h" anchor="e" />
            <MathLabel at={[fa, a + h / 2]} tex="h" anchor="w" />
            <MathLabel at={[fa + (m * h) / 2, a + h]} tex="f'(a)\,h" anchor="n" />
            <Point at={[fa, a]} color={vc.purple} r={6} label="Q" onDrag={([, v]) => dragA(v)} />
            <Point at={[a, fa]} color={vc.blue} r={6} label="P" onDrag={([v]) => dragA(v)} />
          </>
        )}

        {id === 'arctan' && (
          <>
            {[1, -1].map((k) => (
              <Segment
                key={k}
                from={[0, (k * Math.PI) / 2]}
                to={[1, (k * Math.PI) / 2]}
                extend
                color={vc.muted}
                width={1}
                dash="4 6"
              />
            ))}
            <MathLabel at={[-3.8, Math.PI / 2]} tex="\frac{\pi}{2}" anchor="n" />
            <MathLabel at={[-3.8, -Math.PI / 2]} tex="-\frac{\pi}{2}" anchor="s" />
            <FunctionPlot f={arctanDerivative} color={vc.teal} width={2} dash="6 6" />
            <FunctionPlot f={Math.atan} color={vc.blue} />
            <Segment {...tangentPiece(A, arctanDerivative(ax), 1.4)} color={vc.teal} width={2.5} />
            <Segment
              from={A}
              to={[ax, arctanDerivative(ax)]}
              color={vc.muted}
              width={1}
              dash="2 4"
            />
            <Point at={[ax, arctanDerivative(ax)]} color={vc.teal} r={4.5} coords={false} />
            <Point
              at={A}
              color={vc.blue}
              r={6}
              label="P"
              onDrag={([v]) => setAx(clamp(v, -4.2, 4.2))}
            />
          </>
        )}

        {id === 'log-diff' && (
          <>
            <FunctionPlot f={dxx} color={vc.teal} width={2} dash="6 6" domain={[0.02, 2.4]} />
            <FunctionPlot f={xx} color={vc.blue} domain={[0.001, 2.4]} />
            <Point at={[1 / Math.E, xx(1 / Math.E)]} color={vc.muted} r={4} hollow coords={false} />
            <Segment {...tangentPiece(L, dxx(lx), 0.6)} color={vc.teal} width={2.5} />
            <Segment from={L} to={[lx, dxx(lx)]} color={vc.muted} width={1} dash="2 4" />
            <Point at={[lx, dxx(lx)]} color={vc.teal} r={4.5} coords={false} />
            <Point
              at={L}
              color={vc.blue}
              r={6}
              label="P"
              onDrag={([v]) => setLx(clamp(v, 0.1, 2))}
            />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'circle' && (
          <LabeledSlider
            label="Position of $P$"
            value={theta}
            onChange={setTheta}
            min={0}
            max={TAU}
            step={0.01}
            color={vc.blue}
          />
        )}
        {id === 'in-y' && (
          <LabeledSlider
            label="Position of $P$"
            value={phi}
            onChange={setPhiT}
            min={circleInY.t0}
            max={circleInY.t0 + TAU}
            step={0.01}
            color={vc.blue}
          />
        )}
        {id === 'implicit' && (
          <LabeledSlider
            label="Position of $P$"
            value={s}
            onChange={setS}
            min={tilted.t0}
            max={tilted.t0 + TAU}
            step={0.01}
            color={vc.blue}
          />
        )}
        {id === 'inverse' && (
          <LabeledSlider
            label="$a$"
            value={a}
            onChange={dragA}
            min={-2.2}
            max={1.6}
            step={0.01}
            color={vc.blue}
          />
        )}
        {id === 'arctan' && (
          <LabeledSlider
            label="$x$"
            value={ax}
            onChange={setAx}
            min={-4.2}
            max={4.2}
            step={0.01}
            color={vc.blue}
          />
        )}
        {id === 'log-diff' && (
          <LabeledSlider
            label="$x$"
            value={lx}
            onChange={setLx}
            min={0.1}
            max={2}
            step={0.01}
            color={vc.blue}
          />
        )}
      </VizControls>
    </>
  )
}
