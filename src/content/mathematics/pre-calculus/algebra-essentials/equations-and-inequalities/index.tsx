import { useState } from 'react'
import { clamp, fmt, intervalTex, type Interval } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  AxisInterval,
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
  useVizStep,
  VizControls,
} from '@/viz-kit'

const R = Infinity
const Y_MIN = -5
const Y_MAX = 8
const X_LIM = 4.3

type Sign = '<' | '>'
type Form = 'written' | 'squared'

/** Crossings of y = x² and y = x + c, from x² - x - c = 0. */
const crossings = (c: number) => {
  const disc = 1 + 4 * c
  if (Math.abs(disc) < 1e-9) return [0.5]
  if (disc < 0) return []
  const r = Math.sqrt(disc)
  return [(1 - r) / 2, (1 + r) / 2]
}

/** A signed constant after a term: + 2, - 0.50. */
const plus = (v: number, digits = 2) => (v < 0 ? `- ${fmt(-v, digits)}` : `+ ${fmt(v, digits)}`)

const open = (from: number, to: number): Interval => ({ from, to })

/** Solution set of x² < x + c or x² > x + c. */
const solution = (c: number, sign: Sign): Interval[] => {
  const xs = crossings(c)
  if (sign === '<') return xs.length === 2 ? [open(xs[0]!, xs[1]!)] : []
  if (xs.length === 0) return [open(-R, R)]
  return [open(-R, xs[0]!), open(xs[xs.length - 1]!, R)]
}

const rounded = (set: Interval[], digits = 2) =>
  set.map((i) => ({
    ...i,
    fromTex: Number.isFinite(i.from) ? fmt(i.from, digits) : undefined,
    toTex: Number.isFinite(i.to) ? fmt(i.to, digits) : undefined,
  }))

const ZEROS: readonly number[] = [-2, 1, 3]
const cubic = (x: number) => ZEROS.reduce((p, z) => p * (x - z), 1)
const factorTex = (z: number) => (z < 0 ? `x + ${-z}` : `x - ${z}`)
const signTex = (v: number) => (Math.abs(v) < 1e-9 ? '0' : v > 0 ? '+' : '-')
const POSITIVE = [open(-2, 1), open(3, R)]
const NEGATIVE = [open(-R, -2), open(1, 3)]

const SIGN_OPTIONS = [
  { value: '<' as const, label: '$<$' },
  { value: '>' as const, label: '$>$' },
]

export default function EquationsAndInequalities() {
  const { id } = useVizStep()
  const [c, setC] = useState(2)
  const [sign, setSign] = useState<Sign>('<')
  const [form, setForm] = useState<Form>('squared')
  const [x, setX] = useState(-1)
  const [a, setA] = useState(1)
  const [r, setR] = useState(2)
  const [absSign, setAbsSign] = useState<Sign>('<')
  const seq = useSequence()

  useStepEffect({
    intersection: () =>
      void seq.run(({ tween }) => tween(-1, 2, { duration: 1.6, onUpdate: setC })),
    extraneous: () => setForm('squared'),
    inequality: () => setSign('<'),
    'sign-chart': () =>
      void seq.run(({ tween }) => tween(-3.5, -1, { duration: 1.4, onUpdate: setX })),
    absolute: () => setAbsSign('<'),
  })

  const squared = useAnimatedValue(form === 'squared' ? 1 : 0, { duration: 0.6 })
  const xs = crossings(c)
  const set = rounded(solution(c, sign))

  const moveX = (v: number) => {
    seq.cancel()
    setX(Math.round(clamp(v, -X_LIM, X_LIM) * 20) / 20)
  }
  const p = cubic(x)

  const abs = (v: number) => Math.abs(v - a)
  const inside = open(a - r, a + r)
  const absSet = absSign === '<' ? [inside] : [open(-R, a - r), open(a + r, R)]

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-4.5, 4.5], y: [id === 'sign-chart' ? Y_MIN : -1.5, Y_MAX] }}
        ariaLabel="Graphs whose crossings solve equations and whose order solves inequalities"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {id === 'intersection' && (
                <>
                  <Readout label="equation" value={<Tex>{`x^2 = x ${plus(c)}`}</Tex>} />
                  <Readout
                    label="solutions"
                    value={xs.length ? xs.map((v) => fmt(v)).join(', ') : 'none'}
                    color={vc.yellow}
                  />
                </>
              )}
              {id === 'extraneous' && (
                <>
                  <Readout
                    label="equation"
                    value={<Tex>{form === 'written' ? '\\sqrt{x + 2} = x' : 'x + 2 = x^2'}</Tex>}
                  />
                  <Readout label="$x = 2$" value={<Tex>{'\\sqrt{4} = 2'}</Tex>} color={vc.yellow} />
                  <Readout
                    label="$x = -1$"
                    value={<Tex>{'\\sqrt{1} = 1 \\neq -1'}</Tex>}
                    color={vc.red}
                  />
                </>
              )}
              {id === 'inequality' && (
                <>
                  <Readout label="inequality" value={<Tex>{`x^2 ${sign} x ${plus(c)}`}</Tex>} />
                  <Readout
                    label="solution"
                    value={<Tex>{intervalTex(set)}</Tex>}
                    color={vc.yellow}
                  />
                </>
              )}
              {id === 'sign-chart' && (
                <>
                  <Readout label="$x$" value={fmt(x)} color={vc.blue} />
                  {ZEROS.map((z) => (
                    <Readout
                      key={z}
                      label={`$${factorTex(z)}$`}
                      value={<Tex>{signTex(x - z)}</Tex>}
                    />
                  ))}
                  <Readout
                    label="product"
                    value={<Tex>{signTex(p)}</Tex>}
                    color={Math.abs(p) < 1e-9 ? vc.muted : p > 0 ? vc.green : vc.red}
                  />
                </>
              )}
              {id === 'absolute' && (
                <>
                  <Readout
                    label="inequality"
                    value={<Tex>{`\\lvert x ${plus(-a, 1)} \\rvert ${absSign} ${fmt(r, 1)}`}</Tex>}
                  />
                  <Readout
                    label="solution"
                    value={<Tex>{intervalTex(rounded(absSet, 1))}</Tex>}
                    color={vc.yellow}
                  />
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {(id === 'intersection' || id === 'inequality') && (
          <>
            <FunctionPlot f={(t) => t * t} color={vc.blue} />
            <FunctionPlot f={(t) => t + c} color={vc.teal} />
            {id === 'inequality' && <AxisInterval set={set} axis="x" color={vc.yellow} />}
            {xs.map((v) => (
              <g key={v}>
                <Segment from={[v, 0]} to={[v, v * v]} color={vc.yellow} width={1.25} dash="4 5" />
                <Point at={[v, v * v]} color={vc.yellow} />
                {id === 'intersection' && <Point at={[v, 0]} color={vc.yellow} r={4} />}
              </g>
            ))}
          </>
        )}

        {id === 'extraneous' && (
          <>
            <g style={{ opacity: 1 - squared }}>
              <FunctionPlot f={(t) => Math.sqrt(t + 2)} color={vc.blue} />
              <FunctionPlot f={(t) => t} color={vc.teal} />
              <Segment from={[-1, 1]} to={[-1, -1]} color={vc.red} width={1.5} dash="4 5" />
              <Point at={[-1, 1]} color={vc.red} hollow />
              <Point at={[-1, -1]} color={vc.red} hollow />
            </g>
            <g style={{ opacity: squared }}>
              <FunctionPlot f={(t) => t + 2} color={vc.blue} />
              <FunctionPlot f={(t) => t * t} color={vc.teal} />
              <Point at={[-1, 1]} color={vc.red} hollow />
            </g>
            <Point at={[2, form === 'squared' ? 4 : 2]} color={vc.yellow} />
            <Point at={[2, 0]} color={vc.yellow} r={4} />
            <Point at={[-1, 0]} color={vc.red} r={4} hollow />
          </>
        )}

        {id === 'sign-chart' && (
          <>
            <AxisInterval set={POSITIVE} axis="x" color={vc.green} />
            <AxisInterval set={NEGATIVE} axis="x" color={vc.red} />
            <FunctionPlot f={cubic} color={vc.blue} />
            <Segment
              from={[x, 0]}
              to={[x, clamp(p, Y_MIN, Y_MAX)]}
              color={vc.blue}
              width={1.5}
              dash="4 5"
            />
            {p >= Y_MIN && p <= Y_MAX && <Point at={[x, p]} color={vc.blue} />}
            <Point at={[x, 0]} color={vc.blue} onDrag={([px]) => moveX(px)} label="x" />
            <MathLabel at={[-0.5, 0]} tex="+" color={vc.green} anchor="n" offset={14} />
            <MathLabel at={[3.7, 0]} tex="+" color={vc.green} anchor="n" offset={14} />
            <MathLabel at={[-3.2, 0]} tex="-" color={vc.red} anchor="n" offset={14} />
            <MathLabel at={[2, 0]} tex="-" color={vc.red} anchor="n" offset={14} />
          </>
        )}

        {id === 'absolute' && (
          <>
            <AxisInterval set={absSet} axis="x" color={vc.yellow} />
            <FunctionPlot f={abs} color={vc.blue} />
            <Segment from={[0, r]} to={[1, r]} extend color={vc.teal} width={2} />
            {[a - r, a + r].map((v) => (
              <Segment key={v} from={[v, 0]} to={[v, r]} color={vc.teal} width={1.25} dash="4 5" />
            ))}
            <Point at={[a, 0]} color={vc.blue} r={4} />
            <MathLabel at={[a, 0]} tex="a" color={vc.blue} anchor="s" offset={30} />
            <MathLabel at={[a - r, 0]} tex="a - r" color={vc.yellow} anchor="s" offset={30} />
            <MathLabel at={[a + r, 0]} tex="a + r" color={vc.yellow} anchor="s" offset={30} />
            <MathLabel at={[a + r / 2, r]} tex="r" color={vc.teal} anchor="n" offset={8} />
          </>
        )}
      </Stage>

      <VizControls>
        {(id === 'intersection' || id === 'inequality') && (
          <LabeledSlider
            label="$c$"
            value={c}
            onChange={(v) => {
              seq.cancel()
              setC(Math.round(v * 20) / 20)
            }}
            min={-1.5}
            max={4}
            step={0.05}
            format={fmt}
            color={vc.teal}
          />
        )}
        {id === 'inequality' && (
          <SegmentedControl label="Sign" value={sign} onChange={setSign} options={SIGN_OPTIONS} />
        )}
        {id === 'extraneous' && (
          <SegmentedControl
            label="Equation"
            value={form}
            onChange={setForm}
            options={[
              { value: 'written', label: 'As written' },
              { value: 'squared', label: 'Squared' },
            ]}
          />
        )}
        {id === 'sign-chart' && (
          <LabeledSlider
            label="$x$"
            value={x}
            onChange={moveX}
            min={-X_LIM}
            max={X_LIM}
            step={0.05}
            format={fmt}
            color={vc.blue}
          />
        )}
        {id === 'absolute' && (
          <>
            <LabeledSlider
              label="$a$"
              value={a}
              onChange={(v) => setA(Math.round(v * 10) / 10)}
              min={-2}
              max={2}
              step={0.1}
              format={(v) => fmt(v, 1)}
              color={vc.blue}
            />
            <LabeledSlider
              label="$r$"
              value={r}
              onChange={(v) => setR(Math.round(v * 10) / 10)}
              min={0.5}
              max={2.5}
              step={0.1}
              format={(v) => fmt(v, 1)}
              color={vc.teal}
            />
            <SegmentedControl
              label="Sign"
              value={absSign}
              onChange={setAbsSign}
              options={SIGN_OPTIONS}
            />
          </>
        )}
      </VizControls>
    </>
  )
}
