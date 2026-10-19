import { useState } from 'react'
import { clamp, fmt, timeToMultiply, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  MathLabel,
  numbersCodec,
  Overlay,
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

const paramsCodec = numbersCodec(['a', 'b'] as const)

/** Integer inputs shown as points in the first step. */
const STAIRS = [-2, -1, 0, 1, 2, 3]

/** Rounds to the slider step, so readouts do not run through decimals during a transition. */
const snap = (v: number) => Math.round(v * 20) / 20

/** A short decimal for TeX: 1.5, 0.25, 2. */
const dec = (v: number) => String(+v.toFixed(2))

const BASE_VIEW = [-4, 5, -1, 8] as const
const WIDE_VIEW = [-3, 6, -2, 20] as const

/** 2^x and x^2 at a few inputs, to compare far from the origin. */
const FAR = [5, 10, 20]

export default function ExponentialGrowth() {
  const { id } = useVizStep()
  const [p, setP] = useVizParam('p', { a: 1, b: 2 }, paramsCodec)
  const [x0, setX0] = useState(0)
  const [shown, setShown] = useState(STAIRS.length)
  const seq = useSequence()

  const tweenTo = (a: number, b: number, duration = 1.4) =>
    void seq.run(({ tween }) => {
      const [a0, b0] = [p.a, p.b]
      return tween(0, 1, {
        duration,
        onUpdate: (t) => setP({ a: a0 + (a - a0) * t, b: b0 + (b - b0) * t }),
      })
    })

  useStepEffect({
    'repeated-factor': () => {
      setP({ a: 1, b: 2 })
      void seq.run(({ tween }) => tween(0, STAIRS.length, { duration: 2.4, onUpdate: setShown }))
    },
    base: () => tweenTo(1, 0.5, 1.8),
    'initial-value': () => tweenTo(3, 0.5),
    doubling: () => {
      setX0(0)
      tweenTo(1, 1.5)
    },
    outgrows: () => setP({ a: 1, b: 2 }),
  })

  const [vx0, vx1, vy0, vy1] = useAnimatedValue(id === 'outgrows' ? WIDE_VIEW : BASE_VIEW, {
    duration: 0.9,
  })

  const { a, b } = p
  const f = (x: number) => a * b ** x
  const shownA = snap(a)
  const shownB = snap(b)

  const setA = (v: number) => {
    seq.cancel()
    setP({ a: v, b })
  }
  const setB = (v: number) => {
    seq.cancel()
    setP({ a, b: v })
  }

  // Doubling (b > 1) or halving (b < 1): the distance d with b^d = 2 or 1/2.
  const factor = b > 1 ? 2 : 0.5
  const d = b === 1 ? NaN : timeToMultiply(b, factor)
  const P: Vec2 = [x0, f(x0)]
  const Q: Vec2 = [x0 + d, f(x0 + d)]
  const corner: Vec2 = [x0 + d, f(x0)]
  const moveP = ([px]: Vec2) => setX0(Math.round(clamp(px, -3, 3) * 10) / 10)

  const kind = shownB > 1 ? 'growth' : shownB < 1 ? 'decay' : 'constant'

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="The graph of an exponential function"
        overlay={
          <Overlay corner="top-right">
            {id === 'repeated-factor' && (
              <ReadoutPanel title="Repeated factor">
                <Readout label="$f(x)$" value={<Tex>{'2^x'}</Tex>} color={vc.blue} />
                <Readout
                  label="$f(x + 1) / f(x)$"
                  value="2"
                  color={vc.yellow}
                  hint="The growth factor: what one step of $1$ in $x$ multiplies the value by."
                />
                <Readout label="$f(-1)$" value={<Tex>{'\\frac{1}{2}'}</Tex>} />
              </ReadoutPanel>
            )}
            {id === 'base' && (
              <ReadoutPanel title="Base">
                <Readout label="$f(x)$" value={<Tex>{`${dec(shownB)}^x`}</Tex>} color={vc.blue} />
                <Readout label="kind" value={kind} />
                <Readout
                  label="mirror"
                  value={<Tex>{`${dec(1 / shownB)}^x`}</Tex>}
                  color={vc.yellow}
                  hint="$\left(\frac{1}{b}\right)^x$, the same curve reflected across the $y$-axis."
                />
              </ReadoutPanel>
            )}
            {id === 'initial-value' && (
              <ReadoutPanel title="Model">
                <Readout
                  label="$f(x)$"
                  value={<Tex>{`${dec(shownA)} \\cdot ${dec(shownB)}^x`}</Tex>}
                  color={vc.blue}
                />
                <Readout
                  label="$f(0)$"
                  value={dec(shownA)}
                  color={vc.teal}
                  hint="$b^0 = 1$, so the value at $x = 0$ is $a$."
                />
                <Readout label="$f(1)$" value={dec(shownA * shownB)} />
                <Readout label="kind" value={kind} />
              </ReadoutPanel>
            )}
            {id === 'doubling' && (
              <ReadoutPanel title={b > 1 ? 'Doubling' : 'Halving'}>
                <Readout label="$f(x)$" value={<Tex>{`${dec(shownB)}^x`}</Tex>} color={vc.blue} />
                <Readout
                  label="$d$"
                  value={
                    Number.isFinite(d) ? (
                      <Tex>{`\\log_{${dec(shownB)}} ${b > 1 ? '2' : '\\tfrac{1}{2}'} \\approx ${fmt(timeToMultiply(shownB, factor))}`}</Tex>
                    ) : (
                      'none'
                    )
                  }
                  color={vc.teal}
                  hint="The power that turns $b$ into the factor: $b^d = 2$ for growth, $b^d = \frac{1}{2}$ for decay."
                />
                <Readout label="value at $P$" value={fmt(f(x0))} />
                <Readout label="after $d$" value={Number.isFinite(d) ? fmt(Q[1]) : 'none'} />
              </ReadoutPanel>
            )}
            {id === 'outgrows' && (
              <ReadoutPanel title="Far away">
                {FAR.map((x) => (
                  <Readout
                    key={x}
                    label={`$x = ${x}$`}
                    value={
                      <Tex>{`x^2 = ${x * x},\\ 2^x = ${(2 ** x).toLocaleString('en-US').replace(/,/g, '{,}')}`}</Tex>
                    }
                  />
                ))}
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {id === 'base' && (
          <FunctionPlot f={(x) => b ** -x} color={vc.yellow} width={1.75} dash="5 6" />
        )}
        {id === 'outgrows' && <FunctionPlot f={(x) => x * x} color={vc.yellow} />}
        <FunctionPlot f={f} color={vc.blue} />

        {id === 'repeated-factor' &&
          STAIRS.filter((_, i) => i < shown).map((x, i) => (
            <g key={x}>
              <Segment from={[x, 0]} to={[x, 2 ** x]} color={vc.blue} width={2} />
              <Point at={[x, 2 ** x]} color={vc.blue} r={4.5} />
              {i > 0 && (
                <MathLabel
                  at={[x - 0.5, 2 ** (x - 0.5)]}
                  tex="\times 2"
                  color={vc.yellow}
                  anchor="nw"
                  offset={8}
                />
              )}
            </g>
          ))}

        {(id === 'base' || id === 'initial-value') && (
          <>
            <Point at={[0, a]} color={vc.teal} />
            <MathLabel
              at={[0, a]}
              tex={id === 'base' ? '(0, 1)' : 'a'}
              color={vc.teal}
              anchor="e"
              offset={12}
            />
          </>
        )}

        {id === 'doubling' && Number.isFinite(d) && (
          <>
            <Segment from={P} to={corner} color={vc.teal} width={2} dash="5 5" />
            <Segment from={corner} to={Q} color={vc.yellow} width={2} dash="5 5" />
            <MathLabel
              at={[x0 + d / 2, P[1]]}
              tex="d"
              color={vc.teal}
              anchor={b > 1 ? 's' : 'n'}
              offset={8}
            />
            <MathLabel
              at={[x0 + d, (P[1] + Q[1]) / 2]}
              tex={b > 1 ? '\\times 2' : '\\times \\tfrac{1}{2}'}
              color={vc.yellow}
              anchor={d > 0 ? 'e' : 'w'}
              offset={8}
            />
            <Point at={Q} color={vc.blue} hollow />
            <Point at={P} color={vc.blue} label="P" onDrag={moveP} />
            <MathLabel at={P} tex="P" color={vc.blue} anchor="nw" offset={14} />
          </>
        )}

        {id === 'outgrows' &&
          [-0.7666647, 2, 4].map((x) => <Point key={x} at={[x, x * x]} color={vc.teal} r={4.5} />)}
      </Stage>

      <VizControls>
        {id === 'initial-value' && (
          <LabeledSlider
            label="$a$"
            value={a}
            onChange={setA}
            min={0.5}
            max={4}
            step={0.05}
            format={(v) => fmt(v)}
            color={vc.blue}
          />
        )}
        {(id === 'base' || id === 'initial-value' || id === 'doubling') && (
          <LabeledSlider
            label="$b$"
            value={b}
            onChange={setB}
            min={0.2}
            max={3}
            step={0.05}
            format={(v) => fmt(v)}
            color={vc.blue}
          />
        )}
      </VizControls>
    </>
  )
}
