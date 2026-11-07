import { useState } from 'react'
import {
  add3,
  apply,
  apply3,
  fmtPoint,
  fmtPoint3,
  fmtShort,
  identity,
  identityN,
  lerpMat,
  lerpMatN,
  mat2,
  matVec,
  rank,
  scale,
  scale3,
  add,
  type MatN,
  type Vec2,
  type Vec3,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes3D,
  Cell3D,
  Grid,
  Grid3D,
  Line3D,
  MappedGrid3D,
  MathLabel,
  MathLabel3D,
  Overlay,
  Plane3D,
  Point,
  Point3D,
  Pulse,
  Segment,
  Segment3D,
  Stage,
  Stage3D,
  TransformedGrid,
  useHighlight,
  useSequence,
  useStepEffect,
  useVizStep,
  Vector,
  Vector3D,
  VizControls,
} from '@/viz-kit'

const X_COLOR = vc.blue
const IMAGE_COLOR = vc.teal
const KERNEL_COLOR = vc.orange

/** The 2D map: columns (1, 0.5) and (2, 1), so a2 = 2 a1. */
const A2 = mat2(1, 2, 0.5, 1)
const A2_ROWS = [
  [1, 2],
  [0.5, 1],
]
const K2: Vec2 = [2, -1]
const IMAGE_DIR: Vec2 = [2, 1]

type Rank = '3' | '2' | '1'
/** Matrices of space with rank 3, 2 and 1, with a basis of each kernel. */
const SPACE: Record<Rank, { m: number[][]; kernel: Vec3[]; image: Vec3[] }> = {
  '3': {
    m: [
      [1, 0, 0.5],
      [0, 1, 0.5],
      [0, 0, 1],
    ],
    kernel: [],
    image: [],
  },
  '2': {
    // Columns (1, 0, 0.5), (0, 1, 0.5) and their sum (1, 1, 1).
    m: [
      [1, 0, 1],
      [0, 1, 1],
      [0.5, 0.5, 1],
    ],
    kernel: [[1, 1, -1]],
    image: [
      [1, 0, 0.5],
      [0, 1, 0.5],
    ],
  },
  '1': {
    // Every column is u = (1, 0.5, 0.5).
    m: [
      [1, 1, 1],
      [0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5],
    ],
    kernel: [
      [1, -1, 0],
      [0, 1, -1],
    ],
    image: [[1, 0.5, 0.5]],
  },
}

/** The direction of sunlight, and the map that sends each point along it to the floor. */
const D: Vec3 = [-0.5, 1, -1]
const SHADOW = [
  [1, 0, -D[0] / D[2]],
  [0, 1, -D[1] / D[2]],
  [0, 0, 0],
]
const shadowOf = (p: Vec3) => apply3(SHADOW, p)
const LIT: Vec3 = [1, -1, 2]
const X0: Vec2 = [0.5, 1]

/** Class hours, home hours, total hours: the third column is the sum of the first two. */
const TABLE = [
  [2, 1, 3],
  [1, 3, 4],
  [3, 2, 5],
  [0, 2, 2],
]
const W: Vec3 = [0.5, 0.5, 1]
const K3: Vec3 = [1, 1, -1]

const num = (v: number) => fmtShort(v, 2)

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}

export default function KernelAndImage() {
  const { id } = useVizStep()
  const [x, setX] = useState<Vec2>(X0)
  const [t, setT] = useState(0)
  const [r, setR] = useState<Rank>('2')
  const [lit, setLit] = useState<Vec3>(LIT)
  /** 0: before the map, 1: after it. */
  const [p, setP] = useState(1)
  const seq = useSequence()
  const hl = useHighlight()

  const play = () => {
    setP(0)
    void seq.run(async ({ tween, wait }) => {
      await wait(0.6)
      await tween(0, 1, { duration: 2, onUpdate: setP })
    })
  }
  const glide = (from: number, to: number) =>
    void seq.run(async ({ tween, wait }) => {
      setT(from)
      await wait(0.5)
      await tween(from, to, { duration: 2.2, onUpdate: setT })
      await tween(to, from + (to - from) * 0.3, { duration: 1.4, onUpdate: setT })
    })

  useStepEffect({
    image: play,
    kernel: play,
    'same-output': () => {
      setX(X0)
      setP(1)
      glide(0, 1)
    },
    rank: () => {
      setR('2')
      play()
    },
    shadow: () => {
      setLit(LIT)
      setP(1)
      glide(0, 0.8)
    },
    features: () => {
      setP(1)
      glide(0, 0.8)
    },
  })

  const moveT = (v: number) => {
    seq.cancel()
    setT(v)
  }

  const flat = id === 'image' || id === 'kernel' || id === 'same-output'

  if (flat) {
    const m = id === 'same-output' ? identity : lerpMat(identity, A2, p)
    const shifted = add(x, scale(K2, t))
    const out = apply(A2, x)
    const kernelImage = (s: number) => apply(m, scale(K2, s))
    return (
      <>
        <Stage
          domain={{ x: [-4.5, 4.5], y: [-3.2, 3.2] }}
          ariaLabel="The plane collapsing onto a line"
          zoomable
          highlight={hl}
          overlay={
            <Overlay corner="top-right">
              <ReadoutPanel title="Map">
                <MatrixView rows={A2_ROWS} name="A =" label="Matrix A" />
                <Readout
                  label="image"
                  value="a line"
                  color={IMAGE_COLOR}
                  hint="Everything $A$ can reach: the span of its columns."
                />
                <Readout label="rank" value="1" hint="The dimension of the image." />
                {id !== 'image' && (
                  <Readout
                    label="kernel"
                    value="a line"
                    color={KERNEL_COLOR}
                    hint="Every input that $A$ sends to $\mathbf{0}$."
                  />
                )}
                {id === 'same-output' && (
                  <>
                    <Readout label="$\mathbf{x}$" value={fmtPoint(x)} color={X_COLOR} />
                    <Readout
                      label="$\mathbf{x} + t\mathbf{k}$"
                      value={fmtPoint(shifted)}
                      color={X_COLOR}
                    />
                    <Readout
                      label="$A(\mathbf{x} + t\mathbf{k})$"
                      value={fmtPoint(apply(A2, shifted))}
                      color={IMAGE_COLOR}
                    />
                  </>
                )}
              </ReadoutPanel>
            </Overlay>
          }
        >
          <Grid />
          <TransformedGrid m={m} />
          {(id !== 'same-output' ? p > 0.5 : true) && (
            <Segment
              from={scale(IMAGE_DIR, -6)}
              to={scale(IMAGE_DIR, 6)}
              color={IMAGE_COLOR}
              width={3}
              opacity={id === 'same-output' ? 0.8 : (p - 0.5) * 2}
            />
          )}
          {id === 'image' && (
            <>
              <Vector to={m.i} color={vc.green} />
              <Vector to={m.j} color={vc.red} />
              <MathLabel at={m.i} tex="\mathbf{a}_1" color={vc.green} anchor="se" />
              <MathLabel at={m.j} tex="\mathbf{a}_2" color={vc.red} anchor="nw" />
            </>
          )}
          {id === 'kernel' && (
            <>
              <Segment
                from={scale(K2, -4)}
                to={scale(K2, 4)}
                color={KERNEL_COLOR}
                width={1.5}
                opacity={0.5}
                dash="5 5"
              />
              <Segment from={kernelImage(-4)} to={kernelImage(4)} color={KERNEL_COLOR} width={3} />
              <Vector to={kernelImage(1)} color={KERNEL_COLOR} />
              {p < 0.95 && (
                <MathLabel at={kernelImage(1)} tex="(2, -1)" color={KERNEL_COLOR} anchor="sw" />
              )}
              <Pulse at={[0, 0]} when={p >= 1} color={KERNEL_COLOR} />
            </>
          )}
          {id === 'same-output' && (
            <>
              <Segment
                from={scale(K2, -4)}
                to={scale(K2, 4)}
                color={KERNEL_COLOR}
                width={2}
                opacity={0.6}
              />
              <Segment
                from={add(x, scale(K2, -4))}
                to={add(x, scale(K2, 4))}
                color={KERNEL_COLOR}
                width={1.5}
                dash="5 5"
              />
              <Segment from={shifted} to={out} color={vc.muted} width={1.5} dash="3 4" />
              <Vector to={x} color={X_COLOR} width={2} opacity={0.5} />
              <Vector to={shifted} color={X_COLOR} />
              <MathLabel at={x} tex="\mathbf{x}" color={X_COLOR} anchor="nw" />
              <MathLabel at={shifted} tex="\mathbf{x} + t\mathbf{k}" color={X_COLOR} anchor="sw" />
              <Vector to={out} color={IMAGE_COLOR} />
              <MathLabel at={out} tex="A\mathbf{x}" color={IMAGE_COLOR} anchor="se" />
              <Point
                at={x}
                color={X_COLOR}
                label="The vector x"
                onDrag={(q) => {
                  seq.cancel()
                  setX([snap(q[0]), snap(q[1])])
                }}
              />
            </>
          )}
        </Stage>
        <VizControls>
          {id === 'same-output' && (
            <LabeledSlider
              label="$t$"
              value={t}
              onChange={moveT}
              min={-1.5}
              max={1.5}
              step={0.05}
              format={num}
              color={KERNEL_COLOR}
            />
          )}
        </VizControls>
      </>
    )
  }

  // Space: rank, shadow, features.
  const space = SPACE[r]
  const m: MatN = id === 'rank' ? lerpMatN(identityN(3), space.m, p) : identityN(3)

  const ray = add3(lit, scale3(D, t))
  const shade = shadowOf(lit)

  const w = add3(W, scale3(K3, t))
  const predictions = matVec(TABLE, w)

  return (
    <>
      <Stage3D
        radius={3.6}
        highlight={hl}
        ariaLabel={
          id === 'features' ? 'Weights of a model in space' : 'Space collapsing onto its image'
        }
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title={id === 'features' ? 'Model' : 'Map'}>
              {id === 'rank' && (
                <>
                  <MatrixView rows={space.m} name="A =" label="Matrix A" />
                  <Readout
                    label="image"
                    value={['a line', 'a plane', 'all of space'][Number(r) - 1]!}
                    color={IMAGE_COLOR}
                    {...hl.bind('image')}
                  />
                  <Readout label="rank" value={String(rank(space.m))} />
                  <Readout
                    label="kernel"
                    value={['a plane', 'a line', 'only $\\mathbf{0}$'][Number(r) - 1]!}
                    color={KERNEL_COLOR}
                    {...hl.bind('kernel')}
                  />
                </>
              )}
              {id === 'shadow' && (
                <>
                  <MatrixView
                    rows={SHADOW.map((row) => row.map((v) => v + 0))}
                    name="S ="
                    label="The shadow map"
                  />
                  <Readout
                    label="$\mathbf{d}$"
                    value={fmtPoint3(D)}
                    color={KERNEL_COLOR}
                    hint="The direction of the light, pointing down."
                    {...hl.bind('kernel')}
                  />
                  <Readout label="point" value={fmtPoint3(ray)} color={X_COLOR} />
                  <Readout
                    label="its shadow"
                    value={fmtPoint3(shadowOf(ray))}
                    color={IMAGE_COLOR}
                  />
                </>
              )}
              {id === 'features' && (
                <>
                  <MatrixView rows={TABLE} name="X =" label="The data table" />
                  <Readout
                    label="$\mathbf{w}$"
                    value={fmtPoint3(w)}
                    color={X_COLOR}
                    {...hl.bind('w')}
                  />
                  <Readout
                    label="$X\mathbf{w}$"
                    value={`(${predictions.map(num).join(', ')})`}
                    color={IMAGE_COLOR}
                    hint="One prediction per row of the table. It does not move with $t$."
                  />
                </>
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid3D extent={3} />
        <Axes3D extent={3} labels={id === 'features' ? ['w₁', 'w₂', 'w₃'] : undefined} />

        {id === 'rank' && (
          <>
            <MappedGrid3D m={m} extent={1} />
            <Cell3D m={m} color={vc.fg} fillOpacity={0.08} opacity={0.5} />
            {p > 0.6 && r === '2' && (
              <Plane3D
                basis={space.image as [Vec3, Vec3]}
                size={2}
                color={IMAGE_COLOR}
                fillOpacity={0.14}
                gridOpacity={0.3}
                opacity={(p - 0.6) / 0.4}
                hoverKey="image"
              />
            )}
            {p > 0.6 && r === '1' && (
              <Line3D
                direction={space.image[0]!}
                color={IMAGE_COLOR}
                width={3}
                opacity={(p - 0.6) / 0.4}
                hoverKey="image"
              />
            )}
            {r === '2' && (
              <>
                <Line3D
                  direction={space.kernel[0]!}
                  color={KERNEL_COLOR}
                  width={2.5}
                  hoverKey="kernel"
                />
                <Vector3D to={apply3(m, space.kernel[0]!)} color={KERNEL_COLOR} />
              </>
            )}
            {r === '1' && (
              <Plane3D
                basis={space.kernel as [Vec3, Vec3]}
                size={2.2}
                color={KERNEL_COLOR}
                fillOpacity={0.1}
                gridOpacity={0.25}
                hoverKey="kernel"
              />
            )}
            {r === '3' && <Point3D at={[0, 0, 0]} color={KERNEL_COLOR} r={4} />}
          </>
        )}

        {id === 'shadow' && (
          <>
            <Line3D
              through={lit}
              direction={D}
              color={KERNEL_COLOR}
              width={1.5}
              opacity={0.6}
              reach={4}
              dash="5 5"
            />
            <Line3D direction={D} color={KERNEL_COLOR} width={2.5} hoverKey="kernel" />
            <Segment3D from={ray} to={shade} color={KERNEL_COLOR} width={2} opacity={0.9} />
            <Point3D at={ray} color={X_COLOR} r={4.5} coords={false} />
            <Point3D
              at={lit}
              color={X_COLOR}
              hollow
              label="The lit point"
              onDrag={(q) => {
                seq.cancel()
                setT(0)
                setLit([snap(q[0]), snap(q[1]), Math.max(0.5, snap(q[2]))])
              }}
            />
            <Point3D at={shade} color={IMAGE_COLOR} r={5} coords={false} />
            <MathLabel3D at={shade} tex="S\mathbf{x}" color={IMAGE_COLOR} anchor="se" />
          </>
        )}

        {id === 'features' && (
          <>
            <Line3D
              through={W}
              direction={K3}
              color={KERNEL_COLOR}
              width={2}
              opacity={0.8}
              reach={3}
            />
            <Line3D
              direction={K3}
              color={KERNEL_COLOR}
              width={1.5}
              opacity={0.4}
              dash="5 5"
              hoverKey="kernel"
            />
            <Vector3D to={W} color={X_COLOR} width={2} opacity={0.4} />
            <Vector3D to={w} color={X_COLOR} hoverKey="w" />
            <MathLabel3D
              at={w}
              tex={Math.abs(t) < 0.02 ? '\\mathbf{w}' : '\\mathbf{w} + t(1, 1, -1)'}
              color={X_COLOR}
              anchor="ne"
              hoverKey="w"
            />
            <Vector3D from={W} to={w} color={KERNEL_COLOR} width={2} />
          </>
        )}
        {(id === 'shadow' || id === 'features') && (
          <MathLabel3D
            at={id === 'shadow' ? scale3(D, -0.8) : scale3(K3, -1.6)}
            tex={id === 'shadow' ? '\\mathbf{d}' : '(1, 1, -1)'}
            color={KERNEL_COLOR}
            anchor="ne"
          />
        )}
      </Stage3D>

      <VizControls>
        {id === 'rank' && (
          <SegmentedControl
            label="Rank"
            value={r}
            onChange={(v) => {
              setR(v as Rank)
              play()
            }}
            options={[
              { value: '3', label: '$3$' },
              { value: '2', label: '$2$' },
              { value: '1', label: '$1$' },
            ]}
          />
        )}
        {(id === 'shadow' || id === 'features') && (
          <LabeledSlider
            label="$t$"
            value={t}
            onChange={moveT}
            min={id === 'shadow' ? -0.6 : -1}
            max={1}
            step={0.05}
            format={num}
            color={KERNEL_COLOR}
          />
        )}
      </VizControls>
    </>
  )
}
