import {
  add,
  add3,
  basisCoords,
  basisCoords3,
  fmtPoint,
  fmtPoint3,
  identity,
  lerpMat,
  sameMat,
  scale,
  scale3,
  type Mat2,
  type Vec2,
  type Vec3,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  Axes3D,
  Grid,
  Grid3D,
  MathLabel,
  MathLabel3D,
  numbersCodec,
  Overlay,
  Point,
  Point3D,
  Segment,
  Stage,
  Stage3D,
  TransformedGrid,
  useHighlight,
  useSequence,
  useStepEffect,
  useStepStart,
  type StepRun,
  useVizParam,
  useVizStep,
  Vector,
  Vector3D,
} from '@/viz-kit'

const B1_COLOR = vc.blue
const B2_COLOR = vc.yellow
const X_COLOR = vc.teal
const B3_COLOR = vc.fg

const X: Vec2 = [3, 4]
const BASIS: Mat2 = { i: [2, 1], j: [-1, 2] }
/** b2 after the move-basis step: x = b1 + b2. */
const B2_MOVED: Vec2 = [1, 3]
/** b2 after the not-a-basis step: -b1 / 2. */
const B2_PARALLEL: Vec2 = [-1, -0.5]

const B3D: readonly [Vec3, Vec3, Vec3] = [
  [2, -1, 0],
  [0, 1, 1],
  [-1, 0, 1],
]
/** -b1 + b2 + b3. */
const X3: Vec3 = [-3, 2, 2]

const basisCodec = numbersCodec(['a', 'b', 'c', 'd'])
const xyCodec = numbersCodec(['x', 'y'])
const xyzCodec = numbersCodec(['x', 'y', 'z'])
const toMat = ({ a, b, c, d }: { a: number; b: number; c: number; d: number }): Mat2 => ({
  i: [a, b],
  j: [c, d],
})
const fromMat = ({ i, j }: Mat2) => ({ a: i[0], b: i[1], c: j[0], d: j[1] })

/** Snaps a dragged coordinate to the nearest multiple of `unit` when it is close to it. */
const snapTo = (unit: number) => (v: number) => {
  const r = Math.round(v / unit) * unit
  return Math.abs(r - v) < 0.15 ? r : v
}
const snapWhole = snapTo(1)
const snapHalf = snapTo(0.5)

export default function BasisAndCoordinates() {
  const { id } = useVizStep()
  const [basisParam, setBasisParam] = useVizParam(
    'B',
    fromMat(id === 'standard' ? identity : BASIS),
    basisCodec,
  )
  const [xParam, setXParam] = useVizParam('x', { x: X[0], y: X[1] }, xyCodec)
  const [x3Param, setX3Param] = useVizParam('x3', { x: X3[0], y: X3[1], z: X3[2] }, xyzCodec)
  const seq = useSequence()
  const hl = useHighlight()

  const m = toMat(basisParam)
  const x: Vec2 = [xParam.x, xParam.y]
  const x3: Vec3 = [x3Param.x, x3Param.y, x3Param.z]
  const setBasis = (next: Mat2) => setBasisParam(fromMat(next))

  const basisStart = useStepStart(m)
  const tweenBasis = (run: StepRun, to: Mat2, duration = 1.6) => {
    const from = basisStart(run)
    if (sameMat(from, to)) return setBasis(to)
    return seq.run(({ tween }) =>
      tween(0, 1, { duration, onUpdate: (t) => setBasis(lerpMat(from, to, t)) }),
    )
  }

  useStepEffect({
    standard: (run) => {
      setXParam({ x: X[0], y: X[1] })
      void tweenBasis(run, identity, 1.2)
    },
    'new-basis': (run) => {
      setXParam({ x: X[0], y: X[1] })
      void tweenBasis(run, BASIS, 2)
    },
    'move-basis': () =>
      void seq.run(async ({ tween, wait }) => {
        setXParam({ x: X[0], y: X[1] })
        setBasis(BASIS)
        await wait(0.5)
        await tween(0, 1, {
          duration: 2,
          onUpdate: (t) => setBasis(lerpMat(BASIS, { i: BASIS.i, j: B2_MOVED }, t)),
        })
      }),
    'not-a-basis': () =>
      void seq.run(async ({ tween, wait }) => {
        setXParam({ x: X[0], y: X[1] })
        setBasis(BASIS)
        await wait(0.5)
        await tween(0, 1, {
          duration: 2,
          onUpdate: (t) => setBasis(lerpMat(BASIS, { i: BASIS.i, j: B2_PARALLEL }, t)),
        })
      }),
    space: () => setX3Param({ x: X3[0], y: X3[1], z: X3[2] }),
  })

  const dragBasis = (key: 'i' | 'j') => (p: Vec2) => {
    seq.cancel()
    setBasis({ ...m, [key]: [snapWhole(p[0]), snapWhole(p[1])] })
  }
  const dragX = (p: Vec2) => {
    seq.cancel()
    setXParam({ x: snapHalf(p[0]), y: snapHalf(p[1]) })
  }
  const dragX3 = (p: Vec3) =>
    setX3Param({ x: snapHalf(p[0]), y: snapHalf(p[1]), z: snapHalf(p[2]) })

  if (id === 'space') {
    const c = basisCoords3(B3D, x3)
    const [b1, b2, b3] = B3D
    const p1 = c ? scale3(b1, c[0]) : null
    const p2 = c && p1 ? add3(p1, scale3(b2, c[1])) : null
    return (
      <Stage3D
        radius={4.6}
        highlight={hl}
        ariaLabel="A basis of space and the coordinates of a vector in it"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Coordinates">
              <Readout
                label="$\mathbf{b}_1$"
                value={fmtPoint3(b1)}
                color={B1_COLOR}
                {...hl.bind('b1')}
              />
              <Readout
                label="$\mathbf{b}_2$"
                value={fmtPoint3(b2)}
                color={B2_COLOR}
                {...hl.bind('b2')}
              />
              <Readout
                label="$\mathbf{b}_3$"
                value={fmtPoint3(b3)}
                color={B3_COLOR}
                {...hl.bind('b3')}
              />
              <Readout
                label="$\mathbf{x}$"
                value={fmtPoint3(x3)}
                color={X_COLOR}
                hint="The components of $\mathbf{x}$: its coordinates in the standard basis."
                {...hl.bind('x')}
              />
              <Readout
                label="$[\mathbf{x}]_{\mathcal{B}}$"
                value={c ? fmtPoint3(c) : 'none'}
                color={X_COLOR}
                hint="The weights with $c_1\mathbf{b}_1 + c_2\mathbf{b}_2 + c_3\mathbf{b}_3 = \mathbf{x}$, drawn tip to tail."
                {...hl.bind('path')}
              />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid3D extent={4} />
        <Axes3D extent={4} />
        {c && p1 && p2 && (
          <>
            <Vector3D to={p1} color={B1_COLOR} width={2} opacity={0.5} hoverKey="path" />
            <Vector3D from={p1} to={p2} color={B2_COLOR} width={2} opacity={0.5} hoverKey="path" />
            <Vector3D from={p2} to={x3} color={B3_COLOR} width={2} opacity={0.5} hoverKey="path" />
          </>
        )}
        <Vector3D to={b1} color={B1_COLOR} hoverKey="b1" />
        <Vector3D to={b2} color={B2_COLOR} hoverKey="b2" />
        <Vector3D to={b3} color={B3_COLOR} hoverKey="b3" />
        <MathLabel3D at={b1} tex="\mathbf{b}_1" color={B1_COLOR} hoverKey="b1" anchor="s" />
        <MathLabel3D at={b2} tex="\mathbf{b}_2" color={B2_COLOR} hoverKey="b2" anchor="se" />
        <MathLabel3D at={b3} tex="\mathbf{b}_3" color={B3_COLOR} hoverKey="b3" anchor="nw" />
        <Vector3D to={x3} color={X_COLOR} width={3} hoverKey="x" />
        <Point3D at={x3} color={X_COLOR} onDrag={dragX3} label="Tip of x" hoverKey="x" />
        <MathLabel3D at={x3} tex="\mathbf{x}" color={X_COLOR} hoverKey="x" anchor="ne" />
      </Stage3D>
    )
  }

  const standard = id === 'standard'
  const c = basisCoords(m, x, 1e-6)
  const p1 = c ? scale(m.i, c[0]) : null
  const showLine = !c && (m.i[0] !== 0 || m.i[1] !== 0)
  const coordsLabel = standard ? '$(x, y)$' : '$[\\mathbf{x}]_{\\mathcal{B}}$'

  return (
    <Stage
      zoomable
      domain={{ x: [-4, 6], y: [-2.5, 5.5] }}
      ariaLabel="A vector and its coordinates in a basis of the plane"
      overlay={
        <Overlay corner="top-left">
          <ReadoutPanel title="Coordinates">
            <Readout
              label={standard ? '$\\hat{\\imath}$' : '$\\mathbf{b}_1$'}
              value={fmtPoint(m.i)}
              color={B1_COLOR}
            />
            <Readout
              label={standard ? '$\\hat{\\jmath}$' : '$\\mathbf{b}_2$'}
              value={fmtPoint(m.j)}
              color={B2_COLOR}
            />
            <Readout
              label="$\mathbf{x}$"
              value={fmtPoint(x)}
              color={X_COLOR}
              hint="The components of $\mathbf{x}$: its coordinates in the standard basis."
            />
            <Readout
              label={coordsLabel}
              value={c ? fmtPoint(c) : 'none'}
              color={X_COLOR}
              hint="The weights with $c_1\mathbf{b}_1 + c_2\mathbf{b}_2 = \mathbf{x}$, drawn tip to tail."
            />
            {!standard && (
              <Readout
                label="basis"
                value={c ? 'yes' : 'no, the span is a line'}
                hint="Two vectors of the plane are a basis exactly when they are not parallel."
              />
            )}
          </ReadoutPanel>
        </Overlay>
      }
    >
      <Grid />
      <Axes />
      <TransformedGrid m={m} color={X_COLOR} opacity={0.3} axisOpacity={0.6} />
      {showLine && (
        <Segment from={[0, 0]} to={m.i} extend color={X_COLOR} width={2} opacity={0.5} />
      )}

      {c && p1 && (
        <>
          <Vector to={p1} color={B1_COLOR} width={2} opacity={0.5} />
          <Vector
            from={p1}
            to={add(p1, scale(m.j, c[1]))}
            color={B2_COLOR}
            width={2}
            opacity={0.5}
          />
        </>
      )}

      <Vector to={x} color={X_COLOR} />
      <Point at={x} color={X_COLOR} onDrag={standard ? undefined : dragX} label="Tip of x" />
      <MathLabel at={x} tex="\mathbf{x}" color={X_COLOR} anchor="ne" offset={10} />

      <Vector to={m.i} color={B1_COLOR} />
      <Vector to={m.j} color={B2_COLOR} />
      <Point
        at={m.i}
        color={B1_COLOR}
        r={4}
        onDrag={standard ? undefined : dragBasis('i')}
        label="Tip of b1"
      />
      <Point
        at={m.j}
        color={B2_COLOR}
        r={4}
        onDrag={standard ? undefined : dragBasis('j')}
        label="Tip of b2"
      />
      <MathLabel
        at={m.i}
        tex={standard ? '\\hat{\\imath}' : '\\mathbf{b}_1'}
        color={B1_COLOR}
        anchor="se"
        offset={8}
      />
      <MathLabel
        at={m.j}
        tex={standard ? '\\hat{\\jmath}' : '\\mathbf{b}_2'}
        color={B2_COLOR}
        anchor={m.j[1] < 0 ? 'sw' : 'nw'}
        offset={8}
      />
    </Stage>
  )
}
