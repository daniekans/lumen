import { useState } from 'react'
import { exactTex, fmt, TAU, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
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
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const WAVE = vc.teal
const INVERSE = vc.purple
const LEVEL = vc.yellow
const FIRST = vc.blue
const SECOND = vc.orange

type Domain = { x: [number, number]; y: [number, number] }

/** The restricted piece of each function, reflected across y = x as m goes from 0 to 1. */
const PIECES: Record<
  string,
  { f: (x: number) => number; from: number; to: number; inv: (x: number) => number; tex: string }
> = {
  arcsin: { f: Math.sin, from: -Math.PI / 2, to: Math.PI / 2, inv: Math.asin, tex: '\\arcsin x' },
  arccos: { f: Math.cos, from: 0, to: Math.PI, inv: Math.acos, tex: '\\arccos x' },
  arctan: { f: Math.tan, from: -1.25, to: 1.25, inv: Math.atan, tex: '\\arctan x' },
}

const DOMAINS: Record<string, Domain> = {
  'many-angles': { x: [-7, 7], y: [-2.2, 2.2] },
  arcsin: { x: [-2.4, 2.4], y: [-2.1, 2.1] },
  arccos: { x: [-1.8, 3.6], y: [-1.4, 3.6] },
  arctan: { x: [-3.6, 3.6], y: [-2.6, 2.6] },
  'all-solutions': { x: [-7, 7], y: [-2.2, 2.2] },
  trap: { x: [-6.5, 6.5], y: [-3.4, 3.4] },
}

const morphPoints = (piece: (typeof PIECES)[string], m: number): Vec2[] =>
  Array.from({ length: 161 }, (_, i) => {
    const x = piece.from + ((piece.to - piece.from) * i) / 160
    const y = piece.f(x)
    return [(1 - m) * x + m * y, (1 - m) * y + m * x]
  })

/** A value as exact TeX when it is a special one. */
const show = (v: number) => {
  const t = exactTex(v)
  return t ? <Tex>{t}</Tex> : fmt(v, 3)
}

export default function InverseTrig() {
  const { id } = useVizStep()
  const step = id ?? 'many-angles'
  const [c, setC] = useState(0.5)
  const [x, setX] = useState((5 * Math.PI) / 6)
  const [m, setM] = useState(0)
  const seq = useSequence()

  const reflect = () =>
    void seq.run(async ({ tween, wait }) => {
      setM(0)
      await wait(0.8)
      await tween(0, 1, { duration: 2, onUpdate: setM })
    })

  useStepEffect({
    'many-angles': () => setC(0.5),
    arcsin: reflect,
    arccos: reflect,
    arctan: reflect,
    'all-solutions': () => setC(0.5),
    trap: () => setX((5 * Math.PI) / 6),
  })

  const stop = () => seq.cancel()
  const domain = DOMAINS[step] ?? DOMAINS['many-angles']!
  const piece = PIECES[step]
  const wave = step === 'many-angles' || step === 'all-solutions'

  const a = Math.asin(c)
  // Solutions keyed by family and turn, never by value: at c = ±1 the two families meet, and
  // value keys would collide.
  type Solution = { key: string; t: number }
  const turns = [-2, -1, 0, 1, 2]
  const inView = (t: number) => t >= domain.x[0] && t <= domain.x[1]
  const firsts: Solution[] = turns
    .map((k) => ({ key: `a${k}`, t: a + TAU * k }))
    .filter((p) => inView(p.t))
  const seconds: Solution[] = turns
    .map((k) => ({ key: `b${k}`, t: Math.PI - a + TAU * k }))
    .filter((p) => inView(p.t) && !firsts.some((f) => Math.abs(f.t - p.t) < 1e-9))
  const crossings = [...firsts, ...seconds]

  const back = Math.asin(Math.sin(x))

  return (
    <>
      <Stage
        zoomable
        domain={domain}
        ariaLabel="Graphs of sine, cosine and tangent, their restricted pieces, and their reflections across y = x"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {wave && (
                <>
                  <Readout label="$c$" value={fmt(c, 3)} color={LEVEL} />
                  <Readout label="$\arcsin c$" value={fmt(a, 3)} color={FIRST} />
                  {step === 'all-solutions' && (
                    <Readout label="$\pi - \arcsin c$" value={fmt(Math.PI - a, 3)} color={SECOND} />
                  )}
                  <Readout
                    label="solutions in view"
                    value={crossings.length}
                    hint="Where the line $y = c$ meets the wave between $-7$ and $7$. There are infinitely many in all."
                  />
                </>
              )}
              {piece && (
                <>
                  <Readout
                    label="restricted to"
                    value={
                      step === 'arctan' ? (
                        <Tex>{'(-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2})'}</Tex>
                      ) : step === 'arccos' ? (
                        <Tex>{'[0, \\pi]'}</Tex>
                      ) : (
                        <Tex>{'[-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}]'}</Tex>
                      )
                    }
                    color={WAVE}
                  />
                  <Readout label="inverse" value={<Tex>{piece.tex}</Tex>} color={INVERSE} />
                  <Readout
                    label="range"
                    value={
                      step === 'arctan' ? (
                        <Tex>{'(-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2})'}</Tex>
                      ) : step === 'arccos' ? (
                        <Tex>{'[0, \\pi]'}</Tex>
                      ) : (
                        <Tex>{'[-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}]'}</Tex>
                      )
                    }
                    hint="The outputs of the inverse are the inputs of the restricted piece."
                  />
                </>
              )}
              {step === 'trap' && (
                <>
                  <Readout label="$x$" value={fmt(x, 3)} />
                  <Readout label="$\sin x$" value={show(Math.sin(x))} color={WAVE} />
                  <Readout label="$\arcsin(\sin x)$" value={fmt(back, 3)} color={INVERSE} />
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {wave && (
          <>
            <FunctionPlot f={Math.sin} color={WAVE} width={2.5} samples={1200} />
            <Segment
              from={[domain.x[0], c]}
              to={[domain.x[1], c]}
              color={LEVEL}
              width={1.5}
              dash="6 5"
            />
            {(step === 'many-angles' ? crossings : firsts).map(({ key, t }) => (
              <Point
                key={key}
                at={[t, c]}
                color={step === 'many-angles' ? LEVEL : FIRST}
                r={5}
                coords={false}
              />
            ))}
            {step === 'all-solutions' &&
              seconds.map(({ key, t }) => (
                <Point key={key} at={[t, c]} color={SECOND} r={5} coords={false} />
              ))}
            {step === 'all-solutions' && (
              <>
                <Segment
                  from={[-Math.PI / 2, -2]}
                  to={[-Math.PI / 2, 2]}
                  color={vc.muted}
                  width={1}
                  dash="3 4"
                />
                <Segment
                  from={[Math.PI / 2, -2]}
                  to={[Math.PI / 2, 2]}
                  color={vc.muted}
                  width={1}
                  dash="3 4"
                />
              </>
            )}
          </>
        )}

        {piece && (
          <>
            <FunctionPlot
              f={(t) => (step === 'arctan' && Math.abs(Math.tan(t)) > 4 ? NaN : piece.f(t))}
              breaks={step === 'arctan' ? [-Math.PI / 2, Math.PI / 2] : undefined}
              color={WAVE}
              width={1.5}
              opacity={0.35}
              samples={1200}
            />
            <Segment from={[-4, -4]} to={[4, 4]} color={vc.muted} width={1.25} dash="6 5" />
            <Path points={morphPoints(piece, 0)} color={WAVE} width={3} />
            <Path
              points={morphPoints(piece, m)}
              color={INVERSE}
              width={3}
              opacity={m > 0.01 ? 1 : 0}
            />
            {step === 'arctan' && m > 0.99 && (
              <>
                <FunctionPlot f={Math.atan} color={INVERSE} width={3} />
                <Segment
                  from={[-4, Math.PI / 2]}
                  to={[4, Math.PI / 2]}
                  color={INVERSE}
                  width={1}
                  dash="4 5"
                  opacity={0.6}
                />
                <Segment
                  from={[-4, -Math.PI / 2]}
                  to={[4, -Math.PI / 2]}
                  color={INVERSE}
                  width={1}
                  dash="4 5"
                  opacity={0.6}
                />
              </>
            )}
            {m > 0.99 && (
              <MathLabel
                at={
                  step === 'arccos'
                    ? [-1, Math.PI]
                    : step === 'arctan'
                      ? [2.6, 1.25]
                      : [1, Math.PI / 2]
                }
                tex={piece.tex}
                color={INVERSE}
                anchor={step === 'arctan' ? 's' : 'e'}
                offset={12}
              />
            )}
          </>
        )}

        {step === 'trap' && (
          <>
            <FunctionPlot f={Math.sin} color={WAVE} width={1.5} opacity={0.5} samples={1200} />
            <Segment from={[-3.4, -3.4]} to={[3.4, 3.4]} color={vc.muted} width={1.25} dash="6 5" />
            <FunctionPlot
              f={(t) => Math.asin(Math.sin(t))}
              color={INVERSE}
              width={2.5}
              samples={2400}
            />
            <Segment from={[x, 0]} to={[x, back]} color={INVERSE} width={1} dash="3 4" />
            <Point at={[x, back]} color={INVERSE} r={5} coords={false} />
            <Point at={[x, Math.sin(x)]} color={WAVE} r={4} coords={false} />
            <Segment
              from={[x, Math.sin(x)]}
              to={[back, Math.sin(x)]}
              color={WAVE}
              width={1}
              dash="3 4"
            />
            <Point at={[back, Math.sin(x)]} color={INVERSE} r={4} hollow coords={false} />
            <MathLabel
              at={[-4.7, 1.57]}
              tex="y = \arcsin(\sin x)"
              color={INVERSE}
              anchor="n"
              offset={10}
            />
          </>
        )}
      </Stage>

      <VizControls>
        {wave ? (
          <LabeledSlider
            label="$c$"
            value={c}
            onChange={(v) => (stop(), setC(v))}
            min={-1}
            max={1}
            step={0.01}
            color={LEVEL}
          />
        ) : step === 'trap' ? (
          <LabeledSlider
            label="$x$"
            value={x}
            onChange={(v) => (stop(), setX(v))}
            min={-TAU}
            max={TAU}
            step={0.01}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>Reflection across y = x</span>
        )}
      </VizControls>
    </>
  )
}
