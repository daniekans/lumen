import { useState } from 'react'
import {
  add3,
  column,
  detN,
  dot3,
  fmtShort,
  fromColumns,
  identityN,
  length3,
  lerpMatN,
  rank,
  sameMatN,
  scale3,
  type MatN,
  type Vec3,
} from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes3D,
  Cell3D,
  Grid3D,
  MappedGrid3D,
  MathLabel3D,
  Overlay,
  Path3D,
  Point3D,
  Stage3D,
  TurnArc3D,
  useHighlight,
  useProjection,
  useSequence,
  useStepEffect,
  useVizStep,
  Vector3D,
  VizControls,
} from '@/viz-kit'

const COL_COLORS = [vc.green, vc.red, vc.purple]
const VOLUME_COLOR = vc.yellow
const HATS = ['\\hat{\\imath}', '\\hat{\\jmath}', '\\hat{k}']

const I3 = identityN(3)
const START: Vec3[] = [
  [1.5, 0, 0],
  [0.5, 1, 0],
  [0, 0.5, 1],
]
const A0 = fromColumns(...START)
/** The third column dropped into the floor, the plane of the other two. */
const PLANE = fromColumns([1.5, 0, 0], [0.5, 1, 0], [1, 0.5, 0])
/** All three columns on the x-axis. */
const LINE = fromColumns([1.5, 0, 0], [0.5, 0, 0], [1, 0, 0])

const colsOf3 = (m: MatN): Vec3[] => [0, 1, 2].map((j) => column(m, j) as unknown as Vec3)
const withColumn = (m: MatN, j: number, c: Vec3) => {
  const cols = colsOf3(m)
  cols[j] = c
  return fromColumns(...cols)
}
const r2 = (m: MatN) => m.map((row) => row.map((v) => Number(v.toFixed(2)) + 0))

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}
const snap3 = (p: Vec3): Vec3 => [snap(p[0]), snap(p[1]), snap(p[2])]

/** The tetrahedron on three edges from the origin, faces drawn far to near. */
function Tetrahedron({ edges, color }: { edges: Vec3[]; color: string }) {
  const { frame } = useProjection()
  const corners: Vec3[] = [[0, 0, 0], ...edges]
  const faces = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ].map((f) => f.map((k) => corners[k]!))
  const depth = (f: Vec3[]) => dot3(scale3(f.reduce(add3), 1 / 3), frame.toward)
  const sorted = [...faces].sort((a, b) => depth(a) - depth(b))
  return (
    <g pointerEvents="none">
      {sorted.map((f, k) => (
        <Path3D key={k} points={f} closed color={color} width={1.5} fill={alpha(color, 0.3)} />
      ))}
    </g>
  )
}

export default function VolumeIn3D() {
  const { id } = useVizStep()
  const [m, setM] = useState<MatN>(A0)
  const seq = useSequence()
  const hl = useHighlight()

  /** Back to plain space when it has moved, then to each target in turn. */
  const play = (...targets: MatN[]) => {
    const from = m
    void seq.run(async ({ tween, wait }) => {
      if (!sameMatN(from, I3, 1e-6)) {
        await tween(0, 1, { duration: 0.8, onUpdate: (t) => setM(lerpMatN(from, I3, t)) })
      }
      await wait(0.4)
      let cur: MatN = I3
      for (const [k, target] of targets.entries()) {
        const a = cur
        if (k) await wait(0.6)
        await tween(0, 1, { duration: 1.6, onUpdate: (t) => setM(lerpMatN(a, target, t)) })
        cur = target
      }
    })
  }

  useStepEffect({
    cube: () => play(A0),
    handedness: () => play(A0, withColumn(A0, 2, [0, 0.5, -1])),
    collapse: () => play(A0, PLANE, LINE),
    tetrahedron: () => play(A0),
  })

  const cols = colsOf3(m)
  // Exact on the entries the panel shows, so a collapse reads 0, not a rounding residue.
  const d = detN(r2(m))
  const vol = Math.abs(d)
  const moved = !sameMatN(m, I3, 1e-6)
  const draggable = (id === 'cube' || id === 'tetrahedron') && !seq.running
  const hand = vol < 1e-9 ? 'flat' : d > 0 ? 'right-handed' : 'left-handed'
  const dim = rank(r2(m))
  const image =
    dim === 3 ? 'all of space' : dim === 2 ? 'a plane' : dim === 1 ? 'a line' : 'a point'

  return (
    <>
      <Stage3D
        radius={2.5}
        highlight={hl}
        ariaLabel="Space moved by a 3 by 3 matrix, with the unit cube and its image, the parallelepiped of the columns"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Map">
              <MatrixView rows={r2(m)} name="A =" colors={COL_COLORS} label="Matrix A" />
              <Readout
                label="Volume of the box"
                value={fmtShort(vol, 3)}
                color={VOLUME_COLOR}
                hint="The volume of the parallelepiped the unit cube lands on."
              />
              {id === 'tetrahedron' && (
                <Readout
                  label="Tetrahedron"
                  value={fmtShort(vol / 6, 3)}
                  color={VOLUME_COLOR}
                  hint="One sixth of the box: a pyramid on half the base, with the same height."
                />
              )}
              <Readout
                label="$\det A$"
                value={fmtShort(d, 3)}
                color={VOLUME_COLOR}
                hint="The volume factor with a sign: positive when the columns are right-handed."
              />
              {id === 'handedness' && (
                <Readout
                  label="Columns"
                  value={hand}
                  hint="With the right hand's fingers curling from the first column to the second, the third is on the thumb's side when the columns are right-handed."
                />
              )}
              {id === 'collapse' && (
                <Readout label="Image" value={image} hint="Where all of space lands." />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid3D extent={3} />
        <Axes3D extent={3} />
        <MappedGrid3D m={m} extent={1} opacity={0.2} />

        {id === 'tetrahedron' ? (
          <>
            <Cell3D m={m} color={VOLUME_COLOR} fillOpacity={0.04} opacity={0.35} />
            <Tetrahedron edges={cols} color={VOLUME_COLOR} />
          </>
        ) : (
          <Cell3D m={m} color={VOLUME_COLOR} fillOpacity={0.14} opacity={0.75} />
        )}

        {id === 'handedness' && (
          <TurnArc3D from={cols[0]!} to={cols[1]!} r={0.6} color={vc.fg} opacity={0.9} />
        )}

        {cols.map((c, j) => (
          <g key={j}>
            <Vector3D to={c} color={COL_COLORS[j]} hoverKey={`a${j}`} />
            {length3(c) > 0.15 && (
              <MathLabel3D
                at={c}
                tex={moved ? `A${HATS[j]}` : HATS[j]!}
                color={COL_COLORS[j]}
                anchor={j === 0 ? 'se' : j === 1 ? 'e' : 'ne'}
                hoverKey={`a${j}`}
              />
            )}
          </g>
        ))}

        {draggable &&
          cols.map((c, j) => (
            <Point3D
              key={j}
              at={c}
              color={COL_COLORS[j]}
              r={3.5}
              label={`Column ${j + 1}`}
              onDrag={(q) => {
                seq.cancel()
                setM((cur) => withColumn(cur, j, snap3(q)))
              }}
            />
          ))}
      </Stage3D>

      {id === 'handedness' && (
        <VizControls>
          <LabeledSlider
            label="Height of $A\hat{k}$"
            value={cols[2]![2]}
            onChange={(v) => {
              seq.cancel()
              setM(withColumn(A0, 2, [0, 0.5, v]))
            }}
            min={-1.5}
            max={1.5}
            step={0.05}
          />
        </VizControls>
      )}
    </>
  )
}
