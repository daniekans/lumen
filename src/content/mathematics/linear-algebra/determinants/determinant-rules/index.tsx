import { useState } from 'react'
import { add, cross, fmtShort, length, lerpVec, scale, type Mat2, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Grid,
  LetterF,
  MathLabel,
  Overlay,
  Parallelogram,
  Point,
  Segment,
  Stage,
  TurnArc,
  useHighlight,
  useSequence,
  useStepEffect,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const C1_COLOR = vc.green
const C2_COLOR = vc.red
const V_COLOR = vc.blue
const AREA_COLOR = vc.yellow

const U0: Vec2 = [2, 1]
const W0: Vec2 = [1, 2]
const V0: Vec2 = [0.5, -0.5]
const I_HAT: Vec2 = [1, 0]
const J_HAT: Vec2 = [0, 1]

/** The two shears of the last step: column 2 minus half of column 1, then column 1 minus 2/3 of column 2. */
const S1: Vec2 = add(W0, scale(U0, -0.5)) // (0, 1.5)
const S2: Vec2 = add(U0, scale(S1, -2 / 3)) // (2, 0)

const fmt = (v: number) => fmtShort(v, 2)

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}
const snap2 = (p: Vec2): Vec2 => [snap(p[0]), snap(p[1])]

const rows = (a: Vec2, b: Vec2) => [
  [Number(a[0].toFixed(2)) + 0, Number(b[0].toFixed(2)) + 0],
  [Number(a[1].toFixed(2)) + 0, Number(b[1].toFixed(2)) + 0],
]

export default function DeterminantRules() {
  const { id } = useVizStep()
  const [u, setU] = useState<Vec2>(U0)
  const [v, setV] = useState<Vec2>(V0)
  const [c, setC] = useState(1)
  const [k, setK] = useState(0)
  /** Progress of the step's animation (equal, swap, the first shear of the last step). */
  const [t, setT] = useState(0)
  /** Progress of the second shear of the last step. */
  const [t2, setT2] = useState(0)
  const seq = useSequence()
  const hl = useHighlight()

  const animate = (set: (v: number) => void, from: number, ...targets: number[]) => {
    set(from)
    void seq.run(async ({ tween, wait }) => {
      let cur = from
      for (const target of targets) {
        await wait(0.6)
        await tween(cur, target, { duration: 1.4, onUpdate: set })
        cur = target
      }
    })
  }

  useStepEffect({
    identity: () => seq.cancel(),
    scale: () => animate(setC, 1, 2, -1),
    add: () => {
      seq.cancel()
      setU(U0)
      setV(V0)
    },
    equal: () => animate(setT, 0, 1),
    shear: () => animate(setK, 0, 1.5, -1),
    swap: () => animate(setT, 0, 1),
    dependent: () => {
      setU(U0)
      animate(setK, 1.5, -0.75)
    },
    triangular: () => {
      setT(0)
      setT2(0)
      void seq.run(async ({ tween, wait }) => {
        await wait(0.8)
        await tween(0, 1, { duration: 1.6, onUpdate: setT })
        await wait(0.8)
        await tween(0, 1, { duration: 1.6, onUpdate: setT2 })
      })
    },
  })

  const settle =
    <T,>(set: (x: T) => void) =>
    (x: T) => {
      seq.cancel()
      set(x)
    }

  // The two columns the step shows, and their names on the stage.
  let a: Vec2 = U0
  let b: Vec2 = W0
  let names: [string, string] = ['\\mathbf{u}', '\\mathbf{w}']
  switch (id) {
    case 'identity':
      a = I_HAT
      b = J_HAT
      names = ['\\hat{\\imath}', '\\hat{\\jmath}']
      break
    case 'scale':
      a = scale(U0, c)
      names = ['c\\mathbf{u}', '\\mathbf{w}']
      break
    case 'add':
      a = add(u, v)
      names = ['\\mathbf{u} + \\mathbf{v}', '\\mathbf{w}']
      break
    case 'equal':
      b = lerpVec(W0, U0, t)
      names = ['\\mathbf{u}', t > 0.98 ? '' : '\\mathbf{w}']
      break
    case 'shear':
      a = add(U0, scale(W0, k))
      names = ['\\mathbf{u} + k\\mathbf{w}', '\\mathbf{w}']
      break
    case 'swap':
      a = lerpVec(U0, W0, t)
      b = lerpVec(W0, U0, t)
      names =
        t < 0.02
          ? ['\\mathbf{u}', '\\mathbf{w}']
          : t > 0.98
            ? ['\\mathbf{w}', '\\mathbf{u}']
            : ['', '']
      break
    case 'dependent':
      a = u
      b = scale(u, k)
      names = ['\\mathbf{u}', 'k\\mathbf{u}']
      break
    case 'triangular':
      b = lerpVec(W0, S1, t)
      a = lerpVec(U0, S2, t2)
      names = ['\\mathbf{a}_1', '\\mathbf{a}_2']
      break
  }

  const m: Mat2 = { i: a, j: b }
  const d = cross(a, b)
  const flat = Math.abs(d) < 1e-9

  const readouts = () => {
    switch (id) {
      case 'scale':
        return (
          <>
            <Readout label="$c$" value={fmt(c)} />
            <Readout
              label="$\det[\mathbf{u}\ \mathbf{w}]$"
              value={fmt(cross(U0, W0))}
              hint="The determinant before scaling."
            />
          </>
        )
      case 'add':
        return (
          <>
            <Readout
              label="$\det[\mathbf{u}\ \mathbf{w}]$"
              value={fmt(cross(u, W0))}
              color={C1_COLOR}
              {...hl.bind('u')}
            />
            <Readout
              label="$\det[\mathbf{v}\ \mathbf{w}]$"
              value={fmt(cross(v, W0))}
              color={V_COLOR}
              {...hl.bind('v')}
            />
          </>
        )
      case 'shear':
        return <Readout label="$k$" value={fmt(k)} />
      case 'dependent':
        return <Readout label="$k$" value={fmt(k)} />
      default:
        return null
    }
  }

  const detLabel =
    id === 'add' ? '$\\det[\\mathbf{u} + \\mathbf{v}\\ \\ \\mathbf{w}]$' : '$\\det A$'

  return (
    <>
      <Stage
        domain={{ x: [-4.5, 4.5], y: [-3.2, 3.2] }}
        ariaLabel="The parallelogram of two columns, whose signed area is the determinant"
        zoomable
        highlight={hl}
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Columns">
              <MatrixView
                rows={rows(a, b)}
                name="A ="
                colors={[C1_COLOR, C2_COLOR]}
                label="The matrix of the two columns"
              />
              {readouts()}
              <Readout
                label={detLabel}
                value={fmt(d)}
                color={AREA_COLOR}
                hint="The signed area of the parallelogram of the columns: negative when the turn from the first column to the second is clockwise."
              />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />

        {id === 'add' && (
          <>
            <Segment from={[0, 0]} to={W0} extend color={vc.muted} width={1} />
            <Parallelogram u={u} v={W0} />
            <Parallelogram u={v} v={W0} origin={u} color={V_COLOR} />
            <Parallelogram u={a} v={W0} color={vc.fg} fillOpacity={0} dash="5 5" />
          </>
        )}

        {(id === 'scale' || id === 'shear') && (
          <Parallelogram u={U0} v={W0} color={vc.fg} fillOpacity={0} dash="4 5" opacity={0.5} />
        )}
        {id === 'shear' && (
          <Segment from={U0} to={add(U0, W0)} extend color={vc.muted} width={1} dash="3 5" />
        )}

        {id !== 'add' && <Parallelogram u={a} v={b} />}
        {id !== 'add' && !flat && (
          <LetterF m={m} origin={[0.25, 0.15]} size={0.7} width={3} opacity={0.85} />
        )}
        {id !== 'add' && <TurnArc from={a} to={b} r={0.55} color={vc.fg} opacity={0.8} />}

        {id === 'add' && (
          <>
            <Vector to={u} color={C1_COLOR} hoverKey="u" />
            <Vector from={u} to={add(u, v)} color={V_COLOR} hoverKey="v" />
            <Vector to={v} color={V_COLOR} opacity={0.5} hoverKey="v" />
            <MathLabel at={u} tex="\mathbf{u}" color={C1_COLOR} anchor="se" offset={10} />
            <MathLabel at={v} tex="\mathbf{v}" color={V_COLOR} anchor="sw" offset={8} />
            <Vector to={a} color={vc.fg} width={2} />
          </>
        )}

        {id !== 'add' && <Vector to={a} color={C1_COLOR} />}
        <Vector to={b} color={C2_COLOR} />
        {length(a) > 0.2 && names[0] && (
          <MathLabel
            at={a}
            tex={names[0]}
            color={id === 'add' ? vc.fg : C1_COLOR}
            anchor="e"
            offset={10}
          />
        )}
        {length(b) > 0.2 && names[1] && (
          <MathLabel at={b} tex={names[1]} color={C2_COLOR} anchor="nw" offset={10} />
        )}

        {id === 'add' && (
          <>
            <Point
              at={u}
              color={C1_COLOR}
              r={3.5}
              onDrag={(p) => setU(snap2(p))}
              label="The vector u"
            />
            <Point
              at={v}
              color={V_COLOR}
              r={3.5}
              onDrag={(p) => setV(snap2(p))}
              label="The vector v"
            />
          </>
        )}
        {id === 'dependent' && (
          <Point
            at={u}
            color={C1_COLOR}
            r={3.5}
            onDrag={settle((p: Vec2) => setU(snap2(p)))}
            label="The first column u"
          />
        )}
      </Stage>

      {(id === 'scale' || id === 'shear' || id === 'dependent') && (
        <VizControls>
          {id === 'scale' && (
            <LabeledSlider
              label="$c$"
              value={c}
              onChange={settle(setC)}
              min={-2}
              max={2}
              step={0.05}
            />
          )}
          {id === 'shear' && (
            <LabeledSlider
              label="$k$"
              value={k}
              onChange={settle(setK)}
              min={-2}
              max={2}
              step={0.05}
            />
          )}
          {id === 'dependent' && (
            <LabeledSlider
              label="$k$"
              value={k}
              onChange={settle(setK)}
              min={-2}
              max={2}
              step={0.05}
            />
          )}
        </VizControls>
      )}
    </>
  )
}
