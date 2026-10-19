import { useState } from 'react'
import { clamp, compoundFactor, fmt, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
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
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

/** Compounding periods per year the slider steps through. */
const PERIODS = [1, 2, 4, 12, 52, 365]

/** The opening animation stops at monthly compounding, where the steps are still visible. */
const MONTHLY = PERIODS.indexOf(12)

const VIEWS = {
  compounding: [-0.25, 1.25, -0.2, 3.2],
  'slope-at-zero': [-3, 3, -1, 5],
  'slope-equals-height': [-3, 3, -1, 5],
  'continuous-growth': [-1, 6, -1, 8],
} as const

/** Balance over one year with n compounding periods: a staircase from 1 to (1 + 1/n)^n. */
const staircase = (n: number): Vec2[] => {
  const pts: Vec2[] = [[0, 1]]
  for (let k = 0; k < n; k++) {
    const v = (1 + 1 / n) ** k
    pts.push([(k + 1) / n, v], [(k + 1) / n, v * (1 + 1 / n)])
  }
  return pts
}

export default function TheNumberE() {
  const { id } = useVizStep()
  const [periodIndex, setPeriodIndex] = useVizParam<number>('n', MONTHLY)
  const [b, setB] = useVizParam<number>('b', 2)
  const [r, setR] = useVizParam<number>('r', 0.5)
  const [x0, setX0] = useState(1)
  const seq = useSequence()

  useStepEffect({
    compounding: () =>
      void seq.run(({ tween }) =>
        tween(0, MONTHLY + 0.99, {
          duration: 3,
          onUpdate: (i) => setPeriodIndex(Math.floor(i)),
        }),
      ),
    'slope-at-zero': () =>
      void seq.run(({ tween }) => tween(2, Math.E, { duration: 1.6, onUpdate: setB })),
    'slope-equals-height': () => setX0(1),
    'continuous-growth': () =>
      void seq.run(({ tween }) => tween(0, 0.5, { duration: 1.4, onUpdate: setR })),
  })

  const view = VIEWS[id as keyof typeof VIEWS] ?? VIEWS['slope-at-zero']
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(view, { duration: 0.9 })

  const n = PERIODS[clamp(periodIndex, 0, PERIODS.length - 1)]!
  const year = compoundFactor(1, n)

  const slope0 = Math.log(b)
  const y0 = Math.exp(x0)
  const moveP = ([px]: Vec2) => setX0(Math.round(clamp(px, -2, 1.5) * 10) / 10)

  // Readouts use r rounded to the slider step, so they do not flicker during the transition.
  const rs = Math.round(r * 20) / 20
  const doubling = Math.log(2) / rs

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Exponential curves and the number e"
        overlay={
          <Overlay corner="top-right">
            {id === 'compounding' && (
              <ReadoutPanel title="One year at 100%">
                <Readout
                  label="periods $n$"
                  value={String(n)}
                  hint="How many times a year the interest is added to the balance."
                />
                <Readout
                  label="each period"
                  value={<Tex>{`\\times\\left(1 + \\tfrac{1}{${n}}\\right)`}</Tex>}
                />
                <Readout
                  label="end of year"
                  value={
                    <Tex>{`\\left(1 + \\tfrac{1}{${n}}\\right)^{${n}} \\approx ${fmt(year, 4)}`}</Tex>
                  }
                  color={vc.yellow}
                />
                <Readout label="$e$" value={fmt(Math.E, 4)} color={vc.blue} />
              </ReadoutPanel>
            )}
            {id === 'slope-at-zero' && (
              <ReadoutPanel title="At x = 0">
                <Readout label="$f(x)$" value={<Tex>{`${fmt(b)}^x`}</Tex>} color={vc.blue} />
                <Readout
                  label="slope at $0$"
                  value={fmt(slope0, 3)}
                  color={vc.yellow}
                  hint="The slope of the tangent line at $(0, 1)$, the limit of $\frac{b^h - 1}{h}$ as $h \to 0$."
                />
              </ReadoutPanel>
            )}
            {id === 'slope-equals-height' && (
              <ReadoutPanel title="At P">
                <Readout label="$f(x)$" value={<Tex>{'e^x'}</Tex>} color={vc.blue} />
                <Readout label="$x$" value={fmt(x0, 1)} />
                <Readout label="height $e^x$" value={fmt(y0)} color={vc.yellow} />
                <Readout
                  label="slope"
                  value={fmt(y0)}
                  hint="Rise over run of the tangent: the height, over a run of $1$."
                />
              </ReadoutPanel>
            )}
            {id === 'continuous-growth' && (
              <ReadoutPanel title="Growth at rate r">
                <Readout
                  label="continuous"
                  value={<Tex>{`e^{${fmt(rs)}t}`}</Tex>}
                  color={vc.blue}
                />
                <Readout label="yearly" value={<Tex>{`${fmt(1 + rs)}^t`}</Tex>} color={vc.yellow} />
                <Readout
                  label="after $1$ year"
                  value={`${fmt(Math.exp(rs), 3)} vs ${fmt(1 + rs, 3)}`}
                />
                <Readout
                  label="after $4$ years"
                  value={`${fmt(Math.exp(4 * rs), 2)} vs ${fmt((1 + rs) ** 4, 2)}`}
                />
                <Readout
                  label="doubling time"
                  value={
                    rs > 0 ? <Tex>{`\\frac{\\ln 2}{r} \\approx ${fmt(doubling)}`}</Tex> : 'none'
                  }
                  hint="$e^{rd} = 2$ when $rd = \ln 2$."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {id === 'compounding' && (
          <>
            <Segment
              from={[0, Math.E]}
              to={[1, Math.E]}
              extend
              color={vc.blue}
              width={1.25}
              dash="4 6"
            />
            <FunctionPlot f={Math.exp} domain={[0, 1]} color={vc.blue} />
            <Path points={staircase(n)} color={vc.yellow} width={2} />
            <Point at={[1, year]} color={vc.yellow} />
            <MathLabel at={[0.5, Math.E]} tex="e" color={vc.blue} anchor="n" offset={6} />
          </>
        )}

        {id === 'slope-at-zero' && (
          <>
            <FunctionPlot f={Math.exp} color={vc.muted} width={1.5} dash="4 6" />
            <FunctionPlot f={(x) => b ** x} color={vc.blue} />
            <Segment from={[0, 1]} to={[1, 1 + slope0]} extend color={vc.yellow} width={2} />
            <Point at={[0, 1]} color={vc.yellow} />
          </>
        )}

        {id === 'slope-equals-height' && (
          <>
            <FunctionPlot f={Math.exp} color={vc.blue} />
            <Segment from={[x0 - 1, 0]} to={[x0, y0]} extend color={vc.yellow} width={2} />
            <Segment from={[x0, 0]} to={[x0, y0]} color={vc.yellow} width={2} dash="5 5" />
            <Segment from={[x0 - 1, 0]} to={[x0, 0]} color={vc.teal} width={3} />
            <MathLabel at={[x0 - 0.5, 0]} tex="1" color={vc.teal} anchor="s" offset={8} />
            <MathLabel at={[x0, y0 / 2]} tex="e^x" color={vc.yellow} anchor="e" offset={8} />
            <Point at={[x0, y0]} color={vc.blue} label="P" onDrag={moveP} />
            <MathLabel at={[x0, y0]} tex="P" color={vc.blue} anchor="nw" offset={14} />
          </>
        )}

        {id === 'continuous-growth' && (
          <>
            <FunctionPlot f={(t) => (1 + r) ** t} color={vc.yellow} width={2} dash="5 6" />
            <FunctionPlot f={(t) => Math.exp(r * t)} color={vc.blue} />
            <Point at={[4, Math.exp(4 * r)]} color={vc.blue} r={4.5} />
            <Point at={[4, (1 + r) ** 4]} color={vc.yellow} r={4.5} />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'compounding' && (
          <LabeledSlider
            label="periods per year"
            value={periodIndex}
            onChange={(i) => {
              seq.cancel()
              setPeriodIndex(i)
            }}
            min={0}
            max={PERIODS.length - 1}
            step={1}
            format={(i) => String(PERIODS[i] ?? '')}
            color={vc.teal}
          />
        )}
        {id === 'slope-at-zero' && (
          <LabeledSlider
            label="$b$"
            value={b}
            onChange={(v) => {
              seq.cancel()
              setB(v)
            }}
            min={1.2}
            max={4}
            step={0.01}
            format={(v) => fmt(v)}
            color={vc.blue}
          />
        )}
        {id === 'continuous-growth' && (
          <LabeledSlider
            label="rate $r$"
            value={r}
            onChange={(v) => {
              seq.cancel()
              setR(v)
            }}
            min={-0.5}
            max={1}
            step={0.05}
            format={(v) => fmt(v)}
            color={vc.blue}
          />
        )}
      </VizControls>
    </>
  )
}
