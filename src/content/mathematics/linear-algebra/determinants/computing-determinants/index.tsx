import { useState } from 'react'
import {
  add,
  cross,
  detN,
  fmtShort,
  minorMatrix,
  polygonArea,
  scale,
  type MatN,
  type Vec2,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  cellCenter,
  Grid,
  MathLabel,
  MatrixCells,
  Overlay,
  Parallelogram,
  Path,
  Point,
  powerOfTen,
  Segment,
  Stage,
  TextLabel,
  TurnArc,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  Vector,
  VizControls,
  type MatrixBand,
} from '@/viz-kit'

const C1_COLOR = vc.green
const C2_COLOR = vc.red
const ROW_COLOR = vc.blue
const AREA_COLOR = vc.yellow
const ADD_COLOR = vc.teal
const SUB_COLOR = vc.orange

const fmt = (v: number) => fmtShort(v, 2)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** The 2 x 2 example: columns (a, c) = (3, 1) and (b, d) = (2, 3), det 7. */
const COL1: Vec2 = [3, 1]
const COL2: Vec2 = [2, 3]

/** The 3 x 3 example of the cofactor steps, det 3. */
const A3: MatN = [
  [2, 1, 3],
  [0, -1, 4],
  [1, 0, 2],
]

/** The triangular example, det 2 * 3 * (-1) * 2 = -12. */
const T4: MatN = [
  [2, 5, -1, 3],
  [0, 3, 7, 1],
  [0, 0, -1, 4],
  [0, 0, 0, 2],
]

/** Elimination: a swap, then two shears. det A = 8. */
const ELIM: { m: MatN; op: string; det: string }[] = [
  {
    m: [
      [0, 2, 1],
      [1, 1, 2],
      [2, 4, 1],
    ],
    op: '',
    det: '\\det A',
  },
  {
    m: [
      [1, 1, 2],
      [0, 2, 1],
      [2, 4, 1],
    ],
    op: 'R_1 \\leftrightarrow R_2',
    det: '-\\det A',
  },
  {
    m: [
      [1, 1, 2],
      [0, 2, 1],
      [0, 2, -3],
    ],
    op: 'R_3 - 2R_1',
    det: '-\\det A',
  },
  {
    m: [
      [1, 1, 2],
      [0, 2, 1],
      [0, 0, -4],
    ],
    op: 'R_3 - R_2',
    det: '-\\det A',
  },
]

/** The plot of land, in units of 10 meters. */
const PLOT0: Vec2[] = [
  [1, 1],
  [6, 0.5],
  [7, 4],
  [3.5, 5.5],
  [0.5, 3.5],
]

type Line = 'r1' | 'r2' | 'r3' | 'c1' | 'c2' | 'c3'
const LINES: { value: Line; label: string }[] = [
  { value: 'r1', label: 'Row 1' },
  { value: 'r2', label: 'Row 2' },
  { value: 'r3', label: 'Row 3' },
  { value: 'c1', label: 'Col 1' },
  { value: 'c2', label: 'Col 2' },
  { value: 'c3', label: 'Col 3' },
]

type Scene = 'plane' | 'cells' | 'chart'
const sceneOf: Record<string, Scene> = {
  rules: 'plane',
  picture: 'plane',
  rows: 'plane',
  cofactor: 'cells',
  'any-line': 'cells',
  sarrus: 'cells',
  triangular: 'cells',
  elimination: 'cells',
  cost: 'chart',
  polygon: 'plane',
}

const DOMAINS: Record<string, { x: readonly [number, number]; y: readonly [number, number] }> = {
  rules: { x: [-4.6, 4.6], y: [-1.6, 4.4] },
  picture: { x: [-1.5, 6.5], y: [-1.2, 5] },
  rows: { x: [-1.5, 6.5], y: [-1.2, 5] },
  cells: { x: [-0.8, 14.8], y: [-3.6, 3.2] },
  chart: { x: [-2, 22], y: [-1.5, 20] },
  polygon: { x: [-1, 8.5], y: [-1.2, 6.5] },
}

const factorial = (n: number) => {
  let f = 1
  for (let k = 2; k <= n; k++) f *= k
  return f
}

/** 2.43 x 10^{18}, or the number itself below a million. */
const sci = (v: number) => {
  if (v < 1e6) return String(Math.round(v))
  const e = Math.floor(Math.log10(v))
  return `${(v / 10 ** e).toFixed(2)} \\times 10^{${e}}`
}

const paren = (v: number) => (v < 0 ? `(${v})` : String(v))

/** The terms of the cofactor expansion of a 3 x 3 along a row or column. */
const expansion = (a: MatN, line: Line) => {
  const k = Number(line[1]) - 1
  const byRow = line[0] === 'r'
  return [0, 1, 2].map((t) => {
    const [i, j] = byRow ? [k, t] : [t, k]
    const sign = (i + j) % 2 === 0 ? 1 : -1
    const minor = minorMatrix(a, i, j)
    const entry = a[i]![j]!
    return { i, j, sign, entry, minor, value: sign * entry * detN(minor) }
  })
}

export default function ComputingDeterminants() {
  const id = useVizStep().id ?? 'rules'
  const scene = sceneOf[id] ?? 'plane'
  const seq = useSequence()
  /** Progress of the step's reveal: piece, term or matrix k shows once s passes k. */
  const [s, setS] = useState(0)
  const [c1, setC1] = useState<Vec2>(COL1)
  const [c2, setC2] = useState<Vec2>(COL2)
  const [plot, setPlot] = useState<Vec2[]>(PLOT0)
  const [n, setN] = useVizParam<number>('n', 20)
  const [line, setLine] = useVizParam<Line>('line', 'c2')

  const reveal = (count: number, from = 0, per = 0.9) => {
    setS(from)
    if (from >= count) return
    void seq.run(async ({ tween, wait }) => {
      await wait(0.5)
      for (let k = Math.floor(from); k < count; k++) {
        await tween(k, k + 1, { duration: per, onUpdate: setS })
        await wait(0.35)
      }
    })
  }

  useStepEffect({
    rules: () => reveal(2),
    picture: () => reveal(6),
    rows: () => {
      seq.cancel()
      setC1(COL1)
      setC2(COL2)
    },
    cofactor: () => reveal(3),
    'any-line': () => {
      seq.cancel()
      setLine('c2')
      setS(3)
    },
    sarrus: () => reveal(6, 0, 0.7),
    triangular: () => reveal(4),
    elimination: () => reveal(3, 0, 1.1),
    cost: () => {
      seq.cancel()
      setN(20)
    },
    polygon: () => {
      setPlot(PLOT0)
      reveal(PLOT0.length, 0, 0.8)
    },
  })

  const drag =
    <T,>(set: (x: T) => void) =>
    (x: T) => {
      seq.cancel()
      set(x)
    }
  const snap = (p: Vec2): Vec2 => [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2]

  const domain = DOMAINS[scene === 'plane' ? (id ?? 'picture') : scene] ?? DOMAINS.picture!

  // ---------- Readouts ----------
  const [a, c] = id === 'rows' ? c1 : COL1
  const [b, d] = id === 'rows' ? c2 : COL2
  const det2 = a * d - b * c
  const plotSigned = polygonArea(plot)
  const fanTerms = plot.map((p, k) => cross(p, plot[(k + 1) % plot.length]!) / 2)
  const shownSum = fanTerms.reduce((acc, v, k) => acc + v * clamp01(s - k), 0)

  const readouts = () => {
    switch (scene) {
      case 'plane':
        if (id === 'polygon')
          return (
            <ReadoutPanel title="Shoelace">
              <Readout
                label="Sum of the triangles"
                value={fmt(shownSum)}
                color={AREA_COLOR}
                hint="The signed areas of the triangles shown so far, origin to each edge."
              />
              <Readout
                label="Area"
                value={`$${fmt(Math.abs(plotSigned) * 100)}\\ \\text{m}^2$`}
                hint="The absolute value of the full sum; one grid square is 10 m by 10 m."
              />
            </ReadoutPanel>
          )
        return (
          <ReadoutPanel title="Columns">
            <MatrixView
              rows={[
                [a, b],
                [c, d],
              ]}
              name="A ="
              colors={[C1_COLOR, C2_COLOR]}
              label="The matrix of the two columns"
            />
            {id === 'picture' && (
              <Readout
                label="$(a + b)(c + d)$"
                value={fmt((a + b) * (c + d))}
                hint="The area of the surrounding rectangle."
              />
            )}
            {id === 'picture' && (
              <Readout
                label="$ac + bd + 2bc$"
                value={fmt(a * c + b * d + 2 * b * c)}
                hint="The six corner pieces together."
              />
            )}
            {id === 'rows' && (
              <Readout
                label="$\det A^T$"
                value={fmt(a * d - c * b)}
                color={ROW_COLOR}
                hint="The signed area of the parallelogram of the rows."
              />
            )}
            <Readout label="$\det A = ad - bc$" value={fmt(det2)} color={AREA_COLOR} />
          </ReadoutPanel>
        )
      case 'chart':
        return (
          <ReadoutPanel title="Work">
            <Readout label="$n$" value={String(n)} />
            <Readout
              label="$n!$"
              value={`$${sci(factorial(n))}$`}
              color={SUB_COLOR}
              hint="Products in a cofactor expansion."
            />
            <Readout
              label="$n^3$"
              value={`$${sci(n ** 3)}$`}
              color={ADD_COLOR}
              hint="About the number of operations of elimination."
            />
          </ReadoutPanel>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Stage
        domain={domain}
        ariaLabel="Ways to compute a determinant: areas, cofactor expansion, elimination, and the area of a polygon"
        zoomable={scene !== 'cells'}
        overlay={readouts() && <Overlay corner="top-left">{readouts()}</Overlay>}
      >
        {scene === 'plane' && <Grid />}
        {id === 'rules' && <RulesScene s={s} />}
        {id === 'picture' && <PictureScene s={s} />}
        {id === 'rows' && (
          <RowsScene
            c1={c1}
            c2={c2}
            onC1={drag((p: Vec2) => setC1(snap(p)))}
            onC2={drag((p: Vec2) => setC2(snap(p)))}
          />
        )}
        {id === 'cofactor' && <ExpansionScene line="r1" s={s} />}
        {id === 'any-line' && <ExpansionScene line={line} s={3} signs />}
        {id === 'sarrus' && <SarrusScene s={s} />}
        {id === 'triangular' && <TriangularScene s={s} />}
        {id === 'elimination' && <EliminationScene s={s} />}
        {id === 'cost' && <CostScene n={n} />}
        {id === 'polygon' && (
          <PolygonScene
            plot={plot}
            terms={fanTerms}
            s={s}
            onMove={(k, p) => {
              seq.cancel()
              setS(plot.length)
              setPlot(plot.map((q, j) => (j === k ? snap(p) : q)))
            }}
          />
        )}
      </Stage>

      {(id === 'any-line' || id === 'cost') && (
        <VizControls>
          {id === 'any-line' && (
            <SegmentedControl
              value={line}
              onChange={setLine}
              options={LINES}
              label="The row or column to expand along"
            />
          )}
          {id === 'cost' && (
            <LabeledSlider
              label="$n$"
              value={n}
              onChange={(v) => setN(Math.round(v))}
              format={(v) => String(Math.round(v))}
              min={2}
              max={20}
              step={1}
            />
          )}
        </VizControls>
      )}
    </>
  )
}

/** The two terms that survive rule 2: ad (counterclockwise) and -bc (clockwise). */
function RulesScene({ s }: { s: number }) {
  const [a, c] = COL1
  const [b, d] = COL2
  const left: Vec2 = [-3.6, 0]
  return (
    <>
      <g style={{ opacity: clamp01(s) }}>
        <Parallelogram u={[a, 0]} v={[0, d]} />
        <TurnArc from={[a, 0]} to={[0, d]} r={0.6} />
        <Vector to={[a, 0]} color={C1_COLOR} />
        <Vector to={[0, d]} color={C2_COLOR} />
        <MathLabel at={[a, 0]} tex="a\hat{\imath}" color={C1_COLOR} anchor="se" offset={6} />
        <MathLabel at={[0, d]} tex="d\hat{\jmath}" color={C2_COLOR} anchor="w" offset={8} />
        <MathLabel at={[a / 2, d / 2]} tex={`ad = ${a * d}`} color={AREA_COLOR} anchor="center" />
      </g>
      <g style={{ opacity: clamp01(s - 1) }}>
        <Parallelogram u={[0, c]} v={[b, 0]} origin={left} dash="5 4" />
        <TurnArc from={[0, c]} to={[b, 0]} center={left} r={0.5} />
        <Vector from={left} to={add(left, [0, c])} color={C1_COLOR} />
        <Vector from={left} to={add(left, [b, 0])} color={C2_COLOR} />
        <MathLabel
          at={add(left, [0, c])}
          tex="c\hat{\jmath}"
          color={C1_COLOR}
          anchor="w"
          offset={8}
        />
        <MathLabel
          at={add(left, [b, 0])}
          tex="b\hat{\imath}"
          color={C2_COLOR}
          anchor="se"
          offset={6}
        />
        <MathLabel
          at={add(left, [b / 2, c + 0.55])}
          tex={`-bc = ${-b * c}`}
          color={AREA_COLOR}
          anchor="center"
        />
      </g>
      <MathLabel
        at={[0, -1]}
        tex={`\\det A = ad - bc = ${a * d} - ${b * c} = ${a * d - b * c}`}
        anchor="center"
        opacity={clamp01(s - 1)}
      />
    </>
  )
}

/** The parallelogram inside its bounding rectangle, with the six corner pieces. */
function PictureScene({ s }: { s: number }) {
  const [a, c] = COL1
  const [b, d] = COL2
  const W = a + b
  const H = c + d
  const pieces: { pts: Vec2[]; tex: string }[] = [
    {
      pts: [
        [0, 0],
        [a, 0],
        [a, c],
      ],
      tex: '\\dfrac{ac}{2}',
    },
    {
      pts: [
        [a, 0],
        [W, 0],
        [W, c],
        [a, c],
      ],
      tex: 'bc',
    },
    {
      pts: [
        [a, c],
        [W, c],
        [W, H],
      ],
      tex: '\\dfrac{bd}{2}',
    },
    {
      pts: [
        [b, d],
        [W, H],
        [b, H],
      ],
      tex: '\\dfrac{ac}{2}',
    },
    {
      pts: [
        [0, d],
        [b, d],
        [b, H],
        [0, H],
      ],
      tex: 'bc',
    },
    {
      pts: [
        [0, 0],
        [b, d],
        [0, d],
      ],
      tex: '\\dfrac{bd}{2}',
    },
  ]
  const centroid = (pts: Vec2[]) =>
    scale(
      pts.reduce((p, q) => add(p, q), [0, 0] as Vec2),
      1 / pts.length,
    )
  return (
    <>
      <Path
        points={[
          [0, 0],
          [W, 0],
          [W, H],
          [0, H],
        ]}
        closed
        color={vc.fg}
        width={1.5}
        dash="5 4"
      />
      {pieces.map((p, k) => (
        <g key={k} style={{ opacity: clamp01(s - k) }}>
          <Path
            points={p.pts}
            closed
            color={vc.muted}
            width={1}
            fill={vc.muted}
            fillOpacity={0.18}
          />
          <MathLabel
            at={centroid(p.pts)}
            tex={p.tex}
            anchor="center"
            size={15}
            color={vc.fg}
            opacity={0.8}
          />
        </g>
      ))}
      <Parallelogram u={COL1} v={COL2} />
      <Vector to={COL1} color={C1_COLOR} />
      <Vector to={COL2} color={C2_COLOR} />
      <MathLabel at={COL1} tex="(a, c)" color={C1_COLOR} anchor="e" offset={8} />
      <MathLabel at={COL2} tex="(b, d)" color={C2_COLOR} anchor="w" offset={8} />
      <MathLabel at={[W / 2, -0.55]} tex="a + b" anchor="center" color={vc.muted} />
      <MathLabel at={[W + 0.2, H / 2]} tex="c + d" anchor="w" color={vc.muted} />
    </>
  )
}

/** The parallelograms of the columns and of the rows, with the same area. */
function RowsScene({
  c1,
  c2,
  onC1,
  onC2,
}: {
  c1: Vec2
  c2: Vec2
  onC1: (p: Vec2) => void
  onC2: (p: Vec2) => void
}) {
  const r1: Vec2 = [c1[0], c2[0]]
  const r2: Vec2 = [c1[1], c2[1]]
  return (
    <>
      <Parallelogram u={r1} v={r2} color={ROW_COLOR} fillOpacity={0.12} dash="5 4" />
      <Vector to={r1} color={ROW_COLOR} width={2} />
      <Vector to={r2} color={ROW_COLOR} width={2} />
      <MathLabel at={r1} tex="\mathbf{r}_1" color={ROW_COLOR} anchor="se" offset={6} />
      <MathLabel at={r2} tex="\mathbf{r}_2" color={ROW_COLOR} anchor="nw" offset={6} />
      <Parallelogram u={c1} v={c2} />
      <TurnArc from={c1} to={c2} r={0.5} />
      <Vector to={c1} color={C1_COLOR} />
      <Vector to={c2} color={C2_COLOR} />
      <MathLabel at={c1} tex="\mathbf{a}_1" color={C1_COLOR} anchor="e" offset={10} />
      <MathLabel at={c2} tex="\mathbf{a}_2" color={C2_COLOR} anchor="n" offset={10} />
      <Point at={c1} color={C1_COLOR} r={3.5} onDrag={onC1} label="The first column" />
      <Point at={c2} color={C2_COLOR} r={3.5} onDrag={onC2} label="The second column" />
    </>
  )
}

const A_ORIGIN: Vec2 = [0, 1.5]
const TERM_X = (t: number) => 4 + t * 3.6

/** A 3 x 3 matrix and its expansion along one line, term by term. */
function ExpansionScene({ line, s, signs = false }: { line: Line; s: number; signs?: boolean }) {
  const terms = expansion(A3, line)
  const k = Number(line[1]) - 1
  const byRow = line[0] === 'r'
  const active = Math.min(2, Math.floor(s))
  const cur = s < 3 ? terms[active] : undefined
  const lineBand: MatrixBand[] = [{ index: k, color: ROW_COLOR, opacity: 0.16 }]
  const dimmed = (i: number, j: number) => cur !== undefined && (i === cur.i || j === cur.j)
  const total = terms.reduce((acc, t) => acc + t.value, 0)
  return (
    <>
      <MatrixCells
        values={A3}
        origin={A_ORIGIN}
        rowBands={byRow ? lineBand : []}
        colBands={byRow ? [] : lineBand}
        cellBands={cur ? [{ index: cur.i, col: cur.j, color: AREA_COLOR, opacity: 0.35 }] : []}
        opacity={(i, j) => (dimmed(i, j) && !(i === cur!.i && j === cur!.j) ? 0.3 : 1)}
      />
      <MathLabel at={[1.5, A_ORIGIN[1] + 0.45]} tex="A" anchor="center" />
      {signs && (
        <>
          <MatrixCells
            values={[0, 1, 2].map((i) => [0, 1, 2].map((j) => ((i + j) % 2 === 0 ? '+' : '−')))}
            origin={[0.6, -2.0]}
            cell={0.6}
            color={() => vc.muted}
            rowBands={byRow ? [{ index: k, color: ROW_COLOR, opacity: 0.16 }] : []}
            colBands={byRow ? [] : [{ index: k, color: ROW_COLOR, opacity: 0.16 }]}
          />
          <TextLabel at={[0.45, -2.95]} align="end" size={11}>
            signs
          </TextLabel>
        </>
      )}
      {terms.map((t, idx) => {
        const x = TERM_X(idx)
        const op = idx === 0 ? (t.sign < 0 ? '-' : '') : t.sign < 0 ? '-' : '+'
        const zero = t.entry === 0
        return (
          <g key={idx} style={{ opacity: s > idx ? (zero ? 0.4 : 1) : 0.12 }}>
            <MathLabel at={[x + 0.5, 0.5]} tex={`${op}\\,${paren(t.entry)}`} anchor="center" />
            <MatrixCells values={t.minor} origin={[x + 1.15, 1.3]} cell={0.8} />
            <MathLabel
              at={[x + 1.7, -0.9]}
              tex={`${t.sign < 0 ? '-' : ''}${paren(t.entry)} \\cdot ${paren(detN(t.minor))}`}
              anchor="center"
              size={14}
              color={vc.muted}
            />
          </g>
        )
      })}
      <MathLabel
        at={[9.4, -2.4]}
        tex={`\\det A = ${terms.map((t, i) => (i === 0 ? String(t.value) : t.value < 0 ? `- ${-t.value}` : `+ ${t.value}`)).join(' ')} = ${total}`}
        anchor="center"
        color={AREA_COLOR}
        opacity={clamp01(s - 2)}
      />
    </>
  )
}

/** A 3 x 3 matrix with its first two columns copied, and the six diagonals. */
function SarrusScene({ s }: { s: number }) {
  const ext = A3.map((row) => [...row, row[0]!, row[1]!])
  const origin: Vec2 = [2.5, 1.8]
  const cell = 1.2
  const diag = (j: number, up: boolean) =>
    [0, 1, 2].map((t) => {
      const i = up ? 2 - t : t
      return { i, j: j + t, center: cellCenter(origin, cell, i, j + t) }
    })
  const diags = [0, 1, 2].flatMap((j) => [
    { up: false, cells: diag(j, false) },
    { up: true, cells: diag(j, true) },
  ])
  // Reveal the three going down first, then the three going up.
  const order = [0, 2, 4, 1, 3, 5]
  const product = (cells: { i: number; j: number }[]) =>
    cells.reduce((p, q) => p * ext[q.i]![q.j]!, 1)
  const total = diags.reduce((acc, dd) => acc + (dd.up ? -1 : 1) * product(dd.cells), 0)
  return (
    <>
      <MatrixCells
        values={ext}
        origin={origin}
        cell={cell}
        color={(_, j) => (j > 2 ? vc.muted : undefined)}
        bracketOpacity={0}
      />
      <MatrixCells values={A3.map((row) => row.map(() => null))} origin={origin} cell={cell} />
      {order.map((idx, r) => {
        const dd = diags[idx]!
        const pts = dd.cells.map((q) => q.center)
        const color = dd.up ? SUB_COLOR : ADD_COLOR
        const first = pts[0]!
        const last = pts[2]!
        const dir = scale(add(last, scale(first, -1)), 0.3)
        const tip = add(last, dir)
        const p = product(dd.cells)
        const sign = dd.up ? '-' : '+'
        return (
          <g key={idx} style={{ opacity: clamp01(s - r) }}>
            <Segment
              from={add(first, scale(dir, -1))}
              to={tip}
              color={color}
              width={2}
              opacity={0.75}
              dash={dd.up ? '6 4' : undefined}
            />
            <MathLabel
              at={tip}
              tex={`${sign}\\,(${p})`}
              color={color}
              anchor={dd.up ? 'n' : 's'}
              offset={6}
              size={14}
            />
          </g>
        )
      })}
      <MathLabel
        at={[6.5, -2.9]}
        tex={`\\det A = (-4 + 4 + 0) - (-3 + 0 + 0) = ${total}`}
        anchor="center"
        color={AREA_COLOR}
        opacity={clamp01(s - 5)}
      />
      <TextLabel at={[11.2, 0]} align="middle" size={12}>
        3 × 3 only
      </TextLabel>
    </>
  )
}

/** A triangular 4 x 4, expanded along the first column again and again. */
function TriangularScene({ s }: { s: number }) {
  const origin: Vec2 = [1, 2.4]
  const cell = 1.1
  const taken = Math.floor(s)
  const diagValues = T4.map((row, i) => row[i]!)
  const partial = diagValues.slice(0, Math.max(1, Math.min(4, Math.ceil(s))))
  const product = partial.reduce((p, v) => p * v, 1)
  return (
    <>
      <MatrixCells
        values={T4}
        origin={origin}
        cell={cell}
        cellBands={diagValues.map((_, i) => ({
          index: i,
          col: i,
          color: AREA_COLOR,
          opacity: i < s ? 0.4 : 0.15,
        }))}
        color={(i, j) => (i > j ? vc.muted : undefined)}
        opacity={(i, j) => (i !== j && (i < taken || j < taken) ? 0.25 : 1)}
      />
      <MathLabel
        at={[10.5, 0.6]}
        tex={`\\det T = ${partial.map(paren).join(' \\cdot ')}${s >= 4 ? ` = ${product}` : ' \\cdots'}`}
        anchor="center"
        color={AREA_COLOR}
        opacity={clamp01(s)}
      />
    </>
  )
}

/** Row operations from A to a triangular matrix, one matrix after another. */
function EliminationScene({ s }: { s: number }) {
  const cell = 0.8
  const gap = 1.4
  const w = 3 * cell
  return (
    <>
      {ELIM.map((e, k) => {
        const x = k * (w + gap)
        const origin: Vec2 = [x, 1.2]
        const last = k === ELIM.length - 1
        return (
          <g key={k} style={{ opacity: k === 0 ? 1 : clamp01(s - k + 1) }}>
            {k > 0 && (
              <>
                <MathLabel at={[x - gap / 2, 1.85]} tex={e.op} anchor="center" size={13} />
                <MathLabel at={[x - gap / 2, 0]} tex="\to" anchor="center" color={vc.muted} />
              </>
            )}
            <MatrixCells
              values={e.m}
              origin={origin}
              cell={cell}
              cellBands={
                last
                  ? [0, 1, 2].map((i) => ({
                      index: i,
                      col: i,
                      color: AREA_COLOR,
                      opacity: 0.35,
                    }))
                  : []
              }
              color={(i, j) => (i > j && e.m[i]![j] === 0 ? vc.muted : undefined)}
            />
            <MathLabel
              at={[x + w / 2, -1.7]}
              tex={e.det}
              anchor="center"
              size={13}
              color={vc.muted}
            />
          </g>
        )
      })}
      <MathLabel
        at={[7, -2.85]}
        tex="-\det A = 1 \cdot 2 \cdot (-4) = -8, \quad \det A = 8"
        anchor="center"
        color={AREA_COLOR}
        opacity={clamp01(s - 2)}
      />
    </>
  )
}

/** log10 of n! and of n^3 for n = 1 to 20. */
function CostScene({ n }: { n: number }) {
  const ns = Array.from({ length: 20 }, (_, k) => k + 1)
  const fact = ns.map((m): Vec2 => [m, Math.log10(factorial(m))])
  const cube = ns.map((m): Vec2 => [m, Math.log10(m ** 3)])
  return (
    <>
      <Grid step={5} />
      <Axes step={5} formatY={powerOfTen} />
      <Path points={fact} color={SUB_COLOR} width={2.5} />
      <Path points={cube} color={ADD_COLOR} width={2.5} />
      <MathLabel at={fact[16]!} tex="n!" color={SUB_COLOR} anchor="nw" offset={10} />
      <MathLabel at={cube[19]!} tex="n^3" color={ADD_COLOR} anchor="n" offset={10} />
      <Segment
        from={[n, 0]}
        to={[n, Math.log10(factorial(n))]}
        color={vc.muted}
        width={1}
        dash="3 4"
      />
      <Point at={fact[n - 1]!} color={SUB_COLOR} r={4} coords={false} />
      <Point at={cube[n - 1]!} color={ADD_COLOR} r={4} coords={false} />
    </>
  )
}

/** The plot, the fan of triangles from the origin and their signed areas. */
function PolygonScene({
  plot,
  terms,
  s,
  onMove,
}: {
  plot: Vec2[]
  terms: number[]
  s: number
  onMove: (k: number, p: Vec2) => void
}) {
  return (
    <>
      <Axes />
      <Path points={plot} closed color={vc.fg} width={2} />
      {plot.map((p, k) => {
        const q = plot[(k + 1) % plot.length]!
        const v = terms[k]!
        const neg = v < 0
        const o = clamp01(s - k)
        const mid = scale(add(p, q), 1 / 3)
        return (
          <g key={k} style={{ opacity: o }}>
            <Path
              points={[[0, 0], p, q]}
              closed
              color={neg ? SUB_COLOR : AREA_COLOR}
              width={1.2}
              dash={neg ? '5 4' : undefined}
              fill={neg ? SUB_COLOR : AREA_COLOR}
              fillOpacity={0.14}
            />
            <MathLabel
              at={mid}
              tex={neg ? `-${fmt(-v)}` : `+${fmt(v)}`}
              color={neg ? SUB_COLOR : AREA_COLOR}
              anchor="center"
              size={12}
            />
          </g>
        )
      })}
      {plot.map((p, k) => (
        <g key={`p${k}`}>
          <Point
            at={p}
            color={vc.fg}
            r={4}
            onDrag={(q) => onMove(k, q)}
            label={`Corner ${k + 1}`}
          />
          <MathLabel at={p} tex={`\\mathbf{p}_{${k + 1}}`} anchor="ne" offset={6} size={13} />
        </g>
      ))}
    </>
  )
}
