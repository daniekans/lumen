import { useState } from 'react'
import {
  add,
  apply,
  clamp,
  det,
  fmt,
  identity,
  lerpMat,
  mat2,
  rotation,
  scale,
  type Mat2,
  type Vec2,
} from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { Button, Divider } from '@/ui/atoms'
import { Readout, ReadoutPanel, SegmentedControl, ToggleField } from '@/ui/molecules'
import {
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Stage,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  Vector,
  VizControls,
} from '@/viz-kit'
import { MatrixView } from './MatrixView'

const I_COLOR = vc.green
const J_COLOR = vc.red
const AREA_COLOR = vc.yellow

type Preset = 'rotate' | 'shear' | 'scale' | 'reflect' | 'project'

const presets: Record<Preset, Mat2> = {
  rotate: rotation(Math.PI / 2),
  shear: mat2(1, 1, 0, 1),
  scale: mat2(2, 0, 0, 1.5),
  reflect: mat2(-1, 0, 0, 1),
  // Orthogonal projection onto the line y = x / 2.
  project: mat2(0.8, 0.4, 0.4, 0.2),
}

const presetOptions = [
  { value: 'rotate', label: 'Rotate' },
  { value: 'shear', label: 'Shear' },
  { value: 'scale', label: 'Scale' },
  { value: 'reflect', label: 'Reflect' },
  { value: 'project', label: 'Project' },
] as const

const V: Vec2 = [2, 1]
/** How many grid lines on each side of the origin, and how far each line extends. */
const LINES = 16
const REACH = 60

const isIdentity = (m: Mat2) =>
  [m.i[0] - 1, m.i[1], m.j[0], m.j[1] - 1].every((v) => Math.abs(v) < 1e-6)

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}

export default function MatrixTransformations() {
  const [m, setM] = useState<Mat2>(identity)
  const [preset, setPreset] = useState<Preset | 'custom'>('custom')
  const [showV, setShowV] = useState(true)
  const [showSquare, setShowSquare] = useState(false)
  const seq = useSequence()

  const vOpacity = useAnimatedValue(showV ? 1 : 0, { duration: 0.5 })
  const squareOpacity = useAnimatedValue(showSquare ? 1 : 0, { duration: 0.5 })

  const animateTo = (target: Mat2, duration = 1.4) => {
    const from = m
    return seq.run(({ tween }) =>
      tween(0, 1, { duration, onUpdate: (t) => setM(lerpMat(from, target, t)) }),
    )
  }

  const choosePreset = (p: Preset) => {
    setPreset(p)
    animateTo(presets[p])
  }

  const replay = () => {
    const target = m
    seq.run(async ({ tween, wait }) => {
      setM(identity)
      await wait(0.25)
      await tween(0, 1, { duration: 1.6, onUpdate: (t) => setM(lerpMat(identity, target, t)) })
    })
  }

  const dragBasis = (which: 'i' | 'j') => (p: Vec2) => {
    seq.cancel()
    setPreset('custom')
    setM((cur) => ({ ...cur, [which]: [snap(p[0]), snap(p[1])] as Vec2 }))
  }

  useStepEffect({
    basis: () => {
      setPreset('custom')
      setShowV(true)
      setShowSquare(false)
      animateTo(identity, 1)
    },
    columns: () => {
      setPreset('custom')
      setShowV(true)
      setShowSquare(false)
      animateTo(mat2(1.5, -0.5, 0.5, 1))
    },
    grid: () => {
      setPreset('shear')
      setShowV(false)
      setShowSquare(false)
      animateTo(presets.shear)
    },
    area: () => {
      setPreset('custom')
      setShowV(false)
      setShowSquare(true)
      animateTo(mat2(2, 0.5, 0.5, 1.5))
    },
    sign: () => {
      setShowV(false)
      setShowSquare(true)
      const from = m
      const flipped = mat2(0.5, 1, 1, 0.5)
      seq.run(async ({ tween, wait }) => {
        setPreset('custom')
        await tween(0, 1, { duration: 1.6, onUpdate: (t) => setM(lerpMat(from, flipped, t)) })
        await wait(1.4)
        setPreset('project')
        await tween(0, 1, {
          duration: 1.6,
          onUpdate: (t) => setM(lerpMat(flipped, presets.project, t)),
        })
      })
    },
  })

  const d = det(m)
  const corner = add(m.i, m.j)
  const Av = apply(m, V)
  const iPart = scale(m.i, V[0])

  const gridLines: Vec2[][] = []
  for (let k = -LINES; k <= LINES; k++) {
    if (k === 0) continue
    gridLines.push([apply(m, [k, -REACH]), apply(m, [k, REACH])])
    gridLines.push([apply(m, [-REACH, k]), apply(m, [REACH, k])])
  }

  return (
    <>
      <Stage
        domain={{ x: [-4.5, 4.5], y: [-3.2, 3.2] }}
        ariaLabel="The plane transformed by a 2 by 2 matrix"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel>
              <MatrixView m={m} colors={[I_COLOR, J_COLOR]} />
              <Readout label="$\det A$" value={fmt(d)} color={AREA_COLOR} />
              <Readout
                label="orientation"
                value={Math.abs(d) < 1e-3 ? 'collapsed' : d < 0 ? 'flipped' : 'preserved'}
              />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />

        <g>
          {gridLines.map((pts, k) => (
            <Path key={k} points={pts} color={vc.fg} width={1} opacity={0.22} />
          ))}
          <Path
            points={[apply(m, [-REACH, 0]), apply(m, [REACH, 0])]}
            color={vc.fg}
            width={1.5}
            opacity={0.7}
          />
          <Path
            points={[apply(m, [0, -REACH]), apply(m, [0, REACH])]}
            color={vc.fg}
            width={1.5}
            opacity={0.7}
          />
        </g>

        {squareOpacity > 0.01 && (
          <g style={{ opacity: squareOpacity }}>
            <Path
              points={[[0, 0], m.i, corner, m.j]}
              closed
              color={AREA_COLOR}
              width={1.5}
              dash={d < 0 ? '5 5' : undefined}
              fill={alpha(AREA_COLOR, d < 0 ? 0.1 : 0.2)}
            />
            <MathLabel
              at={[corner[0] / 2, corner[1] / 2]}
              tex={`\\det = ${fmt(d)}`}
              color={AREA_COLOR}
              size={15}
              opacity={squareOpacity * clamp((Math.abs(d) - 0.4) / 0.4, 0, 1)}
            />
          </g>
        )}

        {vOpacity > 0.01 && (
          <g style={{ opacity: vOpacity }}>
            <Path points={[[0, 0], iPart]} color={I_COLOR} width={2} dash="5 6" opacity={0.8} />
            <Path points={[iPart, Av]} color={J_COLOR} width={2} dash="5 6" opacity={0.8} />
            <Vector to={Av} color={vc.fg} width={2.5} />
            <MathLabel
              at={Av}
              tex={isIdentity(m) ? '\\mathbf{v}' : 'A\\mathbf{v}'}
              anchor="ne"
              opacity={vOpacity}
            />
          </g>
        )}

        <Vector to={m.i} color={I_COLOR} />
        <Vector to={m.j} color={J_COLOR} />
        <Point
          at={m.i}
          color={I_COLOR}
          r={3.5}
          onDrag={dragBasis('i')}
          label="Basis vector i-hat"
        />
        <Point
          at={m.j}
          color={J_COLOR}
          r={3.5}
          onDrag={dragBasis('j')}
          label="Basis vector j-hat"
        />
        <MathLabel at={m.i} tex="\hat{\imath}" color={I_COLOR} anchor="se" offset={12} />
        <MathLabel at={m.j} tex="\hat{\jmath}" color={J_COLOR} anchor="nw" offset={12} />
      </Stage>

      <VizControls>
        <SegmentedControl
          label="Preset transformations"
          value={preset}
          onChange={(p) => choosePreset(p as Preset)}
          options={presetOptions}
        />
        <Divider />
        <Button onClick={replay} disabled={seq.running}>
          Replay
        </Button>
        <Button
          onClick={() => {
            setPreset('custom')
            animateTo(identity, 1)
          }}
        >
          Reset
        </Button>
        <Divider />
        <ToggleField
          label="Vector $\mathbf{v}$"
          checked={showV}
          onChange={setShowV}
          color={vc.fg}
        />
        <ToggleField
          label="Area"
          checked={showSquare}
          onChange={setShowSquare}
          color={AREA_COLOR}
        />
      </VizControls>
    </>
  )
}
