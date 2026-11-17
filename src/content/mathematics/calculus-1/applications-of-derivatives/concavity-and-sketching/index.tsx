import { useState } from 'react'
import { clamp, fmt, tangentPiece, type Fn, type Interval, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  AxisInterval,
  FunctionPlot,
  Grid,
  HoverGroup,
  MathLabel,
  Overlay,
  Point,
  Segment,
  Stage,
  useAnimatedValue,
  useHighlight,
  useSequence,
  useStepEffect,
  useStepStart,
  useVizParam,
  useVizStep,
  type ParamCodec,
  VizControls,
} from '@/viz-kit'

/** The function of the previous items: critical points 1 and 3, inflection at 2. */
const f = (x: number) => 0.25 * x ** 3 - 1.5 * x ** 2 + 2.25 * x + 1
const df = (x: number) => 0.75 * x ** 2 - 3 * x + 2.25
const d2f = (x: number) => 1.5 * x - 3

const X_MIN = -0.4
const X_MAX = 4.6
const DOWN: Interval[] = [{ from: X_MIN, to: 2 }]
const UP: Interval[] = [{ from: 2, to: X_MAX }]

type Case = 'cubic' | 'quartic'
const caseCodec: ParamCodec<Case> = {
  encode: (v) => v,
  decode: (t) => (t === 'cubic' || t === 'quartic' ? t : undefined),
}
const QUARTIC = {
  f: (x: number) => 0.25 * (x - 2) ** 4 + 0.5,
  d2f: (x: number) => 3 * (x - 2) ** 2,
}

/** The sketch: 4x / (x^2 + 1). */
const g = (x: number) => (4 * x) / (x * x + 1)
const R3 = Math.sqrt(3)

/** Logistic outbreak: K thousand cases in all, rate r per day, midpoint T0. */
const K = 10
const RATE = 0.2
const T0 = 30
const DAYS = 60
const N = (t: number) => K / (1 + Math.exp(-RATE * (t - T0)))
const newCases = (t: number) => RATE * N(t) * (1 - N(t) / K)
const SX = 0.1
const SY = 0.4
/** New cases per day are drawn taller, on their own scale. */
const SY_NEW = 4

const VIEWS = {
  graph: [-0.9, 5.1, -0.9, 4.1],
  together: [-0.9, 5.1, -3.6, 4.4],
  sketch: [-6.2, 6.2, -3.4, 3.4],
  outbreak: [-0.8, 6.8, -0.8, 4.6],
} as const
type View = keyof typeof VIEWS

export default function ConcavityAndSketching() {
  const { id } = useVizStep()
  const [x, setX] = useState(0.2)
  const [reveal, setReveal] = useState(5)
  const [day, setDay] = useState(T0)
  const [kase, setKase] = useVizParam<Case>('case', 'cubic', caseCodec)
  const seq = useSequence()
  const hl = useHighlight()
  const start = useStepStart({ x, day })

  const sweep = (from: number, to: number, duration: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration, onUpdate: setX }))

  useStepEffect({
    bend: (run) => sweep(run.replay ? X_MIN : start(run).x, X_MAX - 0.2, 4.5),
    inflection: () => seq.cancel(),
    'second-test': () => seq.cancel(),
    together: (run) => sweep(run.replay ? X_MIN : start(run).x, 3.4, 3),
    sketch: () =>
      void seq.run(({ tween }) =>
        tween(0, 5, { duration: 3, onUpdate: setReveal, ease: 'linear' }),
      ),
    outbreak: (run) =>
      void seq.run(({ tween }) =>
        tween(run.replay ? 0 : start(run).day === T0 ? 0 : start(run).day, T0, {
          duration: 2.6,
          onUpdate: setDay,
        }),
      ),
  })

  const view: View =
    id === 'together'
      ? 'together'
      : id === 'sketch'
        ? 'sketch'
        : id === 'outbreak'
          ? 'outbreak'
          : 'graph'
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(VIEWS[view], { duration: 1.1 })

  const moveX = (v: number) => {
    seq.cancel()
    setX(clamp(v, X_MIN, X_MAX))
  }
  const moveDay = (v: number) => {
    seq.cancel()
    setDay(clamp(v, 0, DAYS))
  }

  const P: Vec2 = [x, f(x)]
  const reach = 1.2
  const piece = tangentPiece(P, df(x), reach)
  const showP = id === 'bend' || id === 'together'
  const bendColor = (v: number) => (v > 1e-9 ? vc.purple : v < -1e-9 ? vc.orange : vc.muted)

  const layer = (k: number) => clamp(reveal - k, 0, 1)
  const curveEnd = -6 + 12 * clamp(reveal - 4, 0, 1)

  const q: { f: Fn; d2f: Fn } = kase === 'quartic' ? QUARTIC : { f, d2f }
  const D: Vec2 = [day * SX, N(day) * SY]

  return (
    <>
      <Stage
        zoomable
        highlight={hl}
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Graph of a function with its concavity and inflection points marked"
        overlay={
          <Overlay corner="top-left">
            {showP && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(x)} />
                <Readout
                  label="$f(x)$"
                  value={fmt(f(x))}
                  color={vc.blue}
                  hint="$f(x) = \frac{1}{4}x^3 - \frac{3}{2}x^2 + \frac{9}{4}x + 1$"
                  {...hl.bind('f')}
                />
                <Readout
                  label="$f'(x)$"
                  value={fmt(df(x))}
                  color={vc.teal}
                  hint="$f'(x) = \frac{3}{4}x^2 - 3x + \frac{9}{4}$"
                  {...hl.bind('df')}
                />
                <Readout
                  label="$f''(x)$"
                  value={fmt(d2f(x))}
                  color={bendColor(d2f(x))}
                  hint="$f''(x) = \frac{3}{2}x - 3$. Positive: bends up. Negative: bends down."
                  {...hl.bind('d2f')}
                />
              </ReadoutPanel>
            )}
            {id === 'inflection' && (
              <ReadoutPanel>
                <Readout label="$f''(1.5)$" value={fmt(q.d2f(1.5))} color={bendColor(q.d2f(1.5))} />
                <Readout label="$f''(2)$" value={fmt(q.d2f(2))} color={vc.muted} />
                <Readout label="$f''(2.5)$" value={fmt(q.d2f(2.5))} color={bendColor(q.d2f(2.5))} />
              </ReadoutPanel>
            )}
            {id === 'second-test' && (
              <ReadoutPanel>
                <Readout label="$f'(1)$, $f''(1)$" value="0, −1.5" color={vc.orange} />
                <Readout label="$f'(3)$, $f''(3)$" value="0, 1.5" color={vc.purple} />
              </ReadoutPanel>
            )}
            {id === 'sketch' && (
              <ReadoutPanel title="From the derivatives">
                <Readout
                  label="$f(x)$"
                  value={<Tex>{'\\frac{4x}{x^2 + 1}'}</Tex>}
                  color={vc.blue}
                />
                <Readout
                  label="$f'(x)$"
                  value={<Tex>{'\\frac{4(1 - x^2)}{(x^2 + 1)^2}'}</Tex>}
                  color={vc.teal}
                  hint="Zero at $x = \pm 1$: positive between them, negative outside."
                />
                <Readout
                  label="$f''(x)$"
                  value={<Tex>{'\\frac{8x(x^2 - 3)}{(x^2 + 1)^3}'}</Tex>}
                  color={vc.purple}
                  hint="Zero at $0$ and $\pm\sqrt{3}$, changing sign at each."
                />
              </ReadoutPanel>
            )}
            {id === 'outbreak' && (
              <ReadoutPanel>
                <Readout label="day" value={fmt(day, 0)} />
                <Readout
                  label="cases so far $N$"
                  value={`${fmt(N(day) * 1000, 0)}`}
                  color={vc.blue}
                  hint="$N(t) = \frac{10\,000}{1 + e^{-0.2(t - 30)}}$"
                />
                <Readout
                  label="new per day $\frac{dN}{dt}$"
                  value={`${fmt(newCases(day) * 1000, 0)}`}
                  color={vc.teal}
                  hint="Largest on day 30, the inflection point, where $N$ is half the total."
                />
                <Readout
                  label="$\frac{d^2N}{dt^2}$"
                  value={day < T0 - 0.05 ? 'positive' : day > T0 + 0.05 ? 'negative' : '0'}
                  color={bendColor(T0 - day)}
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes
          formatX={view === 'outbreak' ? (v) => (v < 0 ? null : fmt(v / SX, 0)) : undefined}
          formatY={view === 'outbreak' ? (v) => (v < 0 ? null : fmt(v / SY, 1)) : undefined}
        />

        {(id === 'bend' || id === 'second-test') && (
          <>
            <AxisInterval set={DOWN} axis="x" color={vc.orange} opacity={0.8} />
            <AxisInterval set={UP} axis="x" color={vc.purple} opacity={0.8} />
            <MathLabel
              at={[0.8, 0]}
              tex="\text{concave down}"
              color={vc.orange}
              anchor="s"
              offset={8}
            />
            <MathLabel
              at={[3.4, 0]}
              tex="\text{concave up}"
              color={vc.purple}
              anchor="s"
              offset={8}
            />
          </>
        )}

        {(id === 'bend' || id === 'second-test' || id === 'together') && (
          <HoverGroup hoverKey="f">
            <FunctionPlot f={f} domain={[X_MIN, X_MAX]} color={vc.blue} />
            <MathLabel at={[4.4, f(4.4)]} tex="f" color={vc.blue} anchor="w" offset={10} />
          </HoverGroup>
        )}

        {id === 'together' && (
          <>
            <HoverGroup hoverKey="df">
              <FunctionPlot f={df} domain={[X_MIN, X_MAX]} color={vc.teal} />
              <MathLabel at={[4.3, df(4.3)]} tex="f'" color={vc.teal} anchor="w" offset={10} />
            </HoverGroup>
            <HoverGroup hoverKey="d2f">
              <FunctionPlot f={d2f} domain={[X_MIN, X_MAX]} color={vc.purple} />
              <MathLabel at={[4.3, d2f(4.3)]} tex="f''" color={vc.purple} anchor="w" offset={10} />
            </HoverGroup>
            <Segment from={[x, -3.6]} to={[x, 4.4]} color={vc.muted} width={1} dash="3 5" />
            <Point at={[x, df(x)]} color={vc.teal} r={4.5} coords={false} />
            <Point at={[x, d2f(x)]} color={vc.purple} r={4.5} coords={false} />
            {[1, 3].map((c) => (
              <Point key={c} at={[c, 0]} color={vc.teal} r={4} hollow coords={false} />
            ))}
            <Point at={[2, 0]} color={vc.purple} r={4} hollow coords={false} />
          </>
        )}

        {showP && (
          <>
            <Segment from={piece.from} to={piece.to} color={vc.teal} width={2.5} />
            <Point at={P} color={vc.blue} r={6} onDrag={([px]) => moveX(px)} />
            <MathLabel at={P} tex="P" color={vc.blue} anchor="nw" offset={12} />
          </>
        )}

        {id === 'inflection' && (
          <>
            <AxisInterval
              set={kase === 'quartic' ? [{ from: X_MIN, to: X_MAX }] : UP}
              axis="x"
              color={vc.purple}
              opacity={0.8}
            />
            {kase === 'cubic' && (
              <AxisInterval set={DOWN} axis="x" color={vc.orange} opacity={0.8} />
            )}
            <FunctionPlot f={q.f} domain={[X_MIN, X_MAX]} color={vc.blue} />
            <Point at={[2, q.f(2)]} color={kase === 'cubic' ? vc.yellow : vc.muted} r={6} />
            <MathLabel
              at={[2, q.f(2)]}
              tex={kase === 'cubic' ? '\\text{inflection}' : "f''(2) = 0,\\ \\text{no inflection}"}
              color={kase === 'cubic' ? vc.yellow : vc.muted}
              anchor={kase === 'cubic' ? 'e' : 's'}
              offset={14}
            />
          </>
        )}

        {id === 'second-test' && (
          <>
            <Segment from={[0.4, 2]} to={[1.6, 2]} color={vc.teal} width={2.5} />
            <Segment from={[2.4, 1]} to={[3.6, 1]} color={vc.teal} width={2.5} />
            <Point at={[1, 2]} color={vc.orange} r={6} />
            <Point at={[3, 1]} color={vc.purple} r={6} />
            <MathLabel
              at={[1, 2]}
              tex="f''(1) < 0,\ \max"
              color={vc.orange}
              anchor="n"
              offset={14}
            />
            <MathLabel
              at={[3, 1]}
              tex="f''(3) > 0,\ \min"
              color={vc.purple}
              anchor="s"
              offset={14}
            />
          </>
        )}

        {id === 'sketch' && (
          <>
            <g opacity={layer(0)}>
              <Segment from={[-6.2, 0]} to={[6.2, 0]} color={vc.yellow} width={2} dash="6 6" />
              <MathLabel at={[-5, 0]} tex="y \to 0" color={vc.yellow} anchor="n" offset={10} />
              <Point at={[0, 0]} color={vc.blue} r={4.5} />
            </g>
            <g opacity={layer(1)}>
              <Point at={[1, 2]} color={vc.teal} r={5.5} />
              <Point at={[-1, -2]} color={vc.teal} r={5.5} />
              <Segment from={[0.4, 2]} to={[1.6, 2]} color={vc.teal} width={2.5} />
              <Segment from={[-1.6, -2]} to={[-0.4, -2]} color={vc.teal} width={2.5} />
              <MathLabel at={[1, 2]} tex="(1, 2)" color={vc.teal} anchor="n" offset={12} />
              <MathLabel at={[-1, -2]} tex="(-1, -2)" color={vc.teal} anchor="s" offset={12} />
            </g>
            <g opacity={layer(2)}>
              {[-R3, 0, R3].map((c, i) => (
                <Point key={i} at={[c, g(c)]} color={vc.purple} r={5} />
              ))}
              <MathLabel at={[R3, g(R3)]} tex="\sqrt{3}" color={vc.purple} anchor="se" offset={8} />
            </g>
            <g opacity={layer(3)}>
              <AxisInterval
                set={[
                  { from: -R3, to: 0 },
                  { from: R3, to: 6.2 },
                ]}
                axis="x"
                color={vc.purple}
                opacity={0.8}
              />
              <AxisInterval
                set={[
                  { from: -6.2, to: -R3 },
                  { from: 0, to: R3 },
                ]}
                axis="x"
                color={vc.orange}
                opacity={0.8}
              />
            </g>
            {reveal > 4 && <FunctionPlot f={g} domain={[-6.2, curveEnd]} color={vc.blue} />}
          </>
        )}

        {id === 'outbreak' && (
          <>
            <HoverGroup hoverKey="new">
              <FunctionPlot
                f={(px) => newCases(px / SX) * SY_NEW}
                domain={[0, DAYS * SX]}
                color={vc.teal}
                width={2}
              />
            </HoverGroup>
            <FunctionPlot f={(px) => N(px / SX) * SY} domain={[0, DAYS * SX]} color={vc.blue} />
            <Segment
              from={[0, K * SY]}
              to={[DAYS * SX, K * SY]}
              color={vc.muted}
              width={1}
              dash="4 5"
            />
            <Segment
              from={[T0 * SX, 0]}
              to={[T0 * SX, K * SY]}
              color={vc.yellow}
              width={1}
              dash="3 5"
            />
            <Point at={[T0 * SX, N(T0) * SY]} color={vc.yellow} r={5.5} />
            <MathLabel
              at={[T0 * SX, N(T0) * SY]}
              tex="\text{inflection}"
              color={vc.yellow}
              anchor="w"
              offset={12}
            />
            <MathLabel
              at={[5.2, N(52) * SY]}
              tex="N\ (\text{thousands})"
              color={vc.blue}
              anchor="s"
              offset={10}
            />
            <MathLabel
              at={[4.6, newCases(46) * SY_NEW]}
              tex="\frac{dN}{dt}"
              color={vc.teal}
              anchor="ne"
              offset={6}
            />
            <Segment from={[D[0], 0]} to={D} color={vc.muted} width={1} dash="2 4" />
            <Point at={[D[0], newCases(day) * SY_NEW]} color={vc.teal} r={4.5} coords={false} />
            <Point
              at={D}
              color={vc.blue}
              r={6}
              coords={false}
              onDrag={([px]) => moveDay(px / SX)}
            />
            <MathLabel at={[6.4, 0]} tex="\text{day}" color={vc.muted} anchor="n" offset={12} />
          </>
        )}
      </Stage>

      <VizControls>
        {showP && (
          <LabeledSlider
            label="$x$"
            value={x}
            onChange={moveX}
            min={X_MIN}
            max={X_MAX}
            step={0.01}
            color={vc.blue}
          />
        )}
        {id === 'inflection' && (
          <SegmentedControl
            label="$f(x)$"
            value={kase}
            onChange={setKase}
            options={[
              { value: 'cubic', label: 'The cubic' },
              { value: 'quartic', label: '$\\frac{1}{4}(x - 2)^4 + 0.5$' },
            ]}
          />
        )}
        {id === 'outbreak' && (
          <LabeledSlider
            label="day"
            value={day}
            onChange={moveDay}
            min={0}
            max={DAYS}
            step={1}
            color={vc.blue}
            format={(v) => fmt(v, 0)}
          />
        )}
      </VizControls>
    </>
  )
}
