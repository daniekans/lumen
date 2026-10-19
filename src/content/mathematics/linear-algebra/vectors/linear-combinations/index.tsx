import { useState } from 'react'
import { add, det, fmtPoint, fmtShort, lerpVec, scale, type Mat2, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  Grid,
  MathLabel,
  numbersCodec,
  Overlay,
  Point,
  Pulse,
  Segment,
  Stage,
  TransformedGrid,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  Vector,
  VizControls,
} from '@/viz-kit'

const V_COLOR = vc.blue
const W_COLOR = vc.yellow
const SUM_COLOR = vc.teal

const V: Vec2 = [2, 1]
const W: Vec2 = [-1, 2]
/** w after the parallel step: -v / 2. */
const W_PARALLEL: Vec2 = [-1, -0.5]
const U: Vec2 = [3, 4]

const weightsCodec = numbersCodec(['a', 'b'])

const comps = (p: Vec2) => fmtPoint(p)

/** Rounds a weight dragged into place to a tenth, so readouts stay short. */
const tenth = (x: number) => Math.round(x * 10) / 10

export default function LinearCombinations() {
  const { id } = useVizStep()
  const [weights, setWeights] = useVizParam('ab', { a: 1, b: 1 }, weightsCodec)
  // 0 while w is (-1, 2), 1 once it has turned parallel to v.
  const [par, setPar] = useState(() => (id === 'parallel' ? 1 : 0))
  const seq = useSequence()
  const { a, b } = weights

  const w = lerpVec(W, W_PARALLEL, par)
  const m: Mat2 = { i: V, j: w }
  const av = scale(V, a)
  const tip = add(av, scale(w, b))
  const parallel = Math.abs(det(m)) < 1e-6

  const tweenWeights = (to: { a: number; b: number }, duration = 1.4) => {
    const from = weights
    return seq.run(({ tween }) =>
      tween(0, 1, {
        duration,
        onUpdate: (t) =>
          setWeights({ a: from.a + (to.a - from.a) * t, b: from.b + (to.b - from.b) * t }),
      }),
    )
  }
  const unpar = () => {
    const from = par
    return seq.run(({ tween }) => tween(from, 0, { duration: 0.8, onUpdate: setPar }))
  }

  useStepEffect({
    weights: () =>
      void seq.run(async ({ tween, wait }) => {
        setPar(0)
        await tween(0, 1, {
          duration: 1.6,
          onUpdate: (t) => setWeights({ a: 1 + 0.5 * t, b: 1 - 1.5 * t }),
        })
        await wait(0.3)
      }),
    target: () => {
      setPar(0)
      void tweenWeights({ a: 2, b: 1 })
    },
    grid: () => {
      if (par > 0) void unpar()
      else void tweenWeights({ a: -1, b: 1.5 })
    },
    parallel: () =>
      void seq.run(async ({ tween, wait }) => {
        setWeights({ a: 2, b: 1 })
        await tween(0, 1, { duration: 1.8, onUpdate: setPar })
        await wait(0.3)
        await tween(0, 1, {
          duration: 1.6,
          onUpdate: (t) => setWeights({ a: 2 - 3 * t, b: 1 + t }),
        })
      }),
  })

  /** Solves a v + b w = p for the weights (Cramer's rule). */
  const dragTip = (p: Vec2) => {
    seq.cancel()
    const d = det(m)
    setWeights({
      a: tenth((p[0] * w[1] - w[0] * p[1]) / d),
      b: tenth((V[0] * p[1] - p[0] * V[1]) / d),
    })
  }

  const setWeight = (key: 'a' | 'b') => (x: number) => {
    seq.cancel()
    setWeights({ ...weights, [key]: x })
  }

  const onTarget = Math.hypot(tip[0] - U[0], tip[1] - U[1]) < 1e-6
  const showGrid = id === 'grid' || id === 'parallel'

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-5, 6], y: [-3, 5.5] }}
        ariaLabel="A linear combination of two vectors in the plane"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Combination">
              <Readout label="$\mathbf{v}$" value={comps(V)} color={V_COLOR} />
              <Readout label="$\mathbf{w}$" value={comps(w)} color={W_COLOR} />
              <Readout label="$a$" value={fmtShort(a, 2)} color={V_COLOR} />
              <Readout label="$b$" value={fmtShort(b, 2)} color={W_COLOR} />
              <Readout
                label="$a\mathbf{v} + b\mathbf{w}$"
                value={comps(tip)}
                color={SUM_COLOR}
                hint="Each component is $a$ times the component of $\mathbf{v}$ plus $b$ times the component of $\mathbf{w}$."
              />
              {(id === 'target' || id === 'parallel') && (
                <Readout
                  label="$\mathbf{u}$"
                  value={onTarget ? `${comps(U)}, reached` : comps(U)}
                  hint={
                    parallel
                      ? 'No weights reach $\\mathbf{u}$: it is off the line through $\\mathbf{v}$.'
                      : 'Solve $2a - b = 3$ and $a + 2b = 4$ for the weights.'
                  }
                />
              )}
              {id === 'parallel' && (
                <Readout
                  label="reachable"
                  value={parallel ? 'a line' : 'the whole plane'}
                  hint="The combinations of two parallel vectors are the multiples of one of them."
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <Axes />
        {showGrid && <TransformedGrid m={m} color={SUM_COLOR} opacity={0.3} axisOpacity={0.6} />}
        {id === 'parallel' && parallel && (
          <Segment from={[0, 0]} to={V} extend color={SUM_COLOR} width={2} opacity={0.5} />
        )}

        {(id === 'target' || id === 'parallel') && (
          <>
            <Point at={U} color={vc.fg} hollow r={6} coords={false} />
            <MathLabel at={U} tex="\mathbf{u}" anchor="ne" offset={10} />
            <Pulse at={U} when={onTarget} color={SUM_COLOR} />
          </>
        )}

        <Vector to={av} color={V_COLOR} width={2} opacity={0.6} />
        <Vector from={av} to={tip} color={W_COLOR} width={2} opacity={0.6} />
        <Vector to={tip} color={SUM_COLOR} />

        <Vector to={V} color={V_COLOR} />
        <Vector to={w} color={W_COLOR} />
        <MathLabel at={V} tex="\mathbf{v}" color={V_COLOR} anchor="se" offset={8} />
        <MathLabel
          at={w}
          tex="\mathbf{w}"
          color={W_COLOR}
          anchor={par > 0.5 ? 'sw' : 'nw'}
          offset={8}
        />
        <Point
          at={tip}
          color={SUM_COLOR}
          onDrag={parallel ? undefined : dragTip}
          label="Tip of the combination"
        />
        <MathLabel
          at={tip}
          tex="a\mathbf{v} + b\mathbf{w}"
          color={SUM_COLOR}
          anchor="e"
          offset={14}
        />
      </Stage>

      <VizControls>
        <LabeledSlider
          label="$a$"
          value={a}
          onChange={setWeight('a')}
          min={-3}
          max={3}
          step={0.1}
          format={(x) => fmtShort(x, 2)}
          color={V_COLOR}
        />
        <LabeledSlider
          label="$b$"
          value={b}
          onChange={setWeight('b')}
          min={-3}
          max={3}
          step={0.1}
          format={(x) => fmtShort(x, 2)}
          color={W_COLOR}
        />
      </VizControls>
    </>
  )
}
