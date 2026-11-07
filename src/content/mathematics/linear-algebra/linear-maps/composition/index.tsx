import { useState } from 'react'
import {
  apply,
  clamp,
  fmtPoint,
  identity,
  lerpMat,
  mat2,
  multiply,
  rotation,
  sameMat,
  toRows,
  type Mat2,
  type Vec2,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Divider } from '@/ui/atoms'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Grid,
  MathLabel,
  Overlay,
  Path,
  Point,
  Stage,
  TransformedGrid,
  useCodeFocus,
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
const MID_COLOR = vc.yellow
const OUT_COLOR = vc.teal

/** A map with a path from the identity, so the plane can move there smoothly. */
interface Move {
  m: Mat2
  at: (t: number) => Mat2
}

const blend = (m: Mat2): Move => ({ m, at: (t) => lerpMat(identity, m, t) })
const turn = (theta: number): Move => ({ m: rotation(theta), at: (t) => rotation(theta * t) })

const SHEAR = mat2(1, 1, 0, 1)
const QUARTER = Math.PI / 2

type Order = 'AB' | 'BA'

const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (v: number) => `${Math.round(v)}°` // i18n-ignore

/** The letter F, upright on y = 0.4, as strokes. */
const LETTER: Vec2[][] = [
  [
    [0.6, 0.4],
    [0.6, 2.2],
    [1.6, 2.2],
  ],
  [
    [0.6, 1.3],
    [1.4, 1.3],
  ],
]

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}

export default function Composition() {
  const { id } = useVizStep()
  const [B, setB] = useState<Mat2>(SHEAR)
  const [x, setX] = useState<Vec2>([1, 1])
  const [order, setOrder] = useState<Order>('AB')
  const [alpha, setAlpha] = useState(60)
  const [beta, setBeta] = useState(45)
  /** 0: the plain plane, 1: after the first map, 2: after both. */
  const [p, setP] = useState(2)
  const seq = useSequence()
  const hl = useHighlight()

  const rotations = id === 'commute'
  const A: Move = rotations ? turn(rad(alpha)) : turn(QUARTER)
  const Bm: Move = rotations ? turn(rad(beta)) : blend(B)
  const [first, second] = order === 'AB' ? [Bm, A] : [A, Bm]

  /** The plane after p of the way through first, then second. */
  const at = (q: number) => (q <= 1 ? first.at(q) : multiply(second.at(q - 1), first.m))
  const m = at(p)

  const play = (from = 0) => {
    setP(from)
    void seq.run(async ({ tween, wait }) => {
      await wait(0.4)
      if (from < 1) {
        await tween(from, 1, { duration: 1.3, onUpdate: setP })
        await wait(0.5)
      }
      await tween(1, 2, { duration: 1.3, onUpdate: setP })
    })
  }

  useStepEffect({
    twice: () => {
      setB(SHEAR)
      setOrder('AB')
      setX([1, 1])
      play()
    },
    columns: () => {
      setB(SHEAR)
      setOrder('AB')
      play(1)
    },
    order: () => {
      setB(SHEAR)
      setOrder('AB')
      play()
    },
    commute: () => {
      setOrder('AB')
      setAlpha(60)
      setBeta(45)
      play()
    },
  })

  const chooseOrder = (o: Order) => {
    setOrder(o)
    play()
  }

  const settle = () => {
    seq.cancel()
    setP(2)
  }

  const dragColumn = (which: 'i' | 'j') => (q: Vec2) => {
    settle()
    setB((cur) => ({ ...cur, [which]: [snap(q[0]), snap(q[1])] as Vec2 }))
  }

  // The code panel follows the two moves: line 9 of compose.py (`y = B @ x`) while B moves the
  // plane, line 10 (`z = A @ y`) while A does.
  const line = id === 'twice' && seq.running ? 9 + clamp(p - 1, 0, 1) : null
  useCodeFocus(line, { key: line === null ? null : p < 1 ? 'y' : 'z' })

  const AB = multiply(A.m, Bm.m)
  const BA = multiply(Bm.m, A.m)
  const product = order === 'AB' ? AB : BA
  const other = order === 'AB' ? BA : AB

  const showX = id === 'twice'
  const Bx = apply(first.m, x)
  const mid = apply(first.at(Math.min(p, 1)), x)
  const out = apply(m, x)

  const colStep = id === 'columns'
  const orderStep = id === 'order' || id === 'commute'
  const named = (s: string) =>
    rotations ? s.replace('A', 'R_{\\alpha}').replace('B', 'R_{\\beta}') : s
  const productName = named(order === 'AB' ? 'AB' : 'BA')

  return (
    <>
      <Stage
        domain={{ x: [-4.5, 4.5], y: [-3.2, 3.2] }}
        ariaLabel="The plane moved by one linear map, then another"
        zoomable
        highlight={hl}
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel title="Matrices">
              <MatrixView
                rows={toRows(Bm.m)}
                name={`${named('B')} =`}
                colors={colStep ? [I_COLOR, J_COLOR] : undefined}
                label="Matrix B"
              />
              <MatrixView rows={toRows(A.m)} name={`${named('A')} =`} label="Matrix A" />
              <MatrixView
                rows={toRows(product)}
                name={`${productName} =`}
                colors={[I_COLOR, J_COLOR]}
                label="The product"
              />
              {orderStep && (
                <Readout
                  label={`$${named('AB')} = ${named('BA')}$`}
                  value={sameMat(AB, BA, 1e-9) ? 'yes' : 'no'}
                />
              )}
              {showX && (
                <>
                  <Readout
                    label="$\mathbf{x}$"
                    value={fmtPoint(x)}
                    color={X_COLOR}
                    {...hl.bind('x')}
                  />
                  <Readout
                    label="$B\mathbf{x}$"
                    value={fmtPoint(Bx)}
                    color={MID_COLOR}
                    {...hl.bind('y')}
                  />
                  <Readout
                    label="$A(B\mathbf{x})$"
                    value={fmtPoint(apply(AB, x))}
                    color={OUT_COLOR}
                    {...hl.bind('z')}
                  />
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <TransformedGrid m={m} />

        {orderStep &&
          LETTER.map((stroke, n) => (
            <Path
              key={`other-${n}`}
              points={stroke.map((q) => apply(other, q))}
              color={vc.muted}
              width={2.5}
              dash="4 5"
            />
          ))}
        {!showX &&
          LETTER.map((stroke, n) => (
            <Path key={n} points={stroke.map((q) => apply(m, q))} color={vc.fg} width={4} />
          ))}

        {showX && (
          <>
            {p > 0 && <Vector to={x} color={X_COLOR} width={2} opacity={0.5} hoverKey="x" />}
            {p > 1 && <Vector to={Bx} color={MID_COLOR} width={2} opacity={0.6} hoverKey="y" />}
            <Vector
              to={p <= 1 ? mid : out}
              color={p >= 2 ? OUT_COLOR : p >= 1 ? MID_COLOR : X_COLOR}
              hoverKey={p >= 2 ? 'z' : p >= 1 ? 'y' : 'x'}
            />
            <MathLabel
              at={p <= 1 ? mid : out}
              tex={p >= 2 ? 'A(B\\mathbf{x})' : p >= 1 ? 'B\\mathbf{x}' : '\\mathbf{x}'}
              color={p >= 2 ? OUT_COLOR : p >= 1 ? MID_COLOR : X_COLOR}
              anchor="ne"
            />
            {!seq.running && p >= 2 && (
              <Point
                at={x}
                color={X_COLOR}
                onDrag={(q) => setX([snap(q[0]), snap(q[1])])}
                label="The vector x"
              />
            )}
          </>
        )}

        {colStep && (
          <>
            <Vector to={B.i} color={I_COLOR} width={2} opacity={0.45} />
            <Vector to={B.j} color={J_COLOR} width={2} opacity={0.45} />
            <MathLabel at={B.i} tex="\mathbf{b}_1" color={I_COLOR} anchor="se" offset={10} />
            <MathLabel at={B.j} tex="\mathbf{b}_2" color={J_COLOR} anchor="ne" offset={10} />
          </>
        )}

        <Vector to={m.i} color={I_COLOR} />
        <Vector to={m.j} color={J_COLOR} />
        {colStep && p >= 2 && (
          <>
            <MathLabel at={m.i} tex="A\mathbf{b}_1" color={I_COLOR} anchor="nw" offset={10} />
            <MathLabel at={m.j} tex="A\mathbf{b}_2" color={J_COLOR} anchor="nw" offset={10} />
          </>
        )}
        {colStep && (
          <>
            <Point
              at={B.i}
              color={I_COLOR}
              r={3.5}
              onDrag={dragColumn('i')}
              label="Column 1 of B"
            />
            <Point
              at={B.j}
              color={J_COLOR}
              r={3.5}
              onDrag={dragColumn('j')}
              label="Column 2 of B"
            />
          </>
        )}
      </Stage>

      <VizControls>
        {orderStep && (
          <SegmentedControl
            label="Order"
            value={order}
            onChange={(o) => chooseOrder(o as Order)}
            options={
              rotations
                ? [
                    { value: 'AB', label: '$\\beta$ then $\\alpha$' },
                    { value: 'BA', label: '$\\alpha$ then $\\beta$' },
                  ]
                : [
                    { value: 'AB', label: 'Shear, then rotate' },
                    { value: 'BA', label: 'Rotate, then shear' },
                  ]
            }
          />
        )}
        {rotations && (
          <>
            <Divider />
            <LabeledSlider
              label="$\alpha$"
              value={alpha}
              onChange={(v) => {
                settle()
                setAlpha(v)
              }}
              min={-180}
              max={180}
              step={5}
              format={deg}
            />
            <LabeledSlider
              label="$\beta$"
              value={beta}
              onChange={(v) => {
                settle()
                setBeta(v)
              }}
              min={-180}
              max={180}
              step={5}
              format={deg}
            />
          </>
        )}
      </VizControls>
    </>
  )
}
