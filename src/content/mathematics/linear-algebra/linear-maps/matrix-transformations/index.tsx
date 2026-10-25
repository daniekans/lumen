import { useState } from 'react'
import {
  apply,
  fmtPoint,
  identity,
  lerpMat,
  sameMat,
  mat2,
  rotation,
  scale,
  toRows,
  type Mat2,
  type Vec2,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Button, Divider } from '@/ui/atoms'
import { MatrixView, Readout, ReadoutPanel, SegmentedControl, ToggleField } from '@/ui/molecules'
import {
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Stage,
  TransformedGrid,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useStepStart,
  type StepRun,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const I_COLOR = vc.green
const J_COLOR = vc.red
const X_COLOR = vc.blue
const OUT_COLOR = vc.teal

type Preset = 'rotate' | 'reflect' | 'scale' | 'project'

const presets: Record<Preset, Mat2> = {
  rotate: rotation(Math.PI / 2),
  reflect: mat2(-1, 0, 0, 1),
  scale: mat2(2, 0, 0, 1.5),
  // Orthogonal projection onto the line y = x / 2.
  project: mat2(0.8, 0.4, 0.4, 0.2),
}

const presetOptions = [
  { value: 'rotate', label: 'Rotate' },
  { value: 'reflect', label: 'Reflect' },
  { value: 'scale', label: 'Scale' },
  { value: 'project', label: 'Project' },
] as const

const READ = mat2(1, -1, 1, 0.5)
const DRAW = mat2(2, 1, 0, 1)
const ITALIC = mat2(1, 0.25, 0, 1)

const X: Vec2 = [2, 1]

/** The letter F, upright on the baseline y = 0, as strokes. */
const LETTER: Vec2[][] = [
  [
    [-3, 0],
    [-3, 2],
    [-1.8, 2],
  ],
  [
    [-3, 1.1],
    [-2.1, 1.1],
  ],
]

const isIdentity = (m: Mat2) => sameMat(m, identity, 1e-6)

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}

export default function MatrixTransformations() {
  const { id } = useVizStep()
  const [m, setM] = useState<Mat2>(identity)
  const [preset, setPreset] = useState<Preset | 'custom'>('custom')
  const [showX, setShowX] = useState(true)
  const [showLetter, setShowLetter] = useState(false)
  const seq = useSequence()

  const xOpacity = useAnimatedValue(showX ? 1 : 0, { duration: 0.5 })
  const letterOpacity = useAnimatedValue(showLetter ? 1 : 0, { duration: 0.5 })

  const start = useStepStart(m)
  /** Animates to `target`; in a step handler, pass `run` so a replay starts where the step began. */
  const animateTo = (target: Mat2, duration = 1.4, run?: StepRun) => {
    const from = run ? start(run) : m
    if (run && sameMat(from, target)) return setM(target)
    return seq.run(({ tween }) =>
      tween(0, 1, { duration, onUpdate: (t) => setM(lerpMat(from, target, t)) }),
    )
  }

  const choosePreset = (p: Preset) => {
    setPreset(p)
    animateTo(presets[p])
  }

  const dragBasis = (which: 'i' | 'j') => (p: Vec2) => {
    seq.cancel()
    setPreset('custom')
    setM((cur) => ({ ...cur, [which]: [snap(p[0]), snap(p[1])] as Vec2 }))
  }

  const show = (x: boolean, letter: boolean) => {
    setShowX(x)
    setShowLetter(letter)
  }

  useStepEffect({
    basis: (run) => {
      setPreset('custom')
      show(true, false)
      animateTo(identity, 1, run)
    },
    columns: (run) => {
      setPreset('custom')
      show(true, false)
      animateTo(mat2(1.5, -0.5, 0.5, 1), undefined, run)
    },
    read: (run) => {
      setPreset('custom')
      show(false, false)
      animateTo(READ, undefined, run)
    },
    draw: (run) => {
      setPreset('custom')
      show(false, false)
      // One column at a time: first i-hat moves, then j-hat.
      const from = start(run)
      const half: Mat2 = { i: DRAW.i, j: from.j }
      void seq.run(async ({ tween, wait }) => {
        await tween(0, 1, { duration: 1.1, onUpdate: (t) => setM(lerpMat(from, half, t)) })
        await wait(0.3)
        await tween(0, 1, { duration: 1.1, onUpdate: (t) => setM(lerpMat(half, DRAW, t)) })
      })
    },
    italic: (run) => {
      setPreset('custom')
      show(false, true)
      const from = start(run)
      void seq.run(async ({ tween, wait }) => {
        if (!isIdentity(from)) {
          await tween(0, 1, { duration: 1, onUpdate: (t) => setM(lerpMat(from, identity, t)) })
          await wait(0.4)
        }
        await tween(0, 1, { duration: 1.4, onUpdate: (t) => setM(lerpMat(identity, ITALIC, t)) })
      })
    },
    presets: (run) => {
      setPreset('rotate')
      show(false, true)
      animateTo(presets.rotate, undefined, run)
    },
  })

  const Ax = apply(m, X)
  const xPart = scale(m.i, X[0])
  const moved = !isIdentity(m)

  return (
    <>
      <Stage
        domain={{ x: [-4.5, 4.5], y: [-3.2, 3.2] }}
        ariaLabel="The plane transformed by a 2 by 2 matrix"
        zoomable
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Matrix">
              <MatrixView
                rows={toRows(m)}
                name="A ="
                colors={[I_COLOR, J_COLOR]}
                label="Matrix A"
              />
              <Readout label="$T(\hat{\imath})$, column 1" value={fmtPoint(m.i)} color={I_COLOR} />
              <Readout label="$T(\hat{\jmath})$, column 2" value={fmtPoint(m.j)} color={J_COLOR} />
              {showX && (
                <Readout
                  label={moved ? '$T(\\mathbf{x})$' : '$\\mathbf{x}$'}
                  value={fmtPoint(Ax)}
                  color={moved ? OUT_COLOR : X_COLOR}
                  hint="$2$ times column 1 plus $1$ times column 2."
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />

        <TransformedGrid m={m} />

        {letterOpacity > 0.01 &&
          moved &&
          LETTER.map((stroke, k) => (
            <Path
              key={`ghost-${k}`}
              points={stroke}
              color={vc.fg}
              width={2}
              dash="4 5"
              opacity={0.3 * letterOpacity}
            />
          ))}
        {letterOpacity > 0.01 &&
          LETTER.map((stroke, k) => (
            <Path
              key={k}
              points={stroke.map((p) => apply(m, p))}
              color={vc.fg}
              width={4}
              opacity={letterOpacity}
            />
          ))}

        {xOpacity > 0.01 && (
          <g style={{ opacity: xOpacity }}>
            <Path points={[[0, 0], xPart]} color={I_COLOR} width={2} dash="5 6" opacity={0.8} />
            <Path points={[xPart, Ax]} color={J_COLOR} width={2} dash="5 6" opacity={0.8} />
            <Vector to={Ax} color={moved ? OUT_COLOR : X_COLOR} width={2.5} />
            <MathLabel
              at={Ax}
              tex={moved ? 'T(\\mathbf{x})' : '\\mathbf{x}'}
              anchor="ne"
              color={moved ? OUT_COLOR : X_COLOR}
              opacity={xOpacity}
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
          label="Image of i-hat, the first column"
        />
        <Point
          at={m.j}
          color={J_COLOR}
          r={3.5}
          onDrag={dragBasis('j')}
          label="Image of j-hat, the second column"
        />
        <MathLabel
          at={m.i}
          tex={moved ? 'T(\\hat{\\imath})' : '\\hat{\\imath}'}
          color={I_COLOR}
          anchor="se"
          offset={12}
        />
        <MathLabel
          at={m.j}
          tex={moved ? 'T(\\hat{\\jmath})' : '\\hat{\\jmath}'}
          color={J_COLOR}
          anchor="nw"
          offset={12}
        />
      </Stage>

      <VizControls>
        {id === 'presets' && (
          <>
            <SegmentedControl
              label="Preset maps"
              value={preset}
              onChange={(p) => choosePreset(p as Preset)}
              options={presetOptions}
            />
            <Divider />
          </>
        )}
        <Button
          onClick={() => {
            setPreset('custom')
            animateTo(identity, 1)
          }}
          disabled={!moved}
        >
          Reset
        </Button>
        <Divider />
        <ToggleField
          label="Vector $\mathbf{x}$"
          checked={showX}
          onChange={setShowX}
          color={X_COLOR}
        />
        <ToggleField label="Letter" checked={showLetter} onChange={setShowLetter} />
      </VizControls>
    </>
  )
}
