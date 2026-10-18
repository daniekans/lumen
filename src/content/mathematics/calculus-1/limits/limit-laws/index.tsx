import { useState } from 'react'
import { clamp, fmt, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
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

// The laws step: f -> 2 and g -> 3 as x -> 1.
const f = (x: number) => x + 1
const g = (x: number) => 4 - x * x

type Op = 'sum' | 'product' | 'quotient'
const OPS: Record<Op, { h: (x: number) => number; tex: string; limit: string; breaks?: number[] }> =
  {
    sum: { h: (x) => f(x) + g(x), tex: 'f + g', limit: '2 + 3 = 5' },
    product: { h: (x) => f(x) * g(x), tex: 'f \\cdot g', limit: '2 \\cdot 3 = 6' },
    quotient: {
      h: (x) => f(x) / g(x),
      tex: '\\frac{f}{g}',
      limit: '\\frac{2}{3}',
      breaks: [-2, 2],
    },
  }
const opCodec: ParamCodec<Op> = {
  encode: (v) => v,
  decode: (t) => (t === 'sum' || t === 'product' || t === 'quotient' ? t : undefined),
}

interface Example {
  h: (x: number) => number
  a: number
  tex: string
  substitute: string
  rewrite?: string
  limit: string
  /** True when the graph has a hole at a, false for a pole, undefined when f(a) is defined. */
  hole?: boolean
  breaks?: number[]
  domain: { x: readonly [number, number]; y: readonly [number, number] }
}

const EXAMPLES: Record<string, Example> = {
  substitution: {
    h: (x) => x ** 3 - 3 * x + 1,
    a: 2,
    tex: 'x^3 - 3x + 1',
    substitute: '2^3 - 3 \\cdot 2 + 1 = 3',
    limit: '3',
    domain: { x: [-2.5, 3.5], y: [-3, 8] },
  },
  factor: {
    h: (x) => (x === 3 ? NaN : (x * x - 9) / (x - 3)),
    a: 3,
    tex: '\\frac{x^2 - 9}{x - 3}',
    substitute: '\\frac{0}{0}',
    rewrite: '\\frac{(x - 3)(x + 3)}{x - 3} = x + 3',
    limit: '6',
    hole: true,
    domain: { x: [-1, 6], y: [-1, 9] },
  },
  rationalize: {
    h: (x) => (x === 4 ? NaN : (x - 4) / (Math.sqrt(x) - 2)),
    a: 4,
    tex: '\\frac{x - 4}{\\sqrt{x} - 2}',
    substitute: '\\frac{0}{0}',
    rewrite: '\\frac{(x - 4)(\\sqrt{x} + 2)}{x - 4} = \\sqrt{x} + 2',
    limit: '4',
    hole: true,
    domain: { x: [-1, 8], y: [-1, 6] },
  },
  combine: {
    h: (x) => (x === 2 ? NaN : (1 / x - 1 / 2) / (x - 2)),
    a: 2,
    tex: '\\frac{\\frac{1}{x} - \\frac{1}{2}}{x - 2}',
    substitute: '\\frac{0}{0}',
    rewrite: '\\frac{2 - x}{2x(x - 2)} = -\\frac{1}{2x}',
    limit: '-\\frac{1}{4}',
    hole: true,
    breaks: [0],
    domain: { x: [-1, 5], y: [-1.5, 0.75] },
  },
  'nonzero-over-zero': {
    h: (x) => (x + 1) / (x - 1),
    a: 1,
    tex: '\\frac{x + 1}{x - 1}',
    substitute: '\\frac{2}{0}',
    limit: '-\\infty \\text{ and } \\infty',
    hole: false,
    breaks: [1],
    domain: { x: [-3, 5], y: [-8, 8] },
  },
}

/** A value for a readout, with huge ones in scientific notation. */
const show = (v: number) =>
  !Number.isFinite(v) ? 'undefined' : Math.abs(v) >= 1e5 ? v.toExponential(2) : fmt(v, 4)

export default function LimitLaws() {
  const { id } = useVizStep()
  const [op, setOp] = useVizParam<Op>('op', 'sum', opCodec)
  const [x, setX] = useState(2.2)
  // Distance of the two inputs from a, as a power of ten (d = 10^s).
  const [s, setS] = useState(0)
  const seq = useSequence()

  const shrink = () =>
    void seq.run(({ tween }) => tween(0, -1.2, { duration: 2.2, onUpdate: setS }))

  useStepEffect({
    laws: () =>
      void seq.run(({ tween }) =>
        tween(2.2, 1.05, { duration: 2, onUpdate: (v) => setX(Math.round(v * 100) / 100) }),
      ),
    substitution: shrink,
    factor: shrink,
    rationalize: shrink,
    combine: shrink,
    'nonzero-over-zero': shrink,
  })

  const moveX = ([px]: Vec2) => {
    seq.cancel()
    setX(Math.round(clamp(px, -1.4, 2.9) * 100) / 100)
  }

  const ex = id ? EXAMPLES[id] : undefined
  const d = 10 ** s
  const combo = OPS[op]

  const moveNear = ([px]: Vec2) => {
    if (!ex) return
    seq.cancel()
    setS(Math.log10(clamp(Math.abs(px - ex.a), 0.01, 1)))
  }

  return (
    <>
      <Stage
        zoomable
        domain={ex?.domain ?? { x: [-1.5, 3], y: [-2, 8] }}
        ariaLabel="Graphs of functions whose limits are evaluated with the limit laws"
        overlay={
          <Overlay corner="top-left">
            {!ex && (
              <ReadoutPanel title="As x approaches 1">
                <Readout label="$f(x)$" value={<Tex>{'x + 1'}</Tex>} color={vc.blue} />
                <Readout label="$g(x)$" value={<Tex>{'4 - x^2'}</Tex>} color={vc.yellow} />
                <Readout label="$x$" value={fmt(x)} />
                <Readout label="$f(x)$" value={fmt(f(x), 3)} color={vc.blue} />
                <Readout label="$g(x)$" value={fmt(g(x), 3)} color={vc.yellow} />
                <Readout label={`$${combo.tex}$`} value={show(combo.h(x))} color={vc.teal} />
                <Readout
                  label="limit"
                  value={<Tex>{combo.limit}</Tex>}
                  color={vc.teal}
                  hint={
                    op === 'quotient'
                      ? 'The quotient law needs the limit of the denominator to be nonzero. Here it is $3$.'
                      : 'The limits of $f$ and $g$ exist, so the limit of the combination is the same combination of the limits.'
                  }
                />
              </ReadoutPanel>
            )}
            {ex && (
              <ReadoutPanel title={`As x approaches ${ex.a}`}>
                <Readout label="$f(x)$" value={<Tex>{ex.tex}</Tex>} color={vc.blue} />
                <Readout
                  label="substitute"
                  value={<Tex>{ex.substitute}</Tex>}
                  hint={
                    ex.hole === undefined
                      ? 'The function is defined at $a$ and built from the limit laws, so its value is the limit.'
                      : ex.hole
                        ? 'An indeterminate form: top and bottom both tend to $0$, and their race decides the limit.'
                        : 'The top tends to $2$ and the bottom to $0$: the quotient grows without bound.'
                  }
                />
                {ex.rewrite && <Readout label="for $x \neq a$" value={<Tex>{ex.rewrite}</Tex>} />}
                <Readout label="left" value={show(ex.h(ex.a - d))} color={vc.teal} />
                <Readout label="right" value={show(ex.h(ex.a + d))} color={vc.teal} />
                <Readout label="limit" value={<Tex>{ex.limit}</Tex>} color={vc.teal} />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {!ex && (
          <>
            <Segment from={[1, 0]} to={[1, 1]} extend color={vc.muted} width={1} dash="4 5" />
            <FunctionPlot f={f} color={vc.blue} width={2} />
            <FunctionPlot f={g} color={vc.yellow} width={2} />
            <FunctionPlot f={combo.h} breaks={combo.breaks} color={vc.teal} />
            <Point at={[x, f(x)]} color={vc.blue} r={4} />
            <Point at={[x, g(x)]} color={vc.yellow} r={4} />
            {Math.abs(combo.h(x)) < 8 && <Point at={[x, combo.h(x)]} color={vc.teal} />}
            <Point at={[x, 0]} color={vc.fg} label="x" onDrag={moveX} />
          </>
        )}

        {ex && (
          <>
            {ex.hole === false && (
              <Segment
                from={[ex.a, 0]}
                to={[ex.a, 1]}
                extend
                color={vc.teal}
                width={1.25}
                dash="4 5"
              />
            )}
            <FunctionPlot f={ex.h} breaks={[...(ex.breaks ?? []), ex.a]} color={vc.blue} />
            {ex.hole && (
              <Point at={[ex.a, ex.h(ex.a + 1e-9)]} color={vc.blue} hollow coords={false} />
            )}
            {ex.hole === undefined && <Point at={[ex.a, ex.h(ex.a)]} color={vc.blue} />}
            {[ex.a - d, ex.a + d].map((xi) => {
              const yi = ex.h(xi)
              const [y0, y1] = ex.domain.y
              return (
                <g key={xi < ex.a ? 'left' : 'right'}>
                  <Segment
                    from={[xi, 0]}
                    to={[xi, clamp(yi, y0 - 50, y1 + 50)]}
                    color={vc.yellow}
                    width={1.25}
                    dash="4 5"
                  />
                  {yi > y0 && yi < y1 && <Point at={[xi, yi]} color={vc.teal} r={4} />}
                  <Point
                    at={[xi, 0]}
                    color={vc.yellow}
                    label={xi < ex.a ? 'left x' : 'right x'}
                    onDrag={moveNear}
                  />
                </g>
              )
            })}
          </>
        )}
      </Stage>

      <VizControls>
        {!ex && (
          <SegmentedControl
            label="Combination"
            value={op}
            onChange={setOp}
            options={[
              { value: 'sum', label: '$f + g$' },
              { value: 'product', label: '$f \\cdot g$' },
              { value: 'quotient', label: '$\\frac{f}{g}$' },
            ]}
          />
        )}
        {ex && (
          <LabeledSlider
            label="distance from $a$"
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
      </VizControls>
    </>
  )
}
