import { useState } from 'react'
import { clamp, fmt, type Vec2 } from '@/lib/math'
import { tex } from '@/lib/practice'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
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

const { num, signed } = tex

const Y_MIN = -4
const Y_MAX = 5
const X_LIM = 4.8

type Case = 'lower' | 'equal'
interface Example {
  f: (x: number) => number
  tex: string
  degrees: string
  poles: number[]
  limit: number
}

const EXAMPLES: Record<Case, Example> = {
  lower: {
    f: (x) => (2 * x + 1) / (x * x - 4),
    tex: '\\frac{2x + 1}{x^2 - 4}',
    degrees: '1 < 2',
    poles: [-2, 2],
    limit: 0,
  },
  equal: {
    f: (x) => (2 * x * x - 2) / (x * x - 4),
    tex: '\\frac{2x^2 - 2}{x^2 - 4}',
    degrees: '2 = 2',
    poles: [-2, 2],
    limit: 2,
  },
}

const caseCodec: ParamCodec<Case> = {
  encode: (c) => c,
  decode: (t) => (t === 'lower' || t === 'equal' ? t : undefined),
}
const multCodec: ParamCodec<1 | 2> = {
  encode: String,
  decode: (t) => (t === '1' ? 1 : t === '2' ? 2 : undefined),
}

const slant = (x: number) => (x * x - 1) / (x - 2)

// The sketch: (x + 1)(x - 3)(x - 1) / ((x - 1)(x + 2)(x - 2)), with a hole at x = 1.
const sketch = (x: number) =>
  x === 1 ? NaN : ((x + 1) * (x - 3) * (x - 1)) / ((x - 1) * (x + 2) * (x - 2))
const reduced = (x: number) => ((x + 1) * (x - 3)) / ((x + 2) * (x - 2))
const HOLE: Vec2 = [1, reduced(1)]
const CROSS: Vec2 = [0.5, 1]

/** A value for a readout: a number, or a note when it is undefined or out of reach. */
const show = (v: number) => (Number.isFinite(v) ? fmt(v) : 'undefined')

export default function RationalFunctions() {
  const { id } = useVizStep()
  const [c, setC] = useVizParam<number>('c', 1)
  const [m, setM] = useVizParam<1 | 2>('m', 1, multCodec)
  const [kind, setKind] = useVizParam<Case>('case', 'equal', caseCodec)
  const [x, setX] = useState(3)
  const seq = useSequence()

  const approach = (from: number, to: number) =>
    void seq.run(({ tween }) =>
      tween(from, to, { duration: 1.6, onUpdate: (v) => setX(Math.round(v * 100) / 100) }),
    )

  useStepEffect({
    vertical: () => approach(3, c + 0.25),
    horizontal: () => approach(0, 3.8),
    slant: () => approach(-1, -4),
    sketch: () => seq.cancel(),
  })

  const vertical = (t: number) => 1 / (t - c) ** m
  const example = EXAMPLES[kind]

  /** Poles of the active step, kept a little away from the dragged x. */
  const poles = id === 'vertical' ? [c] : id === 'slant' ? [2] : example.poles
  const moveX = ([px]: Vec2) => {
    seq.cancel()
    let v = Math.round(clamp(px, -X_LIM, id === 'slant' ? 7.5 : X_LIM) * 20) / 20
    for (const p of poles) if (Math.abs(v - p) < 0.05) v = p + (v < p || px < p ? -0.05 : 0.05)
    setX(v)
  }

  const f = id === 'vertical' ? vertical : id === 'slant' ? slant : example.f
  const y = f(x)
  const yMax = id === 'slant' ? 10 : Y_MAX
  const inView = Number.isFinite(y) && y > Y_MIN && y < yMax

  return (
    <>
      <Stage
        zoomable
        domain={id === 'slant' ? { x: [-5, 8], y: [-4, 10] } : { x: [-5, 5], y: [Y_MIN, Y_MAX] }}
        ariaLabel="Graphs of rational functions with their asymptotes"
        overlay={
          <Overlay corner="top-right">
            {id === 'vertical' && (
              <ReadoutPanel title="Near the asymptote">
                <Readout
                  label="$f(x)$"
                  value={<Tex>{`\\frac{1}{(x${signed(-c)})${m === 2 ? '^2' : ''}}`}</Tex>}
                  color={vc.blue}
                />
                <Readout
                  label="asymptote"
                  value={<Tex>{`x = ${num(c)}`}</Tex>}
                  color={vc.teal}
                  hint="The denominator is zero here and the numerator is not, so the values grow without bound."
                />
                <Readout label="$x$" value={fmt(x)} />
                <Readout label="$f(x)$" value={show(y)} />
              </ReadoutPanel>
            )}
            {id === 'horizontal' && (
              <ReadoutPanel title="Far away">
                <Readout label="$f(x)$" value={<Tex>{example.tex}</Tex>} color={vc.blue} />
                <Readout
                  label="degrees"
                  value={<Tex>{example.degrees}</Tex>}
                  hint="Degree of the numerator against degree of the denominator."
                />
                <Readout
                  label="asymptote"
                  value={<Tex>{`y = ${example.limit}`}</Tex>}
                  color={vc.yellow}
                  hint={
                    kind === 'equal'
                      ? 'Equal degrees: the ratio of the leading coefficients, $\\frac{2}{1}$.'
                      : 'The denominator grows faster, so the quotient shrinks to $0$.'
                  }
                />
                <Readout label="$f(x)$" value={show(y)} />
                <Readout label="$f(100)$" value={example.f(100).toFixed(4)} />
              </ReadoutPanel>
            )}
            {id === 'slant' && (
              <ReadoutPanel title="Long division">
                <Readout
                  label="$f(x)$"
                  value={<Tex>{'x + 2 + \\frac{3}{x - 2}'}</Tex>}
                  color={vc.blue}
                />
                <Readout
                  label="asymptote"
                  value={<Tex>{'y = x + 2'}</Tex>}
                  color={vc.yellow}
                  hint="The quotient of the long division. The remainder over $x - 2$ tends to $0$."
                />
                <Readout label="$x$" value={fmt(x)} />
                <Readout
                  label="gap"
                  value={show(3 / (x - 2))}
                  hint="The vertical distance $f(x) - (x + 2) = \frac{3}{x - 2}$."
                />
              </ReadoutPanel>
            )}
            {id === 'sketch' && (
              <ReadoutPanel title="Features">
                <Readout
                  label="$f(x)$"
                  value={<Tex>{'\\frac{(x + 1)(x - 3)(x - 1)}{(x - 1)(x + 2)(x - 2)}'}</Tex>}
                  color={vc.blue}
                />
                <Readout
                  label="hole"
                  value={<Tex>{'\\left(1, \\tfrac{4}{3}\\right)'}</Tex>}
                  hint="$x - 1$ cancels, so $x = 1$ is excluded but the graph does not blow up there."
                />
                <Readout label="vertical" value={<Tex>{'x = -2,\\ x = 2'}</Tex>} color={vc.teal} />
                <Readout
                  label="horizontal"
                  value={<Tex>{'y = 1'}</Tex>}
                  color={vc.yellow}
                  hint="Equal degrees, leading coefficients $1$ and $1$."
                />
                <Readout label="zeros" value={<Tex>{'-1,\\ 3'}</Tex>} />
                <Readout
                  label="crosses $y = 1$"
                  value={<Tex>{'x = \\tfrac{1}{2}'}</Tex>}
                  hint="Solve $\frac{(x + 1)(x - 3)}{(x + 2)(x - 2)} = 1$: $x^2 - 2x - 3 = x^2 - 4$."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {poles.map((p) => (
          <Segment
            key={p}
            from={[p, 0]}
            to={[p, 1]}
            extend
            color={vc.teal}
            width={1.25}
            dash="4 5"
          />
        ))}
        {id === 'horizontal' && (
          <Segment
            from={[0, example.limit]}
            to={[1, example.limit]}
            extend
            color={vc.yellow}
            width={1.5}
            dash="5 6"
          />
        )}
        {id === 'slant' && (
          <Segment from={[0, 2]} to={[1, 3]} extend color={vc.yellow} width={1.5} dash="5 6" />
        )}
        {id === 'sketch' && (
          <>
            <Segment from={[0, 1]} to={[1, 1]} extend color={vc.yellow} width={1.5} dash="5 6" />
            <FunctionPlot f={sketch} breaks={[-2, 1, 2]} color={vc.blue} />
            <Point at={HOLE} color={vc.blue} hollow />
            <Point at={[-1, 0]} color={vc.blue} r={4} />
            <Point at={[3, 0]} color={vc.blue} r={4} />
            <Point at={CROSS} color={vc.yellow} r={4} />
          </>
        )}

        {id !== 'sketch' && (
          <>
            <FunctionPlot f={f} breaks={poles} color={vc.blue} />
            {id === 'slant' && inView && (
              <Segment from={[x, x + 2]} to={[x, y]} color={vc.yellow} width={2} />
            )}
            <Segment
              from={[x, 0]}
              to={[x, clamp(Number.isFinite(y) ? y : 0, Y_MIN - 50, Y_MAX + 50)]}
              color={vc.blue}
              width={1.25}
              dash="4 5"
            />
            {inView && <Point at={[x, y]} color={vc.blue} />}
            <Point at={[x, 0]} color={vc.blue} label="x" onDrag={moveX} />
          </>
        )}
        {id === 'vertical' && (
          <>
            <Point
              at={[c, 0]}
              color={vc.teal}
              r={4}
              label="c"
              onDrag={([px]) => {
                seq.cancel()
                const next = Math.round(clamp(px, -3, 3) * 2) / 2
                if (Math.abs(next - x) < 0.05) setX(next + 0.5)
                setC(next)
              }}
            />
            <MathLabel at={[c, 0]} tex="c" color={vc.teal} anchor="s" offset={22} />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'vertical' && (
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
        {id === 'horizontal' && (
          <SegmentedControl
            label="Degrees"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'lower', label: 'Numerator lower' },
              { value: 'equal', label: 'Equal' },
            ]}
          />
        )}
      </VizControls>
    </>
  )
}
