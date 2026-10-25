import { useState } from 'react'
import { clamp, fmt, tangentPiece, type Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
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
  TextLabel,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useStepStart,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

/** A ball thrown up at 19.6 m/s: s(t) = 19.6t - 4.9t², at the top at t = 2, back down at t = 4. */
const V0 = 19.6
const G = 9.8
const s = (t: number) => V0 * t - (G / 2) * t * t
const v = (t: number) => V0 - G * t
const T_END = 4

/** The graph is drawn at SX plot units per second and SY meters (or m/s, m/s²) per plot unit. */
const SX = 2
const SY = 5
const at = (t: number, value: number): Vec2 => [t * SX, value / SY]

/** The ball's track, left of the graph. */
const TRACK_X = -1.2
/** Arrows on the ball are drawn this many plot units long per m/s (or m/s²). */
const ARROW = 0.1
const DT_MIN = 0.001

/** Views as [x0, x1, y0, y1]: position only, then room for the negative velocities. */
const VIEW_S = [-2.2, 9.2, -1.2, 5.2] as const
const VIEW_V = [-2.2, 9.2, -4.6, 5.2] as const

const traceOf = (f: (t: number) => number, to: number, n = 120): Vec2[] =>
  Array.from({ length: n + 1 }, (_, i) => at((to * i) / n, f((to * i) / n)))

export default function Motion() {
  const { id } = useVizStep()
  const [time, setTime] = useState(T_END)
  const [t0, setT0] = useState(1)
  const [dt, setDt] = useState(2)
  const seq = useSequence()
  const start = useStepStart({ dt })

  const sweep = (set: (t: number) => void, seconds: number) =>
    void seq.run(({ tween }) =>
      tween(0, T_END, { duration: seconds, ease: 'linear', onUpdate: set }),
    )

  useStepEffect({
    position: () => sweep(setTime, T_END),
    average: (run) => {
      setT0(1)
      const from = start(run).dt
      if (from === 1) setDt(1)
      else void seq.run(({ tween }) => tween(from, 1, { duration: 1.2, onUpdate: setDt }))
    },
    instant: (run) => {
      setT0(1)
      const from = run.replay ? 1 : start(run).dt
      void seq.run(({ tween }) => tween(from, DT_MIN, { duration: 2, onUpdate: setDt }))
    },
    velocity: () => sweep(setT0, 6),
    acceleration: () => sweep(setT0, 6),
  })

  const manual =
    <T,>(set: (v: T) => void) =>
    (value: T) => {
      seq.cancel()
      set(value)
    }
  const setTimeManually = manual(setTime)
  const setT0Manually = manual((value: number) => {
    setT0(value)
    setDt((d) => Math.min(d, T_END - value))
  })
  const setDtManually = manual((value: number) => setDt(clamp(value, DT_MIN, T_END - t0)))

  const tracing = id === 'position'
  const secant = id === 'average' || id === 'instant'
  const showV = id === 'velocity' || id === 'acceleration'
  const showA = id === 'acceleration'

  // The moment the ball is shown at.
  const tb = tracing ? time : t0
  const ball: Vec2 = [TRACK_X, s(tb) / SY]
  const vel = v(tb)

  const P = at(t0, s(t0))
  const Q = at(t0 + dt, s(t0 + dt))
  const avg = (s(t0 + dt) - s(t0)) / dt
  // The secant in plot units has slope avg * SX / SY.
  const plotSlope = (rate: number) => rate / SY / SX
  const triangleOpacity = clamp((dt - 0.12) / 0.3, 0, 1)
  const top = at(2, s(2))
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(showV ? VIEW_V : VIEW_S, { duration: 1.2 })

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="A ball thrown upward moving on a vertical track, next to the graph of its height over time, with its velocity and acceleration"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="$t$" value={fmt(tb, 2)} />
              <Readout label="$s(t)$" value={fmt(s(tb), 2)} color={vc.blue} />
              {secant && (
                <>
                  <Readout label="$\Delta t$" value={fmt(dt, 3)} />
                  <Readout
                    label="$\frac{\Delta s}{\Delta t}$"
                    value={fmt(avg, 3)}
                    color={vc.yellow}
                    hint="The average velocity over the interval, in meters per second."
                  />
                </>
              )}
              {(id === 'instant' || showV) && (
                <Readout
                  label="$v = \frac{ds}{dt}$"
                  value={fmt(vel, 3)}
                  color={vc.teal}
                  hint="$19.6 - 9.8t$, in meters per second. Negative means moving down."
                />
              )}
              {showA && (
                <>
                  <Readout
                    label="$a = \frac{d^2s}{dt^2}$"
                    value={fmt(-G, 2)}
                    color={vc.orange}
                    hint="The rate of change of the velocity, in meters per second per second."
                  />
                  <Readout label="speed $\lvert v \rvert$" value={fmt(Math.abs(vel), 3)} />
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <Axes formatX={(x) => (x < 0 ? null : fmt(x / SX, 1))} formatY={(y) => fmt(y * SY, 0)} />
        <MathLabel at={[T_END * SX + 0.5, 0]} tex="t" anchor="n" color={vc.muted} />

        <Segment
          from={[TRACK_X, 0]}
          to={[TRACK_X, 21 / SY]}
          color={vc.muted}
          width={3}
          opacity={0.6}
        />
        <Segment from={ball} to={at(tb, s(tb))} color={vc.muted} width={1} dash="2 4" />

        {tracing ? (
          <Path points={traceOf(s, time)} color={vc.blue} width={3} />
        ) : (
          <Path points={traceOf(s, T_END)} color={vc.blue} width={3} />
        )}
        <MathLabel at={at(3.3, s(3.3))} tex="s(t)" anchor="e" color={vc.blue} />

        {secant && (
          <>
            <Segment
              from={P}
              to={Q}
              extend
              color={vc.yellow}
              width={2}
              opacity={id === 'instant' ? 1 - 0.7 * (1 - triangleOpacity) : 1}
            />
            <Path
              points={[P, [Q[0], P[1]], Q]}
              closed
              color={vc.yellow}
              width={1}
              fill={alpha(vc.yellow, 0.15)}
              opacity={triangleOpacity}
            />
            {triangleOpacity > 0.5 && (
              <>
                <MathLabel at={[(P[0] + Q[0]) / 2, P[1]]} tex="\Delta t" anchor="s" />
                <MathLabel
                  at={[Q[0], (P[1] + Q[1]) / 2]}
                  tex="\Delta s"
                  anchor={Q[1] >= P[1] ? 'e' : 'w'}
                />
              </>
            )}
            {id === 'instant' && (
              <Segment {...tangentPiece(P, plotSlope(v(t0)), 2)} color={vc.teal} width={2.5} />
            )}
            <Point at={Q} color={vc.yellow} r={5} label="Q" coords={false} />
            <Point at={P} color={vc.blue} r={6} label="P" coords={false} />
          </>
        )}

        {showV && (
          <>
            <FunctionPlot
              f={(x) => v(x / SX) / SY}
              domain={[0, T_END * SX]}
              color={vc.teal}
              width={2.5}
            />
            <MathLabel at={at(0.4, v(0.4))} tex="v(t)" anchor="ne" color={vc.teal} />
            <Segment {...tangentPiece(P, plotSlope(v(t0)), 1.6)} color={vc.teal} width={2} />
            <Segment from={P} to={at(t0, v(t0))} color={vc.muted} width={1} dash="2 4" />
            <Point at={top} color={vc.muted} r={4} hollow coords={false} />
            <Point at={at(2, 0)} color={vc.teal} r={4} hollow coords={false} />
            <MathLabel at={at(2, 0)} tex="v = 0" anchor="ne" color={vc.teal} />
            <Point at={at(t0, v(t0))} color={vc.teal} r={5} coords={false} />
            <Point at={P} color={vc.blue} r={6} coords={false} />
          </>
        )}

        {showA && (
          <>
            <Segment from={at(0, -G)} to={at(T_END, -G)} color={vc.orange} width={2.5} />
            <MathLabel at={at(T_END, -G)} tex="a(t) = -9.8" anchor="e" color={vc.orange} />
            <TextLabel at={at(1, 22)} color={vc.muted} size={12}>
              slowing down
            </TextLabel>
            <TextLabel at={at(3, 22)} color={vc.muted} size={12}>
              speeding up
            </TextLabel>
            <Vector
              from={[TRACK_X + 0.35, ball[1]]}
              to={[TRACK_X + 0.35, ball[1] - G * ARROW]}
              color={vc.orange}
              grow={false}
            />
          </>
        )}

        {(id === 'instant' || showV) && Math.abs(vel) > 0.3 && (
          <Vector from={ball} to={[TRACK_X, ball[1] + vel * ARROW]} color={vc.teal} grow={false} />
        )}
        <Point at={ball} color={vc.fg} r={8} coords={false} />
      </Stage>

      <VizControls>
        {tracing && (
          <LabeledSlider
            label="$t$"
            value={time}
            onChange={setTimeManually}
            min={0}
            max={T_END}
            step={0.01}
          />
        )}
        {!tracing && (
          <LabeledSlider
            label="$t$"
            value={t0}
            onChange={setT0Manually}
            min={0}
            max={secant ? T_END - DT_MIN : T_END}
            step={0.01}
            color={vc.blue}
          />
        )}
        {secant && (
          <LabeledSlider
            label="$\Delta t$"
            value={dt}
            onChange={setDtManually}
            min={DT_MIN}
            max={T_END - t0}
            step={0.001}
            color={vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
