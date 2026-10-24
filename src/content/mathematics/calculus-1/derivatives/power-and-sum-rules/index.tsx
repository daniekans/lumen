import { useState } from 'react'
import { add3, clamp, fmt, type Vec2, type Vec3, tangentPiece } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  Box3D,
  FunctionPlot,
  Grid,
  MathLabel,
  MathLabel3D,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
  Stage3D,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useStepStart,
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const binomial = (n: number, k: number) => {
  let c = 1
  for (let i = 1; i <= k; i++) c = (c * (n - i + 1)) / i
  return c
}

/** A power of a variable as TeX: '' for 0, 'x' for 1, 'x^{3}' otherwise. */
const pow = (v: string, p: number) => (p === 0 ? '' : p === 1 ? v : `${v}^{${p}}`)

/** (x + h)^n expanded, every term written out. */
const expansionTex = (n: number) =>
  n === 0
    ? '1'
    : Array.from({ length: n + 1 }, (_, k) => {
        const c = binomial(n, k)
        const body = pow('x', n - k) + pow('h', k)
        return (c === 1 ? '' : String(c)) + body
      }).join(' + ')

/** The derivative n x^(n-1) as TeX. */
const ruleTex = (n: number) => (n === 0 ? '0' : n === 1 ? '1' : `${n}${pow('x', n - 1)}`)

const f = (x: number) => x * x
const g = (x: number) => 0.5 * x ** 3 - 2 * x
const df = (x: number) => 2 * x
const dg = (x: number) => 1.5 * x * x - 2

const VIEWS = {
  square: [-0.6, 4.2, -0.6, 4.2],
  power: [-2.2, 2.2, -2.6, 4.2],
  linearity: [-2.8, 2.8, -3.6, 4.6],
} as const

/** Where the cube's corner sits, so the shape stays near the middle of the 3D stage. */
const SHIFT: Vec3 = [-1.6, -1.6, -1.6]

export default function PowerAndSumRules() {
  const { id } = useVizStep()
  const [side, setSide] = useState(2)
  const [dx, setDx] = useState(0.8)
  const [n, setN] = useVizParam<number>('n', 3)
  const [x, setX] = useState(1)
  const [h, setH] = useState(0.8)
  const [a, setA] = useVizParam<number>('a', 1)
  const [b, setB] = useVizParam<number>('b', 1)
  const seq = useSequence()
  const start = useStepStart({ dx, h })

  const shrinkDx = (from: number) =>
    void seq.run(({ tween }) => tween(from, 0.3, { duration: 2, onUpdate: setDx }))

  useStepEffect({
    square: (run) => shrinkDx(run.replay ? start(run).dx : 0.9),
    cube: (run) => shrinkDx(run.replay ? start(run).dx : 0.7),
    expand: (run) =>
      void seq.run(({ tween }) =>
        tween(run.replay ? start(run).h : 0.9, 0.01, { duration: 2.4, onUpdate: setH }),
      ),
    'power-rule': () => seq.cancel(),
    linearity: () => seq.cancel(),
  })

  const view =
    id === 'square' || id === 'cube'
      ? VIEWS.square
      : id === 'linearity'
        ? VIEWS.linearity
        : VIEWS.power
  const [vx0, vx1, vy0, vy1] = useAnimatedValue(view, { duration: 1.2 })

  const stop =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      seq.cancel()
      set(v)
    }

  if (id === 'cube') return <Cube side={side} dx={dx} setSide={setSide} setDx={stop(setDx)} />

  const s = side
  const d = dx
  const labelOpacity = clamp((d - 0.15) / 0.25, 0, 1)
  const rect = (x0: number, y0: number, x1: number, y1: number): Vec2[] => [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]

  const xn = (t: number) => t ** n
  const dxn = (t: number) => (n === 0 ? 0 : n * t ** (n - 1))
  const P: Vec2 = [x, xn(x)]
  const Q: Vec2 = [x + h, xn(x + h)]
  const tangent = tangentPiece(P, dxn(x))

  const combo = (t: number) => a * f(t) + b * g(t)
  const shapes = [
    { key: 'f', fn: f, slope: df(x), color: vc.blue },
    { key: 'g', fn: g, slope: dg(x), color: vc.purple },
    { key: 'af+bg', fn: combo, slope: a * df(x) + b * dg(x), color: vc.green },
  ]

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [vx0, vx1], y: [vy0, vy1] }}
        ariaLabel="Pictures and graphs behind the power and sum rules"
        overlay={
          <Overlay corner="top-right">
            {id === 'square' && (
              <ReadoutPanel title="Area">
                <Readout label="$x$" value={fmt(s)} />
                <Readout label="$\Delta x$" value={fmt(d, 3)} />
                <Readout
                  label="$\Delta A$"
                  value={fmt(2 * s * d + d * d, 4)}
                  hint="$(x + \Delta x)^2 - x^2 = 2x\,\Delta x + (\Delta x)^2$"
                />
                <Readout label="$\frac{\Delta A}{\Delta x}$" value={fmt(2 * s + d, 3)} />
                <Readout label="$2x$" value={fmt(2 * s, 3)} color={vc.teal} />
              </ReadoutPanel>
            )}
            {(id === 'expand' || id === 'power-rule') && (
              <ReadoutPanel>
                <Readout
                  label="$f(x)$"
                  value={<Tex>{n === 0 ? 'x^0 = 1' : pow('x', n)}</Tex>}
                  color={vc.blue}
                />
                {id === 'expand' && (
                  <>
                    <Readout
                      label="$(x + h)^n$"
                      value={<Tex>{expansionTex(n)}</Tex>}
                      hint="The binomial theorem: the coefficients are a row of Pascal's triangle."
                    />
                    <Readout label="$h$" value={fmt(h, 3)} />
                    <Readout
                      label="secant slope"
                      value={fmt((xn(x + h) - xn(x)) / h, 3)}
                      color={vc.yellow}
                    />
                  </>
                )}
                <Readout
                  label="$nx^{n-1}$"
                  value={<Tex>{`${ruleTex(n)} = ${fmt(dxn(x), 3)}`}</Tex>}
                  color={vc.teal}
                />
              </ReadoutPanel>
            )}
            {id === 'linearity' && (
              <ReadoutPanel title={`Slopes at x = ${fmt(x)}`}>
                <Readout
                  label="$f'(x)$"
                  value={fmt(df(x))}
                  color={vc.blue}
                  hint="$f(x) = x^2$, $f'(x) = 2x$"
                />
                <Readout
                  label="$g'(x)$"
                  value={fmt(dg(x))}
                  color={vc.purple}
                  hint="$g(x) = \frac{1}{2}x^3 - 2x$, $g'(x) = \frac{3}{2}x^2 - 2$"
                />
                <Readout
                  label="$af'(x) + bg'(x)$"
                  value={fmt(a * df(x) + b * dg(x))}
                  color={vc.green}
                  hint="The slope of the green curve $af + bg$ at $x$."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {id === 'square' && (
          <>
            <Path
              points={rect(0, 0, s, s)}
              closed
              color={vc.blue}
              width={1.5}
              fill={alpha(vc.blue, 0.2)}
            />
            <Path
              points={rect(s, 0, s + d, s)}
              closed
              color={vc.teal}
              width={1.5}
              fill={alpha(vc.teal, 0.35)}
            />
            <Path
              points={rect(0, s, s, s + d)}
              closed
              color={vc.teal}
              width={1.5}
              fill={alpha(vc.teal, 0.35)}
            />
            <Path
              points={rect(s, s, s + d, s + d)}
              closed
              color={vc.yellow}
              width={1.5}
              fill={alpha(vc.yellow, 0.45)}
            />
            <MathLabel at={[s / 2, s / 2]} tex="x^2" color={vc.blue} />
            <MathLabel at={[s / 2, 0]} tex="x" anchor="n" />
            <MathLabel at={[s + d / 2, 0]} tex="\Delta x" anchor="n" opacity={labelOpacity} />
            <MathLabel
              at={[s + d, s / 2]}
              tex="x\,\Delta x"
              opacity={labelOpacity}
              color={vc.teal}
              anchor="e"
              offset={8}
            />
            <MathLabel
              at={[s / 2, s + d]}
              tex="x\,\Delta x"
              opacity={labelOpacity}
              color={vc.teal}
              anchor="n"
              offset={8}
            />
            <MathLabel
              at={[s + d, s + d]}
              tex="(\Delta x)^2"
              opacity={labelOpacity}
              color={vc.yellow}
              anchor="ne"
              offset={6}
            />
          </>
        )}

        {(id === 'expand' || id === 'power-rule') && (
          <>
            {id === 'power-rule' && <FunctionPlot f={dxn} color={vc.teal} width={2} dash="6 6" />}
            <FunctionPlot f={xn} color={vc.blue} />
            {id === 'expand' && <Segment from={P} to={Q} extend color={vc.yellow} width={2} />}
            <Segment from={tangent.from} to={tangent.to} color={vc.teal} width={2.5} />
            {id === 'power-rule' && (
              <>
                <Segment from={P} to={[x, dxn(x)]} color={vc.muted} width={1} dash="2 4" />
                <Point at={[x, dxn(x)]} color={vc.teal} r={4.5} coords={false} />
              </>
            )}
            <Point
              at={P}
              color={vc.blue}
              r={6}
              label="P"
              onDrag={([px]) => setX(clamp(px, -1.8, 1.8))}
            />
          </>
        )}

        {id === 'linearity' &&
          shapes.map(({ key, fn, slope, color }) => {
            const p: Vec2 = [x, fn(x)]
            const t = tangentPiece(p, slope)
            return (
              <g key={key}>
                <FunctionPlot f={fn} color={color} width={key === 'af+bg' ? 3 : 2} />
                <Segment from={t.from} to={t.to} color={color} width={2.5} />
                <Point
                  at={p}
                  color={color}
                  r={5}
                  label={key}
                  onDrag={([px]) => setX(clamp(px, -2.4, 2.4))}
                />
              </g>
            )
          })}
        {id === 'linearity' && (
          <>
            <MathLabel at={[-1.9, f(-1.9)]} tex="f" color={vc.blue} anchor="e" offset={10} />
            <MathLabel at={[-1, combo(-1)]} tex="af + bg" color={vc.green} anchor="e" offset={12} />
            <MathLabel at={[2.4, g(2.4)]} tex="g" color={vc.purple} anchor="w" offset={10} />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'square' && (
          <>
            <LabeledSlider
              label="$x$"
              value={s}
              onChange={setSide}
              min={0.5}
              max={2.8}
              step={0.01}
              color={vc.blue}
            />
            <LabeledSlider
              label="$\Delta x$"
              value={d}
              onChange={stop(setDx)}
              min={0.02}
              max={1}
              step={0.01}
              color={vc.teal}
            />
          </>
        )}
        {(id === 'expand' || id === 'power-rule') && (
          <>
            <LabeledSlider
              label="$n$"
              value={n}
              onChange={(v) => setN(Math.round(v))}
              min={0}
              max={5}
              step={1}
            />
            <LabeledSlider
              label="$x$"
              value={x}
              onChange={setX}
              min={-1.8}
              max={1.8}
              step={0.01}
              color={vc.blue}
            />
            {id === 'expand' && (
              <LabeledSlider
                label="$h$"
                value={h}
                onChange={stop(setH)}
                min={0.01}
                max={1}
                step={0.01}
                color={vc.yellow}
              />
            )}
          </>
        )}
        {id === 'linearity' && (
          <>
            <LabeledSlider label="$a$" value={a} onChange={setA} min={-2} max={2} step={0.1} />
            <LabeledSlider label="$b$" value={b} onChange={setB} min={-2} max={2} step={0.1} />
            <LabeledSlider label="$x$" value={x} onChange={setX} min={-2.4} max={2.4} step={0.01} />
          </>
        )}
      </VizControls>
    </>
  )
}

function Cube({
  side,
  dx,
  setSide,
  setDx,
}: {
  side: number
  dx: number
  setSide: (v: number) => void
  setDx: (v: number) => void
}) {
  const s = side
  const e = s + dx
  const box = (min: Vec3, max: Vec3) => ({ min: add3(min, SHIFT), max: add3(max, SHIFT) })
  const slabs = [box([s, 0, 0], [e, s, s]), box([0, s, 0], [s, e, s]), box([0, 0, s], [s, s, e])]
  const rods = [box([s, s, 0], [e, e, s]), box([s, 0, s], [e, s, e]), box([0, s, s], [s, e, e])]
  const dV = 3 * s * s * dx + 3 * s * dx * dx + dx ** 3
  return (
    <>
      <Stage3D
        radius={2.9}
        ariaLabel="A cube of side x growing by slabs, rods and a corner"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel title="Volume">
              <Readout label="$x$" value={fmt(s)} />
              <Readout label="$\Delta x$" value={fmt(dx, 3)} />
              <Readout
                label="$\Delta V$"
                value={fmt(dV, 4)}
                hint="$3x^2\,\Delta x + 3x(\Delta x)^2 + (\Delta x)^3$"
              />
              <Readout label="$\frac{\Delta V}{\Delta x}$" value={fmt(dV / dx, 3)} />
              <Readout label="$3x^2$" value={fmt(3 * s * s, 3)} color={vc.teal} />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Box3D {...box([0, 0, 0], [s, s, s])} color={vc.blue} fillOpacity={0.12} />
        {slabs.map((b, i) => (
          <Box3D key={i} {...b} color={vc.teal} fillOpacity={0.22} />
        ))}
        {rods.map((b, i) => (
          <Box3D key={i} {...b} color={vc.yellow} fillOpacity={0.3} />
        ))}
        <Box3D {...box([s, s, s], [e, e, e])} color={vc.orange} fillOpacity={0.4} />
        <MathLabel3D at={add3([s / 2, s / 2, e], SHIFT)} tex="x^2\,\Delta x" color={vc.teal} />
      </Stage3D>
      <VizControls>
        <LabeledSlider
          label="$x$"
          value={s}
          onChange={setSide}
          min={0.8}
          max={2.6}
          step={0.01}
          color={vc.blue}
        />
        <LabeledSlider
          label="$\Delta x$"
          value={dx}
          onChange={setDx}
          min={0.02}
          max={1}
          step={0.01}
          color={vc.teal}
        />
      </VizControls>
    </>
  )
}
