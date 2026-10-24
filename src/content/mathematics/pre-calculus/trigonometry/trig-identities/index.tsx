import { useState } from 'react'
import { fmt, TAU, type Vec2 } from '@/lib/math'
import { alpha as tint, vc } from '@/styles/viz-colors'
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
  Vector,
  VizControls,
} from '@/viz-kit'

const ANGLE = vc.yellow
const IMAGE = vc.purple
const COS = vc.blue
const SIN = vc.teal

const on = (t: number, r = 1): Vec2 => [r * Math.cos(t), r * Math.sin(t)]
const scale = (k: number, v: Vec2): Vec2 => [k * v[0], k * v[1]]
const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]]

/** For each reflection step: the image angle, the mirror line and its label. */
const MIRRORS: Record<string, { image: (t: number) => number; line: [Vec2, Vec2]; tex: string }> = {
  negative: {
    image: (t) => -t,
    line: [
      [-1.6, 0],
      [1.6, 0],
    ],
    tex: '-\\theta',
  },
  supplement: {
    image: (t) => Math.PI - t,
    line: [
      [0, -1.4],
      [0, 1.4],
    ],
    tex: '\\pi - \\theta',
  },
  complement: {
    image: (t) => Math.PI / 2 - t,
    line: [
      [-1.3, -1.3],
      [1.3, 1.3],
    ],
    tex: '\\tfrac{\\pi}{2} - \\theta',
  },
}

export default function TrigIdentities() {
  const { id } = useVizStep()
  const [theta, setTheta] = useState(0.6)
  const [a, setA] = useState(0.5)
  const [b, setB] = useState(0.8)
  const seq = useSequence()
  const start = useStepStart(theta)

  const glideTheta = (from: number, to: number) =>
    void seq.run(({ tween }) => tween(from, to, { duration: 1.4, onUpdate: setTheta }))

  useStepEffect({
    pythagorean: (run) => glideTheta(start(run), 2.5),
    negative: (run) => glideTheta(start(run), 0.6),
    supplement: (run) => glideTheta(start(run), 0.5),
    complement: (run) => glideTheta(start(run), 0.35),
    addition: () => {
      setA(0.5)
      void seq.run(({ tween }) => tween(0, 0.8, { duration: 1.8, onUpdate: setB }))
    },
    double: (run) => glideTheta(start(run), 0.6),
  })

  const stop = () => seq.cancel()
  const mirror = MIRRORS[id ?? '']
  const rotating = id === 'addition' || id === 'double'
  const [al, be] = id === 'double' ? [theta, theta] : [a, b]

  const P = on(theta)
  const [c, s] = P
  const image = mirror ? mirror.image(theta) : 0
  const Pi = on(image)

  // The rotated frame and the point at α + β built from it.
  const u = on(be)
  const v: Vec2 = [-Math.sin(be), Math.cos(be)]
  const cu = scale(Math.cos(al), u)
  const R = add(cu, scale(Math.sin(al), v))

  const dragP = (p: Vec2) => {
    stop()
    const t = Math.atan2(p[1], p[0])
    setTheta(t < 0 ? t + TAU : t)
  }

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-1.7, 1.7], y: [-1.45, 1.45] }}
        ariaLabel="The unit circle with a point, its reflections, and a rotated frame that builds the angle addition formulas"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {rotating ? (
                <>
                  <Readout
                    label={id === 'double' ? '$\\theta$' : '$\\alpha$'}
                    value={fmt(al, 3)}
                    color={ANGLE}
                  />
                  {id === 'addition' && (
                    <Readout label="$\beta$" value={fmt(be, 3)} color={IMAGE} />
                  )}
                  <Readout
                    label={id === 'double' ? '$\\cos 2\\theta$' : '$\\cos(\\alpha + \\beta)$'}
                    value={fmt(R[0], 3)}
                    hint="The horizontal coordinate of the rotated point."
                  />
                  <Readout
                    label={
                      id === 'double'
                        ? '$\\cos^2\\theta - \\sin^2\\theta$'
                        : '$\\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta$'
                    }
                    value={fmt(Math.cos(al) * Math.cos(be) - Math.sin(al) * Math.sin(be), 3)}
                  />
                  <Readout
                    label={id === 'double' ? '$\\sin 2\\theta$' : '$\\sin(\\alpha + \\beta)$'}
                    value={fmt(R[1], 3)}
                    hint="The vertical coordinate of the rotated point."
                  />
                  <Readout
                    label={
                      id === 'double'
                        ? '$2\\sin\\theta\\cos\\theta$'
                        : '$\\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta$'
                    }
                    value={fmt(Math.sin(al) * Math.cos(be) + Math.cos(al) * Math.sin(be), 3)}
                  />
                </>
              ) : (
                <>
                  <Readout label="$\theta$" value={fmt(theta, 3)} color={ANGLE} />
                  <Readout label="$\cos\theta$" value={fmt(c, 3)} color={COS} />
                  <Readout label="$\sin\theta$" value={fmt(s, 3)} color={SIN} />
                  {mirror ? (
                    <>
                      <Readout
                        label={`$\\cos(${mirror.tex})$`}
                        value={fmt(Pi[0], 3)}
                        color={IMAGE}
                      />
                      <Readout
                        label={`$\\sin(${mirror.tex})$`}
                        value={fmt(Pi[1], 3)}
                        color={IMAGE}
                      />
                    </>
                  ) : (
                    <Readout label="$\sin^2\theta + \cos^2\theta$" value={fmt(c * c + s * s, 3)} />
                  )}
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid step={0.5} />
        <Axes step={0.5} />
        <Arc r={1} from={0} to={TAU} color={vc.muted} width={1.5} />

        {id === 'pythagorean' && (
          <>
            <Path points={[[0, 0], [c, 0], P]} closed color="none" fill={tint(vc.fg, 0.06)} />
            <Segment from={[0, 0]} to={[c, 0]} color={COS} width={3} />
            <Segment from={[c, 0]} to={P} color={SIN} width={3} />
            <Segment from={[0, 0]} to={P} color={vc.fg} width={1.5} />
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

        {mirror && (
          <>
            <Segment
              from={mirror.line[0]}
              to={mirror.line[1]}
              color={vc.muted}
              width={1.5}
              dash="6 5"
            />
            <Arc r={1} from={0} to={theta} color={ANGLE} width={3.5} />
            <Arc r={1.07} from={0} to={image} color={IMAGE} width={3.5} opacity={0.75} />
            <Segment from={P} to={Pi} color={vc.muted} width={1} dash="3 4" />
            <Segment from={[0, 0]} to={P} color={vc.fg} width={1.5} />
            <Segment from={[0, 0]} to={Pi} color={IMAGE} width={1.5} />
            <MathLabel at={on(theta / 2, 1.18)} tex="\theta" color={ANGLE} />
            <MathLabel at={on(image / 2, 1.22)} tex={mirror.tex} color={IMAGE} />
            <Point at={Pi} color={IMAGE} r={5} coords={false} />
          </>
        )}

        {rotating && (
          <>
            <Arc r={1} from={be} to={be + al} color={ANGLE} width={3.5} />
            <Arc r={0.28} from={0} to={be} color={IMAGE} width={2} />
            <MathLabel
              at={on(be / 2, 0.42)}
              tex={id === 'double' ? '\\theta' : '\\beta'}
              color={IMAGE}
            />
            <MathLabel
              at={on(be + al / 2, 1.18)}
              tex={id === 'double' ? '\\theta' : '\\alpha'}
              color={ANGLE}
            />
            <Point at={on(al)} color={vc.muted} r={4} hollow coords={false} />
            <Vector to={u} color={COS} width={2} />
            <Vector to={v} color={SIN} width={2} />
            <MathLabel at={u} tex="\mathbf{u}" color={COS} anchor="e" offset={10} />
            <MathLabel at={v} tex="\mathbf{v}" color={SIN} anchor="n" offset={10} />
            <Segment from={[0, 0]} to={cu} color={COS} width={3} />
            <Segment from={cu} to={R} color={SIN} width={3} />
            <MathLabel
              at={scale(0.75, cu)}
              tex={id === 'double' ? '\\cos\\theta\\,\\mathbf{u}' : '\\cos\\alpha\\,\\mathbf{u}'}
              color={COS}
              anchor="se"
              offset={10}
            />
            <Segment from={[0, 0]} to={R} color={vc.fg} width={1.5} />
            <Segment from={R} to={[R[0], 0]} color={vc.muted} width={1} dash="3 4" />
            <Point at={R} color={ANGLE} r={5} coords={false} />
          </>
        )}

        {!rotating && <Point at={P} color={ANGLE} label="P" onDrag={dragP} coords={false} />}
      </Stage>

      <VizControls>
        {id === 'addition' ? (
          <>
            <LabeledSlider
              label="$\alpha$"
              value={a}
              onChange={(x) => (stop(), setA(x))}
              min={0}
              max={TAU}
              step={0.01}
              color={ANGLE}
            />
            <LabeledSlider
              label="$\beta$"
              value={b}
              onChange={(x) => (stop(), setB(x))}
              min={0}
              max={TAU}
              step={0.01}
              color={IMAGE}
            />
          </>
        ) : (
          <LabeledSlider
            label="$\theta$"
            value={theta}
            onChange={(x) => (stop(), setTheta(x))}
            min={0}
            max={TAU}
            step={0.01}
            color={ANGLE}
          />
        )}
      </VizControls>
    </>
  )
}
