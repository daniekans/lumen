import { useState } from 'react'
import {
  add,
  fmtPoint,
  fmtShort,
  length,
  lerpVec,
  normalize,
  scale,
  sub,
  type Vec2,
} from '@/lib/math'
import { tex } from '@/lib/practice'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Arc,
  Axes,
  Grid,
  MathLabel,
  Overlay,
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

const { num } = tex

const V_COLOR = vc.blue
const W_COLOR = vc.yellow
const SUM_COLOR = vc.teal

const comps = (p: Vec2) => fmtPoint(p)

const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.15 ? r : v
}
const snapVec = ([x, y]: Vec2): Vec2 => [snap(x), snap(y)]

const U: Vec2 = [2.5, 0.5]
const RULE_V: Vec2 = [0.5, 1.5]
const RULE_W: Vec2 = [-1.5, 1]
const UV = add(U, RULE_V)
const UVW = add(UV, RULE_W)

export default function VectorAlgebra() {
  const { id } = useVizStep()
  const [v, setV] = useState<Vec2>([3, 2])
  const [w, setW] = useState<Vec2>([1, 2])
  const [c, setC] = useVizParam<number>('c', 1.5)
  const seq = useSequence()

  const tweenVecs = (toV: Vec2, toW: Vec2, duration = 1.2) => {
    const fromV = v
    const fromW = w
    return seq.run(({ tween }) =>
      tween(0, 1, {
        duration,
        onUpdate: (t) => {
          setV(lerpVec(fromV, toV, t))
          setW(lerpVec(fromW, toW, t))
        },
      }),
    )
  }

  useStepEffect({
    componentwise: () => void tweenVecs([2, 1], [1.5, 2]),
    rules: () => seq.cancel(),
    length: () => void tweenVecs([3, 2], w),
    'scaled-length': () =>
      void seq.run(async ({ tween, wait }) => {
        const from = v
        await tween(0, 1, { duration: 0.8, onUpdate: (t) => setV(lerpVec(from, [2, 1], t)) })
        await tween(1, 2, { duration: 1.2, onUpdate: setC })
        await wait(0.3)
        await tween(2, -1.5, { duration: 1.6, onUpdate: setC })
      }),
    // (1.2, -1.6) has length 2 and the direction of (3, -4) from the check.
    'unit-vector': () => void tweenVecs([1.2, -1.6], w),
    distance: () => void tweenVecs([1, 0.5], [4, 3.5]),
    triangle: () =>
      void seq.run(async ({ tween, wait }) => {
        const fromV = v
        const fromW = w
        await tween(0, 1, {
          duration: 1.2,
          onUpdate: (t) => {
            setV(lerpVec(fromV, [2, 0.5], t))
            setW(lerpVec(fromW, [0.5, 2], t))
          },
        })
        await wait(0.6)
        // Turn w until it points along v: the triangle flattens and the two lengths meet.
        const target = scale(normalize([2, 0.5]), length([0.5, 2]))
        await tween(0, 1, { duration: 2, onUpdate: (t) => setW(lerpVec([0.5, 2], target, t)) })
        await wait(1.2)
        await tween(1, 0, { duration: 1.6, onUpdate: (t) => setW(lerpVec([0.5, 2], target, t)) })
      }),
  })

  const drag = (set: (p: Vec2) => void) => (p: Vec2) => {
    seq.cancel()
    set(snapVec(p))
  }
  const dragV = drag(setV)
  const dragW = drag(setW)

  const vw = add(v, w)
  const lv = length(v)
  const lw = length(w)
  const domain =
    id === 'unit-vector'
      ? { x: [-3, 3] as const, y: [-2.2, 2.2] as const }
      : id === 'scaled-length'
        ? { x: [-4.5, 5] as const, y: [-3, 3.5] as const }
        : { x: [-2.5, 5.5] as const, y: [-1.5, 4.5] as const }

  const legs = (from: Vec2, to: Vec2, color: string) => (
    <>
      <Segment from={from} to={[to[0], from[1]]} color={color} width={1.5} dash="4 5" />
      <Segment from={[to[0], from[1]]} to={to} color={color} width={1.5} dash="4 5" />
    </>
  )

  const panel = () => {
    switch (id) {
      case 'componentwise':
        return (
          <ReadoutPanel title="Components">
            <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} />
            <Readout label="$\mathbf{w}$" value={comps(w)} color={W_COLOR} />
            <Readout label="$\mathbf{v} + \mathbf{w}$" value={comps(vw)} color={SUM_COLOR} />
          </ReadoutPanel>
        )
      case 'rules':
        return (
          <ReadoutPanel title="Grouping">
            <Readout label="$\mathbf{u} + \mathbf{v}$" value={comps(UV)} color={V_COLOR} />
            <Readout
              label="$\mathbf{v} + \mathbf{w}$"
              value={comps(add(RULE_V, RULE_W))}
              color={W_COLOR}
            />
            <Readout
              label="sum"
              value={comps(UVW)}
              color={SUM_COLOR}
              hint="Both groupings give the same tip, so the parentheses can be dropped: $\mathbf{u} + \mathbf{v} + \mathbf{w}$."
            />
          </ReadoutPanel>
        )
      case 'length':
        return (
          <ReadoutPanel title="Length">
            <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} />
            <Readout label="$v_1^2 + v_2^2$" value={fmtShort(v[0] ** 2 + v[1] ** 2)} />
            <Readout label="$\lVert \mathbf{v} \rVert$" value={fmtShort(lv, 3)} color={V_COLOR} />
          </ReadoutPanel>
        )
      case 'scaled-length':
        return (
          <ReadoutPanel title="Scaled length">
            <Readout label="$\lVert \mathbf{v} \rVert$" value={fmtShort(lv, 3)} color={V_COLOR} />
            <Readout label="$c$" value={fmtShort(c, 2)} />
            <Readout
              label="$\lVert c\mathbf{v} \rVert$"
              value={fmtShort(Math.abs(c) * lv, 3)}
              color={SUM_COLOR}
              hint="Equal to $\lvert c \rvert \lVert \mathbf{v} \rVert$ for every $c$."
            />
          </ReadoutPanel>
        )
      case 'unit-vector':
        return (
          <ReadoutPanel title="Unit vector">
            <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} />
            <Readout label="$\lVert \mathbf{v} \rVert$" value={fmtShort(lv, 3)} />
            <Readout
              label="$\frac{\mathbf{v}}{\lVert \mathbf{v} \rVert}$"
              value={lv < 1e-9 ? 'undefined' : comps(normalize(v))}
              color={SUM_COLOR}
              hint="The zero vector has no direction, so it has no unit vector."
            />
          </ReadoutPanel>
        )
      case 'distance':
        return (
          <ReadoutPanel title="Distance">
            <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} />
            <Readout label="$\mathbf{w}$" value={comps(w)} color={W_COLOR} />
            <Readout label="$\mathbf{w} - \mathbf{v}$" value={comps(sub(w, v))} />
            <Readout
              label="$\lVert \mathbf{w} - \mathbf{v} \rVert$"
              value={fmtShort(length(sub(w, v)), 3)}
              color={SUM_COLOR}
            />
          </ReadoutPanel>
        )
      case 'triangle':
        return (
          <ReadoutPanel title="Two paths">
            <Readout
              label="$\lVert \mathbf{v} \rVert + \lVert \mathbf{w} \rVert$"
              value={fmtShort(lv + lw, 3)}
            />
            <Readout
              label="$\lVert \mathbf{v} + \mathbf{w} \rVert$"
              value={fmtShort(length(vw), 3)}
              color={SUM_COLOR}
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
        zoomable
        domain={domain}
        ariaLabel="Vectors with their components, lengths and sums"
        overlay={<Overlay corner="top-left">{panel()}</Overlay>}
      >
        <Grid />
        <Axes />

        {id === 'componentwise' && (
          <>
            <Segment from={[0, 0]} to={[v[0], 0]} color={V_COLOR} width={5} opacity={0.7} />
            <Segment from={[v[0], 0]} to={[vw[0], 0]} color={W_COLOR} width={5} opacity={0.7} />
            <Segment from={[0, 0]} to={[0, v[1]]} color={V_COLOR} width={5} opacity={0.7} />
            <Segment from={[0, v[1]]} to={[0, vw[1]]} color={W_COLOR} width={5} opacity={0.7} />
            <Segment from={vw} to={[vw[0], 0]} color={vc.muted} width={1} dash="3 5" />
            <Segment from={vw} to={[0, vw[1]]} color={vc.muted} width={1} dash="3 5" />
            <Vector to={v} color={V_COLOR} />
            <Vector from={v} to={vw} color={W_COLOR} />
            <Vector to={vw} color={SUM_COLOR} />
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            <Point at={vw} color={W_COLOR} onDrag={(p) => dragW(sub(p, v))} label="Tip of w" />
            <MathLabel at={scale(v, 0.5)} tex="\mathbf{v}" color={V_COLOR} anchor="se" offset={8} />
            <MathLabel
              at={add(v, scale(w, 0.5))}
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
            />
          </>
        )}

        {id === 'rules' && (
          <>
            <Vector to={U} color={vc.muted} width={2} />
            <Vector from={U} to={UV} color={vc.muted} width={2} />
            <Vector from={UV} to={UVW} color={vc.muted} width={2} />
            <Vector to={UV} color={V_COLOR} width={2.5} />
            <Vector from={UV} to={UVW} color={V_COLOR} width={2.5} opacity={0.6} />
            <Vector from={U} to={UVW} color={W_COLOR} width={2.5} />
            <Vector to={UVW} color={SUM_COLOR} />
            <MathLabel
              at={scale(U, 0.5)}
              tex="\mathbf{u}"
              color={vc.muted}
              anchor="s"
              offset={10}
            />
            <MathLabel
              at={lerpVec(U, UV, 0.5)}
              tex="\mathbf{v}"
              color={vc.muted}
              anchor="e"
              offset={10}
            />
            <MathLabel
              at={lerpVec(UV, UVW, 0.5)}
              tex="\mathbf{w}"
              color={vc.muted}
              anchor="ne"
              offset={8}
            />
            <MathLabel
              at={scale(UV, 0.5)}
              tex="\mathbf{u} + \mathbf{v}"
              color={V_COLOR}
              anchor="se"
              offset={10}
            />
            <MathLabel
              at={lerpVec(U, UVW, 0.6)}
              tex="\mathbf{v} + \mathbf{w}"
              color={W_COLOR}
              anchor="w"
              offset={14}
            />
            <MathLabel
              at={UVW}
              tex="\mathbf{u} + \mathbf{v} + \mathbf{w}"
              color={SUM_COLOR}
              anchor="nw"
              offset={10}
            />
          </>
        )}

        {id === 'length' && (
          <>
            {legs([0, 0], v, vc.muted)}
            <MathLabel
              at={[v[0] / 2, 0]}
              tex={`v_1 = ${num(v[0])}`}
              anchor="s"
              offset={8}
              color={vc.muted}
            />
            <MathLabel
              at={[v[0], v[1] / 2]}
              tex={`v_2 = ${num(v[1])}`}
              anchor={v[0] >= 0 ? 'e' : 'w'}
              offset={8}
              color={vc.muted}
            />
            <Vector to={v} color={V_COLOR} />
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            <MathLabel
              at={scale(v, 0.5)}
              tex="\lVert \mathbf{v} \rVert"
              color={V_COLOR}
              anchor={v[0] >= 0 ? 'nw' : 'ne'}
              offset={8}
            />
          </>
        )}

        {id === 'scaled-length' && (
          <>
            <Segment from={[0, 0]} to={v} extend color={vc.muted} width={1} dash="3 6" />
            <Vector to={scale(v, c)} color={SUM_COLOR} width={5} opacity={0.75} />
            <Vector to={v} color={V_COLOR} />
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            <MathLabel at={v} tex="\mathbf{v}" color={V_COLOR} anchor="nw" offset={10} />
            <MathLabel
              at={scale(v, c)}
              tex="c\mathbf{v}"
              color={SUM_COLOR}
              anchor={c >= 0 ? 'se' : 'sw'}
              offset={10}
            />
          </>
        )}

        {id === 'unit-vector' && (
          <>
            <Arc r={1} from={0} to={2 * Math.PI} color={vc.muted} width={1.5} />
            <Vector to={v} color={V_COLOR} />
            {lv > 1e-9 && <Vector to={normalize(v)} color={SUM_COLOR} width={4} />}
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            <MathLabel at={v} tex="\mathbf{v}" color={V_COLOR} anchor="se" offset={10} />
            {lv > 1e-9 && (
              <MathLabel
                at={normalize(v)}
                tex="\hat{\mathbf{v}}"
                color={SUM_COLOR}
                anchor={v[0] >= 0 ? 'nw' : 'ne'}
                offset={12}
              />
            )}
          </>
        )}

        {id === 'distance' && (
          <>
            {legs(v, w, vc.muted)}
            <Vector to={v} color={V_COLOR} width={2} opacity={0.6} />
            <Vector to={w} color={W_COLOR} width={2} opacity={0.6} />
            <Vector from={v} to={w} color={SUM_COLOR} />
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            <Point at={w} color={W_COLOR} onDrag={dragW} label="Tip of w" />
            <MathLabel at={v} tex="\mathbf{v}" color={V_COLOR} anchor="se" offset={10} />
            <MathLabel at={w} tex="\mathbf{w}" color={W_COLOR} anchor="nw" offset={10} />
            <MathLabel
              at={lerpVec(v, w, 0.5)}
              tex="\lVert \mathbf{w} - \mathbf{v} \rVert"
              color={SUM_COLOR}
              anchor="nw"
              offset={8}
            />
          </>
        )}

        {id === 'triangle' && (
          <>
            <Vector to={v} color={V_COLOR} />
            <Vector from={v} to={vw} color={W_COLOR} />
            <Vector to={vw} color={SUM_COLOR} />
            <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
            <Point at={vw} color={W_COLOR} onDrag={(p) => dragW(sub(p, v))} label="Tip of w" />
            <MathLabel at={scale(v, 0.5)} tex="\mathbf{v}" color={V_COLOR} anchor="se" offset={8} />
            <MathLabel
              at={add(v, scale(w, 0.5))}
              tex="\mathbf{w}"
              color={W_COLOR}
              anchor="e"
              offset={10}
            />
            <MathLabel
              at={scale(vw, 0.5)}
              tex="\mathbf{v} + \mathbf{w}"
              color={SUM_COLOR}
              anchor="nw"
              offset={10}
            />
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'scaled-length' && (
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
      </VizControls>
    </>
  )
}
