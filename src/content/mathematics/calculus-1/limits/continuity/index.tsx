import { useState } from 'react'
import { bisection, clamp, fmt, niceStep } from '@/lib/math'
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
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  type ParamCodec,
  VizControls,
} from '@/viz-kit'

/** The continuous base curve the kinds of discontinuity are built from, with g(1) = 2. */
const g = (x: number) => 2 + (x - 1) - 0.3 * (x - 1) ** 2

type Kind = 'continuous' | 'removable' | 'jump' | 'infinite' | 'oscillating'

interface KindSpec {
  f: (x: number) => number
  /** f(1), or undefined. */
  value?: number
  /** The two-sided limit at 1 as TeX, or undefined when it does not exist. */
  limit?: string
  /** The limit from each side, for drawing open circles. */
  left?: number
  right?: number
  breaks?: number[]
  samples?: number
}

const KINDS: Record<Kind, KindSpec> = {
  continuous: { f: g, value: 2, limit: '2', left: 2, right: 2 },
  removable: { f: g, value: 3.5, limit: '2', left: 2, right: 2 },
  jump: { f: (x) => (x < 1 ? g(x) : g(x) - 1.5), value: 0.5, left: 2, right: 0.5, breaks: [1] },
  infinite: { f: (x) => 2 + 1 / (x - 1), breaks: [1] },
  oscillating: {
    f: (x) => (x === 1 ? 2 : 2 + Math.sin(1 / (x - 1))),
    value: 2,
    samples: 6000,
  },
}
const KIND_IDS = Object.keys(KINDS) as Kind[]
const kindCodec: ParamCodec<Kind> = {
  encode: (v) => v,
  decode: (t) => (KIND_IDS.includes(t as Kind) ? (t as Kind) : undefined),
}

const cubic = (x: number) => x ** 3 - x - 1
const BISECTION = bisection(cubic, 1, 2, 16)
const MAX_STEPS = 12

/** A yes or no readout value. */
const check = (ok: boolean) => (ok ? 'yes' : 'no')

export default function Continuity() {
  const { id } = useVizStep()
  const [kind, setKind] = useVizParam<Kind>('kind', 'continuous', kindCodec)
  const [c, setC] = useVizParam<number>('c', -1)
  const [N, setN] = useVizParam<number>('N', 2)
  const [k, setK] = useState(0)
  const seq = useSequence()

  useStepEffect({
    definition: () => setKind('continuous'),
    discontinuities: () => setKind('removable'),
    parameter: () => void seq.run(({ tween }) => tween(-1, 1, { duration: 2.2, onUpdate: setC })),
    ivt: () => void seq.run(({ tween }) => tween(-0.5, 3.5, { duration: 2.6, onUpdate: setN })),
    // Whole steps of the method, one after another.
    bisection: () =>
      void seq.run(async ({ wait }) => {
        for (let i = 0; i <= 6; i++) {
          setK(i)
          await wait(0.9)
        }
      }),
  })
  const stop = () => seq.cancel()

  const spec = KINDS[kind]
  const defined = spec.value !== undefined
  const hasLimit = spec.limit !== undefined
  const equal = defined && hasLimit && Math.abs(spec.value! - Number(spec.limit)) < 1e-9

  // The parameter step.
  const piece = (x: number) => (x < 2 ? x * x + c : 3 * x - 1)
  const joined = Math.abs(4 + c - 5) < 1e-9

  // The IVT step: the c in [1, 2] with f(c) = N, when N is between f(1) and f(2).
  const reached = N >= -1 && N <= 5
  const root = reached
    ? N === -1
      ? 1
      : N === 5
        ? 2
        : bisection((x) => cubic(x) - N, 1, 2, 50).at(-1)!.mid
    : undefined

  // The bisection step: the view follows the current interval.
  const step = BISECTION[k]!
  const width = step.b - step.a
  const view = useAnimatedValue(
    [
      step.mid - 0.9 * width,
      step.mid + 0.9 * width,
      Math.min(step.fa, step.fb) - 0.4 * (step.fb - step.fa),
      Math.max(step.fa, step.fb) + 0.4 * (step.fb - step.fa),
    ] as const,
    { duration: 0.6 },
  )

  const domain =
    id === 'parameter'
      ? { x: [-1, 4] as const, y: [-2, 9] as const }
      : id === 'ivt'
        ? { x: [-0.5, 2.8] as const, y: [-2.5, 6] as const }
        : id === 'bisection'
          ? { x: [view[0], view[1]] as const, y: [view[2], view[3]] as const }
          : { x: [-1, 3.5] as const, y: [-1, 5] as const }
  // The view is taller than wide in stage units, so the y span sets the tick spacing.
  const gridStep = id === 'bisection' ? niceStep((view[3] - view[2]) / 6) : 1

  return (
    <>
      <Stage
        zoomable
        domain={domain}
        ariaLabel="Graphs showing continuity, kinds of discontinuity, the intermediate value theorem and bisection"
        overlay={
          <Overlay corner="top-left">
            {(id === 'definition' || id === 'discontinuities') && (
              <ReadoutPanel title="At a = 1">
                <Readout
                  label="$f(1)$ defined"
                  value={defined ? `yes, $f(1) = ${fmt(spec.value!, 2)}$` : 'no'}
                  color={vc.yellow}
                />
                <Readout
                  label="limit exists"
                  value={hasLimit ? `yes, $\\lim_{x \\to 1} f(x) = ${spec.limit}$` : 'no'}
                  color={vc.teal}
                  hint={
                    kind === 'jump'
                      ? 'The one-sided limits are $2$ and $0.5$.'
                      : kind === 'infinite'
                        ? 'The values go to $-\\infty$ from the left and $\\infty$ from the right.'
                        : kind === 'oscillating'
                          ? 'The values swing between $1$ and $3$ infinitely often near $1$ and settle nowhere.'
                          : undefined
                  }
                />
                <Readout label="equal" value={check(equal)} />
                <Readout
                  label="continuous at $1$"
                  value={check(equal)}
                  color={vc.blue}
                  hint={
                    kind === 'removable'
                      ? 'Redefining $f(1) = 2$ removes the discontinuity, hence the name.'
                      : undefined
                  }
                />
              </ReadoutPanel>
            )}
            {id === 'parameter' && (
              <ReadoutPanel title="At x = 2">
                <Readout
                  label="from the left"
                  value={`$4 + c = ${fmt(4 + c, 1)}$`}
                  color={vc.blue}
                />
                <Readout label="from the right" value="$3 \cdot 2 - 1 = 5$" color={vc.teal} />
                <Readout label="$f(2)$" value="5" color={vc.teal} />
                <Readout
                  label="continuous"
                  value={check(joined)}
                  hint="Each piece is a polynomial, so the only point to check is where they meet."
                />
              </ReadoutPanel>
            )}
            {id === 'ivt' && (
              <ReadoutPanel title="On [1, 2]">
                <Readout label="$f(1)$" value="-1" color={vc.blue} />
                <Readout label="$f(2)$" value="5" color={vc.blue} />
                <Readout label="$N$" value={fmt(N, 2)} color={vc.teal} />
                <Readout
                  label="$c$ with $f(c) = N$"
                  value={root === undefined ? 'not promised' : fmt(root, 4)}
                  color={vc.yellow}
                  hint={
                    root === undefined
                      ? 'The theorem only covers values between $f(1)$ and $f(2)$. Outside them it says nothing.'
                      : 'Here $f$ is increasing on $[1, 2]$, so $c$ is unique. The theorem alone only promises at least one.'
                  }
                />
              </ReadoutPanel>
            )}
            {id === 'bisection' && (
              <ReadoutPanel title="Bisection">
                <Readout label="step" value={String(k)} />
                <Readout
                  label="interval"
                  value={`$[${fmt(step.a, 5)}, ${fmt(step.b, 5)}]$`}
                  color={vc.yellow}
                />
                <Readout
                  label="width"
                  value={fmt(width, 5)}
                  hint="Halved at each step: $2^{-k}$."
                />
                <Readout label="midpoint $m$" value={fmt(step.mid, 5)} color={vc.teal} />
                <Readout
                  label="sign of $f(m)$"
                  value={
                    step.fmid > 0 ? (
                      <Tex>{'+ \\Rightarrow \\text{keep the left half}'}</Tex>
                    ) : (
                      <Tex>{'- \\Rightarrow \\text{keep the right half}'}</Tex>
                    )
                  }
                  hint="$f(a)$ is negative and $f(b)$ positive, so the sign change, and a root, is in the half whose ends differ in sign."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid step={gridStep} />
        <Axes step={gridStep} />

        {(id === 'definition' || id === 'discontinuities') && (
          <>
            {kind === 'infinite' && (
              <Segment from={[1, 0]} to={[1, 1]} extend color={vc.teal} width={1.25} dash="4 5" />
            )}
            <FunctionPlot f={spec.f} breaks={spec.breaks} samples={spec.samples} color={vc.blue} />
            {spec.left !== undefined && spec.left !== spec.value && (
              <Point
                at={[1, spec.left]}
                color={hasLimit ? vc.teal : vc.blue}
                hollow
                coords={false}
              />
            )}
            {spec.right !== undefined && spec.right !== spec.left && spec.right !== spec.value && (
              <Point at={[1, spec.right]} color={vc.blue} hollow coords={false} />
            )}
            {defined && <Point at={[1, spec.value!]} color={vc.yellow} />}
            <MathLabel at={[1, 0]} tex="a" anchor="s" offset={18} color={vc.muted} />
          </>
        )}

        {id === 'parameter' && (
          <>
            <FunctionPlot f={piece} breaks={[2]} color={vc.blue} domain={[-Infinity, 2]} />
            <FunctionPlot f={piece} color={vc.teal} domain={[2, Infinity]} />
            {!joined && <Point at={[2, 4 + c]} color={vc.blue} hollow coords={false} />}
            <Point at={[2, 5]} color={vc.teal} />
            <MathLabel at={[0, c]} tex="x^2 + c" anchor="e" offset={10} color={vc.blue} />
            <MathLabel at={[3.3, 8.9]} tex="3x - 1" anchor="w" offset={10} color={vc.teal} />
          </>
        )}

        {id === 'ivt' && (
          <>
            <FunctionPlot f={cubic} color={vc.blue} opacity={0.35} />
            <FunctionPlot f={cubic} domain={[1, 2]} color={vc.blue} />
            <Segment from={[1, 0]} to={[2, 0]} color={vc.yellow} width={4} opacity={0.5} />
            <Segment from={[0, N]} to={[1, N]} extend color={vc.teal} width={1.5} dash="5 6" />
            <Point at={[1, -1]} color={vc.blue} />
            <Point at={[2, 5]} color={vc.blue} />
            {root !== undefined && (
              <>
                <Segment
                  from={[root, 0]}
                  to={[root, N]}
                  color={vc.yellow}
                  width={1.25}
                  dash="4 5"
                />
                <Point at={[root, N]} color={vc.teal} r={5} />
                <Point at={[root, 0]} color={vc.yellow} label="c" coords={false} />
              </>
            )}
            <Point
              at={[0, N]}
              color={vc.teal}
              label="N"
              onDrag={([, py]) => {
                stop()
                setN(clamp(py, -2.5, 6))
              }}
            />
          </>
        )}

        {id === 'bisection' && (
          <>
            <FunctionPlot f={cubic} color={vc.blue} />
            <Segment
              from={[step.a, 0]}
              to={[step.b, 0]}
              color={vc.yellow}
              width={5}
              opacity={0.6}
            />
            <Segment
              from={[step.a, 0]}
              to={[step.a, step.fa]}
              color={vc.yellow}
              width={1.25}
              dash="4 5"
            />
            <Segment
              from={[step.b, 0]}
              to={[step.b, step.fb]}
              color={vc.yellow}
              width={1.25}
              dash="4 5"
            />
            <Point at={[step.a, step.fa]} color={vc.blue} r={4} />
            <Point at={[step.b, step.fb]} color={vc.blue} r={4} />
            <Segment from={[step.mid, 0]} to={[step.mid, step.fmid]} color={vc.teal} width={1.5} />
            <Point at={[step.mid, step.fmid]} color={vc.teal} r={4} />
            <Point at={[step.mid, 0]} color={vc.teal} label="m" coords={false} />
          </>
        )}
      </Stage>

      <VizControls>
        {(id === 'definition' || id === 'discontinuities') && (
          <SegmentedControl
            label="Kind"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'continuous', label: 'Continuous' },
              { value: 'removable', label: 'Removable' },
              { value: 'jump', label: 'Jump' },
              { value: 'infinite', label: 'Infinite' },
              { value: 'oscillating', label: 'Oscillating' },
            ]}
          />
        )}
        {id === 'parameter' && (
          <LabeledSlider
            label="$c$"
            value={c}
            onChange={(v) => {
              stop()
              setC(v)
            }}
            min={-3}
            max={3}
            step={0.1}
            format={(v) => fmt(v, 1)}
            color={vc.blue}
          />
        )}
        {id === 'ivt' && (
          <LabeledSlider
            label="$N$"
            value={N}
            onChange={(v) => {
              stop()
              setN(v)
            }}
            min={-2.5}
            max={6}
            step={0.05}
            format={(v) => fmt(v, 2)}
            color={vc.teal}
          />
        )}
        {id === 'bisection' && (
          <LabeledSlider
            label="step $k$"
            value={k}
            onChange={(v) => {
              stop()
              setK(Math.round(v))
            }}
            min={0}
            max={MAX_STEPS}
            step={1}
            format={(v) => String(Math.round(v))}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
