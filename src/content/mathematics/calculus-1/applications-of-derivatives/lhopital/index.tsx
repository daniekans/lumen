import { useState } from 'react'
import { clamp, fmt, tangentPiece, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  HoverGroup,
  MathLabel,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
  useAnimatedValue,
  useHighlight,
  useSequence,
  useStepEffect,
  useStepStart,
  useVizStep,
  VizControls,
  type StepRun,
} from '@/viz-kit'

type StepId =
  | 'zero-over-zero'
  | 'tangents'
  | 'cauchy'
  | 'infinity'
  | 'fails'
  | 'logs'
  | 'compounding'
  | 'circular'

/** The pair of the first three steps: both vanish at 1, and f'(1) / g'(1) = 1 / 2. */
const f = (x: number) => Math.log(x)
const g = (x: number) => x * x - 1
const ratio = (x: number) => (g(x) === 0 ? NaN : f(x) / g(x))
/** f'(c) / g'(c) = 1 / (2c^2) equals the chord slope f(x) / g(x) at c = 1 / sqrt(2 f / g). */
const cauchyPoint = (x: number) => 1 / Math.sqrt(2 * ratio(x))
const PAIR: [number, number] = [0.25, 2.2]
const pairCurve: Vec2[] = Array.from({ length: 241 }, (_, i) => {
  const t = PAIR[0] + ((PAIR[1] - PAIR[0]) * i) / 240
  return [g(t), f(t)]
})

const square = (x: number) => (x * x) / Math.exp(x)
const square1 = (x: number) => (2 * x) / Math.exp(x)
const square2 = (x: number) => 2 / Math.exp(x)

const wobble = (x: number) => (x + Math.sin(x)) / x
const wobbleSlopes = (x: number) => 1 + Math.cos(x)

const xlnx = (x: number) => x * Math.log(x)
const xx = (x: number) => x ** x

const balance = (r: number) => (h: number) => (1 + r * h) ** (1 / h)
const logBalance = (r: number) => (h: number) => Math.log(1 + r * h) / h
const PAYMENTS = [1, 2, 4, 12] as const

const sinc = (x: number) => (x === 0 ? NaN : Math.sin(x) / x)

/** A tick value without trailing zeros: 2 -> '2', 0.25 -> '0.25'. */
const clean = (v: number) => String(Number(v.toFixed(2)))

interface View {
  box: readonly [number, number, number, number]
  /** Stage units per unit of x and of y, for steps whose graphs need different scales. */
  sx: number
  sy: number
  grid: number
}

const VIEWS: Record<StepId, View> = {
  'zero-over-zero': { box: [-0.4, 2.6, -1.9, 3.9], sx: 1, sy: 1, grid: 1 },
  tangents: { box: [0.8, 1.2, -0.3, 0.6], sx: 1, sy: 1, grid: 0.1 },
  cauchy: { box: [-1.2, 4.1, -1.6, 1.2], sx: 1, sy: 1, grid: 1 },
  infinity: { box: [-0.5, 6.4, -0.5, 4.4], sx: 0.5, sy: 2, grid: 1 },
  fails: { box: [-0.5, 6.4, -0.5, 4.6], sx: 0.2, sy: 2, grid: 1 },
  logs: { box: [-0.4, 2.2, -0.8, 3.1], sx: 1, sy: 1, grid: 0.5 },
  compounding: { box: [-0.5, 4.6, -0.4, 3.2], sx: 4, sy: 1, grid: 1 },
  circular: { box: [-3.8, 3.8, -1.4, 1.9], sx: 1, sy: 1, grid: 1 },
}

/** The range of x on each step, and where a step's animation starts and ends. */
const RANGES: Record<StepId, readonly [number, number]> = {
  'zero-over-zero': [0.25, 2.2],
  tangents: [0.84, 1.16],
  cauchy: [0.25, 2.2],
  infinity: [0, 12],
  fails: [0.5, 30],
  logs: [0.01, 1.8],
  compounding: [0, 1],
  circular: [0.05, 3.5],
}
const MOVES: Record<StepId, readonly [number, number]> = {
  'zero-over-zero': [2.1, 1.04],
  tangents: [1.15, 1.02],
  cauchy: [2.2, 1.35],
  infinity: [1, 10],
  fails: [2, 28],
  logs: [1.5, 0.02],
  compounding: [0.2, 1],
  circular: [3, 0.06],
}

export default function LHopital() {
  const id = useVizStep().id as StepId
  const [x, setX] = useState(MOVES['zero-over-zero'][1])
  const [r, setR] = useState(1)
  const seq = useSequence()
  const hl = useHighlight()
  const start = useStepStart({ x, r })

  const tweenX = (from: number, to: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration: 2.4, onUpdate: setX }))
  const tweenR = (from: number, to: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration: 2, onUpdate: setR }))

  /** Each step moves x from its own start, or from where it is when that lies in the step's range. */
  const moveFor = (step: StepId) => (run: StepRun) => {
    const [from, to] = MOVES[step]
    const [lo, hi] = RANGES[step]
    const now = start(run).x
    tweenX(run.replay || now < lo || now > hi ? from : now, to)
  }

  useStepEffect({
    'zero-over-zero': moveFor('zero-over-zero'),
    tangents: moveFor('tangents'),
    cauchy: moveFor('cauchy'),
    infinity: moveFor('infinity'),
    fails: moveFor('fails'),
    logs: moveFor('logs'),
    compounding: (run) => tweenR(run.replay ? 0.2 : Math.min(start(run).r, 0.2), 1),
    circular: moveFor('circular'),
  })

  const view = VIEWS[id]
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(view.box, { duration: 1.1 })
  const { sx, sy } = view
  const P = (u: number, v: number): Vec2 => [u * sx, v * sy]
  const plot = (fn: (u: number) => number) => (su: number) => fn(su / sx) * sy
  const scaled = sx !== 1 || sy !== 1
  const coords = scaled ? ([u, v]: Vec2) => `(${fmt(u / sx)}, ${fmt(v / sy)})` : undefined

  const [lo, hi] = RANGES[id]
  const moveX = (v: number) => {
    seq.cancel()
    setX(clamp(v, lo, hi))
  }
  const moveR = (v: number) => {
    seq.cancel()
    setR(clamp(v, 0.05, 1))
  }

  const graphStep = id === 'zero-over-zero' || id === 'tangents'
  const q = ratio(x)
  const qTex = Number.isNaN(q) ? <Tex>{'\\tfrac{0}{0}'}</Tex> : fmt(q, 4)
  const c = cauchyPoint(x)
  const Pp: Vec2 = [g(x), f(x)]

  const readouts = (() => {
    switch (id) {
      case 'zero-over-zero':
      case 'tangents':
        return (
          <ReadoutPanel>
            <Readout label="$x$" value={fmt(x, 3)} />
            <Readout label="$f(x)$" value={fmt(f(x), 4)} color={vc.blue} />
            <Readout label="$g(x)$" value={fmt(g(x), 4)} color={vc.orange} />
            <Readout
              label="$\frac{f(x)}{g(x)}$"
              value={qTex}
              color={vc.purple}
              {...hl.bind('ratio')}
            />
            {id === 'tangents' && (
              <Readout
                label="$\frac{f'(1)}{g'(1)}$"
                value="0.5"
                color={vc.purple}
                hint="$f'(x) = \frac{1}{x}$ and $g'(x) = 2x$, so $\frac{f'(1)}{g'(1)} = \frac{1}{2}$."
              />
            )}
          </ReadoutPanel>
        )
      case 'cauchy':
        return (
          <ReadoutPanel>
            <Readout label="$x$" value={fmt(x, 3)} />
            <Readout
              label="slope $\frac{f(x)}{g(x)}$"
              value={qTex}
              color={vc.purple}
              {...hl.bind('chord')}
            />
            {!Number.isNaN(q) && (
              <Readout
                label={`$c = ${fmt(c, 3)}$, $\\frac{f'(c)}{g'(c)}$`}
                value={fmt(1 / (2 * c * c), 4)}
                color={vc.teal}
                hint="$\frac{f'(c)}{g'(c)} = \frac{1 / c}{2c} = \frac{1}{2c^2}$"
                {...hl.bind('tangent')}
              />
            )}
            <Readout label="slope at the origin" value="0.5" color={vc.teal} />
          </ReadoutPanel>
        )
      case 'infinity':
        return (
          <ReadoutPanel>
            <Readout label="$x$" value={fmt(x, 2)} />
            <Readout label="$\frac{x^2}{e^x}$" value={fmt(square(x), 4)} color={vc.purple} />
            <Readout label="$\frac{2x}{e^x}$" value={fmt(square1(x), 4)} color={vc.teal} />
            <Readout label="$\frac{2}{e^x}$" value={fmt(square2(x), 4)} color={vc.teal} />
          </ReadoutPanel>
        )
      case 'fails':
        return (
          <ReadoutPanel>
            <Readout label="$x$" value={fmt(x, 2)} />
            <Readout label="$\frac{x + \sin x}{x}$" value={fmt(wobble(x), 4)} color={vc.purple} />
            <Readout
              label="$\frac{f'(x)}{g'(x)} = 1 + \cos x$"
              value={fmt(wobbleSlopes(x), 4)}
              color={vc.teal}
            />
          </ReadoutPanel>
        )
      case 'logs':
        return (
          <ReadoutPanel>
            <Readout label="$x$" value={fmt(x, 3)} />
            <Readout label="$x \ln x$" value={fmt(xlnx(x), 4)} color={vc.purple} />
            <Readout label="$x^x = e^{x \ln x}$" value={fmt(xx(x), 4)} color={vc.blue} />
          </ReadoutPanel>
        )
      case 'compounding':
        return (
          <ReadoutPanel title="1 dollar after a year">
            <Readout label="$r$" value={`${fmt(r * 100, 0)}%`} />
            {[1, 12, 365].map((n) => (
              <Readout
                key={n}
                label={`$n = ${n}$`}
                value={fmt(balance(r)(1 / n), 4)}
                color={vc.blue}
              />
            ))}
            <Readout
              label="$e^r$"
              value={fmt(Math.exp(r), 4)}
              color={vc.blue}
              hint="The limit as $n \to \infty$: continuous compounding."
            />
          </ReadoutPanel>
        )
      case 'circular':
        return (
          <ReadoutPanel>
            <Readout label="$x$" value={fmt(x, 3)} />
            <Readout label="$\frac{\sin x}{x}$" value={fmt(sinc(x), 5)} color={vc.purple} />
            <Readout
              label="$\sin'(0)$"
              value="1"
              color={vc.teal}
              hint="$\sin'(0) = \lim_{h \to 0} \frac{\sin h - \sin 0}{h} = \lim_{h \to 0} \frac{\sin h}{h}$"
            />
          </ReadoutPanel>
        )
    }
  })()

  const slider = (() => {
    if (id === 'compounding')
      return (
        <LabeledSlider
          label="$r$"
          value={r}
          onChange={moveR}
          min={0.05}
          max={1}
          step={0.01}
          color={vc.blue}
        />
      )
    return (
      <LabeledSlider
        label="$x$"
        value={x}
        onChange={moveX}
        min={lo}
        max={hi}
        step={hi - lo > 5 ? 0.1 : 0.005}
      />
    )
  })()

  return (
    <>
      <Stage
        zoomable
        highlight={hl}
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Ratios of two functions near a point where both vanish or both grow without bound"
        overlay={
          <Overlay corner={id === 'compounding' ? 'top-right' : 'top-left'}>{readouts}</Overlay>
        }
      >
        <Grid step={view.grid} />
        <Axes
          step={view.grid}
          formatX={scaled ? (v) => (v < 0 ? null : clean(v / sx)) : undefined}
          formatY={scaled ? (v) => (v < 0 ? null : clean(v / sy)) : undefined}
        />

        {graphStep && (
          <>
            {id === 'tangents' && (
              <>
                <Segment
                  {...tangentPiece([1, 0], 1, 0.5)}
                  color={vc.blue}
                  width={1.75}
                  dash="5 5"
                />
                <Segment
                  {...tangentPiece([1, 0], 2, 0.5)}
                  color={vc.orange}
                  width={1.75}
                  dash="5 5"
                />
              </>
            )}
            <FunctionPlot f={f} domain={PAIR} color={vc.blue} />
            <FunctionPlot f={g} domain={PAIR} color={vc.orange} />
            <HoverGroup hoverKey="ratio">
              <FunctionPlot f={ratio} domain={PAIR} color={vc.purple} breaks={[1]} />
              <Point at={[1, 0.5]} color={vc.purple} hollow r={5} />
            </HoverGroup>
            <Segment from={[x, 0]} to={[x, f(x)]} color={vc.blue} width={1.5} dash="3 4" />
            <Segment from={[x, 0]} to={[x, g(x)]} color={vc.orange} width={1.5} dash="3 4" />
            <Point at={[x, f(x)]} color={vc.blue} r={5} onDrag={([u]) => moveX(u)} />
            <Point at={[x, g(x)]} color={vc.orange} r={5} onDrag={([u]) => moveX(u)} />
            {!Number.isNaN(q) && <Point at={[x, q]} color={vc.purple} r={4.5} />}
            {id === 'zero-over-zero' && (
              <>
                <MathLabel at={[2.2, f(2.2)]} tex="f" color={vc.blue} anchor="w" offset={10} />
                <MathLabel at={[2.2, g(2.2)]} tex="g" color={vc.orange} anchor="w" offset={10} />
                <MathLabel
                  at={[2.2, ratio(2.2)]}
                  tex="\frac{f}{g}"
                  color={vc.purple}
                  anchor="w"
                  offset={10}
                />
              </>
            )}
          </>
        )}

        {id === 'cauchy' && (
          <>
            <Path points={pairCurve} color={vc.green} width={2.5} />
            <HoverGroup hoverKey="chord">
              {!Number.isNaN(q) && <Segment from={[0, 0]} to={Pp} color={vc.purple} width={2.5} />}
            </HoverGroup>
            <Segment {...tangentPiece([0, 0], 0.5, 0.9)} color={vc.teal} width={1.75} dash="5 5" />
            <HoverGroup hoverKey="tangent">
              {!Number.isNaN(q) && (
                <>
                  <Segment
                    {...tangentPiece([g(c), f(c)], 1 / (2 * c * c), 0.8)}
                    color={vc.teal}
                    width={2.5}
                  />
                  <Point at={[g(c), f(c)]} color={vc.teal} r={5} coords={false} />
                  <MathLabel at={[g(c), f(c)]} tex="c" color={vc.teal} anchor="nw" offset={10} />
                </>
              )}
            </HoverGroup>
            <Point
              at={Pp}
              color={vc.green}
              r={6}
              coords={false}
              onDrag={([u]) => moveX(Math.sqrt(Math.max(u, -0.9375) + 1))}
            />
            <MathLabel at={Pp} tex="P" color={vc.green} anchor="se" offset={10} />
            <MathLabel at={[3.6, 0]} tex="g" color={vc.muted} anchor="n" offset={10} />
            <MathLabel at={[0, 1.1]} tex="f" color={vc.muted} anchor="e" offset={10} />
          </>
        )}

        {id === 'infinity' && (
          <>
            <FunctionPlot f={plot(square2)} domain={[0, 6.4]} color={vc.teal} dash="6 5" />
            <FunctionPlot f={plot(square1)} domain={[0, 6.4]} color={vc.teal} />
            <FunctionPlot f={plot(square)} domain={[0, 6.4]} color={vc.purple} />
            <Point at={P(x, square(x))} color={vc.purple} r={5} coords={coords} />
            <Point at={P(x, square1(x))} color={vc.teal} r={4.5} coords={coords} />
            <Point at={P(x, square2(x))} color={vc.teal} r={4.5} coords={coords} />
            <MathLabel
              at={P(2, square(2))}
              tex="\frac{x^2}{e^x}"
              color={vc.purple}
              anchor="ne"
              offset={8}
            />
            <MathLabel
              at={P(1, square1(1))}
              tex="\frac{2x}{e^x}"
              color={vc.teal}
              anchor="ne"
              offset={8}
            />
            <MathLabel
              at={P(0.3, square2(0.3))}
              tex="\frac{2}{e^x}"
              color={vc.teal}
              anchor="ne"
              offset={8}
            />
          </>
        )}

        {id === 'fails' && (
          <>
            <Segment from={P(0, 1)} to={P(32, 1)} color={vc.muted} width={1.5} dash="4 5" />
            <FunctionPlot f={plot(wobbleSlopes)} domain={[0, 6.4]} color={vc.teal} />
            <FunctionPlot f={plot(wobble)} domain={[0.1, 6.4]} color={vc.purple} />
            <Point at={P(x, wobble(x))} color={vc.purple} r={5} coords={coords} />
            <Point at={P(x, wobbleSlopes(x))} color={vc.teal} r={4.5} coords={coords} />
            <MathLabel at={P(30, 2)} tex="1 + \cos x" color={vc.teal} anchor="s" offset={10} />
            <MathLabel
              at={P(4.5, wobble(4.5))}
              tex="\frac{x + \sin x}{x}"
              color={vc.purple}
              anchor="n"
              offset={10}
            />
          </>
        )}

        {id === 'logs' && (
          <>
            <FunctionPlot f={xlnx} domain={[1e-4, 1.8]} color={vc.purple} />
            <FunctionPlot f={xx} domain={[1e-4, 1.8]} color={vc.blue} />
            <Point at={[0, 0]} color={vc.purple} hollow r={5} />
            <Point at={[0, 1]} color={vc.blue} hollow r={5} />
            <Point at={[x, xlnx(x)]} color={vc.purple} r={5} onDrag={([u]) => moveX(u)} />
            <Point at={[x, xx(x)]} color={vc.blue} r={5} onDrag={([u]) => moveX(u)} />
            <MathLabel at={[1.8, xx(1.8)]} tex="x^x" color={vc.blue} anchor="w" offset={10} />
            <MathLabel
              at={[1.8, xlnx(1.8)]}
              tex="x \ln x"
              color={vc.purple}
              anchor="w"
              offset={10}
            />
          </>
        )}

        {id === 'compounding' && (
          <>
            <FunctionPlot f={plot(logBalance(r))} domain={[0.004, 4]} color={vc.purple} />
            <FunctionPlot f={plot(balance(r))} domain={[0.004, 4]} color={vc.blue} />
            <Point at={P(0, Math.exp(r))} color={vc.blue} hollow r={5} />
            <Point at={P(0, r)} color={vc.purple} hollow r={5} />
            <MathLabel at={P(0, Math.exp(r))} tex="e^r" color={vc.blue} anchor="e" offset={12} />
            <MathLabel at={P(0, r)} tex="r" color={vc.purple} anchor="e" offset={12} />
            {PAYMENTS.map((n, i) => (
              <Point
                key={i}
                at={P(1 / n, balance(r)(1 / n))}
                color={vc.blue}
                r={4}
                coords={coords}
              />
            ))}
            <MathLabel
              at={P(1, balance(r)(1))}
              tex="n = 1"
              color={vc.blue}
              anchor="n"
              offset={10}
            />
            <MathLabel
              at={P(0.8, logBalance(r)(0.8))}
              tex="\frac{\ln(1 + rh)}{h}"
              color={vc.purple}
              anchor="n"
              offset={10}
            />
            <MathLabel
              at={[4.4, 0]}
              tex="h = \frac{1}{n}"
              color={vc.muted}
              anchor="n"
              offset={10}
            />
          </>
        )}

        {id === 'circular' && (
          <>
            <Segment {...tangentPiece([0, 0], 1, 1.5)} color={vc.teal} width={2} dash="5 5" />
            <FunctionPlot f={Math.sin} color={vc.blue} />
            <HoverGroup hoverKey="ratio">
              <FunctionPlot f={sinc} color={vc.purple} breaks={[0]} />
              <Point at={[0, 1]} color={vc.purple} hollow r={5} />
            </HoverGroup>
            <Point at={[x, sinc(x)]} color={vc.purple} r={5} onDrag={([u]) => moveX(u)} />
            <Point at={[x, Math.sin(x)]} color={vc.blue} r={4.5} onDrag={([u]) => moveX(u)} />
            <MathLabel
              at={[-2.6, Math.sin(-2.6)]}
              tex="\sin x"
              color={vc.blue}
              anchor="s"
              offset={10}
            />
            <MathLabel at={[1, 1]} tex="y = x" color={vc.teal} anchor="nw" offset={8} />
            <MathLabel
              at={[-2, sinc(-2)]}
              tex="\frac{\sin x}{x}"
              color={vc.purple}
              anchor="n"
              offset={10}
            />
          </>
        )}
      </Stage>

      <VizControls>{slider}</VizControls>
    </>
  )
}
