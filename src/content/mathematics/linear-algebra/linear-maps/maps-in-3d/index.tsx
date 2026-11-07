import { useState } from 'react'
import {
  add3,
  apply3,
  fmtPoint,
  fmtPoint3,
  fromColumns,
  identityN,
  length3,
  lerpMatN,
  matVec,
  rotationAbout,
  scale3,
  type Axis3,
  type MatN,
  type Vec3,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes3D,
  Cell3D,
  defaultCamera,
  Grid3D,
  Line3D,
  MappedGrid3D,
  MathLabel3D,
  Overlay,
  Path3D,
  Point3D,
  Segment3D,
  screenFrame,
  Stage3D,
  useHighlight,
  useSequence,
  useStepEffect,
  useVizStep,
  Vector3D,
  VizControls,
  type Camera,
} from '@/viz-kit'

const I_COLOR = vc.green
const J_COLOR = vc.red
const K_COLOR = vc.purple
const X_COLOR = vc.blue
const OUT_COLOR = vc.teal
/** The screen's right and up directions. */
const SCREEN_COLOR = vc.yellow
const COL_COLORS = [I_COLOR, J_COLOR, K_COLOR]
const HATS = ['\\hat{\\imath}', '\\hat{\\jmath}', '\\hat{k}']

const I3 = identityN(3)
/** The plane's own grid, placed on the floor: the start of the embedding. */
const FLOOR = [
  [1, 0],
  [0, 1],
  [0, 0],
]
/** Space falling onto the floor, drawn in space: (x, y, z) to (x, y, 0). */
const DROP = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
]

const START_COLS: Vec3[] = [
  [1.5, 0, 0],
  [0.5, 1, 0],
  [0, 0.5, 1],
]
const START_SHEET: Vec3[] = [
  [1, 0, 0.8],
  [0, 1, 0.6],
]
const X: Vec3 = [1, 1.5, 2]

/** A drone seen from above, nose along x, flying at height 0.6. */
const DRONE: Vec3[] = [
  [1.3, 0, 0.6],
  [-0.6, 0.7, 0.6],
  [-0.25, 0, 0.6],
  [-0.6, -0.7, 0.6],
]

const AXIS_DIR: Record<Axis3, Vec3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }

const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (v: number) => `${Math.round(v)}°` // i18n-ignore
const r2 = (m: MatN) => m.map((row) => row.map((v) => Number(v.toFixed(2)) + 0))

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}
const snap3 = (p: Vec3): Vec3 => [snap(p[0]), snap(p[1]), snap(p[2])]

export default function MapsIn3D() {
  const { id } = useVizStep()
  const [cols, setCols] = useState<Vec3[]>(START_COLS)
  const [sheet, setSheet] = useState<Vec3[]>(START_SHEET)
  const [theta, setTheta] = useState(60)
  const [axis, setAxis] = useState<Axis3>('x')
  const [camera, setCamera] = useState<Camera>(defaultCamera)
  /** 0: plain space (or the plane on the floor), 1: the step's map. */
  const [p, setP] = useState(1)
  const seq = useSequence()
  const hl = useHighlight()

  const rotating = id === 'yaw' || id === 'axes'
  const turnAxis: Axis3 = id === 'yaw' ? 'z' : axis

  const play = () => {
    setP(0)
    void seq.run(async ({ tween, wait }) => {
      await wait(0.5)
      await tween(0, 1, { duration: 1.8, onUpdate: setP })
    })
  }

  useStepEffect({
    columns: () => {
      setCols(START_COLS)
      play()
    },
    yaw: () => {
      setTheta(60)
      play()
    },
    axes: () => {
      setAxis('x')
      setTheta(60)
      play()
    },
    flatten: play,
    camera: () => {
      seq.cancel()
      setP(1)
    },
    embed: () => {
      setSheet(START_SHEET)
      play()
    },
  })

  const settle = () => {
    seq.cancel()
    setP(1)
  }

  const target: MatN =
    id === 'columns'
      ? fromColumns(...cols)
      : rotating
        ? rotationAbout(turnAxis, rad(theta))
        : id === 'flatten'
          ? DROP
          : id === 'embed'
            ? fromColumns(...sheet)
            : I3
  const m: MatN = rotating
    ? rotationAbout(turnAxis, rad(theta) * p)
    : id === 'embed'
      ? lerpMatN(FLOOR, target, p)
      : lerpMatN(I3, target, p)

  const n = id === 'embed' ? 2 : 3
  const colsNow = identityN(n).map((e) => apply3(m, e))

  // The matrix the panel shows: the 2 x 3 ones without the zero row used for drawing.
  const frame = screenFrame(camera)
  const P = [[...frame.right], [...frame.up]]
  const shown: MatN = id === 'flatten' ? DROP.slice(0, 2) : id === 'camera' ? P : target
  const name =
    id === 'flatten'
      ? 'D ='
      : id === 'camera'
        ? 'P ='
        : rotating
          ? `R_${turnAxis}(\\theta) =`
          : 'A ='

  const showX = id === 'flatten' || id === 'camera'
  const [sx, sy] = matVec(P, X) as [number, number]
  const alongRight = scale3(frame.right, sx)
  const xOut = showX ? apply3(m, X) : X

  return (
    <>
      <Stage3D
        radius={3.6}
        camera={camera}
        onCameraChange={(c) => {
          setCamera(c)
        }}
        sway={id !== 'camera'}
        highlight={hl}
        ariaLabel="Space, or the plane, moved by a matrix"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Map">
              <MatrixView
                rows={r2(shown)}
                name={name}
                colors={id === 'camera' ? undefined : COL_COLORS.slice(0, n)}
                label="The matrix"
              />
              {id === 'columns' && <Readout label="shape" value="3 × 3" hint="Space to space." />}
              {id === 'flatten' && (
                <Readout label="shape" value="2 × 3" hint="Space to the plane." />
              )}
              {id === 'embed' && <Readout label="shape" value="3 × 2" hint="The plane to space." />}
              {showX && (
                <Readout
                  label="$\mathbf{x}$"
                  value={fmtPoint3(X)}
                  color={X_COLOR}
                  {...hl.bind('x')}
                />
              )}
              {id === 'flatten' && (
                <Readout
                  label="$D\mathbf{x}$"
                  value={fmtPoint([X[0], X[1]])}
                  color={OUT_COLOR}
                  {...hl.bind('out')}
                />
              )}
              {id === 'camera' && (
                <Readout
                  label="$P\mathbf{x}$"
                  value={fmtPoint([sx, sy])}
                  hint="Where $\mathbf{x}$ appears on the screen: right of the center, then up."
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid3D extent={3} />
        <Axes3D extent={3} />

        {rotating && (
          <Line3D
            direction={AXIS_DIR[turnAxis]}
            color={COL_COLORS['xyz'.indexOf(turnAxis)]}
            width={3}
            opacity={0.35}
            reach={4}
          />
        )}

        {id !== 'camera' && <MappedGrid3D m={m} extent={1} />}
        {id !== 'camera' && <Cell3D m={m} color={OUT_COLOR} fillOpacity={0.1} opacity={0.6} />}

        {rotating && (
          <Path3D
            points={DRONE.map((q) => apply3(m, q))}
            closed
            color={vc.fg}
            width={2}
            fill="none"
          />
        )}

        {id !== 'camera' &&
          colsNow.map((c, j) => (
            <g key={j}>
              <Vector3D to={c} color={COL_COLORS[j]} />
              {length3(c) > 0.15 && (
                <MathLabel3D
                  at={c}
                  tex={p < 0.02 ? HATS[j]! : `\\mathbf{a}_${j + 1}`}
                  color={COL_COLORS[j]}
                  anchor="ne"
                />
              )}
            </g>
          ))}

        {id === 'columns' &&
          !seq.running &&
          cols.map((c, j) => (
            <Point3D
              key={j}
              at={c}
              color={COL_COLORS[j]}
              r={3.5}
              label={`Column ${j + 1}`}
              onDrag={(q) => {
                settle()
                setCols((cur) => cur.map((v, k) => (k === j ? snap3(q) : v)))
              }}
            />
          ))}
        {id === 'embed' &&
          !seq.running &&
          sheet.map((c, j) => (
            <Point3D
              key={j}
              at={c}
              color={COL_COLORS[j]}
              r={3.5}
              label={`Column ${j + 1}`}
              onDrag={(q) => {
                settle()
                setSheet((cur) => cur.map((v, k) => (k === j ? snap3(q) : v)))
              }}
            />
          ))}

        {showX && (
          <>
            <Vector3D to={X} color={X_COLOR} hoverKey="x" />
            <MathLabel3D at={X} tex="\mathbf{x}" color={X_COLOR} anchor="ne" hoverKey="x" />
          </>
        )}
        {id === 'camera' && (
          <>
            <Segment3D
              from={[0, 0, 0]}
              to={alongRight}
              color={SCREEN_COLOR}
              width={1.5}
              dash="4 4"
            />
            <Segment3D
              from={alongRight}
              to={add3(alongRight, scale3(frame.up, sy))}
              color={SCREEN_COLOR}
              width={1.5}
              dash="4 4"
            />
            <Vector3D to={frame.right} color={SCREEN_COLOR} />
            <Vector3D to={frame.up} color={SCREEN_COLOR} />
            <MathLabel3D at={frame.right} tex="\mathbf{r}" color={SCREEN_COLOR} anchor="se" />
            <MathLabel3D at={frame.up} tex="\mathbf{u}" color={SCREEN_COLOR} anchor="nw" />
          </>
        )}
        {id === 'flatten' && (
          <>
            <Segment3D from={X} to={xOut} color={vc.muted} width={1.5} dash="4 4" />
            {p > 0.98 && (
              <>
                <Vector3D to={xOut} color={OUT_COLOR} hoverKey="out" />
                <MathLabel3D
                  at={xOut}
                  tex="D\mathbf{x}"
                  color={OUT_COLOR}
                  anchor="se"
                  hoverKey="out"
                />
              </>
            )}
          </>
        )}
      </Stage3D>

      <VizControls>
        {id === 'axes' && (
          <SegmentedControl
            label="Axis"
            value={axis}
            onChange={(a) => {
              setAxis(a as Axis3)
              play()
            }}
            options={[
              { value: 'x', label: '$x$' },
              { value: 'y', label: '$y$' },
              { value: 'z', label: '$z$' },
            ]}
          />
        )}
        {rotating && (
          <LabeledSlider
            label="$\theta$"
            value={theta}
            onChange={(v) => {
              settle()
              setTheta(v)
            }}
            min={-180}
            max={180}
            step={5}
            format={deg}
          />
        )}
      </VizControls>
    </>
  )
}
