import { useState } from 'react'
import {
  add,
  apply,
  column,
  dot,
  fmtPoint,
  fmtShort,
  identity,
  lerpMat,
  mat2,
  matVec,
  sameMat,
  scale,
  toRows,
  type Mat2,
  type MatN,
  type Vec2,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, MatrixView, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes,
  Grid,
  MathLabel,
  numbersCodec,
  Overlay,
  Point,
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
  WarpedGrid,
} from '@/viz-kit'

const C1 = vc.green
const C2 = vc.red
const C3 = vc.purple
const X_COLOR = vc.blue
const OUT_COLOR = vc.teal
const W_COLOR = vc.orange
const B_COLOR = vc.yellow

type Scene = 'plane' | 'food' | 'shapes' | 'dot' | 'layer'

const sceneOf: Record<string, Scene> = {
  columns: 'plane',
  rows: 'plane',
  identity: 'plane',
  food: 'food',
  shapes: 'shapes',
  dot: 'dot',
  layer: 'layer',
}

const domains: Record<Scene, { x: [number, number]; y: [number, number] }> = {
  plane: { x: [-3.5, 5.5], y: [-2.5, 4.5] },
  food: { x: [-1, 7], y: [-1, 6] },
  shapes: { x: [-3.5, 5.5], y: [-2.5, 4.5] },
  dot: { x: [-1, 11], y: [-1, 9] },
  layer: { x: [-5.5, 9], y: [-2.5, 8.5] },
}

const A: Mat2 = mat2(2, -1, 1, 1)
/** Protein and carbs per serving, in units of 10 g, as in Vectors: food A = (2, 1), food B = (0.5, 2). */
const FOOD: Mat2 = mat2(2, 0.5, 1, 2)
const A3: MatN = [
  [1, -1, 0.5],
  [0.5, 1, 1.5],
]
const COLS3 = [0, 1, 2].map((j) => column(A3, j) as unknown as Vec2)
const W: Vec2 = [0.5, 0.3]
const W2 = mat2(0.5, 0.3, -0.2, 0.4)
const B: Vec2 = [-4, -1]
/** Hours studied and slept. */
const STUDENT: Vec2 = [6, 7]

const xy = numbersCodec(['x', 'y'])
const xyz = numbersCodec(['a', 'b', 'c'])

const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}

/** A number for a written-out product: negative ones in parentheses. */
const factor = (v: number) => (v < 0 ? `(${fmtShort(v)})` : fmtShort(v))

/** Row i of the matrix dotted with x, written out: 2·1.5 + (-1)·1 = 2. */
const rowTimes = (row: readonly number[], x: readonly number[], value: number) =>
  `${row.map((r, j) => `${factor(r)}·${factor(x[j]!)}`).join(' + ')} = ${fmtShort(value)}`

const grams = (v: number) => (v < 0 ? null : `${fmtShort(v * 10, 1)}`)

/** The level line w . x = k: through k w / |w|^2, perpendicular to w. */
const levelLine = (w: Vec2, k: number): [Vec2, Vec2] => {
  const foot = scale(w, k / dot(w, w))
  return [foot, add(foot, [-w[1], w[0]])]
}

export default function MatrixVectorProduct() {
  const { id } = useVizStep()
  const scene: Scene = (id && sceneOf[id]) || 'plane'
  const [xp, setXp] = useVizParam('x', { x: 1.5, y: 1 }, xy)
  const [x3, setX3] = useVizParam('x3', { a: 1, b: 1, c: 1 }, xyz)
  const [m, setM] = useState<Mat2>(id === 'identity' ? identity : A)
  const seq = useSequence()

  const x: Vec2 = [xp.x, xp.y]
  const start = useStepStart({ x, m })

  /** Moves x and the matrix to their targets for the step; no sequence when nothing moves. */
  const goTo = (run: StepRun, toX: Vec2, toM: Mat2) => {
    const from = start(run)
    const sameX = from.x[0] === toX[0] && from.x[1] === toX[1]
    if (sameX && sameMat(from.m, toM)) {
      setXp({ x: toX[0], y: toX[1] })
      setM(toM)
      return
    }
    void seq.run(({ tween }) =>
      tween(0, 1, {
        duration: 1.3,
        onUpdate: (t) => {
          setXp({
            x: from.x[0] + (toX[0] - from.x[0]) * t,
            y: from.x[1] + (toX[1] - from.x[1]) * t,
          })
          setM(lerpMat(from.m, toM, t))
        },
      }),
    )
  }

  useStepEffect({
    columns: (run) => goTo(run, [1.5, 1], A),
    rows: (run) => goTo(run, [1.5, 1], A),
    food: (run) => goTo(run, [1.5, 1], FOOD),
    shapes: () => {
      setM(A)
      setX3({ a: 1, b: 1, c: 1 })
    },
    identity: (run) => goTo(run, [1.5, 1], identity),
    dot: () => setXp({ x: STUDENT[0], y: STUDENT[1] }),
    layer: () => setXp({ x: STUDENT[0], y: STUDENT[1] }),
  })

  const dragX = (p: Vec2) => {
    seq.cancel()
    setXp({ x: snap(p[0]), y: snap(p[1]) })
  }

  const columnsScene = scene === 'plane' || scene === 'food'
  const Ax = apply(m, x)
  const part1 = scale(m.i, x[0])
  const rowsStep = id === 'rows'
  const rows = toRows(m)

  const v3 = [x3.a, x3.b, x3.c]
  const A3x = matVec(A3, v3) as unknown as Vec2
  const steps3 = [0, 1, 2].reduce<Vec2[]>(
    (acc, j) => [...acc, add(acc[acc.length - 1]!, scale(COLS3[j]!, v3[j]!))],
    [[0, 0]],
  )

  const wx = dot(W, x)
  const Wx = apply(W2, x)
  const out = add(Wx, B)

  const panel = () => {
    switch (scene) {
      case 'plane':
        return (
          <ReadoutPanel title="Product">
            <MatrixView rows={rows} name="A =" colors={[C1, C2]} label="Matrix A" />
            <Readout label="$\mathbf{x}$" value={fmtPoint(x)} color={X_COLOR} />
            <Readout
              label="$A\mathbf{x}$"
              value={fmtPoint(Ax)}
              color={OUT_COLOR}
              hint="$x_1$ times column 1 plus $x_2$ times column 2."
            />
            {rowsStep && (
              <>
                <Readout
                  label="$\mathbf{r}_1 \cdot \mathbf{x}$"
                  value={rowTimes(rows[0], x, Ax[0])}
                  hint="Row 1 of $A$ dotted with $\mathbf{x}$: the first entry of $A\mathbf{x}$."
                />
                <Readout
                  label="$\mathbf{r}_2 \cdot \mathbf{x}$"
                  value={rowTimes(rows[1], x, Ax[1])}
                  hint="Row 2 of $A$ dotted with $\mathbf{x}$: the second entry of $A\mathbf{x}$."
                />
              </>
            )}
          </ReadoutPanel>
        )
      case 'food':
        return (
          <ReadoutPanel title="Meal">
            <MatrixView
              rows={toRows(FOOD).map((r) => r.map((v) => v * 10))}
              name="A ="
              colors={[C1, C2]}
              label="Grams per serving: protein in row 1, carbs in row 2; food A in column 1, food B in column 2"
            />
            <Readout label="servings of A" value={fmtShort(x[0], 2)} color={C1} />
            <Readout label="servings of B" value={fmtShort(x[1], 2)} color={C2} />
            <Readout
              label="protein, row 1"
              value={`${fmtShort(Ax[0] * 10, 1)} g`}
              color={OUT_COLOR}
              hint="$20$ g times the servings of A plus $5$ g times the servings of B."
            />
            <Readout
              label="carbs, row 2"
              value={`${fmtShort(Ax[1] * 10, 1)} g`}
              color={OUT_COLOR}
              hint="$10$ g times the servings of A plus $20$ g times the servings of B."
            />
          </ReadoutPanel>
        )
      case 'shapes':
        return (
          <ReadoutPanel title="2 × 3">
            <MatrixView rows={A3} name="A =" colors={[C1, C2, C3]} label="Matrix A, 2 by 3" />
            <Readout
              label="$\mathbf{x}$ in $\mathbb{R}^3$"
              value={`(${v3.map((v) => fmtShort(v, 2)).join(', ')})`}
              color={X_COLOR}
            />
            <Readout
              label="$A\mathbf{x}$ in $\mathbb{R}^2$"
              value={fmtPoint(A3x)}
              color={OUT_COLOR}
            />
          </ReadoutPanel>
        )
      case 'dot':
        return (
          <ReadoutPanel title="Score">
            <Readout label="$\mathbf{w}$" value={fmtPoint(W)} color={W_COLOR} />
            <Readout
              label="$\mathbf{x}$"
              value={fmtPoint(x)}
              color={X_COLOR}
              hint="Hours studied and hours slept."
            />
            <Readout
              label="$\mathbf{w} \cdot \mathbf{x}$"
              value={fmtShort(wx, 2)}
              color={OUT_COLOR}
              hint="One number: the output of the $1 \times 2$ matrix $\begin{bmatrix} 0.5 & 0.3 \end{bmatrix}$."
            />
          </ReadoutPanel>
        )
      case 'layer':
        return (
          <ReadoutPanel title="Layer">
            <MatrixView rows={toRows(W2)} name="W =" label="Weights W" />
            <Readout label="$\mathbf{b}$" value={fmtPoint(B)} color={B_COLOR} />
            <Readout label="$\mathbf{x}$" value={fmtPoint(x)} color={X_COLOR} />
            <Readout label="$W\mathbf{x}$" value={fmtPoint(Wx)} color={OUT_COLOR} />
            <Readout
              label="$W\mathbf{x} + \mathbf{b}$"
              value={fmtPoint(out)}
              color={OUT_COLOR}
              hint="The two neurons' scores: each row of $W$ dotted with $\mathbf{x}$, plus its entry of $\mathbf{b}$."
            />
          </ReadoutPanel>
        )
    }
  }

  return (
    <>
      <Stage
        zoomable
        domain={domains[scene]}
        ariaLabel="A matrix times a vector, by columns and by rows"
        overlay={<Overlay corner="top-left">{panel()}</Overlay>}
      >
        <Grid />
        {scene === 'layer' ? (
          <WarpedGrid f={(p) => add(apply(W2, p), B)} reach={6} opacity={0.12} axisOpacity={0.5} />
        ) : (
          <Axes
            formatX={scene === 'food' ? grams : undefined}
            formatY={scene === 'food' ? grams : undefined}
          />
        )}

        {columnsScene && (
          <>
            {id === 'identity' && <TransformedGrid m={m} opacity={0.12} />}
            <Vector to={m.i} color={C1} width={2} opacity={0.5} />
            <Vector to={m.j} color={C2} width={2} opacity={0.5} />
            <Vector to={part1} color={C1} />
            <Vector from={part1} to={Ax} color={C2} />
            {scene === 'plane' && (
              <>
                <Vector to={x} color={X_COLOR} />
                <MathLabel at={x} tex="\mathbf{x}" color={X_COLOR} anchor="se" offset={8} />
              </>
            )}
            <Vector to={Ax} color={OUT_COLOR} />
            <MathLabel at={m.i} tex="\mathbf{a}_1" color={C1} anchor="se" offset={8} />
            <MathLabel at={m.j} tex="\mathbf{a}_2" color={C2} anchor="nw" offset={8} />
            <MathLabel
              at={Ax}
              tex={scene === 'food' ? 'A\\mathbf{x}\\text{ (meal)}' : 'A\\mathbf{x}'}
              color={OUT_COLOR}
              anchor="ne"
              offset={8}
            />
            {scene === 'food' && (
              <>
                <TextLabel at={[6.6, -0.4]} align="end">
                  protein (g)
                </TextLabel>
                <TextLabel at={[0.2, 5.6]} align="start">
                  carbs (g)
                </TextLabel>
              </>
            )}
            {rowsStep && (
              <>
                <Segment from={Ax} to={[Ax[0], 0]} color={OUT_COLOR} width={1} dash="4 4" />
                <Segment from={Ax} to={[0, Ax[1]]} color={OUT_COLOR} width={1} dash="4 4" />
                <Point at={[Ax[0], 0]} color={OUT_COLOR} r={3.5} coords={false} />
                <Point at={[0, Ax[1]]} color={OUT_COLOR} r={3.5} coords={false} />
                <MathLabel
                  at={[Ax[0], 0]}
                  tex="\mathbf{r}_1 \cdot \mathbf{x}"
                  color={OUT_COLOR}
                  anchor="s"
                  offset={10}
                />
                <MathLabel
                  at={[0, Ax[1]]}
                  tex="\mathbf{r}_2 \cdot \mathbf{x}"
                  color={OUT_COLOR}
                  anchor="w"
                  offset={10}
                />
              </>
            )}
            {scene === 'plane' && <Point at={x} color={X_COLOR} onDrag={dragX} label="Tip of x" />}
          </>
        )}

        {scene === 'shapes' && (
          <>
            {COLS3.map((c, j) => (
              <Vector key={`col-${j}`} to={c} color={[C1, C2, C3][j]} width={2} opacity={0.5} />
            ))}
            {COLS3.map((_, j) => (
              <Vector
                key={`step-${j}`}
                from={steps3[j]}
                to={steps3[j + 1]!}
                color={[C1, C2, C3][j]}
              />
            ))}
            <Vector to={A3x} color={OUT_COLOR} />
            {COLS3.map((c, j) => (
              <MathLabel
                key={`label-${j}`}
                at={c}
                tex={`\\mathbf{a}_${j + 1}`}
                color={[C1, C2, C3][j]}
                anchor={j === 1 ? 'nw' : 'se'}
                offset={8}
              />
            ))}
            <MathLabel at={A3x} tex="A\mathbf{x}" color={OUT_COLOR} anchor="ne" offset={8} />
          </>
        )}

        {scene === 'dot' && (
          <>
            {[1, 2, 3, 4, 5, 6, 7].map((k) => {
              const [from, to] = levelLine(W, k)
              return (
                <g key={k}>
                  <Segment from={from} to={to} extend color={vc.fg} width={1} opacity={0.25} />
                  <MathLabel
                    at={from}
                    tex={String(k)}
                    color={vc.muted}
                    anchor="se"
                    offset={6}
                    size={13}
                  />
                </g>
              )
            })}
            <Segment
              from={levelLine(W, wx)[0]}
              to={levelLine(W, wx)[1]}
              extend
              color={OUT_COLOR}
              width={2}
              opacity={0.8}
            />
            <Vector to={W} color={W_COLOR} />
            <MathLabel at={W} tex="\mathbf{w}" color={W_COLOR} anchor="se" offset={6} />
            <Vector to={x} color={X_COLOR} />
            <MathLabel
              at={x}
              tex={`\\mathbf{w} \\cdot \\mathbf{x} = ${fmtShort(wx, 2)}`}
              color={OUT_COLOR}
              anchor="ne"
              offset={10}
            />
            <TextLabel at={[10.6, -0.5]} align="end">
              hours studied
            </TextLabel>
            <TextLabel at={[0.2, 8.6]} align="start">
              hours slept
            </TextLabel>
            <Point at={x} color={X_COLOR} onDrag={dragX} label="Tip of x" />
          </>
        )}

        {scene === 'layer' && (
          <>
            <Vector to={x} color={X_COLOR} />
            <MathLabel at={x} tex="\mathbf{x}" color={X_COLOR} anchor="ne" offset={8} />
            <Vector to={Wx} color={OUT_COLOR} width={2} opacity={0.5} />
            <MathLabel at={Wx} tex="W\mathbf{x}" color={OUT_COLOR} anchor="e" offset={10} />
            <Vector from={Wx} to={out} color={B_COLOR} width={2} />
            <Vector to={out} color={OUT_COLOR} />
            <MathLabel
              at={out}
              tex="W\mathbf{x} + \mathbf{b}"
              color={OUT_COLOR}
              anchor="nw"
              offset={8}
            />
            <Point at={[0, 0]} color={vc.fg} hollow r={5} coords={false} />
            <MathLabel at={[0, 0]} tex="\mathbf{0}" anchor="ne" offset={8} />
            <Vector to={B} color={B_COLOR} />
            <Point at={B} color={B_COLOR} r={4} coords={false} />
            <MathLabel
              at={B}
              tex="W\mathbf{0} + \mathbf{b} = \mathbf{b}"
              color={B_COLOR}
              anchor="s"
              offset={10}
            />
            <Point at={x} color={X_COLOR} onDrag={dragX} label="Tip of x" />
          </>
        )}
      </Stage>

      {(scene === 'food' || scene === 'shapes') && (
        <VizControls>
          {scene === 'food' &&
            (['x', 'y'] as const).map((k, j) => (
              <LabeledSlider
                key={k}
                label={j === 0 ? '$x_1$, servings of A' : '$x_2$, servings of B'}
                value={xp[k]}
                onChange={(v) => {
                  seq.cancel()
                  setXp({ ...xp, [k]: v })
                }}
                min={0}
                max={3}
                step={0.1}
                format={(v) => fmtShort(v, 2)}
                color={j === 0 ? C1 : C2}
              />
            ))}
          {scene === 'shapes' &&
            (['a', 'b', 'c'] as const).map((k, j) => (
              <LabeledSlider
                key={k}
                label={`$x_${j + 1}$`}
                value={x3[k]}
                onChange={(v) => setX3({ ...x3, [k]: v })}
                min={-2}
                max={2}
                step={0.1}
                format={(v) => fmtShort(v, 2)}
                color={[C1, C2, C3][j]}
              />
            ))}
        </VizControls>
      )}
    </>
  )
}
