import { useState } from 'react'
import { clamp, fmt, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
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
  useStepStart,
  useVizStep,
  VizControls,
} from '@/viz-kit'

/** Inner function u = g(x) and outer function y = f(u). */
const g = (x: number) => (x * x) / 2
const dg = (x: number) => x
const f = (u: number) => 2 * Math.sin(u)
const df = (u: number) => 2 * Math.cos(u)
const h = (x: number) => f(g(x))
const dh = (x: number) => df(g(x)) * dg(x)

/** Heights of the three number lines in the diagram. */
const LINE = { x: 0, u: 1.5, y: 3 } as const
const REACH = 3
const TICKS = [-3, -2, -1, 0, 1, 2, 3]
/** Points of the lower line whose images show how g stretches the whole line. */
const GUIDES = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]
const SAMPLES = 7

const VIEWS = {
  lines: [-3.8, 3.8, -0.8, 5.4],
  graph: [-3.4, 3.4, -2.8, 2.8],
} as const

/** A short piece of the line through `p` with slope `m`. */
const tangentPiece = (p: Vec2, m: number, half = 0.8) => {
  const dx = half / Math.hypot(1, m)
  return { from: [p[0] - dx, p[1] - m * dx] as Vec2, to: [p[0] + dx, p[1] + m * dx] as Vec2 }
}

function NumberLine({ y, tex, color }: { y: number; tex: string; color: string }) {
  return (
    <>
      <Segment from={[-REACH, y]} to={[REACH, y]} color={vc.axis} width={1.25} />
      {TICKS.map((t, i) => (
        <g key={i}>
          <Segment from={[t, y - 0.06]} to={[t, y + 0.06]} color={vc.axis} width={1} />
          <MathLabel at={[t, y]} tex={String(t)} color={vc.muted} anchor="s" offset={8} size={12} />
        </g>
      ))}
      <MathLabel at={[-REACH, y]} tex={tex} color={color} anchor="w" offset={12} />
    </>
  )
}

export default function ChainRule() {
  const { id } = useVizStep()
  const [x, setX] = useState(1.3)
  const [dx, setDx] = useState(0.4)
  const [px, setPx] = useState(1.3)
  const seq = useSequence()
  const start = useStepStart(dx)

  useStepEffect({
    stretch: () => {
      seq.cancel()
      setDx(0.4)
    },
    compose: () => {
      seq.cancel()
      setDx(0.4)
    },
    leibniz: (run) =>
      void seq.run(({ tween }) =>
        tween(run.replay ? start(run) : 0.5, 0.02, { duration: 2.4, onUpdate: setDx }),
      ),
    graph: () => seq.cancel(),
  })

  const [vx0, vx1, vy0, vy1] = useAnimatedValue(id === 'graph' ? VIEWS.graph : VIEWS.lines, {
    duration: 1.2,
  })

  const twice = id !== 'stretch'
  const x1 = x + dx
  const du = g(x1) - g(x)
  const dy = h(x1) - h(x)
  const samples = Array.from({ length: SAMPLES }, (_, k) => x + (k * dx) / (SAMPLES - 1))
  const labelOpacity = clamp((dx - 0.08) / 0.15, 0, 1)

  const P: Vec2 = [px, h(px)]
  const tangent = tangentPiece(P, dh(px), 0.7)

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Three number lines: x is mapped to u, then u to y, and a small interval is stretched at each stage"
        overlay={
          <Overlay corner="top-right">
            {id !== 'graph' ? (
              <ReadoutPanel title="Stretch factors">
                <Readout label="$x$" value={fmt(x, 2)} color={vc.blue} />
                <Readout label="$\Delta x$" value={fmt(dx, 3)} />
                <Readout label="$\frac{\Delta u}{\Delta x}$" value={fmt(du / dx, 3)} />
                <Readout
                  label="$g'(x) = x$"
                  value={fmt(dg(x), 3)}
                  color={vc.purple}
                  hint="$\frac{du}{dx}$, the stretch factor of the first map at $x$."
                />
                {twice && (
                  <>
                    <Readout
                      label="$\frac{\Delta y}{\Delta u}$"
                      value={Math.abs(du) < 1e-9 ? 'undefined' : fmt(dy / du, 3)}
                      hint="Undefined when $\Delta u = 0$: the interval's two ends land on the same $u$."
                    />
                    <Readout
                      label="$f'(u) = 2\cos u$"
                      value={fmt(df(g(x)), 3)}
                      color={vc.green}
                      hint="$\frac{dy}{du}$, the stretch factor of the second map at $u = g(x)$."
                    />
                    <Readout label="$\frac{\Delta y}{\Delta x}$" value={fmt(dy / dx, 3)} />
                    <Readout
                      label="$f'(u)\,g'(x)$"
                      value={fmt(dh(x), 3)}
                      color={vc.teal}
                      hint="$\frac{dy}{du}\frac{du}{dx}$"
                    />
                  </>
                )}
              </ReadoutPanel>
            ) : (
              <ReadoutPanel>
                <Readout label="$x$" value={fmt(px, 2)} />
                <Readout label="$u = \frac{x^2}{2}$" value={fmt(g(px), 3)} color={vc.purple} />
                <Readout
                  label="$\frac{dy}{du} = 2\cos u$"
                  value={fmt(df(g(px)), 3)}
                  color={vc.green}
                />
                <Readout label="$\frac{du}{dx} = x$" value={fmt(dg(px), 3)} color={vc.purple} />
                <Readout label="$\frac{dy}{dx}$" value={fmt(dh(px), 3)} color={vc.teal} />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        {id === 'graph' ? (
          <>
            <Grid />
            <Axes />
            <FunctionPlot f={h} color={vc.blue} />
            <Segment from={tangent.from} to={tangent.to} color={vc.teal} width={2.5} />
            <Point
              at={P}
              color={vc.blue}
              r={6}
              label="P"
              onDrag={([v]) => setPx(clamp(v, -3, 3))}
            />
          </>
        ) : (
          <>
            {id === 'stretch' &&
              GUIDES.map((t, i) => (
                <Segment
                  key={i}
                  from={[t, LINE.x]}
                  to={[g(t), LINE.u]}
                  color={vc.muted}
                  width={1}
                  opacity={0.45}
                />
              ))}
            {samples.map((t, i) => (
              <g key={i}>
                <Segment
                  from={[t, LINE.x]}
                  to={[g(t), LINE.u]}
                  color={vc.purple}
                  width={1}
                  opacity={0.6}
                />
                {twice && (
                  <Segment
                    from={[g(t), LINE.u]}
                    to={[h(t), LINE.y]}
                    color={vc.green}
                    width={1}
                    opacity={0.6}
                  />
                )}
              </g>
            ))}
            <NumberLine y={LINE.x} tex="x" color={vc.blue} />
            <NumberLine y={LINE.u} tex="u = \frac{x^2}{2}" color={vc.purple} />
            {twice && <NumberLine y={LINE.y} tex="y = 2\sin u" color={vc.green} />}

            <Segment from={[x, LINE.x]} to={[x1, LINE.x]} color={vc.blue} width={5} />
            <Segment from={[g(x), LINE.u]} to={[g(x1), LINE.u]} color={vc.purple} width={5} />
            {twice && (
              <Segment from={[h(x), LINE.y]} to={[h(x1), LINE.y]} color={vc.green} width={5} />
            )}
            <MathLabel
              at={[x + dx / 2, LINE.x]}
              tex="\Delta x"
              color={vc.blue}
              anchor="n"
              offset={10}
              opacity={labelOpacity}
            />
            <MathLabel
              at={[(g(x) + g(x1)) / 2, LINE.u]}
              tex="\Delta u"
              color={vc.purple}
              anchor="n"
              offset={10}
              opacity={labelOpacity}
            />
            {twice && (
              <MathLabel
                at={[(h(x) + h(x1)) / 2, LINE.y]}
                tex="\Delta y"
                color={vc.green}
                anchor="n"
                offset={10}
                opacity={labelOpacity}
              />
            )}
            <Point
              at={[x, LINE.x]}
              color={vc.blue}
              r={6}
              coords={false}
              onDrag={([v]) => setX(clamp(v, -2, 2))}
            />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'graph' ? (
          <LabeledSlider
            label="$x$"
            value={px}
            onChange={setPx}
            min={-3}
            max={3}
            step={0.01}
            color={vc.blue}
          />
        ) : (
          <>
            <LabeledSlider
              label="$x$"
              value={x}
              onChange={setX}
              min={-2}
              max={2}
              step={0.01}
              color={vc.blue}
            />
            <LabeledSlider
              label="$\Delta x$"
              value={dx}
              onChange={(v) => {
                seq.cancel()
                setDx(v)
              }}
              min={0.02}
              max={0.6}
              step={0.01}
            />
          </>
        )}
      </VizControls>
    </>
  )
}
