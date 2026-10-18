import { useState } from 'react'
import { add, fmtPoint, fmtShort, lerpVec, scale, sub, type Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  Grid,
  MathLabel,
  numbersCodec,
  Overlay,
  Path,
  Point,
  Segment,
  Stage,
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

const xy = numbersCodec(['x', 'y'])
const toVec = (p: { x: number; y: number }): Vec2 => [p.x, p.y]
const fromVec = ([x, y]: Vec2) => ({ x, y })

/** Snaps a dragged coordinate to the nearest whole or half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.15 ? r : v
}
const snapVec = ([x, y]: Vec2): Vec2 => [snap(x), snap(y)]

const comps = (p: Vec2) => fmtPoint(p)

/** Study hours and sleep hours of three students, one row each. */
const ROWS: readonly Vec2[] = [
  [2, 8],
  [5, 6],
  [8, 7],
]
/** Copies of v drawn from other tails. */
const GHOSTS: readonly Vec2[] = [
  [-2.5, -1.5],
  [2, -2],
  [3, 2.5],
]

const MEAN = scale(add(add(ROWS[0]!, ROWS[1]!), ROWS[2]!), 1 / 3)

export default function Vectors() {
  const { id } = useVizStep()
  const [vp, setVp] = useVizParam('v', { x: 3, y: 1 }, xy)
  const [wp, setWp] = useVizParam('w', { x: 1, y: 2 }, xy)
  const [c, setC] = useVizParam<number>('c', 2)
  const [row, setRow] = useVizParam<number>('row', 0)
  const [tail, setTail] = useState<Vec2>([-2, 2])
  // How far the moved copy has slid into place (0: at the origin, 1: tip to tail).
  const [slide, setSlide] = useState(1)
  const seq = useSequence()

  const v = toVec(vp)
  const w = toVec(wp)

  const slideIn = () =>
    void seq.run(async ({ tween, wait }) => {
      setSlide(0)
      await wait(0.4)
      await tween(0, 1, { duration: 1.4, onUpdate: setSlide })
    })

  useStepEffect({
    arrow: () => seq.cancel(),
    'same-vector': () =>
      void seq.run(async ({ tween }) => {
        const from: Vec2 = [-2.5, -1.5]
        const to: Vec2 = [-1, 2.5]
        await tween(0, 1, { duration: 2, onUpdate: (t) => setTail(lerpVec(from, to, t)) })
      }),
    add: slideIn,
    order: slideIn,
    scale: () =>
      void seq.run(async ({ tween, wait }) => {
        await tween(1, 2, { duration: 1, onUpdate: setC })
        await wait(0.4)
        await tween(2, -1, { duration: 1.6, onUpdate: setC })
        await wait(0.4)
        await tween(-1, 1.5, { duration: 1.4, onUpdate: setC })
      }),
    subtract: () => seq.cancel(),
    table: () => seq.cancel(),
  })

  const dragV = (p: Vec2) => {
    seq.cancel()
    setSlide(1)
    setVp(fromVec(snapVec(p)))
  }
  const dragW = (p: Vec2) => {
    seq.cancel()
    setSlide(1)
    setWp(fromVec(snapVec(p)))
  }
  const dragWTip = (p: Vec2) => dragW(sub(p, v))
  const dragTail = (p: Vec2) => {
    seq.cancel()
    setTail(snapVec(p))
  }

  const vw = add(v, w)
  const cv = scale(v, c)
  const table = id === 'table'
  const domain = table
    ? { x: [-3.5, 10] as const, y: [-1, 9.5] as const }
    : { x: [-3.5, 6.5] as const, y: [-2.5, 4.5] as const }

  const legs = (to: Vec2, color: string) => (
    <>
      <Segment from={[0, 0]} to={[to[0], 0]} color={color} width={1.5} dash="4 5" />
      <Segment from={[to[0], 0]} to={to} color={color} width={1.5} dash="4 5" />
    </>
  )

  return (
    <>
      <Stage
        zoomable
        domain={domain}
        ariaLabel="Vectors drawn as arrows in the plane"
        overlay={
          <Overlay corner="top-left">
            {(id === 'arrow' || id === 'same-vector') && (
              <ReadoutPanel title="Vector">
                <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} />
                {id === 'same-vector' && (
                  <>
                    <Readout label="tail" value={comps(tail)} />
                    <Readout
                      label="tip"
                      value={comps(add(tail, v))}
                      hint="Tip minus tail gives the components of $\mathbf{v}$ wherever the arrow starts."
                    />
                  </>
                )}
              </ReadoutPanel>
            )}
            {(id === 'add' || id === 'order') && (
              <ReadoutPanel title="Sum">
                <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} />
                <Readout label="$\mathbf{w}$" value={comps(w)} color={W_COLOR} />
                <Readout
                  label="$\mathbf{v} + \mathbf{w}$"
                  value={comps(vw)}
                  color={SUM_COLOR}
                  hint="The horizontal steps add and the vertical steps add, so the components add."
                />
              </ReadoutPanel>
            )}
            {id === 'scale' && (
              <ReadoutPanel title="Scaling">
                <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} />
                <Readout label="$c$" value={fmtShort(c)} />
                <Readout label="$c\mathbf{v}$" value={comps(cv)} color={SUM_COLOR} />
                <Readout
                  label="direction"
                  value={Math.abs(c) < 0.005 ? 'none (zero vector)' : c > 0 ? 'same' : 'reversed'}
                  hint="The length is multiplied by $\lvert c \rvert$."
                />
              </ReadoutPanel>
            )}
            {id === 'subtract' && (
              <ReadoutPanel title="Difference">
                <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} />
                <Readout label="$\mathbf{w}$" value={comps(w)} color={W_COLOR} />
                <Readout
                  label="$\mathbf{w} - \mathbf{v}$"
                  value={comps(sub(w, v))}
                  color={SUM_COLOR}
                />
              </ReadoutPanel>
            )}
            {table && (
              <ReadoutPanel title="Students (study h, sleep h)">
                {ROWS.map((r, i) => (
                  <Readout
                    key={i}
                    label={`$\\mathbf{r}_${i + 1}$`}
                    value={comps(r)}
                    color={i === row ? V_COLOR : undefined}
                  />
                ))}
                <Readout
                  label="average"
                  value={comps(MEAN)}
                  color={SUM_COLOR}
                  hint="Add the rows, then scale by $\frac{1}{3}$. With $n$ columns the rows are vectors in $\mathbb{R}^n$ and the same rules apply, one component at a time."
                />
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid />
        <Axes />

        {id === 'arrow' && (
          <>
            {legs(v, vc.muted)}
            <Vector to={v} color={V_COLOR} />
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            <MathLabel at={v} tex="\mathbf{v}" color={V_COLOR} anchor="ne" offset={10} />
          </>
        )}

        {id === 'same-vector' && (
          <>
            {GHOSTS.map((p, i) => (
              <Vector key={i} from={p} to={add(p, v)} color={V_COLOR} opacity={0.35} width={2} />
            ))}
            <Vector to={v} color={V_COLOR} opacity={0.6} />
            <Vector from={tail} to={add(tail, v)} color={V_COLOR} />
            <Point at={tail} color={V_COLOR} hollow onDrag={dragTail} label="Tail of the arrow" />
            <MathLabel
              at={add(tail, scale(v, 0.5))}
              tex="\mathbf{v}"
              color={V_COLOR}
              anchor="nw"
              offset={10}
            />
          </>
        )}

        {(id === 'add' || id === 'order') && (
          <>
            {id === 'order' && (
              <>
                <Path
                  points={[[0, 0], v, vw, w]}
                  closed
                  color={SUM_COLOR}
                  width={0}
                  fill={alpha(SUM_COLOR, 0.08 * slide)}
                />
                <Vector
                  from={lerpVec([0, 0], w, slide)}
                  to={add(lerpVec([0, 0], w, slide), v)}
                  color={V_COLOR}
                  opacity={0.55}
                  width={2.5}
                />
                <Vector to={w} color={W_COLOR} />
              </>
            )}
            <Vector to={v} color={V_COLOR} />
            {id === 'add' && (
              <Vector
                from={lerpVec([0, 0], v, slide)}
                to={add(lerpVec([0, 0], v, slide), w)}
                color={W_COLOR}
              />
            )}
            {id === 'order' && (
              <Vector from={v} to={vw} color={W_COLOR} opacity={0.55} width={2.5} />
            )}
            <Vector to={vw} color={SUM_COLOR} opacity={slide} />
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            {id === 'add' ? (
              <Point
                at={add(lerpVec([0, 0], v, slide), w)}
                color={W_COLOR}
                onDrag={dragWTip}
                label="Tip of w"
              />
            ) : (
              <Point at={w} color={W_COLOR} onDrag={dragW} label="Tip of w" />
            )}
            <MathLabel at={scale(v, 0.5)} tex="\mathbf{v}" color={V_COLOR} anchor="se" offset={8} />
            <MathLabel
              at={add(id === 'add' ? lerpVec([0, 0], v, slide) : v, scale(w, 0.5))}
              tex="\mathbf{w}"
              color={W_COLOR}
              anchor="e"
              offset={10}
            />
            <MathLabel
              at={vw}
              tex="\mathbf{v} + \mathbf{w}"
              color={SUM_COLOR}
              anchor="ne"
              offset={10}
              opacity={slide}
            />
          </>
        )}

        {id === 'scale' && (
          <>
            <Segment from={[0, 0]} to={v} extend color={vc.muted} width={1} dash="3 6" />
            <Vector to={cv} color={SUM_COLOR} width={5} opacity={0.75} />
            <Vector to={v} color={V_COLOR} />
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            <MathLabel at={v} tex="\mathbf{v}" color={V_COLOR} anchor="nw" offset={10} />
            <MathLabel
              at={cv}
              tex="c\mathbf{v}"
              color={SUM_COLOR}
              anchor={c >= 0 ? 'se' : 'sw'}
              offset={10}
            />
          </>
        )}

        {id === 'subtract' && (
          <>
            <Vector to={v} color={V_COLOR} />
            <Vector to={w} color={W_COLOR} />
            <Vector from={v} to={w} color={SUM_COLOR} />
            <Vector to={sub(w, v)} color={SUM_COLOR} opacity={0.35} width={2} />
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            <Point at={w} color={W_COLOR} onDrag={dragW} label="Tip of w" />
            <MathLabel at={v} tex="\mathbf{v}" color={V_COLOR} anchor="se" offset={10} />
            <MathLabel at={w} tex="\mathbf{w}" color={W_COLOR} anchor="nw" offset={10} />
            <MathLabel
              at={lerpVec(v, w, 0.5)}
              tex="\mathbf{w} - \mathbf{v}"
              color={SUM_COLOR}
              anchor="ne"
              offset={8}
            />
          </>
        )}

        {table && (
          <>
            {ROWS.map((r, i) => (
              <g key={i}>
                <Vector
                  to={r}
                  color={i === row ? V_COLOR : vc.muted}
                  width={i === row ? 3 : 2}
                  opacity={i === row ? 1 : 0.6}
                />
                <MathLabel
                  at={r}
                  tex={`\\mathbf{r}_${i + 1}`}
                  color={i === row ? V_COLOR : vc.muted}
                  anchor="ne"
                  offset={8}
                />
              </g>
            ))}
            {legs(ROWS[row]!, alpha(V_COLOR, 0.7))}
            <Vector to={MEAN} color={SUM_COLOR} width={2.5} />
            <Point at={MEAN} color={SUM_COLOR} r={3.5} />
            <MathLabel at={MEAN} tex="\bar{\mathbf{r}}" color={SUM_COLOR} anchor="se" offset={8} />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'scale' && (
          <LabeledSlider
            label="$c$"
            value={c}
            onChange={(x) => {
              seq.cancel()
              setC(x)
            }}
            min={-2}
            max={2.5}
            step={0.25}
            format={(x) => fmtShort(x, 2)}
            color={SUM_COLOR}
          />
        )}
        {table && (
          <SegmentedControl
            label="Row"
            value={String(row) as '0' | '1' | '2'}
            onChange={(r) => setRow(Number(r))}
            options={[
              { value: '0', label: '$\\mathbf{r}_1$' },
              { value: '1', label: '$\\mathbf{r}_2$' },
              { value: '2', label: '$\\mathbf{r}_3$' },
            ]}
          />
        )}
      </VizControls>
    </>
  )
}
