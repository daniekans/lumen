import { clamp, fmt, largestDelta } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  Band,
  FunctionPlot,
  Grid,
  MathLabel,
  Overlay,
  type ParamCodec,
  Point,
  Stage,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const line = (x: number) => 2 * x + 1
const square = (x: number) => x * x
const f = (x: number) => (x + 1) / 2
const g = (x: number) => 2 + 1.2 * Math.sin(x - 1)
const sum = (x: number) => f(x) + g(x)
const step = (x: number) => (x < 0 ? -1 : 1)

type Rule = 'min' | 'third'
const ruleCodec: ParamCodec<Rule> = {
  encode: (v) => v,
  decode: (t) => (t === 'min' || t === 'third' ? t : undefined),
}

/** f where it leaves the band, NaN elsewhere: the parts of the graph that escape. */
const escaping = (h: (x: number) => number, center: number, eps: number) => (x: number) => {
  const y = h(x)
  return Math.abs(y - center) >= eps ? y : NaN
}

export default function EpsilonDeltaProofs() {
  const { id } = useVizStep()
  const [eps, setEps] = useVizParam<number>('eps', 1)
  const [rule, setRule] = useVizParam<Rule>('rule', 'min', ruleCodec)
  const [delta, setDelta] = useVizParam<number>('delta', 0.8)
  const [claim, setClaim] = useVizParam<number>('L', 0.3)
  const seq = useSequence()

  useStepEffect({
    definition: () =>
      void seq.run(({ tween }) => tween(1.6, 0.8, { duration: 2, onUpdate: setEps })),
    linear: () => void seq.run(({ tween }) => tween(1.2, 0.3, { duration: 2.4, onUpdate: setEps })),
    quadratic: () => {
      setRule('min')
      void seq.run(({ tween }) => tween(2, 0.6, { duration: 2.4, onUpdate: setEps }))
    },
    restriction: () => {
      seq.cancel()
      setEps(6)
      setRule('third')
    },
    'sum-law': () =>
      void seq.run(({ tween }) => tween(1.6, 0.6, { duration: 2.4, onUpdate: setEps })),
    'no-limit': () => {
      setClaim(0.3)
      void seq.run(({ tween }) => tween(1.2, 0.2, { duration: 2.4, onUpdate: setDelta }))
    },
  })
  const stop = () => seq.cancel()

  const linearMode = id === 'definition' || id === 'linear'
  const quadMode = id === 'quadratic' || id === 'restriction'
  const sumMode = id === 'sum-law'
  const jumpMode = id === 'no-limit'

  // The function, its limit point and the delta the proof chooses, per mode.
  const quadDelta = rule === 'min' ? Math.min(1, eps / 3) : eps / 3
  const deltaF = largestDelta(f, 1, 1, eps / 2, 3).delta
  const deltaG = largestDelta(g, 1, 2, eps / 2, 3).delta
  const [h, a, L, d, e] = linearMode
    ? [line, 1, 3, eps / 2, eps]
    : quadMode
      ? [square, 1, 1, quadDelta, eps]
      : sumMode
        ? [sum, 1, 3, Math.min(deltaF, deltaG), eps]
        : [step, 0, claim, delta, 1]
  const works = largestDelta(h, a, L, e, Math.max(d, 1e-6)).delta >= d - 1e-9

  // The no-limit step: one input on each side of 0, inside the window.
  const x1 = -d / 2
  const x2 = d / 2

  const domain = quadMode
    ? id === 'restriction'
      ? { x: [-2, 4] as const, y: [-1, 10] as const }
      : { x: [-1, 3] as const, y: [-1, 4] as const }
    : jumpMode
      ? { x: [-2, 2] as const, y: [-2, 2] as const }
      : { x: [-1, 3] as const, y: [-0.5, 5] as const }
  const gridStep = id === 'restriction' ? 2 : 1

  return (
    <>
      <Stage
        zoomable
        domain={domain}
        ariaLabel="A graph with an epsilon band around the limit and the delta window a proof chooses"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title={jumpMode ? 'Both sides' : 'The proof'}>
              <Readout label="$\varepsilon$" value={fmt(e, 2)} color={vc.teal} />
              {linearMode && (
                <Readout
                  label="$\delta = \frac{\varepsilon}{2}$"
                  value={fmt(d, 3)}
                  color={vc.yellow}
                />
              )}
              {quadMode && (
                <>
                  <Readout
                    label={
                      rule === 'min'
                        ? '$\\delta = \\min(1, \\frac{\\varepsilon}{3})$'
                        : '$\\delta = \\frac{\\varepsilon}{3}$'
                    }
                    value={fmt(d, 3)}
                    color={vc.yellow}
                  />
                  <Readout
                    label="$|x + 1|$ in the window"
                    value={`$< ${fmt(2 + d, 3)}$`}
                    hint="The proof needs this below $3$, which holds only when $\delta \le 1$."
                  />
                </>
              )}
              {sumMode && (
                <>
                  <Readout label="$\delta_f$ for $\frac{\varepsilon}{2}$" value={fmt(deltaF, 3)} />
                  <Readout label="$\delta_g$ for $\frac{\varepsilon}{2}$" value={fmt(deltaG, 3)} />
                  <Readout label="$\delta = \min$" value={fmt(d, 3)} color={vc.yellow} />
                </>
              )}
              {jumpMode && (
                <>
                  <Readout label="$L$" value={fmt(L, 2)} color={vc.teal} />
                  <Readout
                    label="$|f(x_1) - L|$"
                    value={fmt(Math.abs(-1 - L), 2)}
                    hint="$x_1 = -\frac{\delta}{2}$, on the left, where $f = -1$."
                  />
                  <Readout
                    label="$|f(x_2) - L|$"
                    value={fmt(Math.abs(1 - L), 2)}
                    hint="$x_2 = \frac{\delta}{2}$, on the right, where $f = 1$."
                  />
                </>
              )}
              <Readout
                label="window works"
                value={works ? 'yes' : 'no'}
                color={works ? undefined : vc.red}
                hint={
                  jumpMode
                    ? 'The two distances add up to at least $2$, so they cannot both be less than $1$.'
                    : 'Checked for every $x$ with $0 < |x - a| < \\delta$.'
                }
              />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid step={gridStep} />
        <Axes step={gridStep} />

        {sumMode && (
          <>
            <Band
              axis="y"
              from={1 - e / 2}
              to={1 + e / 2}
              color={vc.teal}
              opacity={0.06}
              edges={false}
            />
            <Band
              axis="y"
              from={2 - e / 2}
              to={2 + e / 2}
              color={vc.teal}
              opacity={0.06}
              edges={false}
            />
            <Band
              axis="x"
              from={1 - deltaF}
              to={1 + deltaF}
              color={vc.yellow}
              opacity={0.06}
              edges={false}
            />
            <Band
              axis="x"
              from={1 - deltaG}
              to={1 + deltaG}
              color={vc.yellow}
              opacity={0.06}
              edges={false}
            />
            <FunctionPlot f={f} color={vc.muted} width={1.5} />
            <FunctionPlot f={g} color={vc.muted} width={1.5} />
            <MathLabel at={[2.8, f(2.8)]} tex="f" anchor="s" offset={10} color={vc.muted} />
            <MathLabel at={[2.8, g(2.8)]} tex="g" anchor="n" offset={10} color={vc.muted} />
            <MathLabel at={[2.4, sum(2.4)]} tex="f + g" anchor="nw" offset={10} color={vc.blue} />
          </>
        )}

        <Band axis="y" from={L - e} to={L + e} color={vc.teal} />
        <Band axis="x" from={a - d} to={a + d} color={vc.yellow} />

        <FunctionPlot f={h} breaks={jumpMode ? [0] : undefined} color={vc.blue} opacity={0.45} />
        <FunctionPlot
          f={h}
          breaks={jumpMode ? [0] : undefined}
          domain={[a - d, a + d]}
          color={vc.blue}
          width={3.5}
        />
        <FunctionPlot
          f={escaping(h, L, e)}
          breaks={jumpMode ? [0] : undefined}
          domain={[a - d, a + d]}
          color={vc.red}
          width={4}
          dash="2 4"
        />

        {jumpMode ? (
          <>
            <Point at={[0, -1]} color={vc.blue} hollow coords={false} />
            <Point at={[0, 1]} color={vc.blue} />
            <Point at={[x1, -1]} color={vc.yellow} r={4} coords={false} />
            <Point at={[x2, 1]} color={vc.yellow} r={4} coords={false} />
            <MathLabel at={[x1, -1]} tex="x_1" anchor="s" offset={12} color={vc.yellow} />
            <MathLabel at={[x2, 1]} tex="x_2" anchor="n" offset={12} color={vc.yellow} />
            <MathLabel at={[-1.5, L]} tex="L" anchor="e" offset={12} color={vc.teal} />
            <Point
              at={[-1.5, L]}
              color={vc.teal}
              label="L"
              onDrag={([, py]) => {
                stop()
                setClaim(clamp(py, -1.8, 1.8))
              }}
            />
          </>
        ) : (
          <>
            <Point at={[a, L]} color={vc.blue} coords={false} />
            <MathLabel at={[0, L]} tex="L" anchor="e" offset={10} color={vc.teal} />
            <MathLabel at={[a, 0]} tex="a" anchor="s" offset={18} color={vc.muted} />
          </>
        )}
      </Stage>

      <VizControls>
        {quadMode && (
          <SegmentedControl
            label="Rule"
            value={rule}
            onChange={(v) => {
              stop()
              setRule(v)
            }}
            options={[
              { value: 'min', label: '$\\min(1, \\frac{\\varepsilon}{3})$' },
              { value: 'third', label: '$\\frac{\\varepsilon}{3}$' },
            ]}
          />
        )}
        {!jumpMode && (
          <LabeledSlider
            label="$\varepsilon$"
            value={eps}
            onChange={(v) => {
              stop()
              setEps(v)
            }}
            min={0.1}
            max={quadMode ? 8 : 2}
            step={0.05}
            format={(v) => fmt(v, 2)}
            color={vc.teal}
          />
        )}
        {jumpMode && (
          <LabeledSlider
            label="$\delta$"
            value={delta}
            onChange={(v) => {
              stop()
              setDelta(v)
            }}
            min={0.05}
            max={1.5}
            step={0.01}
            format={(v) => fmt(v, 2)}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
