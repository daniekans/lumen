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

/** f' = 3/4 (x - 1)(x - 3): local maximum f(1) = 2, local minimum f(3) = 1. */
const f = (x: number) => 0.25 * x ** 3 - 1.5 * x ** 2 + 2.25 * x + 1
const df = (x: number) => 0.75 * (x - 1) * (x - 3)
const CRITICAL = [1, 3] as const

const X_MIN = -0.4
const X_MAX = 5

type Kind = 'turn' | 'flat' | 'corner'
const KINDS: Record<Kind, { g: Fn; tex: string; c: number; note: string }> = {
  turn: { g: f, tex: 'f', c: 1, note: "f'(1) = 0,\\ \\text{local max}" },
  flat: {
    g: (x) => 0.5 * (x - 2) ** 3 + 1.5,
    tex: '\\tfrac{1}{2}(x - 2)^3 + 1.5',
    c: 2,
    note: "f'(2) = 0,\\ \\text{no extremum}",
  },
  corner: {
    g: (x) => 0.8 * Math.abs(x - 2) + 0.6,
    tex: '0.8\\,|x - 2| + 0.6',
    c: 2,
    note: "f'(2)\\ \\text{undefined},\\ \\text{local min}",
  },
}
const kindCodec: ParamCodec<Kind> = {
  encode: (v) => v,
  decode: (t) => (t in KINDS ? (t as Kind) : undefined),
}

/** Concentration after a dose, mg/L, t in hours. */
const C = (t: number) => 8 * t * Math.exp(-t / 2)
const T_END = 12

type Gap = 'open' | 'jump'
const gapCodec: ParamCodec<Gap> = {
  encode: (v) => v,
  decode: (t) => (t === 'open' || t === 'jump' ? t : undefined),
}
const OPEN: Interval = { from: 0.5, to: 4.4 }
const jump = (x: number) => (x < 2 ? 0.5 * x + 1 : 0.8)

const VIEWS = {
  graph: [-0.9, 5.4, -0.9, 4.2],
  dose: [-1.2, 13, -1.4, 7.6],
} as const

const RISING: Interval[] = [
  { from: X_MIN, to: 1 },
  { from: 3, to: X_MAX },
]
const FALLING: Interval[] = [{ from: 1, to: 3 }]

export default function Extrema() {
  const { id } = useVizStep()
  const [x, setX] = useState(0.2)
  const [h, setH] = useState(1.2)
  const [ends, setEnds] = useState<[number, number]>([0.5, 3.8])
  const [kind, setKind] = useVizParam<Kind>('kind', 'flat', kindCodec)
  const [gap, setGap] = useVizParam<Gap>('gap', 'open', gapCodec)
  const seq = useSequence()
  const hl = useHighlight()
  const start = useStepStart({ x, h, ends })

  const sweep = (from: number, to: number, duration: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration, onUpdate: setX }))

  useStepEffect({
    local: (run) => sweep(run.replay ? 0 : start(run).x, 3.6, 3.6),
    fermat: () => void seq.run(({ tween }) => tween(1.2, 0.02, { duration: 2.6, onUpdate: setH })),
    critical: () => seq.cancel(),
    'first-test': (run) => sweep(run.replay ? X_MIN : start(run).x, 4.4, 4),
    closed: (run) => {
      const from = start(run).ends
      void seq.run(({ tween }) =>
        tween(0, 1, {
          duration: 1.6,
          onUpdate: (u) => setEnds([from[0] + (0.2 - from[0]) * u, from[1] + (4.4 - from[1]) * u]),
        }),
      )
    },
    dose: () => seq.cancel(),
    'no-max': () => seq.cancel(),
  })

  const graph = id !== 'dose'
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(graph ? VIEWS.graph : VIEWS.dose, {
    duration: 1.1,
  })

  const moveX = (v: number) => {
    seq.cancel()
    setX(clamp(v, X_MIN, X_MAX))
  }
  const moveH = (v: number) => {
    seq.cancel()
    setH(clamp(v, 0.01, 1.4))
  }
  const moveEnd = (i: 0 | 1, v: number) => {
    seq.cancel()
    setEnds(([a, b]) =>
      i === 0 ? [clamp(v, X_MIN, b - 0.2), b] : [a, clamp(v, a + 0.2, X_MAX - 0.2)],
    )
  }

  const P: Vec2 = [x, f(x)]
  const piece = tangentPiece(P, df(x), 0.7)

  // Fermat: one-sided secants at the peak x = 1.
  const O: Vec2 = [1, f(1)]
  const R: Vec2 = [1 + h, f(1 + h)]
  const L: Vec2 = [1 - h, f(1 - h)]

  // Closed interval method.
  const [a, b] = ends
  const candidates = [
    { x: a, what: 'end' },
    ...CRITICAL.filter((c) => c > a && c < b).map((c) => ({ x: c, what: 'critical' })),
    { x: b, what: 'end' },
  ].map((p) => ({ ...p, y: f(p.x) }))
  const top = candidates.reduce((m, p) => (p.y > m.y ? p : m))
  const bottom = candidates.reduce((m, p) => (p.y < m.y ? p : m))
  // Ties (two candidates at the same height) share the mark.
  const isTop = (p: { y: number }) => Math.abs(p.y - top.y) < 1e-9
  const isBottom = (p: { y: number }) => Math.abs(p.y - bottom.y) < 1e-9
  const mark = (p: { y: number }) => (isTop(p) ? vc.green : isBottom(p) ? vc.red : vc.muted)

  const k = KINDS[kind]
  const showP = id === 'local' || id === 'first-test'

  return (
    <>
      <Stage
        zoomable
        highlight={hl}
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Graph of a function with its local maximum and minimum marked"
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
                />
                <Readout
                  label="$f'(x)$"
                  value={fmt(df(x))}
                  color={df(x) > 0.005 ? vc.green : df(x) < -0.005 ? vc.red : vc.teal}
                  hint="$f'(x) = \frac{3}{4}(x - 1)(x - 3)$"
                />
              </ReadoutPanel>
            )}
            {id === 'fermat' && (
              <ReadoutPanel title="Secants at the peak">
                <Readout label="$h$" value={fmt(h, 3)} />
                <Readout
                  label="from the right"
                  value={fmt((R[1] - O[1]) / h, 3)}
                  color={vc.yellow}
                  hint="$\frac{f(1 + h) - f(1)}{h} \le 0$"
                  {...hl.bind('right')}
                />
                <Readout
                  label="from the left"
                  value={fmt((O[1] - L[1]) / h, 3)}
                  color={vc.orange}
                  hint="$\frac{f(1) - f(1 - h)}{h} \ge 0$"
                  {...hl.bind('left')}
                />
              </ReadoutPanel>
            )}
            {id === 'critical' && (
              <ReadoutPanel>
                <Readout label="function" value={<Tex>{k.tex}</Tex>} color={vc.blue} />
                <Readout
                  label="at the critical point"
                  value={<Tex>{k.note}</Tex>}
                  color={vc.teal}
                />
              </ReadoutPanel>
            )}
            {id === 'closed' && (
              <ReadoutPanel title="Candidates">
                {candidates.map((p, i) => (
                  <Readout
                    key={i}
                    label={`$f(${fmt(p.x)})$ ${p.what === 'end' ? '(end)' : '(critical)'}`}
                    value={fmt(p.y, 3)}
                    color={mark(p)}
                  />
                ))}
              </ReadoutPanel>
            )}
            {id === 'dose' && (
              <ReadoutPanel>
                <Readout
                  label="$C(t)$"
                  value={<Tex>{'8t\\,e^{-t/2}'}</Tex>}
                  color={vc.blue}
                  hint="Concentration in mg/L, $t$ in hours."
                />
                <Readout label="peak $C(2)$" value={`${fmt(C(2), 3)} mg/L`} color={vc.green} />
                <Readout label="$C(0)$" value="0 mg/L" color={vc.red} />
                <Readout label="$C(12)$" value={`${fmt(C(T_END), 3)} mg/L`} color={vc.muted} />
              </ReadoutPanel>
            )}
            {id === 'no-max' && (
              <ReadoutPanel>
                {gap === 'open' ? (
                  <Readout
                    label="on $(0.5, 4.4)$"
                    value={`values below ${fmt(f(4.4), 3)}`}
                    color={vc.blue}
                    hint="Every value is beaten by one further right, so none is the largest."
                  />
                ) : (
                  <Readout
                    label="on $[0, 4]$"
                    value="values below 2"
                    color={vc.blue}
                    hint="The values near $x = 2$ from the left approach $2$, but the function drops to $0.8$ at $x = 2$."
                  />
                )}
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {id === 'first-test' && (
          <>
            <AxisInterval set={RISING} axis="x" color={vc.green} opacity={0.8} />
            <AxisInterval set={FALLING} axis="x" color={vc.red} opacity={0.8} />
            <FunctionPlot f={df} domain={[X_MIN, X_MAX]} color={vc.teal} width={1.5} dash="5 5" />
            <MathLabel at={[4.1, df(4.1)]} tex="f'" color={vc.teal} anchor="e" offset={10} />
            <MathLabel at={[0.3, 0]} tex="+" color={vc.green} anchor="n" offset={10} />
            <MathLabel at={[2, 0]} tex="-" color={vc.red} anchor="n" offset={10} />
            <MathLabel at={[4, 0]} tex="+" color={vc.green} anchor="n" offset={10} />
          </>
        )}

        {(id === 'local' || id === 'first-test' || id === 'fermat') && (
          <>
            <FunctionPlot f={f} domain={[X_MIN, X_MAX]} color={vc.blue} />
            <MathLabel at={[1, 2]} tex="\text{local max}" color={vc.green} anchor="n" offset={14} />
            <MathLabel at={[3, 1]} tex="\text{local min}" color={vc.red} anchor="s" offset={14} />
            {id !== 'fermat' && (
              <>
                <Point at={[1, 2]} color={vc.green} r={5} />
                <Point at={[3, 1]} color={vc.red} r={5} />
              </>
            )}
          </>
        )}

        {id === 'local' && (
          <>
            <Segment from={[0.4, 2]} to={[1.6, 2]} color={vc.green} width={1} dash="3 4" />
            <Segment from={[2.4, 1]} to={[3.6, 1]} color={vc.red} width={1} dash="3 4" />
          </>
        )}

        {showP && (
          <>
            <Segment from={piece.from} to={piece.to} color={vc.teal} width={2.5} />
            <Point at={P} color={vc.blue} r={6} onDrag={([px]) => moveX(px)} />
            <MathLabel at={P} tex="P" color={vc.blue} anchor="nw" offset={12} />
          </>
        )}

        {id === 'fermat' && (
          <>
            <HoverGroup hoverKey="right">
              <Segment from={O} to={R} extend color={vc.yellow} width={3} opacity={0.7} />
              <Point at={R} color={vc.yellow} r={5} onDrag={([px]) => moveH(px - 1)} />
            </HoverGroup>
            <HoverGroup hoverKey="left">
              <Segment from={O} to={L} extend color={vc.orange} width={3} opacity={0.7} />
              <Point at={L} color={vc.orange} r={5} onDrag={([px]) => moveH(1 - px)} />
            </HoverGroup>
            <Point at={O} color={vc.green} r={6} />
          </>
        )}

        {id === 'critical' && (
          <>
            <FunctionPlot f={k.g} domain={[X_MIN, X_MAX]} color={vc.blue} />
            <Point at={[k.c, k.g(k.c)]} color={vc.teal} r={6} />
            {kind !== 'corner' && (
              <Segment
                from={[k.c - 0.8, k.g(k.c)]}
                to={[k.c + 0.8, k.g(k.c)]}
                color={vc.teal}
                width={2.5}
              />
            )}
            <MathLabel
              at={[k.c, k.g(k.c)]}
              tex={`x = ${k.c}`}
              color={vc.teal}
              anchor={kind === 'turn' ? 'n' : 's'}
              offset={14}
            />
          </>
        )}

        {id === 'closed' && (
          <>
            <FunctionPlot f={f} domain={[X_MIN, X_MAX]} color={vc.blue} opacity={0.3} />
            <FunctionPlot f={f} domain={[a, b]} color={vc.blue} width={3} />
            {candidates.map((p, i) => (
              <g key={i}>
                <Segment from={[p.x, 0]} to={[p.x, p.y]} color={vc.muted} width={1} dash="3 4" />
                <Point at={[p.x, p.y]} color={mark(p)} r={isTop(p) || isBottom(p) ? 6 : 4.5} />
              </g>
            ))}
            <MathLabel at={[top.x, top.y]} tex="\max" color={vc.green} anchor="n" offset={14} />
            <MathLabel at={[bottom.x, bottom.y]} tex="\min" color={vc.red} anchor="s" offset={14} />
            <MathLabel at={[a, 0]} tex="a" color={vc.yellow} anchor="s" offset={12} />
            <MathLabel at={[b, 0]} tex="b" color={vc.yellow} anchor="s" offset={12} />
            <Point at={[a, 0]} color={vc.yellow} r={5} onDrag={([px]) => moveEnd(0, px)} />
            <Point at={[b, 0]} color={vc.yellow} r={5} onDrag={([px]) => moveEnd(1, px)} />
          </>
        )}

        {id === 'dose' && (
          <>
            <FunctionPlot f={C} domain={[0, T_END]} color={vc.blue} />
            <Segment from={[0, C(2)]} to={[T_END, C(2)]} color={vc.green} width={1} dash="4 5" />
            <Segment from={[2, 0]} to={[2, C(2)]} color={vc.muted} width={1} dash="3 4" />
            <Segment from={[1, C(2)]} to={[3, C(2)]} color={vc.teal} width={2.5} />
            <Point at={[2, C(2)]} color={vc.green} r={6} />
            <MathLabel at={[2, C(2)]} tex="\text{peak}" color={vc.green} anchor="n" offset={14} />
            <Point at={[0, 0]} color={vc.red} r={5} />
            <Point at={[T_END, C(T_END)]} color={vc.muted} r={4.5} />
            <MathLabel at={[12.6, 0]} tex="t\ (\text{h})" color={vc.muted} anchor="n" offset={10} />
            <MathLabel
              at={[0, 7.2]}
              tex="C\ (\text{mg/L})"
              color={vc.muted}
              anchor="e"
              offset={10}
            />
          </>
        )}

        {id === 'no-max' &&
          (gap === 'open' ? (
            <>
              <FunctionPlot f={f} domain={[OPEN.from, OPEN.to]} color={vc.blue} />
              <Point at={[OPEN.from, f(OPEN.from)]} color={vc.blue} hollow r={5} />
              <Point at={[OPEN.to, f(OPEN.to)]} color={vc.blue} hollow r={5} />
              <Segment
                from={[0, f(OPEN.to)]}
                to={[OPEN.to, f(OPEN.to)]}
                color={vc.red}
                width={1}
                dash="4 5"
              />
              <MathLabel
                at={[OPEN.to, f(OPEN.to)]}
                tex="\text{never reached}"
                color={vc.red}
                anchor="n"
                offset={14}
              />
            </>
          ) : (
            <>
              <FunctionPlot f={jump} domain={[0, 4]} breaks={[2]} color={vc.blue} />
              <Point at={[0, 1]} color={vc.blue} r={4.5} />
              <Point at={[2, 2]} color={vc.blue} hollow r={5} />
              <Point at={[2, 0.8]} color={vc.blue} r={5} />
              <Point at={[4, 0.8]} color={vc.blue} r={4.5} />
              <Segment from={[0, 2]} to={[2, 2]} color={vc.red} width={1} dash="4 5" />
              <MathLabel
                at={[2, 2]}
                tex="\text{never reached}"
                color={vc.red}
                anchor="e"
                offset={12}
              />
            </>
          ))}
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
        {id === 'fermat' && (
          <LabeledSlider
            label="$h$"
            value={h}
            onChange={moveH}
            min={0.01}
            max={1.4}
            step={0.01}
            color={vc.yellow}
          />
        )}
        {id === 'critical' && (
          <SegmentedControl
            label="Function"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'turn', label: 'Turning' },
              { value: 'flat', label: 'Flat, no turn' },
              { value: 'corner', label: 'Corner' },
            ]}
          />
        )}
        {id === 'closed' && (
          <>
            <LabeledSlider
              label="$a$"
              value={a}
              onChange={(v) => moveEnd(0, v)}
              min={X_MIN}
              max={X_MAX - 0.4}
              step={0.01}
              color={vc.yellow}
            />
            <LabeledSlider
              label="$b$"
              value={b}
              onChange={(v) => moveEnd(1, v)}
              min={X_MIN + 0.2}
              max={X_MAX - 0.2}
              step={0.01}
              color={vc.yellow}
            />
          </>
        )}
        {id === 'no-max' && (
          <SegmentedControl
            label="Case"
            value={gap}
            onChange={setGap}
            options={[
              { value: 'open', label: 'Open interval' },
              { value: 'jump', label: 'A jump' },
            ]}
          />
        )}
      </VizControls>
    </>
  )
}
