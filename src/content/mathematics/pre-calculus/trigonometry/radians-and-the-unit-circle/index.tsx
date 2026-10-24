import { useState } from 'react'
import { exactTex, fmt, piTex, radToDeg, TAU, type Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Arc,
  Axes,
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
  useSequence,
  useStepEffect,
  useStepStart,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const ARC = vc.yellow
const COS = vc.blue
const SIN = vc.teal

/** Special angles as [n, d] with θ = nπ/d, one turn. */
const SPECIAL = [
  ...Array.from({ length: 12 }, (_, i) => [i, 6] as const),
  ...[1, 3, 5, 7].map((n) => [n, 4] as const),
]
const SPECIAL_ANGLES = SPECIAL.map(([n, d]) => (n * Math.PI) / d)

/** The angle of a dragged point, continued from the previous angle so turns are not lost. */
const unwrap = (p: Vec2, prev: number) => {
  const a = Math.atan2(p[1], p[0])
  return a + TAU * Math.round((prev - a) / TAU)
}

const snap = (t: number) => {
  const r = ((t % TAU) + TAU) % TAU
  let best = 0
  for (let i = 1; i < SPECIAL_ANGLES.length; i++)
    if (Math.abs(SPECIAL_ANGLES[i]! - r) < Math.abs(SPECIAL_ANGLES[best]! - r)) best = i
  return t - r + SPECIAL_ANGLES[best]!
}

/** An arc that turns into a slow spiral past one turn, so extra turns stay visible. */
const arcPoints = (theta: number, r: number): Vec2[] => {
  const n = Math.max(2, Math.ceil(Math.abs(theta) * 40))
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = (theta * i) / n
    const rr = Math.abs(theta) > TAU ? r * (1 + (0.06 * Math.abs(t)) / TAU) : r
    return [rr * Math.cos(t), rr * Math.sin(t)]
  })
}

export default function RadiansAndTheUnitCircle() {
  const { id } = useVizStep()
  const [theta, setTheta] = useState(0.8)
  const [r, setR] = useState(1)
  const seq = useSequence()
  const start = useStepStart(theta)

  const glide = (from: number, to: number, duration = 1.6) =>
    void seq.run(({ tween }) => tween(from, to, { duration, onUpdate: setTheta }))

  useStepEffect({
    arc: () => {
      setR(1)
      glide(0, 0.8)
    },
    radian: () => {
      setR(1)
      void seq.run(async ({ tween, wait }) => {
        await tween(0, 1, { duration: 1.4, onUpdate: setTheta })
        await wait(1)
        await tween(1, Math.PI, { duration: 1.8, onUpdate: setTheta })
      })
    },
    'arc-length': () => {
      setTheta(2)
      void seq.run(({ tween }) => tween(1, 1.4, { duration: 1.4, onUpdate: setR }))
    },
    coordinates: (run) => {
      setR(1)
      glide(start(run), 0.9)
    },
    pythagoras: (run) => {
      setR(1)
      glide(start(run), 2.3)
    },
    special: () => {
      setR(1)
      void seq.run(async ({ tween, wait }) => {
        let from = 0
        setTheta(0)
        for (const t of [Math.PI / 6, Math.PI / 4, Math.PI / 3]) {
          await tween(from, t, { duration: 0.9, onUpdate: setTheta })
          await wait(1)
          from = t
        }
      })
    },
    quadrants: (run) => {
      setR(1)
      glide(start(run), 2.5)
    },
    beyond: () => {
      setR(1)
      void seq.run(async ({ tween, wait }) => {
        setTheta(0)
        await tween(0, -Math.PI / 3, { duration: 1.2, onUpdate: setTheta })
        await wait(0.6)
        await tween(-Math.PI / 3, -Math.PI / 3 + TAU, { duration: 2.4, onUpdate: setTheta })
      })
    },
  })

  const stepIs = (...ids: string[]) => ids.includes(id ?? '')
  const radius = id === 'arc-length' ? r : 1
  const [c, s] = [Math.cos(theta), Math.sin(theta)]
  const P: Vec2 = [radius * c, radius * s]
  const showLegs = stepIs('coordinates', 'pythagoras', 'special', 'quadrants', 'beyond')
  const snapping = id === 'special'

  // Exact values when θ sits on a special angle.
  const k = SPECIAL.findIndex(([n, d]) => {
    const red = ((theta % TAU) + TAU) % TAU
    return Math.abs(red - (n * Math.PI) / d) < 1e-6
  })
  const exact = k >= 0 && Math.abs(theta) < TAU + 1e-6 ? SPECIAL[k]! : null

  const drag = (p: Vec2) => {
    seq.cancel()
    const t = unwrap(p, theta)
    const bounded = id === 'beyond' ? Math.max(-TAU, Math.min(2 * TAU, t)) : ((t % TAU) + TAU) % TAU
    setTheta(snapping ? snap(bounded) : bounded)
  }

  const mid = theta / 2
  const reflections: Vec2[] = stepIs('quadrants')
    ? [Math.PI - theta, Math.PI + theta, -theta].map((t) => [Math.cos(t), Math.sin(t)])
    : []

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-1.9, 1.9], y: [-1.6, 1.6] }}
        ariaLabel="The unit circle with an angle as an arc, and the point at the end of the arc with its coordinates"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel title="Angle">
              <Readout
                label="$\theta$"
                value={exact ? <Tex>{piTex(exact[0], exact[1])}</Tex> : fmt(theta, 3)}
                color={ARC}
              />
              <Readout label="degrees" value={`${fmt(radToDeg(theta), 1)}°`} />
              {id === 'arc-length' ? (
                <>
                  <Readout label="radius $r$" value={fmt(r, 2)} />
                  <Readout
                    label="arc $s = r\theta$"
                    value={fmt(r * theta, 3)}
                    color={ARC}
                    hint="The radius times the angle in radians."
                  />
                </>
              ) : (
                <>
                  <Readout
                    label="$\cos\theta$"
                    value={exact ? <Tex>{exactTex(c) ?? fmt(c, 3)}</Tex> : fmt(c, 3)}
                    color={COS}
                  />
                  <Readout
                    label="$\sin\theta$"
                    value={exact ? <Tex>{exactTex(s) ?? fmt(s, 3)}</Tex> : fmt(s, 3)}
                    color={SIN}
                  />
                </>
              )}
              {id === 'pythagoras' && (
                <Readout
                  label="$\cos^2\theta + \sin^2\theta$"
                  value={fmt(c * c + s * s, 3)}
                  hint="Rounded to three decimals; it is exactly $1$ at every angle."
                />
              )}
              {id === 'beyond' && (
                <Readout
                  label="turns"
                  value={fmt(theta / TAU, 2)}
                  hint="$\theta$ divided by $2\pi$. Whole turns do not move $P$."
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid step={0.5} />
        <Axes step={0.5} />
        <Arc r={radius} from={0} to={TAU} color={vc.muted} width={1.5} />
        {id === 'arc-length' && (
          <>
            <Arc r={1} from={0} to={TAU} color={vc.muted} width={1} dash="4 5" opacity={0.6} />
            <Arc r={1} from={0} to={theta} color={ARC} width={2.5} opacity={0.5} />
            <MathLabel
              at={[0.8 * Math.cos(theta / 2), 0.8 * Math.sin(theta / 2)]}
              tex="\theta"
              color={ARC}
            />
          </>
        )}

        <Path points={arcPoints(theta, radius)} color={ARC} width={4} />
        <Segment from={[0, 0]} to={[radius, 0]} color={vc.fg} width={1.5} opacity={0.5} />
        <Segment from={[0, 0]} to={P} color={vc.fg} width={1.5} />
        {Math.abs(theta) > 0.25 && Math.abs(theta) <= TAU && (
          <MathLabel
            at={[radius * 1.18 * Math.cos(mid), radius * 1.18 * Math.sin(mid)]}
            tex={id === 'arc-length' ? 's' : '\\theta'}
            color={ARC}
          />
        )}
        {id === 'radian' && theta < 1.2 && (
          <MathLabel at={[0.5 * c - 0.12 * s, 0.5 * s + 0.12 * c]} tex="1" color={vc.fg} />
        )}

        {showLegs && (
          <>
            <Path points={[[0, 0], [c, 0], P]} closed color="none" fill={alpha(vc.fg, 0.06)} />
            <Segment from={[0, 0]} to={[c, 0]} color={COS} width={3} />
            <Segment from={[c, 0]} to={P} color={SIN} width={3} />
            <MathLabel
              at={[c / 2, 0]}
              tex="\cos\theta"
              color={COS}
              anchor={s >= 0 ? 's' : 'n'}
              offset={8}
            />
            <MathLabel
              at={[c, s / 2]}
              tex="\sin\theta"
              color={SIN}
              anchor={c >= 0 ? 'e' : 'w'}
              offset={8}
            />
          </>
        )}
        {stepIs('quadrants') &&
          reflections.map((q, i) => (
            <Point key={i} at={q} color={vc.muted} r={4} hollow coords={false} />
          ))}
        {stepIs('quadrants') && (
          <>
            <MathLabel at={[1.35, 1.25]} tex="(+, +)" color={vc.muted} />
            <MathLabel at={[-1.35, 1.25]} tex="(-, +)" color={vc.muted} />
            <MathLabel at={[-1.35, -1.25]} tex="(-, -)" color={vc.muted} />
            <MathLabel at={[1.35, -1.25]} tex="(+, -)" color={vc.muted} />
          </>
        )}

        <Point at={P} color={ARC} label="P" onDrag={drag} />
      </Stage>

      <VizControls>
        {id === 'arc-length' ? (
          <LabeledSlider
            label="$r$"
            value={r}
            onChange={(v) => {
              seq.cancel()
              setR(v)
            }}
            min={0.4}
            max={1.4}
            step={0.01}
          />
        ) : (
          <LabeledSlider
            label="$\theta$"
            value={theta}
            onChange={(v) => {
              seq.cancel()
              setTheta(snapping ? snap(v) : v)
            }}
            min={id === 'beyond' ? -TAU : 0}
            max={id === 'beyond' ? 2 * TAU : TAU}
            step={0.01}
            color={ARC}
          />
        )}
      </VizControls>
    </>
  )
}
