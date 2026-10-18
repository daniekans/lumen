import { useState } from 'react'
import { clamp, fmt, niceStep, type Vec2 } from '@/lib/math'
import { tex } from '@/lib/practice'
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
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  type ParamCodec,
  VizControls,
} from '@/viz-kit'

const { num } = tex

/** The jump: x + 1 on the left of 1, (2 + k) - (x - 1) from 1 on. */
const jump = (k: number) => (x: number) => (x < 1 ? x + 1 : 2 + k - (x - 1))

const POLE = 2

type Degrees = 'lower' | 'equal' | 'higher'
interface Case {
  f: (x: number) => number
  /** The ratio of the leading terms, drawn dashed. */
  lead: (x: number) => number
  tex: string
  divided: string
  limit: string
}

const CASES: Record<Degrees, Case> = {
  lower: {
    f: (x) => (3 * x + 1) / (x * x + 1),
    lead: (x) => 3 / x,
    tex: '\\frac{3x + 1}{x^2 + 1}',
    divided: '\\frac{\\frac{3}{x} + \\frac{1}{x^2}}{1 + \\frac{1}{x^2}}',
    limit: '0',
  },
  equal: {
    f: (x) => (2 * x * x - 3 * x) / (x * x + 1),
    lead: () => 2,
    tex: '\\frac{2x^2 - 3x}{x^2 + 1}',
    divided: '\\frac{2 - \\frac{3}{x}}{1 + \\frac{1}{x^2}}',
    limit: '2',
  },
  higher: {
    f: (x) => (x ** 3 + x) / (x * x + 4),
    lead: (x) => x,
    tex: '\\frac{x^3 + x}{x^2 + 4}',
    divided: '\\frac{x + \\frac{1}{x}}{1 + \\frac{4}{x^2}}',
    limit: '\\pm\\infty',
  },
}

const degreesCodec: ParamCodec<Degrees> = {
  encode: (v) => v,
  decode: (t) => (t === 'lower' || t === 'equal' || t === 'higher' ? t : undefined),
}
const powerCodec: ParamCodec<1 | 2> = {
  encode: String,
  decode: (t) => (t === '1' ? 1 : t === '2' ? 2 : undefined),
}

const equalCase = CASES.equal.f

/** A value for a readout, with huge ones in scientific notation. */
const show = (v: number) =>
  !Number.isFinite(v) ? 'undefined' : Math.abs(v) >= 1e5 ? v.toExponential(2) : fmt(v, 4)

export default function OneSidedAndInfinite() {
  const { id } = useVizStep()
  const [k, setK] = useVizParam<number>('k', 1)
  const [m, setM] = useVizParam<1 | 2>('m', 1, powerCodec)
  const [degrees, setDegrees] = useVizParam<Degrees>('case', 'equal', degreesCodec)
  // Distance of the two inputs from the point, as a power of ten (d = 10^s).
  const [s, setS] = useState(0)
  // How far out the inputs are in the limit at infinity, as a power of ten (X = 10^t).
  const [t, setT] = useState(0.5)
  const seq = useSequence()

  const tweenS = (from: number, to: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration: 2.2, onUpdate: setS }))

  useStepEffect({
    'one-sided': () => tweenS(0, -1.3),
    'vertical-asymptote': () => tweenS(0, -0.9),
    'at-infinity': () =>
      void seq.run(({ tween }) => tween(0.5, 1.6, { duration: 2.6, onUpdate: setT })),
    'dominant-terms': () => seq.cancel(),
  })

  const d = 10 ** s
  const X = 10 ** t

  const moveNear =
    (a: number) =>
    ([px]: Vec2) => {
      seq.cancel()
      setS(Math.log10(clamp(Math.abs(px - a), 0.01, 1)))
    }
  const moveFar = ([px]: Vec2) => {
    seq.cancel()
    setT(Math.log10(clamp(Math.abs(px), 1, 100)))
  }

  const f = jump(k)
  const pole = (x: number) => 1 / (x - POLE) ** m
  const example = CASES[degrees]

  const span = Math.max(6, 1.3 * X)
  // The stage keeps a uniform scale, so zooming out to large x needs coarser grid lines.
  const gridStep = id === 'at-infinity' ? niceStep(span / 4) : id === 'dominant-terms' ? 2 : 1
  const domain =
    id === 'at-infinity'
      ? { x: [-span, span] as const, y: [-2, 5] as const }
      : id === 'dominant-terms'
        ? { x: [-12, 12] as const, y: [-8, 8] as const }
        : id === 'vertical-asymptote'
          ? { x: [-1, 5] as const, y: [-6, 6] as const }
          : { x: [-1.5, 3.5] as const, y: [-1, 5] as const }

  /** Two inputs at a - d and a + d, with their outputs and guides. */
  const near = (a: number, g: (x: number) => number) =>
    [a - d, a + d].map((x) => {
      const y = g(x)
      return (
        <g key={x < a ? 'left' : 'right'}>
          <Segment
            from={[x, 0]}
            to={[x, clamp(y, -50, 50)]}
            color={vc.yellow}
            width={1.25}
            dash="4 5"
          />
          {Math.abs(y) < 6 && <Point at={[x, y]} color={vc.teal} r={4} />}
          <Point
            at={[x, 0]}
            color={vc.yellow}
            label={x < a ? 'left x' : 'right x'}
            onDrag={moveNear(a)}
          />
        </g>
      )
    })

  const jumpRight = 2 + k
  const twoSided = Math.abs(k) < 1e-9 ? '2' : null

  return (
    <>
      <Stage
        zoomable
        domain={domain}
        ariaLabel="Graphs showing one-sided limits, infinite limits and limits at infinity"
        overlay={
          <Overlay corner="top-left">
            {id === 'one-sided' && (
              <ReadoutPanel title="At x = 1">
                <Readout label="left $x$" value={fmt(1 - d, 4)} color={vc.yellow} />
                <Readout label="$f(x)$" value={fmt(f(1 - d), 4)} color={vc.teal} />
                <Readout label="right $x$" value={fmt(1 + d, 4)} color={vc.yellow} />
                <Readout label="$f(x)$" value={fmt(f(1 + d), 4)} color={vc.teal} />
                <Readout label="from the left" value={<Tex>{'\\lim_{x \\to 1^-} f(x) = 2'}</Tex>} />
                <Readout
                  label="from the right"
                  value={<Tex>{`\\lim_{x \\to 1^+} f(x) = ${num(jumpRight)}`}</Tex>}
                />
                <Readout
                  label="two-sided"
                  value={twoSided ? <Tex>{`\\lim_{x \\to 1} f(x) = 2`}</Tex> : 'does not exist'}
                  hint="The two-sided limit exists exactly when both one-sided limits exist and are equal."
                />
              </ReadoutPanel>
            )}
            {id === 'vertical-asymptote' && (
              <ReadoutPanel title="At x = 2">
                <Readout
                  label="$f(x)$"
                  value={<Tex>{`\\frac{1}{(x - 2)${m === 2 ? '^2' : ''}}`}</Tex>}
                  color={vc.blue}
                />
                <Readout label="left $x$" value={fmt(POLE - d, 4)} color={vc.yellow} />
                <Readout label="$f(x)$" value={show(pole(POLE - d))} color={vc.teal} />
                <Readout label="right $x$" value={fmt(POLE + d, 4)} color={vc.yellow} />
                <Readout label="$f(x)$" value={show(pole(POLE + d))} color={vc.teal} />
                <Readout
                  label="one-sided"
                  value={
                    <Tex>{`\\lim_{x \\to 2^-} = ${m === 1 ? '-' : ''}\\infty,\\ \\lim_{x \\to 2^+} = \\infty`}</Tex>
                  }
                  hint={
                    m === 1
                      ? 'Left of $2$, $x - 2$ is a small negative number, so its reciprocal is a large negative one.'
                      : 'A square is positive on both sides, so both sides grow to $+\\infty$.'
                  }
                />
                <Readout
                  label="two-sided"
                  value={
                    m === 1 ? 'does not exist' : <Tex>{'\\lim_{x \\to 2} f(x) = \\infty'}</Tex>
                  }
                  hint="Even when it is written $\infty$, the limit does not exist as a number. The notation says how it fails."
                />
              </ReadoutPanel>
            )}
            {id === 'at-infinity' && (
              <ReadoutPanel title="Far out">
                <Readout label="$f(x)$" value={<Tex>{CASES.equal.tex}</Tex>} color={vc.blue} />
                <Readout label="$x$" value={fmt(X, 1)} color={vc.yellow} />
                <Readout label="$f(x)$" value={fmt(equalCase(X), 4)} color={vc.teal} />
                <Readout label="$f(-x)$" value={fmt(equalCase(-X), 4)} color={vc.teal} />
                <Readout label="$f(1000)$" value={fmt(equalCase(1000), 5)} />
                <Readout
                  label="limit"
                  value={<Tex>{'\\lim_{x \\to \\pm\\infty} f(x) = 2'}</Tex>}
                  hint="The graph approaches the horizontal asymptote $y = 2$. It may cross it on the way, as it does at $x = -\frac{2}{3}$."
                />
              </ReadoutPanel>
            )}
            {id === 'dominant-terms' && (
              <ReadoutPanel title="Divide by the top power">
                <Readout label="$f(x)$" value={<Tex>{example.tex}</Tex>} color={vc.blue} />
                <Readout
                  label="divided"
                  value={<Tex>{example.divided}</Tex>}
                  hint="Top and bottom divided by the highest power of $x$ in the denominator. The value is unchanged for $x \neq 0$."
                />
                <Readout
                  label="limit"
                  value={<Tex>{`\\lim_{x \\to \\pm\\infty} f(x) = ${example.limit}`}</Tex>}
                  color={vc.yellow}
                  hint={
                    degrees === 'higher'
                      ? 'The top keeps a term $x$, so the quotient grows like $x$: to $+\\infty$ on the right and $-\\infty$ on the left.'
                      : 'Every term with $x$ in a denominator tends to $0$.'
                  }
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid step={gridStep} />
        <Axes step={gridStep} />

        {id === 'one-sided' && (
          <>
            <Segment from={[-5, 2]} to={[1, 2]} color={vc.teal} width={1} dash="4 5" />
            <Segment
              from={[-5, jumpRight]}
              to={[1, jumpRight]}
              color={vc.teal}
              width={1}
              dash="4 5"
            />
            <FunctionPlot f={f} breaks={[1]} color={vc.blue} />
            <Point at={[1, 2]} color={vc.blue} hollow={Math.abs(k) > 1e-9} coords={false} />
            <Point at={[1, jumpRight]} color={vc.blue} />
            {near(1, f)}
          </>
        )}

        {id === 'vertical-asymptote' && (
          <>
            <Segment
              from={[POLE, 0]}
              to={[POLE, 1]}
              extend
              color={vc.teal}
              width={1.25}
              dash="4 5"
            />
            <FunctionPlot f={pole} breaks={[POLE]} color={vc.blue} />
            {near(POLE, pole)}
          </>
        )}

        {id === 'at-infinity' && (
          <>
            <Segment from={[0, 2]} to={[1, 2]} extend color={vc.teal} width={1.25} dash="4 5" />
            <FunctionPlot f={equalCase} color={vc.blue} />
            {[X, -X].map((x) => (
              <g key={x > 0 ? 'right' : 'left'}>
                <Segment
                  from={[x, 0]}
                  to={[x, equalCase(x)]}
                  color={vc.yellow}
                  width={1.25}
                  dash="4 5"
                />
                <Point at={[x, equalCase(x)]} color={vc.teal} r={4} />
                <Point at={[x, 0]} color={vc.yellow} label={x > 0 ? 'x' : '-x'} onDrag={moveFar} />
              </g>
            ))}
            <MathLabel at={[0, 2]} tex="y = 2" color={vc.teal} anchor="ne" offset={8} />
          </>
        )}

        {id === 'dominant-terms' && (
          <>
            <FunctionPlot f={example.lead} breaks={[0]} color={vc.yellow} width={2} dash="5 6" />
            <FunctionPlot f={example.f} color={vc.blue} />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'one-sided' && (
          <LabeledSlider
            label="jump $k$"
            value={k}
            onChange={setK}
            min={-2}
            max={2}
            step={0.5}
            format={(v) => fmt(v, 1)}
            color={vc.blue}
          />
        )}
        {(id === 'one-sided' || id === 'vertical-asymptote') && (
          <LabeledSlider
            label="distance from the point"
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
        {id === 'vertical-asymptote' && (
          <SegmentedControl
            label="Power $m$"
            value={String(m) as '1' | '2'}
            onChange={(v) => setM(v === '2' ? 2 : 1)}
            options={[
              { value: '1', label: '$m = 1$' },
              { value: '2', label: '$m = 2$' },
            ]}
          />
        )}
        {id === 'at-infinity' && (
          <LabeledSlider
            label="$x$"
            value={t}
            onChange={(v) => {
              seq.cancel()
              setT(v)
            }}
            min={0}
            max={2}
            step={0.01}
            format={(v) => fmt(10 ** v, 1)}
            color={vc.yellow}
          />
        )}
        {id === 'dominant-terms' && (
          <SegmentedControl
            label="Degrees"
            value={degrees}
            onChange={setDegrees}
            options={[
              { value: 'lower', label: 'Top lower' },
              { value: 'equal', label: 'Equal' },
              { value: 'higher', label: 'Top higher' },
            ]}
          />
        )}
      </VizControls>
    </>
  )
}
