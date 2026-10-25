import { useState } from 'react'
import { add, fmtPoint, fmtShort, lerpVec, sameVec, scale, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Grid,
  MathLabel,
  numbersCodec,
  Overlay,
  Path,
  Point,
  Pulse,
  Segment,
  Stage,
  useSequence,
  useStepEffect,
  useStepStart,
  type SequenceContext,
  type StepRun,
  useVizParam,
  useVizStep,
  Vector,
  VizControls,
  WarpedGrid,
} from '@/viz-kit'

const IN_COLOR = vc.blue
const OUT_COLOR = vc.teal
const FAIL_COLOR = vc.red

type MapKind = 'identity' | 'linear' | 'shift' | 'bend' | 'collapse'
type Rule = 'sum' | 'scale'

/** The maps of the item. `identity` leaves the plane as it is, for comparison. */
const maps: Record<MapKind, (p: Vec2) => Vec2> = {
  identity: (p) => p,
  linear: ([x, y]) => [x - y, 0.5 * x + y],
  shift: ([x, y]) => [x + 0.5, y + 1.5],
  bend: ([x, y]) => [x, y + (x * x) / 4],
  // Orthogonal projection onto the line y = x / 2.
  collapse: ([x, y]) => [0.8 * x + 0.4 * y, 0.4 * x + 0.2 * y],
}

const formulas: Record<MapKind, string> = {
  identity: '(x,\\ y)',
  linear: '(x - y,\\ 0.5x + y)',
  shift: '(x + 0.5,\\ y + 1.5)',
  bend: '(x,\\ y + \\tfrac{x^2}{4})',
  collapse: '(0.8x + 0.4y,\\ 0.4x + 0.2y)',
}

const mapOptions = [
  { value: 'identity', label: 'None' },
  { value: 'linear', label: 'Linear' },
  { value: 'shift', label: 'Shift' },
  { value: 'bend', label: 'Bend' },
  { value: 'collapse', label: 'Collapse' },
] as const

const ruleOptions = [
  { value: 'sum', label: 'Sums' },
  { value: 'scale', label: 'Multiples' },
] as const

const xy = numbersCodec(['x', 'y'])
const U: Vec2 = [1, 2]
const V: Vec2 = [2, -1]

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}

const comps = (p: Vec2) => fmtPoint(p)

export default function LinearMaps() {
  const { id } = useVizStep()
  const [kind, setKind] = useVizParam<MapKind>('map', 'linear')
  const [rule, setRule] = useVizParam<Rule>('rule', 'sum')
  const [up, setUp] = useVizParam('u', { x: U[0], y: U[1] }, xy)
  const [vp, setVp] = useVizParam('v', { x: V[0], y: V[1] }, xy)
  const [c, setC] = useVizParam<number>('c', 2)
  // The drawn map blends from `prev` to `kind` as t goes from 0 to 1.
  const [prev, setPrev] = useState<MapKind>('identity')
  const [t, setT] = useState(1)
  const seq = useSequence()

  const u: Vec2 = [up.x, up.y]
  const v: Vec2 = [vp.x, vp.y]
  const T = (p: Vec2) => lerpVec(maps[prev](p), maps[kind](p), t)

  const start = useStepStart({ kind, c })
  /** Morphs the drawn map from `from` to `to`; with no change, sets it without a sequence. */
  const morph = (from: MapKind, to: MapKind, then?: (ctx: SequenceContext) => Promise<void>) => {
    setKind(to)
    if (from === to && !then) {
      setPrev(to)
      setT(1)
      return
    }
    setPrev(from)
    void seq.run(async (ctx) => {
      if (from !== to) {
        setT(0)
        await ctx.wait(0.2)
        await ctx.tween(0, 1, { duration: 1.6, onUpdate: setT })
      }
      await then?.(ctx)
    })
  }
  /** A morph to `to` from the map the step started on. */
  const morphTo = (run: StepRun, to: MapKind, then?: (ctx: SequenceContext) => Promise<void>) =>
    morph(start(run).kind, to, then)

  useStepEffect({
    map: () => morph('identity', 'linear'),
    sum: (run) => {
      setRule('sum')
      morphTo(run, 'linear')
    },
    scale: (run) => {
      setRule('scale')
      morphTo(run, 'linear', async ({ tween, wait }) => {
        await tween(start(run).c, -1.5, { duration: 1.4, onUpdate: setC })
        await wait(0.3)
        await tween(-1.5, 2, { duration: 1.4, onUpdate: setC })
      })
    },
    grid: () => morph('identity', 'linear'),
    shift: (run) => {
      setRule('sum')
      morphTo(run, 'shift')
    },
    bend: (run) => {
      setRule('scale')
      const from = start(run).c
      morphTo(run, 'bend', async ({ tween }) => {
        if (from !== 2) await tween(from, 2, { duration: 1.2, onUpdate: setC })
      })
    },
    collapse: (run) => {
      setRule('sum')
      morphTo(run, 'collapse')
    },
  })

  const chooseMap = (next: MapKind) => morph(kind, next)

  const drag = (set: typeof setUp) => (p: Vec2) => {
    seq.cancel()
    setPrev(kind)
    setT(1)
    set({ x: snap(p[0]), y: snap(p[1]) })
  }

  const single = id === 'map' || id === 'grid'
  const showRule = !single
  const sumRule = showRule && rule === 'sum'
  const scaleRule = showRule && rule === 'scale'

  const Tu = T(u)
  const Tv = T(v)
  const origin = T([0, 0])
  const movedOrigin = !sameVec(origin, [0, 0], 1e-6)

  // The two sides of the rule being tested.
  const uv = add(u, v)
  const cv = scale(v, c)
  const lhs = sumRule ? T(uv) : T(cv)
  const rhs = sumRule ? add(Tu, Tv) : scale(Tv, c)
  const holds = sameVec(lhs, rhs, 1e-6)
  const settled = t === 1

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-4.5, 6], y: [-3, 5] }}
        ariaLabel="A map of the plane and its effect on sums and multiples"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Map">
              <Readout label="$T(x, y)$" value={`$${formulas[kind]}$`} />
              {single && (
                <>
                  <Readout label="$\mathbf{u}$" value={comps(u)} color={IN_COLOR} />
                  <Readout label="$T(\mathbf{u})$" value={comps(Tu)} color={OUT_COLOR} />
                </>
              )}
              {sumRule && (
                <>
                  <Readout
                    label="$T(\mathbf{u} + \mathbf{v})$"
                    value={comps(lhs)}
                    color={OUT_COLOR}
                  />
                  <Readout
                    label="$T(\mathbf{u}) + T(\mathbf{v})$"
                    value={comps(rhs)}
                    color={OUT_COLOR}
                    hint="Map each input first, then add the outputs."
                  />
                </>
              )}
              {scaleRule && (
                <>
                  <Readout label="$c$" value={fmtShort(c, 2)} />
                  <Readout label="$T(c\mathbf{v})$" value={comps(lhs)} color={OUT_COLOR} />
                  <Readout
                    label="$cT(\mathbf{v})$"
                    value={comps(rhs)}
                    color={OUT_COLOR}
                    hint="Map $\mathbf{v}$ first, then scale the output."
                  />
                </>
              )}
              {showRule && (
                <Readout
                  label="rule"
                  value={holds ? 'holds' : 'fails'}
                  color={holds ? undefined : FAIL_COLOR}
                />
              )}
              {movedOrigin && (
                <Readout label="$T(\mathbf{0})$" value={comps(origin)} color={FAIL_COLOR} />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />
        <WarpedGrid f={T} reach={kind === 'collapse' || prev === 'collapse' ? 6 : 2.5} />

        {id === 'grid' && <Pulse at={[0, 0]} when={settled} color={OUT_COLOR} />}
        {movedOrigin && (
          <>
            <Point at={origin} color={FAIL_COLOR} r={4} coords={false} />
            <MathLabel at={origin} tex="T(\mathbf{0})" color={FAIL_COLOR} anchor="se" offset={8} />
          </>
        )}

        {/* Inputs. */}
        {sumRule && (
          <Path
            points={[[0, 0], u, uv, v]}
            closed
            color={IN_COLOR}
            width={1}
            dash="4 5"
            opacity={0.6}
          />
        )}
        {sumRule && <Vector to={uv} color={IN_COLOR} width={1.5} opacity={0.6} />}
        {scaleRule && <Vector to={cv} color={IN_COLOR} width={1.5} opacity={0.6} />}
        {single && <Segment from={u} to={Tu} color={vc.fg} width={1} dash="3 5" opacity={0.5} />}
        {(single || sumRule) && <Vector to={u} color={IN_COLOR} />}
        {!single && <Vector to={v} color={IN_COLOR} />}

        {/* Outputs. */}
        {sumRule && (
          <Path
            points={[origin, Tu, rhs, Tv]}
            closed
            color={OUT_COLOR}
            width={1}
            dash="4 5"
            opacity={0.7}
          />
        )}
        {(single || sumRule) && <Vector from={origin} to={Tu} color={OUT_COLOR} />}
        {!single && <Vector from={origin} to={Tv} color={OUT_COLOR} />}
        {scaleRule && <Vector from={origin} to={rhs} color={OUT_COLOR} width={1.5} opacity={0.7} />}
        {showRule && !holds && <Segment from={rhs} to={lhs} color={FAIL_COLOR} width={2.5} />}
        {showRule && (
          <>
            <Point at={rhs} color={OUT_COLOR} hollow r={6} />
            <Point at={lhs} color={OUT_COLOR} r={4} />
            <Pulse at={lhs} when={settled && holds} color={OUT_COLOR} />
          </>
        )}

        {/* Labels after the shapes, so they stay on top. */}
        {(single || sumRule) && (
          <MathLabel at={u} tex="\mathbf{u}" color={IN_COLOR} anchor="nw" offset={8} />
        )}
        {!single && <MathLabel at={v} tex="\mathbf{v}" color={IN_COLOR} anchor="se" offset={8} />}
        {sumRule && (
          <MathLabel
            at={uv}
            tex="\mathbf{u} + \mathbf{v}"
            color={IN_COLOR}
            anchor="e"
            offset={12}
          />
        )}
        {scaleRule && (
          <MathLabel at={cv} tex="c\mathbf{v}" color={IN_COLOR} anchor="se" offset={8} />
        )}
        {(single || sumRule) && (
          <MathLabel at={Tu} tex="T(\mathbf{u})" color={OUT_COLOR} anchor="ne" offset={8} />
        )}
        {!single && (
          <MathLabel at={Tv} tex="T(\mathbf{v})" color={OUT_COLOR} anchor="se" offset={8} />
        )}
        {showRule && (
          <MathLabel
            at={lhs}
            tex={sumRule ? 'T(\\mathbf{u} + \\mathbf{v})' : 'T(c\\mathbf{v})'}
            color={OUT_COLOR}
            anchor="nw"
            offset={10}
          />
        )}
        {showRule && !holds && (
          <MathLabel
            at={rhs}
            tex={sumRule ? 'T(\\mathbf{u}) + T(\\mathbf{v})' : 'cT(\\mathbf{v})'}
            color={OUT_COLOR}
            anchor="se"
            offset={10}
          />
        )}

        {(single || sumRule) && (
          <Point at={u} color={IN_COLOR} onDrag={drag(setUp)} label="Input u" />
        )}
        {!single && <Point at={v} color={IN_COLOR} onDrag={drag(setVp)} label="Input v" />}
      </Stage>

      <VizControls>
        <SegmentedControl
          label="Map"
          value={kind}
          onChange={(k) => chooseMap(k as MapKind)}
          options={mapOptions}
        />
        {showRule && (
          <SegmentedControl
            label="Rule"
            value={rule}
            onChange={(r) => {
              seq.cancel()
              setPrev(kind)
              setT(1)
              setRule(r as Rule)
            }}
            options={ruleOptions}
          />
        )}
        {scaleRule && (
          <LabeledSlider
            label="$c$"
            value={c}
            onChange={(x) => {
              seq.cancel()
              setPrev(kind)
              setT(1)
              setC(x)
            }}
            min={-2}
            max={2.5}
            step={0.1}
            format={(x) => fmtShort(x, 2)}
          />
        )}
      </VizControls>
    </>
  )
}
