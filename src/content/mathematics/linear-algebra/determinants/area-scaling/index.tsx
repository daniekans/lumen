import { useState } from 'react'
import {
  add,
  apply,
  det,
  fmtShort,
  identity,
  length,
  lerpMat,
  mat2,
  polygonArea,
  sameMat,
  toRows,
  type Mat2,
  type Vec2,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Grid,
  LetterF,
  MathLabel,
  Overlay,
  Parallelogram,
  Path,
  Point,
  Stage,
  TransformedGrid,
  TurnArc,
  useCoords,
  useHighlight,
  useSequence,
  useStepEffect,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const I_COLOR = vc.green
const J_COLOR = vc.red
const AREA_COLOR = vc.yellow
const P_COLOR = vc.blue

const A0 = mat2(2, 1, 1, 2)
/** The same first column, the second moved across its line: det 3 becomes -3. */
const FLIPPED = mat2(2, 2.5, 1, -0.25)
const LINE = mat2(2, 1, 1, 0.5)
const ZERO = mat2(0, 0, 0, 0)

const DOMAIN = { x: [-4.5, 4.5] as const, y: [-3.2, 3.2] as const }
const ASPECT = 4.5 / 3.2

/** The grid squares shown in the second step, by their lower-left corners. */
const CELLS: Vec2[] = [
  [0, 0],
  [-1, 0],
  [1, -1],
  [-1, -1],
]

const UNIT: Vec2[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
]

const CIRCLE: Vec2[] = Array.from({ length: 97 }, (_, k): Vec2 => {
  const t = (2 * Math.PI * k) / 96
  return [Math.cos(t), Math.sin(t)]
})

type Side = '0.5' | '0.25' | '0.125' | '0.0625'
const sideOptions = [
  { value: '0.5', label: '$\\frac{1}{2}$' },
  { value: '0.25', label: '$\\frac{1}{4}$' },
  { value: '0.125', label: '$\\frac{1}{8}$' },
  { value: '0.0625', label: '$\\frac{1}{16}$' },
] as const

/** The squares of side h of the grid that lie inside the unit disk, by lower-left corner. */
const cellsInDisk = (h: number): Vec2[] => {
  const n = Math.ceil(1 / h)
  const out: Vec2[] = []
  for (let a = -n; a < n; a++)
    for (let b = -n; b < n; b++) {
      const corners: Vec2[] = [
        [a * h, b * h],
        [(a + 1) * h, b * h],
        [a * h, (b + 1) * h],
        [(a + 1) * h, (b + 1) * h],
      ]
      if (corners.every(([x, y]) => x * x + y * y <= 1 + 1e-12)) out.push([a * h, b * h])
    }
  return out
}

/** The curved map of the last step and the matrix it looks like near a point. */
const AMP = 0.6
const curved = ([x, y]: Vec2): Vec2 => [x + AMP * Math.sin(y), y + AMP * Math.sin(x)]
const localMatrix = ([x, y]: Vec2): Mat2 => mat2(1, AMP * Math.cos(y), AMP * Math.cos(x), 1)

const SPOTS: Vec2[] = [
  [0, 0],
  [1.5, 0.5],
  [3, 0],
]
const spotOptions = [
  { value: '0', label: '$(0, 0)$' },
  { value: '1', label: '$(1.5, 0.5)$' },
  { value: '2', label: '$(3, 0)$' },
] as const

/** Many small parallelograms (the images of squares of side h) as one SVG path. */
function Cells({ m, corners, h }: { m: Mat2; corners: Vec2[]; h: number }) {
  const c = useCoords()
  const d = corners
    .map((p) => {
      const q = [p, add(p, [h, 0]), add(p, [h, h]), add(p, [0, h])].map((v) => c.toPx(apply(m, v)))
      return `M${q.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z`
    })
    .join('')
  return (
    <path
      d={d}
      style={{ fill: AREA_COLOR, fillOpacity: 0.22, stroke: AREA_COLOR, strokeOpacity: 0.7 }}
      strokeWidth={0.75}
      pointerEvents="none"
    />
  )
}

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}

const isIdentity = (m: Mat2) => sameMat(m, identity, 1e-6)

export default function AreaScaling() {
  const { id } = useVizStep()
  const [m, setM] = useState<Mat2>(A0)
  const [side, setSide] = useState<Side>('0.25')
  const [spot, setSpot] = useState(0)
  const [h, setH] = useState(1)
  const seq = useSequence()
  const hl = useHighlight()

  /** Back to the plain plane when it has moved, then to each target in turn. */
  const play = (...targets: Mat2[]) => {
    const from = m
    void seq.run(async ({ tween, wait }) => {
      if (!isIdentity(from)) {
        await tween(0, 1, { duration: 0.8, onUpdate: (t) => setM(lerpMat(from, identity, t)) })
      }
      await wait(0.4)
      let cur = identity
      for (const [k, target] of targets.entries()) {
        const a = cur
        if (k) await wait(0.6)
        await tween(0, 1, { duration: 1.4, onUpdate: (t) => setM(lerpMat(a, target, t)) })
        cur = target
      }
    })
  }

  useStepEffect({
    square: () => play(A0),
    'grid-squares': () => play(A0),
    'any-region': () => play(A0),
    sign: () => play(A0, FLIPPED),
    collapse: () => play(A0, LINE, ZERO, LINE),
    curved: () => {
      seq.cancel()
      setSpot(0)
      setH(1)
    },
  })

  const drag = (which: 'i' | 'j') => (p: Vec2) => {
    seq.cancel()
    setM((cur) => ({ ...cur, [which]: [snap(p[0]), snap(p[1])] as Vec2 }))
  }

  const d = det(m)
  const area = Math.abs(d)
  const flat = area < 1e-9
  const orientation = flat ? 'lost' : d > 0 ? 'kept' : 'flipped'
  const image = !flat
    ? 'the plane'
    : length(m.i) < 1e-9 && length(m.j) < 1e-9
      ? 'a point'
      : 'a line'
  const moved = !isIdentity(m)

  if (id === 'curved') {
    return <Curved spot={spot} setSpot={setSpot} h={h} setH={setH} />
  }

  const hSide = Number(side)
  const disk = id === 'any-region' ? cellsInDisk(hSide) : []
  const squaresArea = disk.length * hSide * hSide

  return (
    <>
      <Stage
        domain={DOMAIN}
        ariaLabel="The plane moved by a matrix, with the unit square and its image, the parallelogram of the columns"
        zoomable
        highlight={hl}
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Map">
              <MatrixView
                rows={toRows(m).map((r) => r.map((v) => Number(v.toFixed(2)) + 0))}
                name="A ="
                colors={[I_COLOR, J_COLOR]}
                label="Matrix A"
              />
              {id === 'any-region' ? (
                <>
                  <Readout
                    label="Squares"
                    value={`${disk.length} × ${fmtShort(hSide * hSide, 4)} = ${fmtShort(squaresArea, 3)}`}
                    hint="How many squares of side h fit inside the disk, times the area of each."
                  />
                  <Readout
                    label="Their images"
                    value={fmtShort(squaresArea * area, 3)}
                    color={AREA_COLOR}
                    hint="The total area of the parallelograms the squares land on: the factor times the squares' area."
                  />
                  <Readout
                    label="Disk, ellipse"
                    value={`${fmtShort(Math.PI, 3)}, ${fmtShort(Math.PI * area, 3)}`}
                    hint="The disk has area π. The squares fill it as h shrinks, and their images fill the ellipse, so the ellipse has the factor times π."
                  />
                </>
              ) : (
                <Readout
                  label="Area of the image"
                  value={fmtShort(area, 3)}
                  color={AREA_COLOR}
                  hint="The area of the parallelogram the unit square lands on."
                />
              )}
              <Readout
                label="$\det A$"
                value={fmtShort(d, 3)}
                color={AREA_COLOR}
                hint="The area factor with a sign: negative when the map flips orientation."
              />
              <Readout
                label="Orientation"
                value={orientation}
                hint="Kept when the turn from the first column to the second is counterclockwise and the letter reads normally; flipped when it reads as in a mirror."
              />
              {id === 'collapse' && (
                <Readout
                  label="Image"
                  value={image}
                  hint="Where the whole plane lands: all the outputs of the map."
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <TransformedGrid m={m} />

        <Path points={UNIT} closed color={vc.fg} width={1.5} dash="4 5" opacity={0.35} />

        {id === 'grid-squares' &&
          CELLS.map((q, k) => (
            <g key={k}>
              {moved && (
                <Path
                  points={UNIT.map((p) => add(q, p))}
                  closed
                  color={vc.fg}
                  width={1}
                  dash="4 5"
                  opacity={0.3}
                />
              )}
              <Parallelogram u={m.i} v={m.j} origin={apply(m, q)} />
              {area > 0.3 && (
                <MathLabel
                  at={apply(m, add(q, [0.5, 0.5]))}
                  tex={fmtShort(area, 2)}
                  anchor="center"
                  color={AREA_COLOR}
                />
              )}
            </g>
          ))}

        {id === 'any-region' ? (
          <>
            <Path points={CIRCLE} color={vc.fg} width={1.5} dash="4 5" opacity={0.35} />
            <Cells m={m} corners={disk} h={hSide} />
            <Path points={CIRCLE.map((p) => apply(m, p))} color={AREA_COLOR} width={2} />
          </>
        ) : (
          id !== 'grid-squares' && <Parallelogram u={m.i} v={m.j} />
        )}

        {id !== 'any-region' && id !== 'grid-squares' && (
          <LetterF m={m} origin={[0.25, 0.15]} size={0.7} width={3} opacity={0.85} />
        )}
        {(id === 'square' || id === 'sign') && (
          <TurnArc from={m.i} to={m.j} r={0.6} color={vc.fg} opacity={0.8} />
        )}

        <Vector to={m.i} color={I_COLOR} hoverKey="i" />
        <Vector to={m.j} color={J_COLOR} hoverKey="j" />
        <Point
          at={m.i}
          color={I_COLOR}
          r={3.5}
          onDrag={drag('i')}
          label="First column, where i-hat lands"
        />
        <Point
          at={m.j}
          color={J_COLOR}
          r={3.5}
          onDrag={drag('j')}
          label="Second column, where j-hat lands"
        />
        {length(m.i) > 0.2 && (
          <MathLabel
            at={m.i}
            tex={moved ? 'A\\hat{\\imath}' : '\\hat{\\imath}'}
            color={I_COLOR}
            anchor="se"
            offset={10}
          />
        )}
        {length(m.j) > 0.2 && (
          <MathLabel
            at={m.j}
            tex={moved ? 'A\\hat{\\jmath}' : '\\hat{\\jmath}'}
            color={J_COLOR}
            anchor="nw"
            offset={10}
          />
        )}
      </Stage>

      {id === 'any-region' && (
        <VizControls>
          <SegmentedControl
            label="Side $h$"
            value={side}
            onChange={(v) => setSide(v as Side)}
            options={sideOptions}
          />
        </VizControls>
      )}
    </>
  )
}

/** Lines k h apart through p, for k from -K to K, sampled for drawing through a curved map. */
const K = 12
const SAMPLES = 72

function Curved({
  spot,
  setSpot,
  h,
  setH,
}: {
  spot: number
  setSpot: (v: number) => void
  h: number
  setH: (v: number) => void
}) {
  const p = SPOTS[spot]!
  const J = localMatrix(p)
  const dJ = det(J)
  const center = curved(add(p, [h / 2, h / 2]))
  const halfH = 2.4 * h
  const domain = {
    x: [center[0] - halfH * ASPECT, center[0] + halfH * ASPECT] as const,
    y: [center[1] - halfH, center[1] + halfH] as const,
  }

  const line = (at: (s: number) => Vec2) =>
    Array.from({ length: SAMPLES + 1 }, (_, i) => curved(at(-K * h + (2 * K * h * i) / SAMPLES)))
  const lines: Vec2[][] = []
  for (let k = -K; k <= K; k++) {
    lines.push(line((s) => [p[0] + k * h, p[1] + s]))
    lines.push(line((s) => [p[0] + s, p[1] + k * h]))
  }

  const n = 32
  const edge = (a: Vec2, b: Vec2) =>
    Array.from({ length: n }, (_, i): Vec2 =>
      curved([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]),
    )
  const corners = UNIT.map((q) => add(p, [q[0] * h, q[1] * h]))
  const outline = corners.flatMap((a, k) => edge(a, corners[(k + 1) % 4]!))
  const ratio = polygonArea(outline) / (h * h)
  const fp = curved(p)
  const linear = UNIT.map((q) => add(fp, apply(J, [q[0] * h, q[1] * h])))

  return (
    <>
      <Stage
        domain={domain}
        ariaLabel="A curved map of the plane near a point, with a small square and its image"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Near p">
              <MatrixView
                rows={toRows(J).map((r) => r.map((v) => Number(v.toFixed(2)) + 0))}
                name="J ="
                label="The local matrix J"
              />
              <Readout label="$h$" value={fmtShort(h, 2)} hint="The side of the square at p." />
              <Readout
                label="Area ratio"
                value={fmtShort(ratio, 4)}
                color={AREA_COLOR}
                hint="The area of the image of the square divided by the square's area, h squared."
              />
              <Readout
                label="$\det J$"
                value={fmtShort(dJ, 4)}
                hint="The determinant of the linear map that the curved map looks like near p. Multivariable calculus calls J the Jacobian matrix."
              />
            </ReadoutPanel>
          </Overlay>
        }
      >
        {lines.map((pts, k) => (
          <Path key={k} points={pts} smooth color={vc.fg} width={1} opacity={0.22} />
        ))}
        <Path
          points={outline}
          closed
          color={AREA_COLOR}
          width={2}
          fill={AREA_COLOR}
          fillOpacity={0.25}
        />
        <Path points={linear} closed color={vc.fg} width={1.5} dash="5 5" opacity={0.7} />
        <Point at={fp} color={P_COLOR} r={4} coords={false} />
        <MathLabel at={fp} tex="f(\mathbf{p})" color={P_COLOR} anchor="sw" offset={8} />
      </Stage>
      <VizControls>
        <SegmentedControl
          label="Point $\mathbf{p}$"
          value={String(spot)}
          onChange={(v) => setSpot(Number(v))}
          options={spotOptions}
        />
        <LabeledSlider label="$h$" value={h} onChange={setH} min={0.02} max={1.5} step={0.01} />
      </VizControls>
    </>
  )
}
