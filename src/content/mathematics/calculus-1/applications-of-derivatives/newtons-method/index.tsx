import { useState } from 'react'
import { clamp, fmt, newtonIterates, tangentPiece, type Fn, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
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

type StepId = 'tangent-step' | 'iterate' | 'digits' | 'babylonian' | 'cycle' | 'diverge' | 'minimum'

const sq = (x: number) => x * x - 2
const dsq = (x: number) => 2 * x
const cubic = (x: number) => x ** 3 - 2 * x + 2
const dcubic = (x: number) => 3 * x * x - 2
const cbrt = Math.cbrt
const dcbrt = (x: number) => 1 / (3 * Math.cbrt(x * x))
/** g' = x^3 - 1, so the minimum is at 1; g'' = 3x^2. */
const g = (x: number) => x ** 4 / 4 - x + 2
const dg = (x: number) => x ** 3 - 1
const ddg = (x: number) => 3 * x * x

interface Setup {
  f: Fn
  df: Fn
  range: readonly [number, number]
  x0: number
  /** Iterations the step animates through. */
  steps: number
  box: readonly [number, number, number, number]
}

const SETUPS: Record<StepId, Setup> = {
  'tangent-step': {
    f: sq,
    df: dsq,
    range: [-0.6, 3],
    x0: 2.6,
    steps: 1,
    box: [-0.8, 3.3, -2.6, 5.4],
  },
  iterate: { f: sq, df: dsq, range: [-0.6, 3], x0: 2.6, steps: 4, box: [-0.8, 3.3, -2.6, 5.4] },
  digits: { f: sq, df: dsq, range: [-0.6, 3], x0: 2.6, steps: 6, box: [-1, 7, -1, 9] },
  babylonian: { f: sq, df: dsq, range: [2, 6], x0: 2, steps: 4, box: [-0.6, 6.6, -0.6, 3.6] },
  cycle: { f: cubic, df: dcubic, range: [-2.2, 1.8], x0: 0, steps: 8, box: [-2.6, 2.3, -2.2, 4.6] },
  diverge: { f: cbrt, df: dcbrt, range: [-1, 1], x0: 0.25, steps: 4, box: [-4.6, 4.6, -2, 2] },
  minimum: { f: dg, df: ddg, range: [0.3, 2.6], x0: 2.2, steps: 4, box: [-0.9, 3, -0.5, 6.4] },
}

/** Digits are drawn at half height on the digits step, so 16 digits fit the view. */
const DIGIT_SCALE = 0.5

/** How much of iteration k is drawn when the animation is at u: 0 none, 1 all. */
const part = (u: number, k: number) => clamp(u - k, 0, 1)

export default function NewtonsMethod() {
  const id = useVizStep().id as StepId
  const setup = SETUPS[id]
  const [x0, setX0] = useState(2.6)
  const [a, setA] = useState(2)
  const [u, setU] = useState(1)
  const seq = useSequence()
  const hl = useHighlight()
  const start = useStepStart({ x0 })

  /** Keep the learner's x0 when it fits the step, else the step's own start. */
  const startFor = (step: StepId, run: StepRun) => {
    const { range, x0: own } = SETUPS[step]
    const now = start(run).x0
    return step === 'cycle' || step === 'diverge' || step === 'minimum' || step === 'babylonian'
      ? own
      : now >= range[0] && now <= range[1]
        ? now
        : own
  }
  const play = (step: StepId) => (run: StepRun) => {
    setX0(startFor(step, run))
    if (step === 'babylonian') setA(2)
    const n = SETUPS[step].steps
    void seq.run(({ tween }) => tween(0, n, { duration: 1.1 * n, onUpdate: setU }))
  }

  useStepEffect({
    'tangent-step': (run) => {
      seq.cancel()
      setX0(startFor('tangent-step', run))
      setU(1)
    },
    iterate: play('iterate'),
    digits: (run) => {
      seq.cancel()
      setX0(startFor('digits', run))
      setU(6)
    },
    babylonian: play('babylonian'),
    cycle: play('cycle'),
    diverge: play('diverge'),
    minimum: play('minimum'),
  })

  const [vx0, vx1, vy0, vy1] = useAnimatedValue(setup.box, { duration: 1.1 })

  const moveX0 = (v: number) => {
    seq.cancel()
    setX0(clamp(v, setup.range[0], setup.range[1]))
    setU(setup.steps)
  }
  const moveA = (v: number) => {
    seq.cancel()
    setA(clamp(v, 2, 6))
    setU(setup.steps)
  }

  const start0 = id === 'babylonian' ? a : x0
  const { f, df } = setup
  const babylon = (x: number) => x * x - a
  const xs =
    id === 'babylonian'
      ? newtonIterates(babylon, dsq, start0, setup.steps)
      : newtonIterates(f, df, start0, setup.steps)
  const flat = xs.length === 1

  /** The root the iterates settle on, for counting correct decimals. */
  const root = (() => {
    const long = newtonIterates(sq, dsq, x0, 60)
    const last = long[long.length - 1]!
    return Math.abs(sq(last)) < 1e-12 ? (last > 0 ? Math.SQRT2 : -Math.SQRT2) : NaN
  })()
  const digits = Number.isNaN(root)
    ? []
    : xs.map((x) => {
        const e = Math.abs(x - root)
        return e === 0 ? 16 : clamp(-Math.log10(e), 0, 16)
      })

  const curveSteps = id === 'tangent-step' || id === 'iterate' || id === 'cycle' || id === 'diverge'

  /** Up to the curve, then along the tangent to the axis, for each drawn iteration. */
  const zigzag = (fn: Fn) =>
    xs.slice(0, -1).map((x, k) => {
      const p = part(u, k)
      if (p <= 0) return null
      const up = Math.min(1, p * 2)
      const along = clamp(p * 2 - 1, 0, 1)
      const top: Vec2 = [x, fn(x)]
      const next = xs[k + 1]!
      return (
        <g key={k} opacity={k < Math.floor(u) - 2 ? 0.55 : 1}>
          <Segment from={[x, 0]} to={[x, top[1] * up]} color={vc.muted} width={1.5} dash="3 4" />
          {along > 0 && (
            <HoverGroup hoverKey="tangent">
              <Segment
                from={top}
                to={[x + (next - x) * along, top[1] * (1 - along)]}
                color={vc.teal}
                width={2.25}
              />
            </HoverGroup>
          )}
          {along >= 1 && <Point at={[next, 0]} color={vc.yellow} r={4.5} coords={false} />}
          {along >= 1 && k === 0 && (
            <MathLabel
              at={[next, 0]}
              tex={`x_{${k + 1}}`}
              color={vc.yellow}
              anchor={next < x ? 'se' : 'sw'}
              offset={8}
            />
          )}
        </g>
      )
    })

  const readouts = (() => {
    if (id === 'tangent-step') {
      const x1 = xs[1]
      return (
        <ReadoutPanel>
          <Readout label="$x_0$" value={fmt(x0, 3)} color={vc.yellow} />
          <Readout label="$f(x_0)$" value={fmt(sq(x0), 4)} color={vc.blue} />
          <Readout
            label="$f'(x_0)$"
            value={fmt(dsq(x0), 4)}
            color={vc.teal}
            {...hl.bind('tangent')}
          />
          <Readout
            label="$x_1 = x_0 - \frac{f(x_0)}{f'(x_0)}$"
            value={x1 === undefined ? 'none' : fmt(x1, 4)}
            color={vc.yellow}
          />
        </ReadoutPanel>
      )
    }
    if (id === 'iterate' || id === 'digits' || id === 'cycle' || id === 'diverge')
      return (
        <ReadoutPanel title={id === 'digits' ? 'Correct decimals' : 'Iterates'}>
          {xs.slice(0, id === 'cycle' ? 6 : xs.length).map((x, n) => (
            <Readout
              key={n}
              label={`$x_{${n}}$`}
              value={
                id === 'digits'
                  ? `${x.toFixed(Math.min(15, Math.max(4, Math.floor(digits[n] ?? 0) + 2)))}  (${fmt(digits[n] ?? 0, 1)})`
                  : fmt(x, 6)
              }
              color={vc.yellow}
            />
          ))}
          {flat && <Readout label="$f'(x_0)$" value="0" color={vc.red} />}
        </ReadoutPanel>
      )
    if (id === 'babylonian')
      return (
        <ReadoutPanel title="Sides of each rectangle">
          {xs.map((x, n) => (
            <Readout
              key={n}
              label={`$x_{${n}}$, $\\frac{a}{x_{${n}}}$`}
              value={`${fmt(x, 5)}, ${fmt(a / x, 5)}`}
              color={vc.yellow}
            />
          ))}
          <Readout label="$\sqrt{a}$" value={fmt(Math.sqrt(a), 5)} color={vc.green} />
        </ReadoutPanel>
      )
    return (
      <ReadoutPanel>
        {xs.map((x, n) => (
          <Readout key={n} label={`$x_{${n}}$`} value={fmt(x, 6)} color={vc.yellow} />
        ))}
        <Readout
          label="$g'(x_n)$, $g''(x_n)$"
          value={`${fmt(dg(xs[Math.min(Math.floor(u), xs.length - 1)]!), 4)}, ${fmt(ddg(xs[Math.min(Math.floor(u), xs.length - 1)]!), 4)}`}
          color={vc.teal}
          hint="$x_{n+1} = x_n - \frac{g'(x_n)}{g''(x_n)}$"
        />
      </ReadoutPanel>
    )
  })()

  const gridStep = 1

  return (
    <>
      <Stage
        zoomable
        highlight={hl}
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Newton's method: tangent lines followed to the axis, step after step"
        overlay={<Overlay corner="top-left">{readouts}</Overlay>}
      >
        <Grid step={gridStep} />
        <Axes
          step={gridStep}
          formatY={id === 'digits' ? (v) => (v <= 0 ? null : fmt(v / DIGIT_SCALE, 0)) : undefined}
          formatX={id === 'digits' ? (v) => (v < 0 ? null : fmt(v, 0)) : undefined}
        />

        {curveSteps && (
          <>
            <FunctionPlot f={f} color={vc.blue} />
            {zigzag(f)}
            {id === 'tangent-step' && flat && (
              <>
                <Segment {...tangentPiece([0, sq(0)], 0, 1.4)} color={vc.teal} width={2.25} />
                <MathLabel at={[0, -2]} tex="f'(0) = 0" color={vc.red} anchor="n" offset={12} />
              </>
            )}
            {id === 'tangent-step' && !flat && (
              <Segment
                {...tangentPiece([x0, sq(x0)], dsq(x0), 0.6)}
                color={vc.teal}
                width={1.5}
                dash="4 5"
              />
            )}
            {id === 'tangent-step' || id === 'iterate' ? (
              <>
                <Point at={[Math.SQRT2, 0]} color={vc.green} r={4} hollow coords={false} />
                <MathLabel
                  at={[Math.SQRT2, 0]}
                  tex="\sqrt{2}"
                  color={vc.green}
                  anchor="n"
                  offset={12}
                />
              </>
            ) : id === 'cycle' ? (
              <>
                <Point at={[-1.7693, 0]} color={vc.green} r={4} hollow coords={false} />
                <MathLabel
                  at={[-1.7693, 0]}
                  tex="\text{root}"
                  color={vc.green}
                  anchor="n"
                  offset={12}
                />
              </>
            ) : (
              <>
                <Point at={[0, 0]} color={vc.green} r={4} hollow coords={false} />
                <MathLabel at={[0, 0]} tex="\text{root}" color={vc.green} anchor="sw" offset={10} />
              </>
            )}
            <Point at={[start0, 0]} color={vc.yellow} r={6} onDrag={([px]) => moveX0(px)} />
            <MathLabel
              at={[start0, 0]}
              tex="x_0"
              color={vc.yellow}
              anchor={id === 'cycle' ? 'nw' : 'n'}
              offset={12}
            />
            {id === 'tangent-step' && (
              <MathLabel
                at={[2.9, sq(2.9)]}
                tex="f(x) = x^2 - 2"
                color={vc.blue}
                anchor="e"
                offset={10}
              />
            )}
          </>
        )}

        {id === 'digits' && (
          <>
            {digits.map((d, n) => {
              const h = d * DIGIT_SCALE
              return (
                <g key={n}>
                  <Path
                    points={[
                      [n - 0.3, 0],
                      [n + 0.3, 0],
                      [n + 0.3, h],
                      [n - 0.3, h],
                    ]}
                    closed
                    color={vc.yellow}
                    width={1.5}
                    fill={vc.yellow}
                    fillOpacity={0.35}
                  />
                  {d >= 0.05 && (
                    <MathLabel
                      at={[n, h]}
                      tex={fmt(d, 1)}
                      color={vc.yellow}
                      anchor="n"
                      offset={8}
                    />
                  )}
                </g>
              )
            })}
          </>
        )}

        {id === 'babylonian' &&
          xs.map((x, n) => {
            const p = n === 0 ? 1 : part(u, n - 1)
            if (p <= 0) return null
            const latest = n === Math.min(Math.ceil(u), xs.length - 1)
            return (
              <g key={n} opacity={p}>
                <Path
                  points={[
                    [0, 0],
                    [x, 0],
                    [x, a / x],
                    [0, a / x],
                  ]}
                  closed
                  color={latest ? vc.yellow : vc.muted}
                  width={latest ? 2.25 : 1.25}
                  fill={vc.yellow}
                  fillOpacity={latest ? 0.22 : 0}
                />
                {latest && (
                  <>
                    <MathLabel
                      at={[x / 2, 0]}
                      tex={`x_{${n}}`}
                      color={vc.yellow}
                      anchor="s"
                      offset={20}
                    />
                    <MathLabel
                      at={[x, a / x / 2]}
                      tex={`\\frac{a}{x_{${n}}}`}
                      color={vc.yellow}
                      anchor="e"
                      offset={10}
                    />
                    <MathLabel at={[x / 2, a / x / 2]} tex="a" color={vc.yellow} />
                  </>
                )}
              </g>
            )
          })}
        {id === 'babylonian' && (
          <Point at={[Math.sqrt(a), Math.sqrt(a)]} color={vc.green} r={4} hollow coords={false} />
        )}

        {id === 'minimum' && (
          <>
            <FunctionPlot f={g} color={vc.blue} />
            {xs.slice(0, -1).map((x, k) => {
              const p = part(u, k)
              if (p <= 0) return null
              const next = xs[k + 1]!
              const q = (t: number) => g(x) + dg(x) * (t - x) + (ddg(x) / 2) * (t - x) ** 2
              const old = k < Math.floor(u) - 1
              return (
                <g key={k} opacity={old ? 0.35 : p}>
                  <HoverGroup hoverKey="parabola">
                    <FunctionPlot
                      f={q}
                      domain={[Math.min(x, next) - 0.6, Math.max(x, next) + 0.6]}
                      color={vc.teal}
                      width={2}
                    />
                  </HoverGroup>
                  <Point at={[x, g(x)]} color={vc.yellow} r={4.5} coords={false} />
                  <Point at={[next, q(next)]} color={vc.teal} r={4.5} coords={false} />
                  <Segment
                    from={[next, q(next)]}
                    to={[next, g(next)]}
                    color={vc.muted}
                    width={1.5}
                    dash="3 4"
                  />
                </g>
              )
            })}
            <Point at={[x0, g(x0)]} color={vc.yellow} r={6} onDrag={([px]) => moveX0(px)} />
            <MathLabel at={[x0, g(x0)]} tex="x_0" color={vc.yellow} anchor="e" offset={12} />
            <Point at={[1, g(1)]} color={vc.green} r={4} hollow coords={false} />
            <MathLabel at={[-0.5, g(-0.5)]} tex="g" color={vc.blue} anchor="e" offset={10} />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'babylonian' ? (
          <LabeledSlider
            label="$a$"
            value={a}
            onChange={moveA}
            min={2}
            max={6}
            step={0.01}
            color={vc.yellow}
          />
        ) : (
          <LabeledSlider
            label="$x_0$"
            value={x0}
            onChange={moveX0}
            min={setup.range[0]}
            max={setup.range[1]}
            step={0.01}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
