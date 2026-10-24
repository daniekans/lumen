import { useState } from 'react'
import { clamp, fmt, type Vec2, tangentPiece } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
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
  useSequence,
  useStepEffect,
  useStepStart,
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

/** Product steps: the width f and the height g of the rectangle. */
const f = (x: number) => 0.5 * x + 1
const df = () => 0.5
const g = (x: number) => 0.25 * x * x + 1
const dg = (x: number) => 0.5 * x

/** Quotient step: the area F, the height G and the width Q = F / G. */
const F = (x: number) => 0.5 * x * x + 1
const dF = (x: number) => x
const G = (x: number) => 0.5 * x + 1
const dG = () => 0.5
const Q = (x: number) => F(x) / G(x)
const dQ = (x: number) => (dF(x) * G(x) - F(x) * dG()) / G(x) ** 2

const VIEWS = {
  rectangle: [-0.7, 4.3, -0.7, 4.6],
  quotient: [-0.7, 3.8, -0.7, 4.0],
  powers: [-3, 3, -4, 4],
} as const

const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
]

interface RectLabels {
  area: string
  width: string
  height: string
  dWidth: string
  dHeight: string
  /** Strip to the right (height times the change in width) and strip on top. */
  right: string
  top: string
}

/** A w by h rectangle that grows by dw and dh: the old area, two strips and a corner. */
function GrowingRectangle({
  w,
  h,
  dw,
  dh,
  labels,
}: {
  w: number
  h: number
  dw: number
  dh: number
  labels: RectLabels
}) {
  const small = Math.min(dw, dh)
  const opacity = clamp((small - 0.08) / 0.2, 0, 1)
  return (
    <>
      <Path
        points={rect(0, 0, w, h)}
        closed
        color={vc.blue}
        width={1.5}
        fill={alpha(vc.blue, 0.2)}
      />
      <Path
        points={rect(w, 0, w + dw, h)}
        closed
        color={vc.teal}
        width={1.5}
        fill={alpha(vc.teal, 0.35)}
      />
      <Path
        points={rect(0, h, w, h + dh)}
        closed
        color={vc.purple}
        width={1.5}
        fill={alpha(vc.purple, 0.35)}
      />
      <Path
        points={rect(w, h, w + dw, h + dh)}
        closed
        color={vc.yellow}
        width={1.5}
        fill={alpha(vc.yellow, 0.45)}
      />
      <MathLabel at={[w / 2, h / 2]} tex={labels.area} color={vc.blue} />
      <MathLabel at={[w / 2, 0]} tex={labels.width} anchor="s" />
      <MathLabel at={[0, h / 2]} tex={labels.height} anchor="w" />
      <MathLabel at={[w + dw / 2, 0]} tex={labels.dWidth} anchor="s" opacity={opacity} />
      <MathLabel at={[0, h + dh / 2]} tex={labels.dHeight} anchor="w" opacity={opacity} />
      <MathLabel
        at={[w + dw, h / 2]}
        tex={labels.right}
        color={vc.teal}
        anchor="e"
        offset={8}
        opacity={opacity}
      />
      <MathLabel
        at={[w / 2, h + dh]}
        tex={labels.top}
        color={vc.purple}
        anchor="n"
        offset={8}
        opacity={opacity}
      />
    </>
  )
}

export default function ProductAndQuotientRules() {
  const { id } = useVizStep()
  const [x, setX] = useState(1.6)
  const [dx, setDx] = useState(0.8)
  const [n, setN] = useVizParam<number>('n', 1)
  const [px, setPx] = useState(1)
  const seq = useSequence()
  const start = useStepStart(dx)

  const tweenDx = (from: number, to: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration: 2, onUpdate: setDx }))

  useStepEffect({
    rectangle: (run) => tweenDx(run.replay ? start(run) : 0.05, 0.8),
    limit: (run) => tweenDx(run.replay ? start(run) : 0.8, 0.05),
    quotient: (run) => tweenDx(run.replay ? start(run) : 0.05, 0.6),
    'negative-powers': () => seq.cancel(),
  })

  const view =
    id === 'quotient' ? VIEWS.quotient : id === 'negative-powers' ? VIEWS.powers : VIEWS.rectangle
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(view, { duration: 1.2 })

  const stop =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      seq.cancel()
      set(v)
    }

  const x1 = x + dx
  const product = id === 'rectangle' || id === 'limit'
  const [w, h, dw, dh] = product
    ? [f(x), g(x), f(x1) - f(x), g(x1) - g(x)]
    : [Q(x), G(x), Q(x1) - Q(x), G(x1) - G(x)]

  const power = (t: number) => t ** -n
  const dPower = (t: number) => -n * t ** (-n - 1)
  const P: Vec2 = [px, power(px)]
  const tangent = tangentPiece(P, dPower(px), 0.7)
  const dragP = (v: number) => {
    const s = v < 0 ? -1 : 1
    setPx(s * clamp(Math.abs(v), 0.5, 2.6))
  }

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="A growing rectangle behind the product and quotient rules, and graphs of negative powers"
        overlay={
          <Overlay corner="top-right">
            {product && (
              <ReadoutPanel title="Area">
                <Readout label="$x$" value={fmt(x)} />
                <Readout label="$\Delta x$" value={fmt(dx, 3)} />
                <Readout
                  label="$\frac{\Delta (fg)}{\Delta x}$"
                  value={fmt((f(x1) * g(x1) - f(x) * g(x)) / dx, 3)}
                  hint="The whole gain in area, strips and corner, divided by $\Delta x$."
                />
                <Readout label="$f'g$" value={fmt(df() * g(x), 3)} color={vc.teal} />
                <Readout label="$fg'$" value={fmt(f(x) * dg(x), 3)} color={vc.purple} />
                <Readout
                  label="$f'g + fg'$"
                  value={fmt(df() * g(x) + f(x) * dg(x), 3)}
                  hint="$f(x) = \frac{1}{2}x + 1$ and $g(x) = \frac{1}{4}x^2 + 1$ here."
                />
              </ReadoutPanel>
            )}
            {id === 'quotient' && (
              <ReadoutPanel title="Width">
                <Readout label="$x$" value={fmt(x)} />
                <Readout label="$\Delta x$" value={fmt(dx, 3)} />
                <Readout
                  label="$q = \frac{f}{g}$"
                  value={fmt(Q(x), 3)}
                  hint="$f(x) = \frac{1}{2}x^2 + 1$ and $g(x) = \frac{1}{2}x + 1$ here."
                />
                <Readout label="$\frac{\Delta q}{\Delta x}$" value={fmt((Q(x1) - Q(x)) / dx, 3)} />
                <Readout label="$\frac{f'g - fg'}{g^2}$" value={fmt(dQ(x), 3)} color={vc.teal} />
              </ReadoutPanel>
            )}
            {id === 'negative-powers' && (
              <ReadoutPanel>
                <Readout
                  label="$f(x)$"
                  value={<Tex>{`\\frac{1}{${n === 1 ? 'x' : `x^{${n}}`}} = x^{-${n}}`}</Tex>}
                  color={vc.blue}
                />
                <Readout label="$x$" value={fmt(px)} />
                <Readout
                  label="$-nx^{-n-1}$"
                  value={<Tex>{`${n === 1 ? '-' : -n}x^{${-n - 1}} = ${fmt(dPower(px), 3)}`}</Tex>}
                  color={vc.teal}
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes labels={id === 'negative-powers'} />

        {product && (
          <GrowingRectangle
            w={w}
            h={h}
            dw={dw}
            dh={dh}
            labels={{
              area: 'fg',
              width: 'f(x)',
              height: 'g(x)',
              dWidth: '\\Delta f',
              dHeight: '\\Delta g',
              right: 'g\\,\\Delta f',
              top: 'f\\,\\Delta g',
            }}
          />
        )}
        {id === 'quotient' && (
          <GrowingRectangle
            w={w}
            h={h}
            dw={dw}
            dh={dh}
            labels={{
              area: 'f = qg',
              width: 'q(x)',
              height: 'g(x)',
              dWidth: '\\Delta q',
              dHeight: '\\Delta g',
              right: 'g\\,\\Delta q',
              top: 'q\\,\\Delta g',
            }}
          />
        )}

        {id === 'negative-powers' && (
          <>
            <FunctionPlot f={dPower} color={vc.teal} width={2} dash="6 6" breaks={[0]} />
            <FunctionPlot f={power} color={vc.blue} breaks={[0]} />
            <Segment from={tangent.from} to={tangent.to} color={vc.teal} width={2.5} />
            <Segment from={P} to={[px, dPower(px)]} color={vc.muted} width={1} dash="2 4" />
            <Point at={[px, dPower(px)]} color={vc.teal} r={4.5} coords={false} />
            <Point at={P} color={vc.blue} r={6} label="P" onDrag={([v]) => dragP(v)} />
          </>
        )}
      </Stage>

      <VizControls>
        {id !== 'negative-powers' && (
          <>
            <LabeledSlider
              label="$x$"
              value={x}
              onChange={setX}
              min={0.5}
              max={2.5}
              step={0.01}
              color={vc.blue}
            />
            <LabeledSlider
              label="$\Delta x$"
              value={dx}
              onChange={stop(setDx)}
              min={0.02}
              max={1}
              step={0.01}
            />
          </>
        )}
        {id === 'negative-powers' && (
          <>
            <LabeledSlider
              label="$n$"
              value={n}
              onChange={(v) => setN(Math.round(v))}
              min={1}
              max={3}
              step={1}
            />
            <LabeledSlider
              label="$x$"
              value={px}
              onChange={dragP}
              min={-2.6}
              max={2.6}
              step={0.01}
              color={vc.blue}
            />
          </>
        )}
      </VizControls>
    </>
  )
}
