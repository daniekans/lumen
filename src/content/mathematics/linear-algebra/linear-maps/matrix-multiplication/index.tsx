import { useState } from 'react'
import { apply, fmtPoint, matMul, rotation, toRows, type MatN, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Arc,
  Axes,
  cellCenter,
  Grid,
  MathLabel,
  MatrixCells,
  Overlay,
  Path,
  Point,
  SqlLabel,
  Stage,
  TextLabel,
  useSequence,
  useStepEffect,
  useVizStep,
  Vector,
  VizControls,
  type MatrixBand,
} from '@/viz-kit'

const COL_COLORS = [vc.green, vc.red, vc.purple, vc.orange]
const ROW_COLOR = vc.blue
const OUT_COLOR = vc.teal

type Scene = 'falk' | 'chain' | 'plane'

const sceneOf: Record<string, Scene> = {
  columns: 'falk',
  entries: 'falk',
  shapes: 'falk',
  associativity: 'chain',
  powers: 'plane',
  transpose: 'falk',
  join: 'falk',
  layers: 'falk',
}

const A: MatN = [
  [1, 2, 0],
  [-1, 1, 3],
]
const B: MatN = [
  [2, 1],
  [0, -1],
  [1, 3],
]

/** Quantities sold: stores by products (apples, cheese, rice). Zeros are not stored. */
const Q: MatN = [
  [10, 0, 3],
  [0, 2, 5],
]
/** Price in dollars and weight in kg per unit: products by measures. */
const P: MatN = [
  [0.5, 0.2],
  [4, 0.25],
  [2, 1],
]
const STORES = ['store 1', 'store 2']
const PRODUCTS = ['apples', 'cheese', 'rice']
const MEASURES = ['price', 'kg']

const W2: MatN = [
  [0.5, -1, 0.25],
  [1, 0.5, -0.5],
]
const W1: MatN = [
  [1, 0.5],
  [-0.5, 1],
  [2, 0],
]

/** Entries for the shapes step, cut to the chosen sizes. */
const POOL_A: MatN = [
  [1, 2, 0, -1],
  [-1, 1, 3, 2],
  [0, 2, 1, 1],
  [3, -2, 1, 0],
]
const POOL_B: MatN = [
  [2, 1, 0, 1],
  [0, -1, 2, 1],
  [1, 3, -1, 0],
  [1, 0, 1, 2],
]
const cut = (a: MatN, m: number, n: number): MatN => a.slice(0, m).map((r) => r.slice(0, n))

const GAP = 0.5

const R45 = Math.PI / 4
const V: Vec2 = [2, 0.8]

/** The fold across the diagonal through the corner of AB: (x, y) to (-y, -x), part of the way. */
const fold =
  (t: number) =>
  ([x, y]: Vec2): Vec2 => [x + t * (-y - x), y + t * (-x - y)]

type Grouping = 'left' | 'right'

/** Boxes of the chain A B C x, right to left as the maps act. */
const CHAIN_X = { out: -5.6, A: -3.2, B: -0.8, C: 1.6, x: 4 }
const BOX = 0.65

export default function MatrixMultiplication() {
  const { id } = useVizStep()
  const scene = (id && sceneOf[id]) || 'falk'
  /** How far the product is filled in: columns done, or entries done (row by row). */
  const [k, setK] = useState(99)
  const [sizes, setSizes] = useState({ m: 2, n: 3, p: 2 })
  const [t, setT] = useState(0)
  const [grouping, setGrouping] = useState<Grouping>('left')
  const [travel, setTravel] = useState(3)
  const [power, setPower] = useState(1)
  const seq = useSequence()

  const byColumns = id === 'columns' || id === 'layers'
  const byEntries = id === 'entries' || id === 'join'

  const [left, top] =
    id === 'join'
      ? [Q, P]
      : id === 'layers'
        ? [W2, W1]
        : id === 'shapes'
          ? [cut(POOL_A, sizes.m, sizes.n), cut(POOL_B, sizes.n, sizes.p)]
          : [A, B]
  const m = left.length
  const n = top.length
  const p = top[0]!.length
  const C = matMul(left, top)
  const total = byColumns ? p : m * p

  /** Fills the product in, one column or one entry at a time. */
  const fill = (count: number) => {
    setK(-1)
    void seq.run(async ({ wait }) => {
      await wait(0.5)
      for (let e = 0; e < count; e++) {
        setK(e)
        await wait(1.4)
      }
      setK(99)
    })
  }

  const playFold = (to: number) => {
    const from = to ? 0 : 1
    setT(from)
    void seq.run(async ({ tween, wait }) => {
      await wait(0.4)
      await tween(from, to, { duration: 1.8, onUpdate: setT })
    })
  }

  const playChain = () => {
    setTravel(0)
    void seq.run(async ({ tween, wait }) => {
      await wait(0.4)
      await tween(0, 3, { duration: 3, onUpdate: setTravel })
    })
  }

  const playPowers = () => {
    setPower(0)
    void seq.run(async ({ tween, wait }) => {
      await wait(0.4)
      await tween(0, 8, { duration: 4, onUpdate: setPower })
      setPower(8)
    })
  }

  useStepEffect({
    columns: () => {
      setT(0)
      fill(2)
    },
    entries: () => {
      setT(0)
      fill(4)
    },
    shapes: () => {
      setT(0)
      setK(99)
      setSizes({ m: 2, n: 3, p: 2 })
    },
    associativity: () => {
      setGrouping('left')
      playChain()
    },
    powers: playPowers,
    transpose: () => {
      setK(99)
      playFold(1)
    },
    join: () => {
      setT(0)
      fill(4)
    },
    layers: () => {
      setT(0)
      fill(2)
    },
  })

  const settle = () => seq.cancel()

  // The product: an entry is shown once its column or its turn has come.
  const at = (i: number, j: number) => (byColumns ? j : i * p + j)
  const shown = (i: number, j: number) => k >= 99 || at(i, j) <= k
  const current = k >= 0 && k < 99 ? k : null
  const ci = current === null ? null : byColumns ? null : Math.floor(current / p)
  const cj = current === null ? null : byColumns ? current : current % p

  const rowBands: MatrixBand[] = ci === null ? [] : [{ index: ci, color: ROW_COLOR }]
  const colBands: MatrixBand[] =
    cj === null ? [] : [{ index: cj, color: COL_COLORS[cj % COL_COLORS.length]! }]
  const colorOfProduct = (_i: number, j: number) =>
    byColumns || id === 'columns' ? COL_COLORS[j % COL_COLORS.length] : undefined

  const isZero = (a: MatN, i: number, j: number) => id === 'join' && a[i]![j] === 0
  const show = (a: MatN) => a.map((r) => r.map((v) => v as number | string | null))
  const sparse = (a: MatN) => a.map((r) => r.map((v) => (v === 0 ? '·' : v)))

  const place = fold(t)
  const cOrigin: Vec2 = [0, 0]
  const aOrigin: Vec2 = [-(n + GAP), 0]
  const bOrigin: Vec2 = [0, n + GAP]
  const folded = t > 0.5

  const names =
    id === 'join'
      ? { a: 'Q', b: 'P', c: 'QP' }
      : id === 'layers'
        ? { a: 'W_2', b: 'W_1', c: 'W_2W_1' }
        : folded
          ? { a: 'A^T', b: 'B^T', c: '(AB)^T' }
          : { a: 'A', b: 'B', c: 'AB' }

  const entryTex = () => {
    if (ci === null || cj === null) return null
    const terms = left[ci]!.map(
      (v, s) =>
        `${v < 0 ? `(${v})` : v} \\cdot ${top[s]![cj]! < 0 ? `(${top[s]![cj]})` : top[s]![cj]}`,
    )
    return `c_{${ci + 1}${cj + 1}} = ${terms.join(' + ')} = ${C[ci]![cj]}`
  }

  const domain =
    scene === 'chain'
      ? { x: [-7.4, 5] as [number, number], y: [-3, 3] as [number, number] }
      : scene === 'plane'
        ? { x: [-3.5, 3.5] as [number, number], y: [-3, 3] as [number, number] }
        : id === 'shapes'
          ? { x: [-5.8, 5] as [number, number], y: [-5.2, 5.2] as [number, number] }
          : id === 'join'
            ? { x: [-6.8, 5.2] as [number, number], y: [-6.2, 5] as [number, number] }
            : { x: [-5, 4.4] as [number, number], y: [-4.2, 4.6] as [number, number] }

  const falk = () => (
    <>
      <MatrixCells
        values={id === 'join' ? sparse(left) : show(left)}
        origin={aOrigin}
        place={place}
        bracketOpacity={Math.abs(1 - 2 * t)}
        rowBands={rowBands}
        color={(i, j) => (isZero(left, i, j) ? vc.muted : undefined)}
      />
      <MatrixCells
        values={id === 'join' ? sparse(top) : show(top)}
        origin={bOrigin}
        place={place}
        bracketOpacity={Math.abs(1 - 2 * t)}
        colBands={colBands}
        color={(i, j) => (isZero(top, i, j) ? vc.muted : undefined)}
      />
      <MatrixCells
        values={show(C)}
        origin={cOrigin}
        place={place}
        bracketOpacity={Math.abs(1 - 2 * t)}
        colBands={byColumns ? colBands : []}
        cellBands={ci !== null && cj !== null ? [{ index: ci, col: cj, color: OUT_COLOR }] : []}
        color={colorOfProduct}
        opacity={(i, j) => (shown(i, j) ? 1 : 0)}
      />
      <MathLabel at={place([aOrigin[0] + n / 2, -m - 0.55])} tex={names.a} anchor="center" />
      <MathLabel at={place([p + 0.4, bOrigin[1] - n / 2])} tex={names.b} anchor="e" />
      <MathLabel at={place([p + 0.4, -m / 2])} tex={names.c} anchor="e" color={OUT_COLOR} />
      {id === 'shapes' && (
        <>
          <MathLabel
            at={[aOrigin[0] + n / 2, -m - 1.3]}
            tex={`${m} \\times ${n}`}
            anchor="center"
            color={vc.muted}
          />
          <MathLabel
            at={[p + 0.4, bOrigin[1] - n / 2 - 0.75]}
            tex={`${n} \\times ${p}`}
            anchor="e"
            color={vc.muted}
          />
          <MathLabel
            at={[p + 0.4, -m / 2 - 0.75]}
            tex={`${m} \\times ${p}`}
            anchor="e"
            color={vc.muted}
          />
        </>
      )}
      {id === 'entries' && entryTex() && (
        <MathLabel at={[-0.5, -m - 1.5]} tex={entryTex()!} anchor="center" color={OUT_COLOR} />
      )}
      {id === 'join' && (
        <>
          {STORES.map((s, i) => (
            <TextLabel key={s} at={[aOrigin[0] - 0.2, -(i + 0.5)]} align="end" size={12}>
              {s}
            </TextLabel>
          ))}
          {PRODUCTS.map((s, j) => (
            <TextLabel key={s} at={cellCenter(aOrigin, 1, -0.75, j)} size={12}>
              {s}
            </TextLabel>
          ))}
          {PRODUCTS.map((s, i) => (
            <TextLabel key={`p-${s}`} at={[-0.2, bOrigin[1] - i - 0.5]} align="end" size={12}>
              {s}
            </TextLabel>
          ))}
          {MEASURES.map((s, j) => (
            <TextLabel key={s} at={cellCenter(bOrigin, 1, -0.75, j)} size={12}>
              {s}
            </TextLabel>
          ))}
          <SqlLabel at={[-6.4, -3.3]} align="start" size={12}>
            {'SELECT q.store, p.measure, SUM(q.qty * p.value)'}
          </SqlLabel>
          <SqlLabel at={[-6.4, -4]} align="start" size={12}>
            {'FROM q JOIN p ON q.product = p.product'}
          </SqlLabel>
          <SqlLabel at={[-6.4, -4.7]} align="start" size={12}>
            {'GROUP BY q.store, p.measure'}
          </SqlLabel>
        </>
      )}
    </>
  )

  const chain = () => {
    const boxes = (['A', 'B', 'C'] as const).map((name) => ({ name, x: CHAIN_X[name] }))
    const group = grouping === 'left' ? ['A', 'B'] : ['B', 'C']
    const g0 = CHAIN_X[group[0] as 'A' | 'B'] - BOX - 0.25
    const g1 = CHAIN_X[group[1] as 'B' | 'C'] + BOX + 0.25
    // The dot travels from x to the output; s counts the maps it has passed.
    const stops = [CHAIN_X.x, (CHAIN_X.C + CHAIN_X.B) / 2, (CHAIN_X.B + CHAIN_X.A) / 2, CHAIN_X.out]
    const s = Math.min(travel, 2.999)
    const seg = Math.floor(s)
    const dotX = stops[seg]! + (stops[seg + 1]! - stops[seg]!) * (s - seg)
    const gaps = [
      { x: stops[1]!, tex: 'C\\mathbf{x}', inside: grouping === 'right' },
      { x: stops[2]!, tex: 'BC\\mathbf{x}', inside: grouping === 'left' },
    ]
    return (
      <>
        <Path
          points={[
            [g0, -1.2],
            [g1, -1.2],
            [g1, 1.2],
            [g0, 1.2],
          ]}
          closed
          color={OUT_COLOR}
          width={1.5}
          fill={OUT_COLOR}
          fillOpacity={0.08}
        />
        <MathLabel
          at={[(g0 + g1) / 2, -1.65]}
          tex={grouping === 'left' ? 'AB' : 'BC'}
          anchor="center"
          color={OUT_COLOR}
        />
        {boxes.map((b) => (
          <g key={b.name}>
            <Path
              points={[
                [b.x - BOX, -BOX],
                [b.x + BOX, -BOX],
                [b.x + BOX, BOX],
                [b.x - BOX, BOX],
              ]}
              closed
              color={vc.fg}
              width={1.5}
            />
            <MathLabel at={[b.x, 0]} tex={b.name} anchor="center" />
          </g>
        ))}
        {[CHAIN_X.x, CHAIN_X.C, CHAIN_X.B, CHAIN_X.A].map((x0, idx) => (
          <Vector
            key={idx}
            from={[x0 - (idx === 0 ? 0.2 : BOX), 0]}
            to={[[CHAIN_X.C, CHAIN_X.B, CHAIN_X.A, CHAIN_X.out][idx]! + (idx === 3 ? 0.2 : BOX), 0]}
            color={vc.muted}
            width={1.5}
          />
        ))}
        <MathLabel at={[CHAIN_X.x + 0.3, 0]} tex="\mathbf{x}" anchor="e" color={vc.blue} />
        <MathLabel
          at={[CHAIN_X.out - 0.3, 0]}
          tex="ABC\mathbf{x}"
          anchor="w"
          color={OUT_COLOR}
          opacity={travel >= 3 ? 1 : 0.35}
        />
        {gaps.map(
          (gp) =>
            !gp.inside && (
              <MathLabel
                key={gp.tex}
                at={[gp.x, 0.55]}
                tex={gp.tex}
                anchor="s"
                color={vc.yellow}
                opacity={travel >= (gp.tex === 'C\\mathbf{x}' ? 1 : 2) ? 1 : 0.35}
              />
            ),
        )}
        <Point at={[dotX, 0]} color={travel >= 3 ? OUT_COLOR : vc.blue} r={5} coords={false} />
      </>
    )
  }

  const plane = () => {
    const whole = Math.round(power)
    const orbit = Array.from({ length: Math.floor(power) + 1 }, (_, j) =>
      apply(rotation(R45 * j), V),
    )
    const now = apply(rotation(R45 * power), V)
    return (
      <>
        <Grid />
        <Axes />
        <Arc r={Math.hypot(...V)} from={0} to={2 * Math.PI} color={vc.muted} width={1} dash="3 5" />
        {orbit.map((q, j) => (
          <Point key={j} at={q} color={vc.muted} r={3} coords={false} />
        ))}
        <Vector to={V} color={vc.blue} width={2} />
        <MathLabel at={V} tex="\mathbf{v}" anchor="se" color={vc.blue} />
        <Vector to={now} color={OUT_COLOR} />
        <MathLabel at={now} tex={`R^{${whole}}\\mathbf{v}`} anchor="ne" color={OUT_COLOR} />
      </>
    )
  }

  const panel = () => {
    if (scene === 'plane') {
      const whole = Math.round(power)
      return (
        <ReadoutPanel title="Powers">
          <MatrixView
            rows={toRows(rotation(R45 * power))}
            name={`R^{${whole}} =`}
            label="R to the k"
          />
          <Readout label="Angle" value={`${Math.round(45 * power)}°`} />
          <Readout
            label="$R^k\mathbf{v}$"
            value={fmtPoint(apply(rotation(R45 * power), V))}
            color={OUT_COLOR}
          />
        </ReadoutPanel>
      )
    }
    return null
  }

  return (
    <>
      <Stage
        domain={domain}
        ariaLabel="Two matrices and their product, laid out so rows and columns meet at the entries"
        overlay={panel() && <Overlay corner="top-left">{panel()}</Overlay>}
      >
        {scene === 'falk' && falk()}
        {scene === 'chain' && chain()}
        {scene === 'plane' && plane()}
      </Stage>

      <VizControls>
        {(byColumns || byEntries) && (
          <LabeledSlider
            label={byColumns ? 'Column' : 'Entry'}
            value={current === null ? total : current + 1}
            onChange={(v) => {
              settle()
              setK(v >= total ? 99 : v - 1)
            }}
            min={1}
            max={total}
            step={1}
            format={(v) => (v >= total && k >= 99 ? 'all' : String(v))}
          />
        )}
        {id === 'shapes' && (
          <>
            {(['m', 'n', 'p'] as const).map((key) => (
              <LabeledSlider
                key={key}
                label={`$${key}$`}
                value={sizes[key]}
                onChange={(v) => setSizes((s) => ({ ...s, [key]: v }))}
                min={1}
                max={4}
                step={1}
                format={(v) => String(v)}
              />
            ))}
          </>
        )}
        {id === 'associativity' && (
          <SegmentedControl
            label="Grouping"
            value={grouping}
            onChange={(g) => {
              setGrouping(g as Grouping)
              playChain()
            }}
            options={[
              { value: 'left', label: '$(AB)C$' },
              { value: 'right', label: '$A(BC)$' },
            ]}
          />
        )}
        {id === 'powers' && (
          <LabeledSlider
            label="$k$"
            value={power}
            onChange={(v) => {
              settle()
              setPower(v)
            }}
            min={0}
            max={8}
            step={1}
            format={(v) => String(Math.round(v))}
          />
        )}
        {id === 'transpose' && (
          <SegmentedControl
            label="Layout"
            value={folded ? 'folded' : 'plain'}
            onChange={(v) => playFold(v === 'folded' ? 1 : 0)}
            options={[
              { value: 'plain', label: '$AB$' },
              { value: 'folded', label: '$(AB)^T$' },
            ]}
          />
        )}
      </VizControls>
    </>
  )
}
