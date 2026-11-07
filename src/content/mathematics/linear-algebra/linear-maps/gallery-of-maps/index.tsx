import { useState } from 'react'
import {
  add,
  apply,
  cross,
  dot,
  fmtPoint,
  fmtShort,
  fromPolar,
  identity,
  length,
  lerpMat,
  mat2,
  rotation,
  toRows,
  type Mat2,
  type Vec2,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Divider } from '@/ui/atoms'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Arc,
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
  TransformedGrid,
  useHighlight,
  useSequence,
  useStepEffect,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const I_COLOR = vc.green
const J_COLOR = vc.red
const X_COLOR = vc.blue
const OUT_COLOR = vc.teal

type Kind = 'rotation' | 'reflection' | 'shear' | 'scaling' | 'projection'

interface Params {
  /** Rotation angle, in degrees. */
  theta: number
  /** Angle of the mirror line, in degrees. */
  mirror: number
  k: number
  sx: number
  sy: number
  /** Angle of the line projected onto, in degrees. */
  line: number
}

const DEFAULTS: Params = { theta: 60, mirror: 30, k: 1, sx: 2, sy: 0.5, line: 0 }

const rad = (deg: number) => (deg * Math.PI) / 180

/** Reflection across the line through the origin at angle phi. */
const reflection = (phi: number): Mat2 =>
  mat2(Math.cos(2 * phi), Math.sin(2 * phi), Math.sin(2 * phi), -Math.cos(2 * phi))

/** Orthogonal projection onto the line through the origin at angle phi: u u^T for a unit u. */
const projection = (phi: number): Mat2 => {
  const [c, s] = [Math.cos(phi), Math.sin(phi)]
  return mat2(c * c, c * s, c * s, s * s)
}

const matrixOf = (kind: Kind, p: Params): Mat2 => {
  switch (kind) {
    case 'rotation':
      return rotation(rad(p.theta))
    case 'reflection':
      return reflection(rad(p.mirror))
    case 'shear':
      return mat2(1, p.k, 0, 1)
    case 'scaling':
      return mat2(p.sx, 0, 0, p.sy)
    case 'projection':
      return projection(rad(p.line))
  }
}

/**
 * The map part of the way from the identity: a rotation turns by a share of its angle (a straight
 * blend would shrink the plane on the way); the others blend the matrices. Half way to a
 * reflection the plane lies flat on the mirror, then it opens on the other side.
 */
const partial = (kind: Kind, p: Params, t: number): Mat2 =>
  kind === 'rotation' ? rotation(rad(p.theta) * t) : lerpMat(identity, matrixOf(kind, p), t)

const kindOptions = [
  { value: 'rotation', label: 'Rotate' },
  { value: 'reflection', label: 'Reflect' },
  { value: 'shear', label: 'Shear' },
  { value: 'scaling', label: 'Scale' },
  { value: 'projection', label: 'Project' },
] as const

/** The letter F in the first quadrant, upright on y = 0.4, as strokes. */
const LETTER: Vec2[][] = [
  [
    [1, 0.4],
    [1, 2.4],
    [2.2, 2.4],
  ],
  [
    [1, 1.5],
    [1.9, 1.5],
  ],
]

const EPS = 1e-6

/** The name of each map's matrix, as in the explanation. */
const NAMES: Record<Kind, string> = {
  rotation: 'R_\\theta',
  reflection: 'F',
  shear: 'S',
  scaling: 'D',
  projection: 'P',
}

/** What the map keeps, read from the images of the basis. */
const keeps = (m: Mat2) => {
  const li = length(m.i)
  const lj = length(m.j)
  const right = Math.abs(dot(m.i, m.j)) < EPS
  const area = cross(m.i, m.j)
  return {
    lengths: right && Math.abs(li - 1) < EPS && Math.abs(lj - 1) < EPS,
    angles: right && li > EPS && Math.abs(li - lj) < EPS,
    area: Math.abs(area),
    orientation: area > EPS ? 'kept' : area < -EPS ? 'flipped' : 'lost',
  }
}

const deg = (v: number) => `${Math.round(v)}°` // i18n-ignore

export default function GalleryOfMaps() {
  const { id } = useVizStep()
  const [picked, setPicked] = useState<Kind>('rotation')
  const [params, setParams] = useState<Params>(DEFAULTS)
  const [t, setT] = useState(1)
  const [x, setX] = useState<Vec2>([1.5, 2])
  const seq = useSequence()
  const hl = useHighlight()

  const kind: Kind = id === 'keeps' ? picked : (id as Kind)

  /** Plays the map from the plain plane. */
  const play = () => {
    setT(0)
    void seq.run(async ({ tween, wait }) => {
      await wait(0.4)
      await tween(0, 1, { duration: 1.6, onUpdate: setT })
    })
  }

  const enter = () => {
    setParams(DEFAULTS)
    play()
  }

  useStepEffect({
    rotation: enter,
    reflection: enter,
    shear: enter,
    scaling: enter,
    projection: () => {
      setX([1.5, 2])
      enter()
    },
    keeps: () => play(),
  })

  const set = (key: keyof Params) => (v: number) => {
    seq.cancel()
    setT(1)
    setParams((p) => ({ ...p, [key]: v }))
  }

  const pick = (k: Kind) => {
    setPicked(k)
    play()
  }

  const m = partial(kind, params, t)
  const name = kind === 'rotation' ? 'R' : NAMES[kind]
  const full = matrixOf(kind, params)
  const k = keeps(m)

  const square: Vec2[] = [[0, 0], m.i, add(m.i, m.j), m.j]
  const lineDir = fromPolar(1, rad(kind === 'reflection' ? params.mirror : params.line))
  const px = apply(m, x)

  const sliders = () => {
    switch (kind) {
      case 'rotation':
        return (
          <LabeledSlider
            label="$\theta$"
            value={params.theta}
            onChange={set('theta')}
            min={-180}
            max={180}
            step={5}
            format={deg}
          />
        )
      case 'reflection':
        return (
          <LabeledSlider
            label="Mirror angle"
            value={params.mirror}
            onChange={set('mirror')}
            min={0}
            max={180}
            step={5}
            format={deg}
          />
        )
      case 'shear':
        return (
          <LabeledSlider
            label="$k$"
            value={params.k}
            onChange={set('k')}
            min={-2}
            max={2}
            step={0.25}
          />
        )
      case 'scaling':
        return (
          <>
            <LabeledSlider
              label="$s_x$"
              value={params.sx}
              onChange={set('sx')}
              min={0.25}
              max={2}
              step={0.25}
            />
            <LabeledSlider
              label="$s_y$"
              value={params.sy}
              onChange={set('sy')}
              min={0.25}
              max={2}
              step={0.25}
            />
          </>
        )
      case 'projection':
        return (
          <LabeledSlider
            label="Line angle"
            value={params.line}
            onChange={set('line')}
            min={0}
            max={180}
            step={5}
            format={deg}
          />
        )
    }
  }

  return (
    <>
      <Stage
        domain={{ x: [-4.5, 4.5], y: [-3.2, 3.2] }}
        ariaLabel="The plane under a rotation, reflection, shear, scaling or projection"
        zoomable
        highlight={hl}
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Map">
              <MatrixView
                rows={toRows(full)}
                name={`${NAMES[kind]} =`}
                colors={[I_COLOR, J_COLOR]}
                label="Matrix A"
              />
              <Readout
                label="Lengths"
                value={k.lengths ? 'kept' : 'changed'}
                hint="Every vector keeps its length."
              />
              <Readout
                label="Angles"
                value={k.angles ? 'kept' : 'changed'}
                hint="Every angle between two vectors stays the same."
              />
              <Readout
                label="Areas"
                value={k.area < EPS ? '0' : `× ${fmtShort(k.area, 2)}`}
                hint="The area of the shaded square, and of every shape, is multiplied by this factor."
              />
              <Readout
                label="Orientation"
                value={k.orientation}
                hint="Kept when the letter can still be read; flipped when it reads as in a mirror."
              />
              {kind === 'projection' && (
                <>
                  <Readout
                    label="$\mathbf{x}$"
                    value={fmtPoint(x)}
                    color={X_COLOR}
                    {...hl.bind('x')}
                  />
                  <Readout
                    label="$P\mathbf{x}$"
                    value={fmtPoint(px)}
                    color={OUT_COLOR}
                    {...hl.bind('Px')}
                  />
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <TransformedGrid m={m} />

        <Path points={square} closed color="none" width={0} fill={vc.fg} fillOpacity={0.1} />

        {kind === 'rotation' && (
          <>
            <Arc r={1} from={0} to={2 * Math.PI} color={vc.muted} width={1.5} dash="4 5" />
            <Arc
              r={0.45}
              from={0}
              to={rad(params.theta) * t}
              color={vc.fg}
              width={1.5}
              fill={vc.fg}
              fillOpacity={0.08}
            />
            <MathLabel
              at={fromPolar(0.62, (rad(params.theta) * t) / 2)}
              tex="\theta"
              anchor="center"
            />
          </>
        )}

        {(kind === 'reflection' || kind === 'projection') && (
          <Segment from={[0, 0]} to={lineDir} extend color={vc.muted} width={1.5} />
        )}

        {LETTER.map((stroke, n) => (
          <Path
            key={`ghost-${n}`}
            points={stroke}
            color={vc.fg}
            width={2}
            dash="4 5"
            opacity={0.3}
          />
        ))}
        {LETTER.map((stroke, n) => (
          <Path key={n} points={stroke.map((p) => apply(m, p))} color={vc.fg} width={4} />
        ))}

        {kind === 'projection' && (
          <>
            <Path points={[x, px]} color={X_COLOR} width={1.5} dash="4 5" opacity={0.7} />
            <Vector to={x} color={X_COLOR} hoverKey="x" />
            <Vector to={px} color={OUT_COLOR} hoverKey="Px" />
            <MathLabel at={x} tex="\mathbf{x}" anchor="ne" color={X_COLOR} />
            <MathLabel at={px} tex="P\mathbf{x}" anchor="se" color={OUT_COLOR} />
            <Point
              at={x}
              color={X_COLOR}
              onDrag={(p) => {
                seq.cancel()
                setT(1)
                setX(p)
              }}
              label="The vector x"
            />
          </>
        )}

        <Vector to={m.i} color={I_COLOR} hoverKey="i" />
        <Vector to={m.j} color={J_COLOR} hoverKey="j" />
        {length(m.i) > 0.2 && (
          <MathLabel
            at={m.i}
            tex={t > 0 ? `${name}\\hat{\\imath}` : '\\hat{\\imath}'}
            color={I_COLOR}
            anchor="se"
            offset={10}
          />
        )}
        {length(m.j) > 0.2 && (
          <MathLabel
            at={m.j}
            tex={t > 0 ? `${name}\\hat{\\jmath}` : '\\hat{\\jmath}'}
            color={J_COLOR}
            anchor="nw"
            offset={10}
          />
        )}
      </Stage>

      <VizControls>
        {id === 'keeps' && (
          <>
            <SegmentedControl
              label="Map"
              value={picked}
              onChange={(v) => pick(v as Kind)}
              options={kindOptions}
            />
            <Divider />
          </>
        )}
        {sliders()}
      </VizControls>
    </>
  )
}
