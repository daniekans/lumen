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
} from '@/viz-kit'

/** f' = 0.6 (x - 1)(x - 3). */
const f = (x: number) => 0.2 * x ** 3 - 1.2 * x ** 2 + 1.8 * x + 1
const df = (x: number) => 0.6 * (x - 1) * (x - 3)

const X_MIN = -0.2
const X_MAX = 4.8

/** Where f'(c) = m: 0.6c^2 - 2.4c + 1.8 = m. */
const slopePoints = (m: number) => {
  if (m < -0.6) return []
  const r = Math.sqrt((m + 0.6) / 0.6)
  return r === 0 ? [2] : [2 - r, 2 + r]
}

/** The b > a with f(b) = f(a): f(x) - f(a) = (x - a)(0.2x^2 + (0.2a - 1.2)x + 0.2a^2 - 1.2a + 1.8). */
const rolleEnd = (a: number) => {
  const p = 0.2 * a - 1.2
  const q = 0.2 * a * a - 1.2 * a + 1.8
  return (-p + Math.sqrt(Math.max(0, p * p - 0.8 * q))) / 0.4
}

const corner = (x: number) => Math.abs(x - 2) + 1
const CORNER_ENDS = [0.5, 4] as const

/** The trip: distance in km after t hours. Scaled on the stage by SX and SY. */
const TRIP_H = 1.5
const TRIP_KM = 160
const AVG = TRIP_KM / TRIP_H
const s = (t: number) =>
  AVG * t + 12 * Math.sin((4 * Math.PI * t) / 3) + 4 * Math.sin((8 * Math.PI * t) / 3)
const speed = (t: number) =>
  AVG +
  16 * Math.PI * Math.cos((4 * Math.PI * t) / 3) +
  ((32 * Math.PI) / 3) * Math.cos((8 * Math.PI * t) / 3)
const SX = 4
const SY = 1 / 40
/** Times when the speedometer reads the average, by sign changes and bisection. */
const AVG_TIMES = (() => {
  const g = (t: number) => speed(t) - AVG
  const out: number[] = []
  const n = 300
  for (let i = 0; i < n; i++) {
    let lo = (TRIP_H * i) / n
    let hi = (TRIP_H * (i + 1)) / n
    if (g(lo) * g(hi) > 0) continue
    for (let k = 0; k < 60; k++) {
      const mid = (lo + hi) / 2
      if (g(lo) * g(mid) <= 0) hi = mid
      else lo = mid
    }
    out.push((lo + hi) / 2)
  }
  return out
})()

const SHIFTS = [-1, 0, 1] as const

const VIEWS = {
  graph: [-0.7, 5.2, -0.8, 4.4],
  trip: [-1.2, 7.4, -0.9, 4.8],
} as const

export default function MeanValueTheorem() {
  const { id } = useVizStep()
  const [a, setA] = useState(0.3)
  const [b, setB] = useState(rolleEnd(0.3))
  const [x, setX] = useState(2.6)
  const seq = useSequence()
  const hl = useHighlight()
  const start = useStepStart({ a, b, x })

  const tweenEnds = (from: { a: number; b: number }, to: { a: number; b: number }) =>
    void seq.run(({ tween }) =>
      tween(0, 1, {
        duration: 1.6,
        onUpdate: (u) => {
          setA(from.a + (to.a - from.a) * u)
          setB(from.b + (to.b - from.b) * u)
        },
      }),
    )

  useStepEffect({
    rolle: (run) =>
      tweenEnds(run.replay ? { a: 0.3, b: 4.6 } : start(run), { a: 0.3, b: rolleEnd(0.3) }),
    mvt: (run) =>
      tweenEnds(run.replay ? { a: 0.3, b: rolleEnd(0.3) } : start(run), { a: 0.3, b: 4.6 }),
    proof: (run) => tweenEnds(start(run), { a: 0.3, b: 4.6 }),
    fails: () => seq.cancel(),
    speed: () => seq.cancel(),
    'same-slope': (run) =>
      void seq.run(({ tween }) =>
        tween(run.replay ? 0.4 : start(run).x, 3.6, { duration: 3, onUpdate: setX }),
      ),
  })

  const trip = id === 'speed'
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(trip ? VIEWS.trip : VIEWS.graph, {
    duration: 1.1,
  })

  const moveA = (v: number) => {
    seq.cancel()
    if (id === 'rolle') {
      const na = clamp(v, 0, 0.95)
      setA(na)
      setB(rolleEnd(na))
    } else setA(clamp(v, X_MIN, b - 0.3))
  }
  const moveB = (v: number) => {
    seq.cancel()
    setB(clamp(v, a + 0.3, X_MAX))
  }
  const moveX = (v: number) => {
    seq.cancel()
    setX(clamp(v, X_MIN, X_MAX))
  }

  const A: Vec2 = [a, f(a)]
  const B: Vec2 = [b, f(b)]
  const m = (B[1] - A[1]) / (b - a)
  const cs = slopePoints(m).filter((c) => c > a + 1e-6 && c < b - 1e-6)
  const chord = (t: number) => A[1] + m * (t - a)
  const gap = (t: number) => f(t) - chord(t)
  const curveStep = id === 'rolle' || id === 'mvt' || id === 'proof'

  const cA: Vec2 = [CORNER_ENDS[0], corner(CORNER_ENDS[0])]
  const cB: Vec2 = [CORNER_ENDS[1], corner(CORNER_ENDS[1])]

  const tripPoint = (t: number): Vec2 => [t * SX, s(t) * SY]

  return (
    <>
      <Stage
        zoomable
        highlight={hl}
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="A curve with a secant from A to B and a parallel tangent at c"
        overlay={
          <Overlay corner="top-left">
            {curveStep && (
              <ReadoutPanel>
                <Readout label="$a$" value={fmt(a)} color={vc.yellow} />
                <Readout label="$b$" value={fmt(b)} color={vc.yellow} />
                <Readout
                  label="chord slope"
                  value={fmt(m, 3)}
                  color={vc.orange}
                  hint="$\frac{f(b) - f(a)}{b - a}$"
                  {...hl.bind('chord')}
                />
                {cs.map((c, i) => (
                  <Readout
                    key={i}
                    label={`$f'(c_{${i + 1}})$, $c_{${i + 1}} = ${fmt(c)}$`}
                    value={fmt(df(c), 3)}
                    color={vc.teal}
                    {...hl.bind('tangent')}
                  />
                ))}
                {id === 'proof' && (
                  <Readout
                    label="gap $h(x)$"
                    value={<Tex>{'f(x) - \\text{chord}(x)'}</Tex>}
                    color={vc.purple}
                    hint="$h(x) = f(x) - f(a) - \frac{f(b) - f(a)}{b - a}(x - a)$, with $h(a) = h(b) = 0$."
                    {...hl.bind('gap')}
                  />
                )}
              </ReadoutPanel>
            )}
            {id === 'fails' && (
              <ReadoutPanel>
                <Readout
                  label="chord slope"
                  value={fmt((cB[1] - cA[1]) / 3.5, 4)}
                  color={vc.orange}
                />
                <Readout label="tangent slopes" value="−1 or 1" color={vc.teal} />
              </ReadoutPanel>
            )}
            {trip && (
              <ReadoutPanel>
                <Readout label="distance" value={`${TRIP_KM} km`} />
                <Readout label="time" value={`${TRIP_H} h`} />
                <Readout
                  label="average speed"
                  value={`${fmt(AVG, 1)} km/h`}
                  color={vc.orange}
                  {...hl.bind('chord')}
                />
                {AVG_TIMES.map((t, i) => (
                  <Readout
                    key={i}
                    label={`speedometer at ${fmt(t * 60, 0)} min`}
                    value={`${fmt(speed(t), 1)} km/h`}
                    color={vc.teal}
                    {...hl.bind('tangent')}
                  />
                ))}
              </ReadoutPanel>
            )}
            {id === 'same-slope' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(x)} />
                <Readout
                  label="slope of each"
                  value={fmt(df(x), 3)}
                  color={vc.teal}
                  hint="$\frac{d}{dx}\left(f(x) + C\right) = f'(x)$"
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes
          formatX={trip ? (v) => (v < 0 ? null : fmt(v / SX, 2)) : undefined}
          formatY={trip ? (v) => (v < 0 ? null : fmt(v / SY, 0)) : undefined}
        />

        {curveStep && (
          <>
            {id === 'proof' && (
              <HoverGroup hoverKey="gap">
                <FunctionPlot f={gap} domain={[a, b]} color={vc.purple} width={2} />
                <MathLabel
                  at={[(a + b) / 2, gap((a + b) / 2)]}
                  tex="h"
                  color={vc.purple}
                  anchor="n"
                  offset={10}
                />
                {cs.map((c, i) => (
                  <g key={i}>
                    <Segment
                      from={[c, chord(c)]}
                      to={[c, f(c)]}
                      color={vc.purple}
                      width={2}
                      dash="3 4"
                    />
                    <Point at={[c, gap(c)]} color={vc.purple} r={4.5} coords={false} />
                  </g>
                ))}
              </HoverGroup>
            )}
            <FunctionPlot f={f} domain={[X_MIN, X_MAX]} color={vc.blue} />
            <HoverGroup hoverKey="chord">
              <Segment from={A} to={B} color={vc.orange} width={2.5} />
            </HoverGroup>
            <HoverGroup hoverKey="tangent">
              {cs.map((c, i) => {
                const piece = tangentPiece([c, f(c)], df(c), 0.8)
                return (
                  <g key={i}>
                    <Segment from={piece.from} to={piece.to} color={vc.teal} width={2.5} />
                    <Point at={[c, f(c)]} color={vc.teal} r={5} />
                    <MathLabel
                      at={[c, f(c)]}
                      tex={`c_{${i + 1}}`}
                      color={vc.teal}
                      anchor="s"
                      offset={12}
                    />
                  </g>
                )
              })}
            </HoverGroup>
            <Point at={A} color={vc.yellow} r={6} onDrag={([px]) => moveA(px)} />
            <MathLabel at={A} tex="A" color={vc.yellow} anchor="nw" offset={12} />
            <Point
              at={B}
              color={vc.yellow}
              r={6}
              onDrag={id === 'rolle' ? undefined : ([px]) => moveB(px)}
            />
            <MathLabel at={B} tex="B" color={vc.yellow} anchor="ne" offset={12} />
          </>
        )}

        {id === 'fails' && (
          <>
            <FunctionPlot f={corner} domain={[X_MIN, X_MAX]} color={vc.blue} />
            <Segment from={cA} to={cB} color={vc.orange} width={2.5} />
            {[1, 3].map((t, i) => {
              const piece = tangentPiece([t, corner(t)], t < 2 ? -1 : 1, 0.5)
              return <Segment key={i} from={piece.from} to={piece.to} color={vc.teal} width={2.5} />
            })}
            <Point at={cA} color={vc.yellow} r={6} />
            <Point at={cB} color={vc.yellow} r={6} />
            <Point at={[2, 1]} color={vc.red} r={5} />
            <MathLabel at={[2, 1]} tex="\text{no } f'(2)" color={vc.red} anchor="s" offset={12} />
          </>
        )}

        {trip && (
          <>
            <FunctionPlot f={(px) => s(px / SX) * SY} domain={[0, TRIP_H * SX]} color={vc.blue} />
            <HoverGroup hoverKey="chord">
              <Segment from={tripPoint(0)} to={tripPoint(TRIP_H)} color={vc.orange} width={2.5} />
            </HoverGroup>
            <HoverGroup hoverKey="tangent">
              {AVG_TIMES.map((t, i) => {
                const piece = tangentPiece(tripPoint(t), (speed(t) * SY) / SX, 0.9)
                return (
                  <g key={i}>
                    <Segment from={piece.from} to={piece.to} color={vc.teal} width={2.5} />
                    <Point at={tripPoint(t)} color={vc.teal} r={5} coords={false} />
                  </g>
                )
              })}
            </HoverGroup>
            <MathLabel at={[7, 0]} tex="t\ (\text{h})" color={vc.muted} anchor="n" offset={12} />
            <MathLabel
              at={tripPoint(TRIP_H)}
              tex="s = 160\ \text{km}"
              color={vc.blue}
              anchor="w"
              offset={12}
            />
          </>
        )}

        {id === 'same-slope' &&
          SHIFTS.map((k, i) => {
            const P: Vec2 = [x, f(x) + k]
            const piece = tangentPiece(P, df(x), 0.7)
            return (
              <g key={i}>
                <FunctionPlot
                  f={(t) => f(t) + k}
                  domain={[X_MIN, X_MAX]}
                  color={vc.blue}
                  opacity={k === 0 ? 1 : 0.55}
                />
                <MathLabel
                  at={[4.6, f(4.6) + k]}
                  tex={k === 0 ? 'f' : `f ${k < 0 ? '-' : '+'} ${Math.abs(k)}`}
                  color={vc.blue}
                  anchor="e"
                  offset={10}
                />
                <Segment from={piece.from} to={piece.to} color={vc.teal} width={2.5} />
                <Point
                  at={P}
                  color={vc.blue}
                  r={k === 0 ? 6 : 4.5}
                  onDrag={k === 0 ? ([px]) => moveX(px) : undefined}
                />
              </g>
            )
          })}
      </Stage>

      <VizControls>
        {curveStep && (
          <LabeledSlider
            label="$a$"
            value={a}
            onChange={moveA}
            min={id === 'rolle' ? 0 : X_MIN}
            max={id === 'rolle' ? 0.95 : X_MAX - 0.3}
            step={0.01}
            color={vc.yellow}
          />
        )}
        {(id === 'mvt' || id === 'proof') && (
          <LabeledSlider
            label="$b$"
            value={b}
            onChange={moveB}
            min={X_MIN + 0.3}
            max={X_MAX}
            step={0.01}
            color={vc.yellow}
          />
        )}
        {id === 'same-slope' && (
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
      </VizControls>
    </>
  )
}
