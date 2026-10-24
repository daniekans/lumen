import { useState } from 'react'
import { clamp, fmt, tangentPiece, type Fn, type Interval } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  AxisInterval,
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
  type ParamCodec,
  VizControls,
} from '@/viz-kit'

/** The traced function: f' = 0.6(x - 1)(x - 3), zero at 1 and 3, lowest at 2. */
const f = (x: number) => 0.2 * x ** 3 - 1.2 * x ** 2 + 1.8 * x + 1
const df = (x: number) => 0.6 * x ** 2 - 2.4 * x + 1.8

const X_MIN = 0
const X_MAX = 5.2
const A = 2

const corner = (x: number) => Math.abs(x - A) + 1
const dCorner = (x: number) => (x === A ? NaN : Math.sign(x - A))

type Kink = 'cusp' | 'vertical'
const KINKS: Record<Kink, { f: Fn; df: Fn; tex: string }> = {
  cusp: {
    f: (x) => Math.cbrt((x - A) ** 2) + 1,
    df: (x) => 2 / 3 / Math.cbrt(x - A),
    tex: 'f(x) = (x - 2)^{2/3} + 1',
  },
  vertical: {
    f: (x) => Math.cbrt(x - A) + 2,
    df: (x) => 1 / (3 * Math.cbrt((x - A) ** 2)),
    tex: 'f(x) = \\sqrt[3]{x - 2} + 2',
  },
}
const kinkCodec: ParamCodec<Kink> = {
  encode: (v) => v,
  decode: (t) => (t === 'cusp' || t === 'vertical' ? t : undefined),
}

type Op = 'square' | 'cubic' | 'reciprocal' | 'root'
const OPS: Record<Op, { f: Fn; df: Fn; tex: string; dtex: string; breaks?: number[] }> = {
  square: { f: (x) => x * x, df: (x) => 2 * x, tex: 'x^2', dtex: '2x' },
  cubic: {
    f: (x) => x ** 3 - 3 * x,
    df: (x) => 3 * x * x - 3,
    tex: 'x^3 - 3x',
    dtex: '3x^2 - 3',
  },
  reciprocal: {
    f: (x) => 1 / x,
    df: (x) => -1 / (x * x),
    tex: '\\frac{1}{x}',
    dtex: '-\\frac{1}{x^2}',
    breaks: [0],
  },
  root: {
    f: (x) => (x < 0 ? NaN : Math.sqrt(x)),
    df: (x) => (x <= 0 ? NaN : 1 / (2 * Math.sqrt(x))),
    tex: '\\sqrt{x}',
    dtex: '\\frac{1}{2\\sqrt{x}}',
  },
}
const opCodec: ParamCodec<Op> = {
  encode: (v) => v,
  decode: (t) => (t in OPS ? (t as Op) : undefined),
}

const VIEWS = {
  graph: [-0.6, 5.6, -1.4, 5.2],
  operator: [-3.4, 3.4, -3.2, 4.2],
} as const

const RISING: Interval[] = [
  { from: X_MIN, to: 1 },
  { from: 3, to: X_MAX },
]
const FALLING: Interval[] = [{ from: 1, to: 3 }]

export default function DerivativeFunction() {
  const { id } = useVizStep()
  const [x, setX] = useState(0.2)
  const [h, setH] = useState(1.5)
  const [kink, setKink] = useVizParam<Kink>('kink', 'cusp', kinkCodec)
  const [op, setOp] = useVizParam<Op>('fn', 'square', opCodec)
  const seq = useSequence()
  const start = useStepStart({ x, h })

  const sweep = (from: number, to: number, duration: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration, onUpdate: setX }))
  const shrink = (from: number) =>
    void seq.run(({ tween }) => tween(from, 0.02, { duration: 2.4, onUpdate: setH }))

  useStepEffect({
    trace: (run) => sweep(run.replay ? X_MIN : start(run).x, X_MAX, 4),
    read: (run) => sweep(start(run).x, A, 1.2),
    corner: () => shrink(1.5),
    cusp: () => shrink(1.5),
    operator: () => seq.cancel(),
  })

  const graphStep = id === 'trace' || id === 'read'
  const kinkStep = id === 'corner' || id === 'cusp'
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(id === 'operator' ? VIEWS.operator : VIEWS.graph, {
    duration: 1.2,
  })

  const moveX = (v: number) => {
    seq.cancel()
    setX(clamp(v, X_MIN, X_MAX))
  }
  const moveH = (v: number) => {
    seq.cancel()
    setH(clamp(v, 0.01, 2))
  }

  const P = [x, f(x)] as const
  const m = df(x)
  const piece = tangentPiece(P, m, 0.9)

  const g = id === 'corner' ? { f: corner, df: dCorner } : KINKS[kink]
  const O = [A, g.f(A)] as const
  const R = [A + h, g.f(A + h)] as const
  const L = [A - h, g.f(A - h)] as const
  const rightSlope = (R[1] - O[1]) / h
  const leftSlope = (O[1] - L[1]) / h

  const o = OPS[op]

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Graph of a function and its derivative"
        overlay={
          <Overlay corner="top-left">
            {graphStep && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(x)} />
                <Readout
                  label="$f(x)$"
                  value={fmt(f(x))}
                  color={vc.blue}
                  hint="$f(x) = 0.2x^3 - 1.2x^2 + 1.8x + 1$"
                />
                <Readout
                  label="slope $f'(x)$"
                  value={fmt(m)}
                  color={vc.teal}
                  hint="$f'(x) = 0.6x^2 - 2.4x + 1.8 = 0.6(x - 1)(x - 3)$"
                />
              </ReadoutPanel>
            )}
            {kinkStep && (
              <ReadoutPanel title="Secant slopes at x = 2">
                <Readout
                  label="$f$"
                  value={<Tex>{id === 'corner' ? 'f(x) = |x - 2| + 1' : KINKS[kink].tex}</Tex>}
                  color={vc.blue}
                />
                <Readout label="$h$" value={fmt(h, 3)} />
                <Readout
                  label="from the right"
                  value={fmt(rightSlope, 2)}
                  color={vc.yellow}
                  hint="$\frac{f(2 + h) - f(2)}{h}$"
                />
                <Readout
                  label="from the left"
                  value={fmt(leftSlope, 2)}
                  color={vc.orange}
                  hint="$\frac{f(2) - f(2 - h)}{h}$"
                />
              </ReadoutPanel>
            )}
            {id === 'operator' && (
              <ReadoutPanel>
                <Readout label="$f(x)$" value={<Tex>{o.tex}</Tex>} color={vc.blue} />
                <Readout
                  label="$\frac{d}{dx} f(x)$"
                  value={<Tex>{o.dtex}</Tex>}
                  color={vc.teal}
                  hint="Each follows from the limit definition, as in the practice."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {graphStep && (
          <>
            {id === 'read' && (
              <>
                <AxisInterval set={RISING} axis="x" color={vc.green} opacity={0.8} />
                <AxisInterval set={FALLING} axis="x" color={vc.red} opacity={0.8} />
                {[1, 3].map((r) => (
                  <g key={r}>
                    <Segment from={[r, 0]} to={[r, f(r)]} color={vc.muted} width={1} dash="3 5" />
                    <Point at={[r, 0]} color={vc.teal} r={4.5} />
                  </g>
                ))}
                <Point at={[A, df(A)]} color={vc.teal} r={4.5} />
                <MathLabel at={[A, df(A)]} tex="f'(2) = -0.6" color={vc.teal} anchor="s" />
              </>
            )}
            <FunctionPlot
              f={df}
              domain={id === 'trace' ? [X_MIN, x] : [X_MIN, X_MAX]}
              color={vc.teal}
              width={2.5}
            />
            <FunctionPlot f={f} domain={[X_MIN, X_MAX]} color={vc.blue} />
            <MathLabel at={[2.8, f(2.8)]} tex="f" color={vc.blue} anchor="n" offset={10} />
            <MathLabel
              at={[0.4, df(0.4)]}
              tex="f'"
              color={vc.teal}
              anchor="w"
              offset={10}
              opacity={id === 'trace' && x < 0.4 ? 0 : 1}
            />
            <Segment from={P} to={[x, m]} color={vc.muted} width={1} dash="2 4" />
            <Segment from={piece.from} to={piece.to} color={vc.teal} width={2.5} />
            <Point at={[x, m]} color={vc.teal} r={5} coords={false} />
            <Point at={P} color={vc.blue} r={6} label="P" onDrag={([px]) => moveX(px)} />
            <MathLabel at={P} tex="P" color={vc.blue} anchor="nw" offset={12} />
          </>
        )}

        {kinkStep && (
          <>
            {id === 'corner' ? (
              <>
                <FunctionPlot f={dCorner} breaks={[A]} color={vc.teal} width={2} dash="6 6" />
                <Point at={[A, -1]} color={vc.teal} hollow r={4.5} coords={false} />
                <Point at={[A, 1]} color={vc.teal} hollow r={4.5} coords={false} />
              </>
            ) : (
              <FunctionPlot f={g.df} breaks={[A]} color={vc.teal} width={2} dash="6 6" />
            )}
            <MathLabel at={[4.6, g.df(4.6)]} tex="f'" color={vc.teal} anchor="s" offset={10} />
            <Segment from={O} to={R} extend color={vc.yellow} width={4} opacity={0.6} />
            <Segment from={O} to={L} extend color={vc.orange} width={4} opacity={0.6} />
            <FunctionPlot f={g.f} color={vc.blue} />
            <Point at={R} color={vc.yellow} r={5.5} onDrag={([px]) => moveH(px - A)} />
            <Point at={L} color={vc.orange} r={5.5} onDrag={([px]) => moveH(A - px)} />
            <Point at={O} color={vc.blue} r={6} />
          </>
        )}

        {id === 'operator' && (
          <>
            <FunctionPlot f={o.df} breaks={o.breaks} color={vc.teal} />
            <FunctionPlot f={o.f} breaks={o.breaks} color={vc.blue} />
          </>
        )}
      </Stage>

      <VizControls>
        {graphStep && (
          <LabeledSlider
            label="$x$"
            value={x}
            onChange={moveX}
            min={X_MIN}
            max={X_MAX}
            step={0.01}
            color={vc.blue}
          />
        )}
        {kinkStep && (
          <LabeledSlider
            label="$h$"
            value={h}
            onChange={moveH}
            min={0.01}
            max={2}
            step={0.01}
            color={vc.yellow}
            format={(v) => fmt(v, 2)}
          />
        )}
        {id === 'cusp' && (
          <SegmentedControl
            label="Kind"
            value={kink}
            onChange={setKink}
            options={[
              { value: 'cusp', label: 'Cusp' },
              { value: 'vertical', label: 'Vertical tangent' },
            ]}
          />
        )}
        {id === 'operator' && (
          <SegmentedControl
            label="$f(x)$"
            value={op}
            onChange={setOp}
            options={[
              { value: 'square', label: '$x^2$' },
              { value: 'cubic', label: '$x^3 - 3x$' },
              { value: 'reciprocal', label: '$\\frac{1}{x}$' },
              { value: 'root', label: '$\\sqrt{x}$' },
            ]}
          />
        )}
      </VizControls>
    </>
  )
}
