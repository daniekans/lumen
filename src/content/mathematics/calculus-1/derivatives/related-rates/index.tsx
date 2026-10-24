import { useState } from 'react'
import { clamp, fmt, type Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Arc,
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
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const VIEWS = {
  ladder: [-1.2, 6.4, -1.4, 6.2],
  tank: [-4.6, 4.6, -0.9, 7.4],
  balloon: [-5.4, 2.6, -1, 8.8],
} as const

/** How long each motion lasts, in seconds; the animation runs in real time. */
const DURATION = { ladder: 7.2, tank: 9, balloon: 8 } as const

/** Ladder of length 5 whose foot starts 1 m from the wall and slides away at 0.5 m/s. */
const LADDER = 5
const FOOT_SPEED = 0.5
const foot = (t: number) => 1 + FOOT_SPEED * t

/** Cone of radius 3 and height 6, filled at 2π per second: V = πh³/12, so h = (24t)^(1/3). */
const CONE = { r: 3, h: 6 }
const depth = (t: number) => Math.cbrt(24 * t)

/** Balloon rising at 1 m/s, 4 m from the observer. */
const DISTANCE = 4

export default function RelatedRates() {
  const { id } = useVizStep()
  const [t, setT] = useState(0)
  const seq = useSequence()
  const step = id === 'tank' ? 'tank' : id === 'balloon' ? 'balloon' : 'ladder'
  const T = DURATION[step]

  const play = () =>
    void seq.run(({ tween }) =>
      tween(0, DURATION[step], { duration: DURATION[step], ease: 'linear', onUpdate: setT }),
    )
  useStepEffect({ ladder: play, tank: play, balloon: play })

  const [vx0, vx1, vy0, vy1] = useAnimatedValue(VIEWS[step], { duration: 1.2 })
  const setTime = (v: number) => {
    seq.cancel()
    setT(v)
  }
  const time = clamp(t, 0, T)

  // Ladder
  const x = foot(time)
  const y = Math.sqrt(LADDER * LADDER - x * x)
  const dy = (-x / y) * FOOT_SPEED

  // Cone
  const h = Math.max(depth(time), 0.3)
  const r = h / 2
  const dh = 8 / (h * h)

  // Balloon
  const b = time
  const theta = Math.atan2(b, DISTANCE)
  const dTheta = Math.cos(theta) ** 2 / DISTANCE
  const O: Vec2 = [-DISTANCE, 0]

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Three moving pictures: a ladder sliding down a wall, water filling a cone, and a balloon rising while an observer watches"
        overlay={
          <Overlay corner="top-right">
            {step === 'ladder' && (
              <ReadoutPanel>
                <Readout label="$t$" value={fmt(time, 2)} />
                <Readout label="$x$" value={fmt(x, 3)} color={vc.blue} />
                <Readout label="$y$" value={fmt(y, 3)} color={vc.purple} />
                <Readout label="$\frac{dx}{dt}$" value={fmt(FOOT_SPEED, 3)} color={vc.blue} />
                <Readout
                  label="$\frac{dy}{dt}$"
                  value={fmt(dy, 3)}
                  color={vc.purple}
                  hint="$-\frac{x}{y}\,\frac{dx}{dt}$, from $x^2 + y^2 = 25$."
                />
              </ReadoutPanel>
            )}
            {step === 'tank' && (
              <ReadoutPanel>
                <Readout label="$t$" value={fmt(time, 2)} />
                <Readout label="$V = 2\pi t$" value={fmt(2 * Math.PI * time, 2)} />
                <Readout label="$h$" value={fmt(h, 3)} color={vc.blue} />
                <Readout label="$r = \frac{h}{2}$" value={fmt(r, 3)} />
                <Readout
                  label="$\frac{dh}{dt}$"
                  value={fmt(dh, 3)}
                  color={vc.teal}
                  hint="$\frac{8}{h^2}$, from $V = \frac{\pi h^3}{12}$."
                />
              </ReadoutPanel>
            )}
            {step === 'balloon' && (
              <ReadoutPanel>
                <Readout label="$t$" value={fmt(time, 2)} />
                <Readout label="$h$" value={fmt(b, 3)} color={vc.purple} />
                <Readout label="$\theta$" value={fmt(theta, 3)} color={vc.teal} />
                <Readout
                  label="$\frac{d\theta}{dt}$"
                  value={fmt(dTheta, 3)}
                  color={vc.teal}
                  hint="$\frac{\cos^2\theta}{4}$, from $\tan\theta = \frac{h}{4}$."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />

        {step === 'ladder' && (
          <>
            <Segment from={[0, 0]} to={[0, 5.8]} color={vc.muted} width={4} />
            <Segment from={[0, 0]} to={[6.2, 0]} color={vc.muted} width={4} />
            <Segment from={[x, 0]} to={[0, y]} color={vc.fg} width={4} />
            <MathLabel at={[x / 2, y / 2]} tex="5" anchor="ne" />
            <MathLabel at={[x / 2, 0]} tex="x" anchor="s" color={vc.blue} />
            <MathLabel at={[0, y / 2]} tex="y" anchor="w" color={vc.purple} />
            <Vector from={[x, 0]} to={[x + FOOT_SPEED, 0]} color={vc.blue} grow={false} />
            <Vector from={[0, y]} to={[0, y + dy]} color={vc.purple} grow={false} />
            <Point at={[x, 0]} color={vc.blue} r={5} coords={false} />
            <Point at={[0, y]} color={vc.purple} r={5} coords={false} />
          </>
        )}

        {step === 'tank' && (
          <>
            <Path
              points={[
                [0, 0],
                [r, h],
                [-r, h],
              ]}
              closed
              color={vc.blue}
              width={1.5}
              fill={alpha(vc.blue, 0.3)}
            />
            <Path
              points={[
                [-CONE.r, CONE.h],
                [0, 0],
                [CONE.r, CONE.h],
              ]}
              color={vc.muted}
              width={3}
            />
            <Segment from={[-r, h]} to={[r, h]} color={vc.blue} width={3} />
            <MathLabel at={[r / 2, h]} tex="r" anchor="n" />
            <Segment from={[CONE.r + 0.5, 0]} to={[CONE.r + 0.5, h]} color={vc.blue} width={1.5} />
            <MathLabel at={[CONE.r + 0.5, h / 2]} tex="h" anchor="e" color={vc.blue} />
            <Vector
              from={[0, h]}
              to={[0, h + Math.min(dh * 1.5, 3)]}
              color={vc.teal}
              grow={false}
            />
          </>
        )}

        {step === 'balloon' && (
          <>
            <Segment from={[-6, 0]} to={[3, 0]} color={vc.muted} width={3} />
            <Segment from={[0, 0]} to={[0, 9]} color={vc.muted} width={1} dash="4 6" />
            <Arc
              center={O}
              r={1.2}
              from={0}
              to={theta}
              color={vc.teal}
              width={2}
              fill={alpha(vc.teal, 0.2)}
            />
            <MathLabel
              at={[O[0] + 1.6 * Math.cos(theta / 2), 1.6 * Math.sin(theta / 2)]}
              tex="\theta"
              color={vc.teal}
            />
            <Segment from={O} to={[0, b]} color={vc.teal} width={2} />
            <MathLabel at={[-DISTANCE / 2, 0]} tex="4" anchor="s" />
            <MathLabel at={[0, b / 2]} tex="h" anchor="e" color={vc.purple} />
            <Vector from={[0, b]} to={[0, b + 1]} color={vc.purple} grow={false} />
            <Point at={O} color={vc.fg} r={5} coords={false} />
            <Point at={[0, b]} color={vc.purple} r={9} coords={false} />
          </>
        )}
      </Stage>

      <VizControls>
        <LabeledSlider label="$t$" value={time} onChange={setTime} min={0} max={T} step={0.01} />
      </VizControls>
    </>
  )
}
