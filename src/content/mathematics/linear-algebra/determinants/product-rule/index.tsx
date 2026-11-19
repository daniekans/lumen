import { useState } from 'react'
import {
  add,
  apply,
  det,
  fmtShort,
  identity,
  lerpMat,
  mat2,
  multiply,
  scale,
  toRows,
  type Mat2,
  type Vec2,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Grid,
  LetterF,
  MathLabel,
  Overlay,
  Parallelogram,
  Point,
  Pulse,
  Segment,
  Stage,
  TransformedGrid,
  TurnArc,
  useSequence,
  useStepEffect,
  useStepStart,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const C1_COLOR = vc.green
const C2_COLOR = vc.red
const AREA_COLOR = vc.yellow
const BASIS_COLOR = vc.blue
const IMAGE_COLOR = vc.teal

const fmt = (v: number) => fmtShort(v, 2)

const A_TWICE = mat2(2, 0.5, 0, 1)
const B_TWICE = mat2(1, 0, 0.5, 1.5)
const R_DIAG = mat2(0, 1, 1, 0)
const R_X = mat2(1, 0, 0, -1)
const A_POW = mat2(1.25, 0.25, 0, 1.2)
const A_SCALAR = mat2(1, 0.5, 0, 1)
const A_BASIS = mat2(1.5, 0.5, 0.5, 1)
const A_EIGEN = mat2(2, 1, 1, 2)
const B1: Vec2 = [-1, -1]
const B2: Vec2 = [1, -1]

const power = (m: Mat2, k: number) => {
  let out = identity
  for (let i = 0; i < k; i++) out = multiply(m, out)
  return out
}

/** The inverse-step matrix: the second column (k, 1.5), so det A = 3 - k. */
const aInverse = (k: number) => mat2(2, k, 1, 1.5)
const inv = (m: Mat2): Mat2 => {
  const d = det(m)
  return { i: [m.j[1] / d, -m.i[1] / d], j: [-m.j[0] / d, m.i[0] / d] }
}

/** A path through matrices: t from 0 to n goes from stops[0] to stops[n] in straight lines. */
const along = (stops: readonly Mat2[], t: number) => {
  const k = Math.min(stops.length - 2, Math.max(0, Math.floor(t)))
  return lerpMat(stops[k]!, stops[k + 1]!, Math.min(1, Math.max(0, t - k)))
}

const snapHalf = (p: Vec2): Vec2 => {
  const s = (v: number) => {
    const r = Math.round(v * 2) / 2
    return Math.abs(r - v) < 0.12 ? r : v
  }
  return [s(p[0]), s(p[1])]
}

export default function ProductRule() {
  const id = useVizStep().id ?? 'twice'
  const seq = useSequence()
  /** Progress along the step's path of matrices. */
  const [t, setT] = useState(0)
  const [k, setK] = useState(1)
  const [c, setC] = useState(2)
  const [lambda, setLambda] = useState(0)
  const [b1, setB1] = useState<Vec2>(B1)
  const [b2, setB2] = useState<Vec2>(B2)
  const start = useStepStart(lambda)

  const path = (to: number, from = 0) => {
    setT(from)
    void seq.run(async ({ tween, wait }) => {
      for (let s = from; s < to; s++) {
        await wait(0.7)
        await tween(s, s + 1, { duration: 1.5, onUpdate: setT })
      }
    })
  }

  useStepEffect({
    twice: () => path(2),
    flips: () => path(2),
    powers: () => path(4),
    inverse: () => {
      setK(1)
      path(2)
    },
    scalar: () => {
      setC(1)
      void seq.run(async ({ tween, wait }) => {
        await wait(0.6)
        await tween(1, 2, { duration: 1.4, onUpdate: setC })
        await wait(0.6)
        await tween(2, 3, { duration: 1.4, onUpdate: setC })
      })
    },
    basis: () => {
      seq.cancel()
      setB1(B1)
      setB2(B2)
    },
    eigen: (run) => {
      const from = run.replay ? 0 : start(run)
      setLambda(from)
      void seq.run(async ({ tween, wait }) => {
        await wait(0.6)
        await tween(from, 1, { duration: 1.4, onUpdate: setLambda })
        await wait(0.9)
        await tween(1, 3, { duration: 2, onUpdate: setLambda })
      })
    },
  })

  const settle =
    <T,>(set: (x: T) => void) =>
    (x: T) => {
      seq.cancel()
      set(x)
    }

  // The map shown on the stage at this moment, and what the readouts say about it.
  let m: Mat2 = identity
  let ghost: Mat2 | null = null
  switch (id) {
    case 'twice':
      m = along([identity, A_TWICE, multiply(B_TWICE, A_TWICE)], t)
      if (t > 1) ghost = A_TWICE
      break
    case 'flips':
      m = along([identity, R_DIAG, multiply(R_X, R_DIAG)], t)
      if (t > 1) ghost = R_DIAG
      break
    case 'powers': {
      const stops = [0, 1, 2, 3, 4].map((p) => power(A_POW, p))
      m = along(stops, t)
      break
    }
    case 'inverse': {
      const a = aInverse(k)
      m = Math.abs(det(a)) < 1e-9 ? a : along([identity, a, identity], t)
      if (t > 1 && Math.abs(det(a)) > 1e-9) ghost = a
      break
    }
    case 'scalar':
      m = { i: scale(A_SCALAR.i, c), j: scale(A_SCALAR.j, c) }
      break
    case 'basis':
      m = identity
      break
    case 'eigen':
      m = { i: add(A_EIGEN.i, [-lambda, 0]), j: add(A_EIGEN.j, [0, -lambda]) }
      break
  }
  const d = det(m)
  const flat = Math.abs(d) < 0.02

  const readouts = () => {
    switch (id) {
      case 'twice':
        return (
          <>
            <Readout label="$\det A$" value={fmt(det(A_TWICE))} />
            <Readout label="$\det B$" value={fmt(det(B_TWICE))} />
            <Readout label="$\det(BA)$" value={fmt(det(multiply(B_TWICE, A_TWICE)))} />
          </>
        )
      case 'flips':
        return (
          <>
            <Readout label="First reflection" value="$-1$" hint="Across the line y = x." />
            <Readout label="Second reflection" value="$-1$" hint="Across the x-axis." />
            <Readout label="Both" value="$1$" />
          </>
        )
      case 'powers': {
        const p = Math.round(t)
        return (
          <>
            <Readout label="$k$" value={String(p)} />
            <Readout label="$(\det A)^k$" value={fmt(1.5 ** p)} />
          </>
        )
      }
      case 'inverse': {
        const a = aInverse(k)
        const da = det(a)
        return (
          <>
            <MatrixView rows={toRows(a)} name="A =" colors={[C1_COLOR, C2_COLOR]} label="The map" />
            <Readout label="$\det A$" value={fmt(da)} />
            <Readout
              label="$\det A^{-1}$"
              value={Math.abs(da) < 1e-9 ? 'none' : fmt(1 / da)}
              hint="The determinant of the map that undoes A, when one exists."
            />
          </>
        )
      }
      case 'scalar':
        return (
          <>
            <Readout label="$c$" value={fmt(c)} />
            <Readout label="$\det A$" value={fmt(det(A_SCALAR))} />
            <Readout label="$c^2 \det A$" value={fmt(c * c * det(A_SCALAR))} />
          </>
        )
      case 'basis': {
        const cell = det({ i: b1, j: b2 })
        const image = det({ i: apply(A_BASIS, b1), j: apply(A_BASIS, b2) })
        const P: Mat2 = { i: b1, j: b2 }
        const inBasis = Math.abs(cell) < 1e-9 ? null : multiply(inv(P), multiply(A_BASIS, P))
        return (
          <>
            <MatrixView rows={toRows(A_BASIS)} name="A =" label="The map in the standard basis" />
            {inBasis && (
              <MatrixView
                rows={toRows(inBasis).map((r) => r.map((v) => Number(v.toFixed(2)) + 0))}
                name="P^{-1}AP ="
                label="The same map in the blue basis"
              />
            )}
            <Readout label="Blue cell" value={fmt(cell)} color={BASIS_COLOR} />
            <Readout label="Teal cell" value={fmt(image)} color={IMAGE_COLOR} />
            <Readout
              label="Ratio"
              value={inBasis ? fmt(image / cell) : 'none'}
              hint="The teal area over the blue one: det A for every basis."
            />
          </>
        )
      }
      case 'eigen':
        return (
          <>
            <Readout label="$\lambda$" value={fmt(lambda)} />
            <MatrixView
              rows={toRows(m).map((r) => r.map((v) => Number(v.toFixed(2)) + 0))}
              name="A - \lambda I ="
              colors={[C1_COLOR, C2_COLOR]}
              label="A minus lambda times the identity"
            />
          </>
        )
      default:
        return null
    }
  }

  const showMap = id !== 'basis'
  const detLabel =
    id === 'eigen' ? '$\\det(A - \\lambda I)$' : id === 'basis' ? '$\\det A$' : 'Area factor now'

  return (
    <>
      <Stage
        domain={{ x: [-4.5, 4.5], y: [-3.2, 3.2] }}
        ariaLabel="The image of the unit square under one map after another, whose area is the product of the determinants"
        zoomable
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Determinants">
              {readouts()}
              <Readout
                label={detLabel}
                value={fmt(id === 'basis' ? det(A_BASIS) : d)}
                color={AREA_COLOR}
                hint="The signed area of the image of the unit square."
              />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        {showMap && <TransformedGrid m={m} />}

        {ghost && (
          <Parallelogram
            u={ghost.i}
            v={ghost.j}
            color={vc.fg}
            fillOpacity={0}
            dash="4 5"
            opacity={0.5}
          />
        )}
        {id === 'scalar' && <ScaledCopies c={c} />}

        {showMap && (
          <>
            <Parallelogram u={m.i} v={m.j} />
            {!flat && <LetterF m={m} origin={[0.2, 0.15]} size={0.7} width={3} opacity={0.85} />}
            <TurnArc from={m.i} to={m.j} r={0.5} />
            <Vector to={m.i} color={C1_COLOR} />
            <Vector to={m.j} color={C2_COLOR} />
          </>
        )}

        {(id === 'inverse' || id === 'eigen') && flat && (
          <>
            <Segment
              from={[0, 0]}
              to={Math.hypot(...m.i) > 0.05 ? m.i : m.j}
              extend
              color={AREA_COLOR}
              width={2}
              opacity={0.7}
            />
            <Pulse at={[0, 0]} when={flat} color={AREA_COLOR} />
            {id === 'eigen' && (
              <MathLabel
                at={[0, -0.4]}
                tex={`\\lambda = ${Math.round(lambda)}`}
                anchor="n"
                color={AREA_COLOR}
              />
            )}
          </>
        )}

        {id === 'basis' && (
          <BasisScene
            b1={b1}
            b2={b2}
            onB1={settle((p: Vec2) => setB1(snapHalf(p)))}
            onB2={settle((p: Vec2) => setB2(snapHalf(p)))}
          />
        )}
      </Stage>

      {(id === 'powers' || id === 'inverse' || id === 'scalar' || id === 'eigen') && (
        <VizControls>
          {id === 'powers' && (
            <LabeledSlider
              label="$k$"
              value={Math.round(t)}
              onChange={settle((v: number) => setT(Math.round(v)))}
              min={0}
              max={4}
              step={1}
              format={(v) => String(Math.round(v))}
            />
          )}
          {id === 'inverse' && (
            <LabeledSlider
              label="Second column, top entry"
              value={k}
              onChange={settle((v: number) => {
                setT(1)
                setK(Math.abs(v - 3) < 0.06 ? 3 : v)
              })}
              min={-1}
              max={4}
              step={0.05}
            />
          )}
          {id === 'scalar' && (
            <LabeledSlider
              label="$c$"
              value={c}
              onChange={settle(setC)}
              min={-3}
              max={3}
              step={0.05}
            />
          )}
          {id === 'eigen' && (
            <LabeledSlider
              label="$\lambda$"
              value={lambda}
              onChange={settle((v: number) => {
                const r = Math.round(v)
                setLambda((r === 1 || r === 3) && Math.abs(v - r) < 0.06 ? r : v)
              })}
              min={-1}
              max={4}
              step={0.05}
            />
          )}
        </VizControls>
      )}
    </>
  )
}

/** The c by c copies of A's parallelogram that fill the parallelogram of cA, for whole c. */
function ScaledCopies({ c }: { c: number }) {
  const n = Math.floor(Math.abs(c) + 1e-9)
  const sgn = c < 0 ? -1 : 1
  const u = scale(A_SCALAR.i, sgn)
  const v = scale(A_SCALAR.j, sgn)
  const lines = []
  for (let q = 1; q < Math.ceil(Math.abs(c) - 1e-9); q++) {
    lines.push(
      <Segment
        key={`a${q}`}
        from={scale(u, q)}
        to={add(scale(u, q), scale(v, Math.abs(c)))}
        color={AREA_COLOR}
        width={1}
        opacity={0.6}
      />,
      <Segment
        key={`b${q}`}
        from={scale(v, q)}
        to={add(scale(v, q), scale(u, Math.abs(c)))}
        color={AREA_COLOR}
        width={1}
        opacity={0.6}
      />,
    )
  }
  return (
    <>
      <Parallelogram
        u={A_SCALAR.i}
        v={A_SCALAR.j}
        color={vc.fg}
        fillOpacity={0}
        dash="4 5"
        opacity={0.6}
      />
      {lines}
      {n >= 1 && Math.abs(Math.abs(c) - n) < 0.02 && (
        <MathLabel
          at={scale(add(u, v), Math.abs(c) / 2)}
          tex={`${n}^2 = ${n * n}\\text{ copies}`}
          anchor="center"
          color={vc.fg}
          size={14}
        />
      )}
    </>
  )
}

/** A basis cell (blue) and its image under the map (teal). */
function BasisScene({
  b1,
  b2,
  onB1,
  onB2,
}: {
  b1: Vec2
  b2: Vec2
  onB1: (p: Vec2) => void
  onB2: (p: Vec2) => void
}) {
  const a1 = apply(A_BASIS, b1)
  const a2 = apply(A_BASIS, b2)
  return (
    <>
      <Parallelogram u={a1} v={a2} color={IMAGE_COLOR} fillOpacity={0.18} arc />
      <Vector to={a1} color={IMAGE_COLOR} />
      <Vector to={a2} color={IMAGE_COLOR} />
      <MathLabel at={a1} tex="A\mathbf{b}_1" color={IMAGE_COLOR} anchor="e" offset={8} />
      <MathLabel at={a2} tex="A\mathbf{b}_2" color={IMAGE_COLOR} anchor="n" offset={8} />
      <Parallelogram u={b1} v={b2} color={BASIS_COLOR} fillOpacity={0.22} dash="5 4" />
      <Vector to={b1} color={BASIS_COLOR} />
      <Vector to={b2} color={BASIS_COLOR} />
      <MathLabel at={b1} tex="\mathbf{b}_1" color={BASIS_COLOR} anchor="se" offset={8} />
      <MathLabel at={b2} tex="\mathbf{b}_2" color={BASIS_COLOR} anchor="w" offset={8} />
      <Point at={b1} color={BASIS_COLOR} r={3.5} onDrag={onB1} label="The basis vector b1" />
      <Point at={b2} color={BASIS_COLOR} r={3.5} onDrag={onB2} label="The basis vector b2" />
    </>
  )
}
