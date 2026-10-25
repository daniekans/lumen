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
  Path,
  Point,
  Pulse,
  Segment,
  Stage,
  TextLabel,
  TransformedGrid,
  useSequence,
  useStepEffect,
  useStepStart,
  type StepRun,
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
/** Grams of protein and carbs per serving, in units of 10 g. Food A is v itself. */
const FOOD_B: Vec2 = [0.5, 2]
/** 35 g protein and 35 g carbs: 1.5 servings of A and 1 of B. */
const MEAL: Vec2 = [3.5, 3.5]
/** Far enough along each food that the cone's outer edge stays off the stage. */
const CONE_REACH = 60

const weightsCodec = numbersCodec(['a', 'b'])

const comps = (p: Vec2) => fmtPoint(p)

/** Rounds a weight dragged into place to a tenth, so readouts stay short. */
const tenth = (x: number) => Math.round(x * 10) / 10

/** Grams for a value in units of 10 g, hiding the negative ticks of the meal step. */
const grams = (v: number) => (v < 0 ? null : `${fmtShort(v * 10, 1)}`)
const nutrients = (p: Vec2) => `${fmtShort(p[0] * 10, 1)} g, ${fmtShort(p[1] * 10, 1)} g`

export default function LinearCombinations() {
  const { id } = useVizStep()
  const [weights, setWeights] = useVizParam('ab', { a: 1, b: 1 }, weightsCodec)
  // 0 while w is (-1, 2), 1 once it has turned parallel to v.
  const [par, setPar] = useState(() => (id === 'parallel' ? 1 : 0))
  // 0 for the abstract w, 1 once it has become food B.
  const [mix, setMix] = useState(() => (id === 'mix' ? 1 : 0))
  const seq = useSequence()
  const { a, b } = weights
  const meal = id === 'mix'

  const w = lerpVec(lerpVec(W, W_PARALLEL, par), FOOD_B, mix)
  const m: Mat2 = { i: V, j: w }
  const av = scale(V, a)
  const tip = add(av, scale(w, b))
  const parallel = Math.abs(det(m)) < 1e-6

  const start = useStepStart({ weights, par, mix })
  const tweenWeights = (run: StepRun, to: { a: number; b: number }, duration = 1.4) => {
    const from = start(run).weights
    if (from.a === to.a && from.b === to.b) return setWeights(to)
    return seq.run(({ tween }) =>
      tween(0, 1, {
        duration,
        onUpdate: (t) =>
          setWeights({ a: from.a + (to.a - from.a) * t, b: from.b + (to.b - from.b) * t }),
      }),
    )
  }
  const unpar = (run: StepRun) => {
    const from = start(run).par
    return seq.run(({ tween }) => tween(from, 0, { duration: 0.8, onUpdate: setPar }))
  }

  /** Turns food B back into w when the learner steps back from the meal. */
  const unmix = (run: StepRun) => {
    if (start(run).mix === 0) return false
    void seq.run(({ tween }) => tween(start(run).mix, 0, { duration: 0.8, onUpdate: setMix }))
    return true
  }

  useStepEffect({
    weights: (run) =>
      unmix(run) ||
      void seq.run(async ({ tween, wait }) => {
        setPar(0)
        await tween(0, 1, {
          duration: 1.6,
          onUpdate: (t) => setWeights({ a: 1 + 0.5 * t, b: 1 - 1.5 * t }),
        })
        await wait(0.3)
      }),
    target: (run) => {
      if (unmix(run)) return
      setPar(0)
      void tweenWeights(run, { a: 2, b: 1 })
    },
    grid: (run) => {
      if (unmix(run)) return
      if (start(run).par > 0) void unpar(run)
      else void tweenWeights(run, { a: -1, b: 1.5 })
    },
    parallel: (run) =>
      unmix(run) ||
      void seq.run(async ({ tween, wait }) => {
        setWeights({ a: 2, b: 1 })
        await tween(0, 1, { duration: 1.8, onUpdate: setPar })
        await wait(0.3)
        await tween(0, 1, {
          duration: 1.6,
          onUpdate: (t) => setWeights({ a: 2 - 3 * t, b: 1 + t }),
        })
      }),
    mix: (run) =>
      void seq.run(async ({ tween, wait }) => {
        const from = start(run)
        await tween(0, 1, {
          duration: 1.2,
          onUpdate: (t) => {
            setPar(from.par * (1 - t))
            setMix(from.mix + (1 - from.mix) * t)
            setWeights({
              a: Math.max(0, from.weights.a) * (1 - t),
              b: Math.max(0, from.weights.b) * (1 - t),
            })
          },
        })
        await wait(0.3)
        await tween(0, 1, {
          duration: 1.6,
          onUpdate: (t) => setWeights({ a: 1.5 * t, b: t }),
        })
      }),
  })

  /** Solves a v + b w = p for the weights (Cramer's rule). */
  const dragTip = (p: Vec2) => {
    seq.cancel()
    const d = det(m)
    // A meal cannot use a negative number of servings.
    const floor = meal ? 0 : -Infinity
    setWeights({
      a: Math.max(floor, tenth((p[0] * w[1] - w[0] * p[1]) / d)),
      b: Math.max(floor, tenth((V[0] * p[1] - p[0] * V[1]) / d)),
    })
  }

  const setWeight = (key: 'a' | 'b') => (x: number) => {
    seq.cancel()
    setWeights({ ...weights, [key]: x })
  }

  const onTarget = Math.hypot(tip[0] - U[0], tip[1] - U[1]) < 1e-6
  const onMeal = Math.hypot(tip[0] - MEAL[0], tip[1] - MEAL[1]) < 1e-6
  const showGrid = id === 'grid' || id === 'parallel'

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-5, 6], y: [-3, 5.5] }}
        ariaLabel="A linear combination of two vectors in the plane"
        overlay={
          <Overlay corner="top-left">
            {meal ? (
              <ReadoutPanel title="Meal">
                <Readout
                  label="food A"
                  value={nutrients(V)}
                  color={V_COLOR}
                  hint="Protein and carbs in one serving."
                />
                <Readout
                  label="food B"
                  value={nutrients(w)}
                  color={W_COLOR}
                  hint="Protein and carbs in one serving."
                />
                <Readout label="$a$, servings of A" value={fmtShort(a, 2)} color={V_COLOR} />
                <Readout label="$b$, servings of B" value={fmtShort(b, 2)} color={W_COLOR} />
                <Readout
                  label="$a\mathbf{v} + b\mathbf{w}$"
                  value={nutrients(tip)}
                  color={SUM_COLOR}
                  hint="Protein and carbs of the meal: each food's grams times its servings, added."
                />
                <Readout
                  label="target"
                  value={onMeal ? '35 g, 35 g, reached' : '35 g, 35 g'}
                  hint="Solve $20a + 5b = 35$ and $10a + 20b = 35$: $a = 1.5$, $b = 1$."
                />
              </ReadoutPanel>
            ) : (
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
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes formatX={meal ? grams : undefined} formatY={meal ? grams : undefined} />
        {meal && (
          <>
            <Path
              points={[[0, 0], scale(V, CONE_REACH), scale(w, CONE_REACH)]}
              closed
              color={SUM_COLOR}
              width={0}
              fill={SUM_COLOR}
              fillOpacity={0.12 * mix}
            />
            <TextLabel at={[5.6, -0.4]} align="end">
              protein (g)
            </TextLabel>
            <TextLabel at={[-0.2, 5.2]} align="end">
              carbs (g)
            </TextLabel>
            <Point at={MEAL} color={vc.fg} hollow r={6} coords={false} />
            <Pulse at={MEAL} when={onMeal} color={SUM_COLOR} />
          </>
        )}
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
        <MathLabel
          at={V}
          tex={meal ? '\\mathbf{v}\\text{ (A)}' : '\\mathbf{v}'}
          color={V_COLOR}
          anchor="se"
          offset={8}
        />
        <MathLabel
          at={w}
          tex={meal ? '\\mathbf{w}\\text{ (B)}' : '\\mathbf{w}'}
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
          min={meal ? 0 : -3}
          max={3}
          step={0.1}
          format={(x) => fmtShort(x, 2)}
          color={V_COLOR}
        />
        <LabeledSlider
          label="$b$"
          value={b}
          onChange={setWeight('b')}
          min={meal ? 0 : -3}
          max={3}
          step={0.1}
          format={(x) => fmtShort(x, 2)}
          color={W_COLOR}
        />
      </VizControls>
    </>
  )
}
