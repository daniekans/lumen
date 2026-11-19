import { useState } from 'react'
import { clamp, fmt, plotBox, type Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Arc,
  MathLabel,
  Overlay,
  Path,
  PlotBoxAxes,
  Point,
  Segment,
  Stage,
  TextLabel,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

type Scene = 'box' | 'can' | 'lifeguard' | 'mean'

const VIEWS: Record<Scene, readonly [number, number, number, number]> = {
  box: [-1.5, 30, -2.5, 14.5],
  can: [-9, 32, -3, 24],
  lifeguard: [-6, 118, -26, 36],
  mean: [-2.5, 43, -2.5, 15],
}

const sceneOf = (id: string | undefined): Scene =>
  id === 'can' || id === 'lifeguard' || id === 'mean' ? id : 'box'

/** Open box from a 12 by 12 sheet: V(x) = x(12 - 2x)^2, largest at x = 2. */
const SHEET = 12
const V = (x: number) => x * (SHEET - 2 * x) ** 2
const dV = (x: number) => (SHEET - 2 * x) * (SHEET - 6 * x)
const BOX = plotBox({ at: [15, -1], size: [13, 9], x: [0, 6], y: [0, 140] })

/** A can of 330 cm^3: A(r) = 2 pi r^2 + 660 / r, least at r = (165 / pi)^(1/3). */
const VOLUME = 330
const height = (r: number) => VOLUME / (Math.PI * r * r)
const A = (r: number) => 2 * Math.PI * r * r + (2 * VOLUME) / r
const dA = (r: number) => 4 * Math.PI * r - (2 * VOLUME) / (r * r)
const R_BEST = Math.cbrt(VOLUME / (2 * Math.PI))
/** A real 330 mL can is about 6.6 cm across. */
const R_REAL = 3.3
const CAN = plotBox({ at: [10, 0], size: [20, 15], x: [0, 8], y: [0, 500] })

/** Lifeguard at G, swimmer at S, shore along y = 0; 6 m/s on sand, 2 m/s in water. */
const G: Vec2 = [0, 30]
const S: Vec2 = [60, -20]
const RUN = 6
const SWIM = 2
const T = (x: number) => Math.hypot(x, G[1]) / RUN + Math.hypot(S[0] - x, S[1]) / SWIM
const STRAIGHT = (S[0] * G[1]) / (G[1] - S[1])
/** The minimum of T on [0, 60], found by sampling (T'(x) = 0 has no tidy closed form). */
const X_BEST = (() => {
  let best = 0
  for (let k = 0; k <= 60000; k++) if (T(k / 1000) < T(best)) best = k / 1000
  return best
})()
const GUARD = plotBox({ at: [72, -20], size: [40, 38], x: [0, 60], y: [15, 40] })

/** Data for the mean, drawn at x = 0, 4, 8, ... */
const DATA = [2, 3, 7, 8, 10] as const
const GAP = 4
const MEAN = DATA.reduce((s, y) => s + y, 0) / DATA.length
const Ssq = (c: number) => DATA.reduce((s, y) => s + (y - c) ** 2, 0)
const MEAN_BOX = plotBox({ at: [28, 0], size: [14, 10], x: [0, 12], y: [0, 240] })

/** Points of an ellipse with center c and semi-axes a (horizontal), b (vertical). */
const ellipse = ([cx, cy]: Vec2, a: number, b: number, from = 0, to = 2 * Math.PI): Vec2[] =>
  Array.from({ length: 49 }, (_, k) => {
    const t = from + ((to - from) * k) / 48
    return [cx + a * Math.cos(t), cy + b * Math.sin(t)]
  })

export default function Optimization() {
  const { id } = useVizStep()
  const scene = sceneOf(id)
  const [x, setX] = useState(1)
  const [r, setR] = useState(6)
  const [e, setE] = useState(STRAIGHT)
  const [c, setC] = useState(2)
  const seq = useSequence()

  const tweenTo = (set: (v: number) => void, from: number, to: number, duration: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration, onUpdate: set }))

  useStepEffect({
    'box-model': () => tweenTo(setX, 0.3, 5.6, 4.5),
    'box-optimize': () => tweenTo(setX, 4.5, 2, 2.4),
    can: () => tweenTo(setR, 6.5, R_BEST, 3),
    lifeguard: () => tweenTo(setE, STRAIGHT, X_BEST, 2.6),
    mean: () => tweenTo(setC, 1.5, MEAN, 3),
  })

  const [vx0, vx1, vy0, vy1] = useAnimatedValue(VIEWS[scene], { duration: 1 })

  const moveX = (v: number) => {
    seq.cancel()
    setX(clamp(v, 0, 6))
  }
  const moveR = (v: number) => {
    seq.cancel()
    setR(clamp(v, 2.2, 7))
  }
  const moveE = (v: number) => {
    seq.cancel()
    setE(clamp(v, 0, 60))
  }
  const moveC = (v: number) => {
    seq.cancel()
    setC(clamp(v, 1, 11))
  }

  // Box
  const base = SHEET - 2 * x
  const showTangent = id === 'box-optimize'
  const slope =
    dV(x) * (BOX.size[1] / (BOX.y[1] - BOX.y[0])) * ((BOX.x[1] - BOX.x[0]) / BOX.size[0])
  const Pbox = BOX.map([x, V(x)])
  const tangentHalf = 1.6 / Math.hypot(1, slope)

  // Can
  const h = height(r)
  const rim = r * 0.3

  // Lifeguard
  const P: Vec2 = [e, 0]
  const up = Math.atan2(G[1], G[0] - e)
  const down = Math.atan2(S[1], S[0] - e)
  const sin1 = e / Math.hypot(e, G[1])
  const sin2 = (S[0] - e) / Math.hypot(S[0] - e, S[1])

  return (
    <>
      <Stage
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Optimization problems drawn beside the graph of the quantity being optimized: an open box folded from a sheet, a can, a lifeguard's path from sand into water, and data points with a line at height c"
        overlay={
          <Overlay corner="top-right">
            {scene === 'box' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(x, 2)} color={vc.yellow} />
                <Readout label="$12 - 2x$" value={fmt(base, 2)} />
                <Readout
                  label="$V(x)$"
                  value={fmt(V(x), 1)}
                  color={vc.blue}
                  hint="$V(x) = x(12 - 2x)^2$, in cubic centimeters."
                />
                {showTangent && (
                  <Readout
                    label="$V'(x)$"
                    value={fmt(dV(x), 1)}
                    hint="$V'(x) = (12 - 2x)(12 - 6x)$"
                  />
                )}
              </ReadoutPanel>
            )}
            {scene === 'can' && (
              <ReadoutPanel>
                <Readout label="$r$" value={fmt(r, 3)} color={vc.yellow} />
                <Readout label="$h = \frac{330}{\pi r^2}$" value={fmt(h, 2)} />
                <Readout
                  label="$A(r)$"
                  value={fmt(A(r), 1)}
                  color={vc.blue}
                  hint="Metal in square centimeters: two disks and the side, $2\pi r^2 + 2\pi r h$."
                />
                <Readout label="$A'(r)$" value={fmt(dA(r), 2)} hint="$4\pi r - \frac{660}{r^2}$" />
                <Readout label="$\frac{h}{r}$" value={fmt(h / r, 2)} hint="$2$ at the minimum." />
              </ReadoutPanel>
            )}
            {scene === 'lifeguard' && (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(e, 1)} color={vc.yellow} />
                <Readout
                  label="$T(x)$"
                  value={fmt(T(e), 2)}
                  color={vc.blue}
                  hint="Seconds: distance on sand over $6$ plus distance in water over $2$."
                />
                <Readout label="$\frac{\sin\theta_1}{6}$" value={fmt(sin1 / RUN, 4)} />
                <Readout
                  label="$\frac{\sin\theta_2}{2}$"
                  value={fmt(sin2 / SWIM, 4)}
                  hint="Equal to the one above exactly when $T'(x) = 0$."
                />
              </ReadoutPanel>
            )}
            {scene === 'mean' && (
              <ReadoutPanel>
                <Readout label="$c$" value={fmt(c, 2)} color={vc.yellow} />
                <Readout
                  label="$S(c)$"
                  value={fmt(Ssq(c), 2)}
                  color={vc.blue}
                  hint="The total area of the red squares."
                />
                <Readout label="$\bar{y}$" value={fmt(MEAN, 2)} color={vc.teal} />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        {scene === 'box' && (
          <>
            <Path
              points={[
                [x, 0],
                [SHEET - x, 0],
                [SHEET - x, x],
                [SHEET, x],
                [SHEET, SHEET - x],
                [SHEET - x, SHEET - x],
                [SHEET - x, SHEET],
                [x, SHEET],
                [x, SHEET - x],
                [0, SHEET - x],
                [0, x],
                [x, x],
              ]}
              closed
              color={vc.fg}
              width={2}
              fill={alpha(vc.blue, 0.12)}
            />
            <Path
              points={[
                [x, x],
                [SHEET - x, x],
                [SHEET - x, SHEET - x],
                [x, SHEET - x],
              ]}
              closed
              color={vc.muted}
              width={1.5}
              dash="5 5"
              fill={alpha(vc.blue, 0.12)}
            />
            {(
              [
                [0, 0],
                [SHEET - x, 0],
                [SHEET - x, SHEET - x],
                [0, SHEET - x],
              ] as const
            ).map(([cx, cy], i) => (
              <Path
                key={i}
                points={[
                  [cx, cy],
                  [cx + x, cy],
                  [cx + x, cy + x],
                  [cx, cy + x],
                ]}
                closed
                color={vc.muted}
                width={1}
                dash="3 5"
              />
            ))}
            <Segment from={[0, SHEET - x]} to={[x, SHEET - x]} color={vc.yellow} width={3} />
            <MathLabel at={[x / 2, SHEET - x]} tex="x" anchor="s" color={vc.yellow} />
            {base > 2.5 && <MathLabel at={[SHEET / 2, x]} tex="12 - 2x" anchor="n" />}
            {base > 4 && (
              <MathLabel at={[SHEET / 2, SHEET / 2]} tex="\text{base}" color={vc.muted} />
            )}

            <PlotBoxAxes box={BOX} xTicks={[0, 2, 6]} yTicks={[0, 128]} xLabel="x" yLabel="V(x)" />
            <Path points={BOX.curve(V, 0, 6)} color={vc.blue} width={2.5} />
            {showTangent && (
              <>
                <Segment
                  from={[Pbox[0] - tangentHalf, Pbox[1] - slope * tangentHalf]}
                  to={[Pbox[0] + tangentHalf, Pbox[1] + slope * tangentHalf]}
                  color={vc.yellow}
                  width={2}
                />
                <Point at={BOX.map([2, 128])} color={vc.teal} r={10} hollow coords={false} />
                <Point at={BOX.map([0, 0])} color={vc.muted} r={5} hollow coords={false} />
                <Point at={BOX.map([6, 0])} color={vc.muted} r={5} hollow coords={false} />
              </>
            )}
            <Segment from={BOX.map([x, 0])} to={Pbox} color={vc.yellow} width={1.5} dash="4 5" />
            <Point at={Pbox} color={vc.blue} r={6} coords={false} />
          </>
        )}

        {scene === 'can' && (
          <>
            <Path
              points={[
                ...ellipse([0, 0], r, rim, Math.PI, 2 * Math.PI),
                [r, h],
                ...ellipse([0, h], r, rim, 0, Math.PI),
                [-r, 0],
              ]}
              closed
              color={vc.fg}
              width={2}
              fill={alpha(vc.blue, 0.12)}
            />
            <Path points={ellipse([0, h], r, rim)} closed color={vc.fg} width={2} />
            <Path
              points={ellipse([0, 0], r, rim, 0, Math.PI)}
              color={vc.muted}
              width={1}
              dash="4 5"
            />
            <Segment from={[0, h]} to={[r, h]} color={vc.yellow} width={3} />
            <MathLabel at={[r / 2, h]} tex="r" anchor="n" color={vc.yellow} offset={6} />
            <Segment from={[r + 1, 0]} to={[r + 1, h]} color={vc.muted} width={1.5} />
            <MathLabel at={[r + 1, h / 2]} tex="h" anchor="e" />

            <PlotBoxAxes
              box={CAN}
              xTicks={[0, 2, 4, 6, 8]}
              yTicks={[0, 250, 500]}
              xLabel="r"
              yLabel="A(r)"
            />
            <Path points={CAN.curve(A, 1.2, 8)} color={vc.blue} width={2.5} />
            <Point at={CAN.map([R_BEST, A(R_BEST)])} color={vc.teal} r={10} hollow coords={false} />
            <Point at={CAN.map([R_REAL, A(R_REAL)])} color={vc.muted} r={5} hollow coords={false} />
            <TextLabel
              at={CAN.map([R_REAL - 0.3, A(R_REAL) - 45])}
              color={vc.muted}
              align="end"
              size={13}
            >
              real can
            </TextLabel>
            <Segment
              from={CAN.map([r, 0])}
              to={CAN.map([r, A(r)])}
              color={vc.yellow}
              width={1.5}
              dash="4 5"
            />
            <Point at={CAN.map([r, A(r)])} color={vc.blue} r={6} coords={false} />
          </>
        )}

        {scene === 'lifeguard' && (
          <>
            <Path
              points={[
                [-6, 0],
                [68, 0],
                [68, -26],
                [-6, -26],
              ]}
              closed
              color={vc.muted}
              width={1}
              fill={alpha(vc.fg, 0.06)}
            />
            <TextLabel at={[-3, 3]} color={vc.muted} size={13} align="start">
              sand
            </TextLabel>
            <TextLabel at={[-3, -5]} color={vc.muted} size={13} align="start">
              water
            </TextLabel>
            <Segment from={G} to={S} color={vc.muted} width={1.5} dash="4 6" />
            <Segment from={[e, -14]} to={[e, 14]} color={vc.muted} width={1} dash="3 5" />
            <Arc center={P} r={7} from={Math.PI / 2} to={up} color={vc.fg} width={1.5} />
            <Arc center={P} r={7} from={-Math.PI / 2} to={down} color={vc.fg} width={1.5} />
            <MathLabel at={[e - 2.5, 10]} tex="\theta_1" anchor="w" size={15} />
            <MathLabel at={[e + 2.5, -10]} tex="\theta_2" anchor="e" size={15} />
            <Segment from={G} to={P} color={vc.blue} width={3} />
            <Segment from={P} to={S} color={vc.blue} width={3} />
            <Point at={[X_BEST, 0]} color={vc.teal} r={5} hollow coords={false} />
            <Point at={G} color={vc.fg} r={6} coords={false} />
            <Point at={S} color={vc.fg} r={6} coords={false} />
            <MathLabel at={G} tex="G" anchor="n" />
            <MathLabel at={S} tex="S" anchor="e" />
            <Point at={P} color={vc.yellow} r={7} onDrag={([px]) => moveE(px)} coords={false} />

            <PlotBoxAxes
              box={GUARD}
              xTicks={[0, { at: STRAIGHT, tex: '36' }, 60]}
              yTicks={[15, 20, 30, 40]}
              xLabel="x"
              yLabel="T(x)"
            />
            <Path points={GUARD.curve(T, 0, 60)} color={vc.blue} width={2.5} />
            <Point
              at={GUARD.map([STRAIGHT, T(STRAIGHT)])}
              color={vc.muted}
              r={5}
              hollow
              coords={false}
            />
            <Point
              at={GUARD.map([X_BEST, T(X_BEST)])}
              color={vc.teal}
              r={10}
              hollow
              coords={false}
            />
            <Segment
              from={GUARD.map([e, 15])}
              to={GUARD.map([e, T(e)])}
              color={vc.yellow}
              width={1.5}
              dash="4 5"
            />
            <Point at={GUARD.map([e, T(e)])} color={vc.blue} r={6} coords={false} />
          </>
        )}

        {scene === 'mean' && (
          <>
            {DATA.map((y, i) => {
              const px = i * GAP
              const side = Math.abs(y - c)
              return (
                <g key={i}>
                  <Path
                    points={[
                      [px, y],
                      [px + side, y],
                      [px + side, c],
                      [px, c],
                    ]}
                    closed
                    color={vc.red}
                    width={1}
                    fill={alpha(vc.red, 0.14)}
                  />
                  <Segment from={[px, y]} to={[px, c]} color={vc.red} width={2.5} />
                  <Point at={[px, y]} color={vc.fg} r={5} coords={false} />
                  <MathLabel
                    at={[px, y]}
                    tex={String(y)}
                    anchor="w"
                    offset={10}
                    color={vc.muted}
                    size={14}
                  />
                </g>
              )
            })}
            <Segment
              from={[-1.5, c]}
              to={[(DATA.length - 1) * GAP + 9, c]}
              color={vc.yellow}
              width={2}
            />
            <Point
              at={[-1.5, c]}
              color={vc.yellow}
              r={7}
              onDrag={([, py]) => moveC(py)}
              coords={false}
            />
            <MathLabel at={[-1.5, c]} tex="c" anchor="s" color={vc.yellow} offset={12} />

            <PlotBoxAxes
              box={MEAN_BOX}
              xTicks={[0, 6, 12]}
              yTicks={[0, 46, 240]}
              xLabel="c"
              yLabel="S(c)"
            />
            <Path points={MEAN_BOX.curve(Ssq, 0, 12)} color={vc.blue} width={2.5} />
            <Point
              at={MEAN_BOX.map([MEAN, Ssq(MEAN)])}
              color={vc.teal}
              r={10}
              hollow
              coords={false}
            />
            <Segment
              from={MEAN_BOX.map([c, 0])}
              to={MEAN_BOX.map([c, Ssq(c)])}
              color={vc.yellow}
              width={1.5}
              dash="4 5"
            />
            <Point at={MEAN_BOX.map([c, Ssq(c)])} color={vc.blue} r={6} coords={false} />
          </>
        )}
      </Stage>

      <VizControls>
        {scene === 'box' && (
          <LabeledSlider label="$x$" value={x} onChange={moveX} min={0} max={6} step={0.01} />
        )}
        {scene === 'can' && (
          <LabeledSlider label="$r$" value={r} onChange={moveR} min={2.2} max={7} step={0.005} />
        )}
        {scene === 'lifeguard' && (
          <LabeledSlider label="$x$" value={e} onChange={moveE} min={0} max={60} step={0.1} />
        )}
        {scene === 'mean' && (
          <LabeledSlider label="$c$" value={c} onChange={moveC} min={1} max={11} step={0.01} />
        )}
      </VizControls>
    </>
  )
}
