import { useState } from 'react'
import {
  add3,
  cross3,
  dot3,
  fmtPoint3,
  fmtShort,
  fromColumns,
  length3,
  lerp3,
  scale3,
  sub3,
  type Vec3,
} from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Axes3D,
  Cell3D,
  DropLines3D,
  Grid3D,
  MathLabel3D,
  Overlay,
  Path3D,
  Plane3D,
  Point3D,
  Pulse3D,
  Segment3D,
  Stage3D,
  TurnArc3D,
  useHighlight,
  useSequence,
  useStepEffect,
  useVizStep,
  Vector3D,
  VizControls,
} from '@/viz-kit'

const V_COLOR = vc.green
const W_COLOR = vc.red
const X_COLOR = vc.purple
const P_COLOR = vc.orange
const VOLUME_COLOR = vc.yellow
const SET_COLOR = vc.teal

const I: Vec3 = [1, 0, 0]
const J: Vec3 = [0, 1, 0]
const K: Vec3 = [0, 0, 1]

/** The base in the floor: area 1.5, so v x w = (0, 0, 1.5). */
const V0: Vec3 = [1.5, 0, 0]
const W0: Vec3 = [0.5, 1, 0]
const X0: Vec3 = [0.5, 0.5, 1]
/** Tilted out of the floor, so every component of v x w = (-0.5, -0.75, 1.5) is nonzero. */
const V1: Vec3 = [1.5, 0, 0.5]
const W1: Vec3 = [0, 1, 0.5]
/** w turned onto the line of v (area 0) and opened wider (area 2.25). */
const W_PARALLEL: Vec3 = [1, 0, 0]
const W_WIDE: Vec3 = [-0.5, 1.5, 0]

/** Three points of the plane x + 2y + 2z = 6 from Lines and planes. */
const PTS0: readonly [Vec3, Vec3, Vec3] = [
  [2, 0, 2],
  [2, 1, 1],
  [0, 1, 2],
]

/** Wrench: 1 meter of handle is drawn 5 units long, 40 newtons 1 unit, 10 newton meters 1 unit. */
const FORCE = 50
const R_SCALE = 5
const F_SCALE = 1 / 40
const T_SCALE = 1 / 10

interface Scene {
  v: Vec3
  w: Vec3
  x: Vec3
}
const SCENE0: Scene = { v: V0, w: W0, x: X0 }
const lerpScene = (a: Scene, b: Scene, t: number): Scene => ({
  v: lerp3(a.v, b.v, t),
  w: lerp3(a.w, b.w, t),
  x: lerp3(a.x, b.x, t),
})
const same3 = (a: Vec3, b: Vec3) => length3(sub3(a, b)) < 1e-6
const sameScene = (a: Scene, b: Scene) => same3(a.v, b.v) && same3(a.w, b.w) && same3(a.x, b.x)

/** Snaps a dragged coordinate to the nearest half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}
const snap3 = (p: Vec3): Vec3 => [snap(p[0]), snap(p[1]), snap(p[2])]

const num = (v: number) => fmtShort(v, 2)
const comps = (p: Vec3) => fmtPoint3(p)
const det3 = (a: Vec3, b: Vec3, c: Vec3) => dot3(c, cross3(a, b))

/** The bolt head: a hexagon in the floor around the origin. */
const HEX: Vec3[] = Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 3) * k + Math.PI / 6
  return [0.22 * Math.cos(a), 0.22 * Math.sin(a), 0]
})

type Order = 'vw' | 'wv'
const ORDERS = [
  { value: 'vw', label: 'v × w' },
  { value: 'wv', label: 'w × v' },
] as const

export default function CrossProduct() {
  const id = useVizStep().id ?? 'volume'
  const seq = useSequence()
  const hl = useHighlight()
  const [s, setS] = useState<Scene>(SCENE0)
  const [order, setOrder] = useState<Order>('vw')
  const [pts, setPts] = useState<readonly [Vec3, Vec3, Vec3]>(PTS0)
  const [handle, setHandle] = useState(0.3)
  const [theta, setTheta] = useState(90)

  /** Moves the scene to each target in turn, the first without a pause. */
  const play = (...targets: Partial<Scene>[]) => {
    const from = s
    void seq.run(async ({ tween, wait }) => {
      let cur = from
      for (const [k, target] of targets.entries()) {
        const next = { ...cur, ...target }
        if (!sameScene(cur, next)) {
          await wait(k ? 0.7 : 0.2)
          const a = cur
          await tween(0, 1, { duration: 1.3, onUpdate: (t) => setS(lerpScene(a, next, t)) })
        }
        cur = next
      }
    })
  }

  useStepEffect({
    volume: () =>
      play(
        SCENE0,
        { x: [0.5, 0.5, 1.5] },
        { x: [-0.5, 1.2, 1.5] },
        { x: [-0.5, 1.2, 0] },
        { x: X0 },
      ),
    'one-vector': () => play({ v: V0, w: W0 }, { x: I }, { x: J }, { x: K }, { x: X0 }),
    geometry: () => {
      setOrder('vw')
      play({ v: V0, w: W0 }, { w: W_PARALLEL }, { w: W_WIDE }, { w: W0 })
    },
    order: () => {
      setS({ ...s, v: V0, w: W0 })
      setOrder('vw')
      void seq.run(async ({ wait }) => {
        await wait(1.2)
        setOrder('wv')
      })
    },
    components: () => {
      setOrder('vw')
      play({ v: V1, w: W1 })
    },
    triple: () => {
      const p = cross3(V1, W1)
      const foot = sub3(X0, scale3(p, dot3(X0, p) / dot3(p, p)))
      play({ v: V1, w: W1, x: X0 }, { x: foot }, { x: X0 })
    },
    plane: () => {
      setPts(PTS0)
      const [p0, q0, r0] = PTS0
      void seq.run(async ({ tween, wait }) => {
        await wait(0.8)
        const up: Vec3 = [0, 1, 3]
        await tween(0, 1, { duration: 1.4, onUpdate: (t) => setPts([p0, q0, lerp3(r0, up, t)]) })
        await wait(0.6)
        await tween(1, 0, { duration: 1.4, onUpdate: (t) => setPts([p0, q0, lerp3(r0, up, t)]) })
      })
    },
    torque: () => {
      setHandle(0.3)
      setTheta(90)
      void seq.run(async ({ tween, wait }) => {
        await wait(0.8)
        await tween(90, 0, { duration: 1.8, onUpdate: setTheta })
        await wait(0.6)
        await tween(0, 90, { duration: 1.4, onUpdate: setTheta })
        await wait(0.4)
        await tween(0.3, 0.4, { duration: 1, onUpdate: setHandle })
      })
    },
  })

  const { v, w, x } = s
  const swapped = id === 'order' && order === 'wv'
  const [first, second] = swapped ? [w, v] : [v, w]
  const p = cross3(first, second)
  const area = length3(p)
  const vol = det3(v, w, x)
  const height = area > 1e-9 ? dot3(x, p) / area : 0
  const foot = area > 1e-9 ? sub3(x, scale3(p, dot3(x, p) / (area * area))) : x

  const boxStep = id === 'volume' || id === 'one-vector' || id === 'triple'
  const baseStep = id === 'geometry' || id === 'order' || id === 'components'
  const vwStep = boxStep || baseStep
  const showP = id !== 'volume' && vwStep
  const dragVW = (id === 'geometry' || id === 'components') && !seq.running
  const dragX = (id === 'volume' || id === 'triple') && !seq.running

  const pLabel =
    id === 'one-vector'
      ? '\\mathbf{p} = \\mathbf{v} \\times \\mathbf{w}'
      : swapped
        ? '\\mathbf{w} \\times \\mathbf{v}'
        : '\\mathbf{v} \\times \\mathbf{w}'

  // The plane through three points.
  const [pp, qq, rr] = pts
  const e1 = sub3(qq, pp)
  const e2 = sub3(rr, pp)
  const n = cross3(e1, e2)
  const nLen = length3(n)
  const d = dot3(n, pp)
  const centroid = scale3(add3(add3(pp, qq), rr), 1 / 3)

  // The wrench: handle along x, the force turned by theta from it in the floor.
  const th = (theta * Math.PI) / 180
  const r: Vec3 = [handle, 0, 0]
  const F: Vec3 = [FORCE * Math.cos(th), FORCE * Math.sin(th), 0]
  const tau = cross3(r, F)
  const rDraw = scale3(r, R_SCALE)
  const fDraw = scale3(F, F_SCALE)
  const tDraw = scale3(tau, T_SCALE)

  const panel = (() => {
    if (id === 'plane')
      return (
        <ReadoutPanel title="Plane">
          <Readout label="$\mathbf{p}$" value={comps(pp)} />
          <Readout label="$\mathbf{q}$" value={comps(qq)} />
          <Readout label="$\mathbf{r}$" value={comps(rr)} />
          <Readout
            label="$\mathbf{n}$"
            value={comps(n)}
            color={P_COLOR}
            hint="$(\mathbf{q} - \mathbf{p}) \times (\mathbf{r} - \mathbf{p})$, drawn at half its length."
          />
          <Readout
            label="Equation"
            value={
              nLen < 1e-9
                ? 'none: the points are on one line'
                : `${num(n[0])}x + ${num(n[1])}y + ${num(n[2])}z = ${num(d)}`.replace(/\+ −/g, '− ')
            }
            color={SET_COLOR}
            hint="$\mathbf{n} \cdot \mathbf{x} = \mathbf{n} \cdot \mathbf{p}$."
          />
        </ReadoutPanel>
      )
    if (id === 'torque')
      return (
        <ReadoutPanel title="Wrench">
          <Readout label="Handle $|\mathbf{r}|$" value={`${num(handle)} m`} color={V_COLOR} />
          <Readout label="Force $|\mathbf{F}|$" value={`${FORCE} N`} color={W_COLOR} />
          <Readout label="Angle $\theta$" value={`${Math.round(theta)}°`} />
          <Readout
            label="Torque $|\boldsymbol{\tau}|$"
            value={`${num(length3(tau))} N·m`}
            color={P_COLOR}
            hint="$|\mathbf{r}||\mathbf{F}|\sin\theta$, along the bolt."
          />
        </ReadoutPanel>
      )
    return (
      <ReadoutPanel title="Vectors">
        <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} {...hl.bind('v')} />
        <Readout label="$\mathbf{w}$" value={comps(w)} color={W_COLOR} {...hl.bind('w')} />
        {boxStep && (
          <Readout label="$\mathbf{x}$" value={comps(x)} color={X_COLOR} {...hl.bind('x')} />
        )}
        {id === 'volume' && (
          <>
            <Readout label="Base area" value={num(area)} />
            <Readout
              label="Height of $\mathbf{x}$"
              value={num(height)}
              hint="Signed: negative below the base, on the other side from $\mathbf{v} \times \mathbf{w}$."
            />
          </>
        )}
        {id === 'one-vector' &&
          (
            [
              ['\\hat{\\imath}', I],
              ['\\hat{\\jmath}', J],
              ['\\hat{k}', K],
            ] as const
          ).map(([name, e]) => (
            <Readout key={name} label={`$f(${name})$`} value={num(det3(v, w, e))} />
          ))}
        {showP && (
          <Readout label={`$${pLabel}$`} value={comps(p)} color={P_COLOR} {...hl.bind('p')} />
        )}
        {(id === 'geometry' || id === 'order') && (
          <>
            <Readout label="Area of the base" value={num(area)} color={VOLUME_COLOR} />
            <Readout label={`$|${pLabel}|$`} value={num(area)} color={P_COLOR} />
            <Readout
              label="Dot with $\mathbf{v}$, with $\mathbf{w}$"
              value={`${num(dot3(p, v))}, ${num(dot3(p, w))}`}
              hint="Both $0$: the cross product is perpendicular to the base."
            />
          </>
        )}
        {id === 'components' && (
          <>
            <Readout label="$v_2w_3 - v_3w_2$" value={num(p[0])} color={P_COLOR} />
            <Readout label="$v_3w_1 - v_1w_3$" value={num(p[1])} color={P_COLOR} />
            <Readout label="$v_1w_2 - v_2w_1$" value={num(p[2])} color={P_COLOR} />
          </>
        )}
        {id === 'triple' && (
          <>
            <Readout label="$|\mathbf{v} \times \mathbf{w}|$" value={num(area)} />
            <Readout label="Height of $\mathbf{x}$" value={num(height)} />
            <Readout
              label="$\mathbf{x} \cdot (\mathbf{v} \times \mathbf{w})$"
              value={num(dot3(x, p))}
              color={VOLUME_COLOR}
            />
          </>
        )}
        {boxStep && (
          <Readout
            label="$\det[\mathbf{v}\ \mathbf{w}\ \mathbf{x}]$"
            value={num(vol)}
            color={VOLUME_COLOR}
            hint="The signed volume of the box on $\mathbf{v}$, $\mathbf{w}$, $\mathbf{x}$."
          />
        )}
      </ReadoutPanel>
    )
  })()

  return (
    <>
      <Stage3D
        radius={2.6}
        highlight={hl}
        ariaLabel="Two vectors of space, the box they make with a third, and their cross product perpendicular to both"
        overlay={<Overlay corner="top-left">{panel}</Overlay>}
      >
        <Grid3D extent={3} />
        <Axes3D extent={3} />

        {vwStep && (
          <>
            {boxStep ? (
              <Cell3D m={fromColumns(v, w, x)} color={VOLUME_COLOR} fillOpacity={0.12} />
            ) : (
              <Cell3D m={fromColumns(v, w)} color={VOLUME_COLOR} fillOpacity={0.22} />
            )}
            {id === 'volume' && area > 1e-9 && (
              <Plane3D
                point={x}
                normal={p}
                size={1.1}
                color={X_COLOR}
                fillOpacity={0.08}
                gridOpacity={0}
              />
            )}
            {id === 'triple' && area > 1e-9 && (
              <>
                <Plane3D
                  normal={p}
                  size={1.6}
                  color={vc.fg}
                  fillOpacity={0.05}
                  gridOpacity={0.12}
                />
                <Segment3D from={foot} to={x} color={X_COLOR} width={1.5} dash="4 4" />
              </>
            )}
            {(id === 'geometry' || id === 'order') && (
              <TurnArc3D from={first} to={second} r={0.55} color={vc.fg} opacity={0.9} />
            )}
            {showP && area > 1e-6 && (
              <>
                <Vector3D to={p} color={P_COLOR} hoverKey="p" />
                <MathLabel3D at={p} tex={pLabel} color={P_COLOR} anchor="n" hoverKey="p" />
              </>
            )}
            {id === 'components' && <DropLines3D at={p} color={P_COLOR} />}
            <Pulse3D at={[0, 0, 0]} when={showP && area < 1e-6} color={P_COLOR} />
            <Pulse3D at={x} when={id === 'triple' && Math.abs(vol) < 1e-6} color={VOLUME_COLOR} />

            <Vector3D to={v} color={V_COLOR} hoverKey="v" />
            <MathLabel3D at={v} tex="\mathbf{v}" color={V_COLOR} anchor="se" hoverKey="v" />
            <Vector3D to={w} color={W_COLOR} hoverKey="w" />
            <MathLabel3D at={w} tex="\mathbf{w}" color={W_COLOR} anchor="e" hoverKey="w" />
            {boxStep && length3(x) > 0.1 && (
              <>
                <Vector3D to={x} color={X_COLOR} hoverKey="x" />
                <MathLabel3D at={x} tex="\mathbf{x}" color={X_COLOR} anchor="ne" hoverKey="x" />
              </>
            )}

            {dragVW && (
              <>
                <Point3D
                  at={v}
                  color={V_COLOR}
                  r={3.5}
                  label="Tip of v"
                  onDrag={(q) => setS((c) => ({ ...c, v: snap3(q) }))}
                />
                <Point3D
                  at={w}
                  color={W_COLOR}
                  r={3.5}
                  label="Tip of w"
                  onDrag={(q) => setS((c) => ({ ...c, w: snap3(q) }))}
                />
              </>
            )}
            {dragX && (
              <Point3D
                at={x}
                color={X_COLOR}
                r={3.5}
                label="Tip of x"
                onDrag={(q) => setS((c) => ({ ...c, x: snap3(q) }))}
              />
            )}
          </>
        )}

        {id === 'plane' && (
          <>
            {nLen > 1e-9 && (
              <Plane3D
                point={centroid}
                normal={n}
                size={1.8}
                color={SET_COLOR}
                fillOpacity={0.1}
                gridOpacity={0.15}
              />
            )}
            <Path3D
              points={[pp, qq, rr]}
              closed
              color={SET_COLOR}
              width={1.5}
              fill={alpha(SET_COLOR, 0.25)}
            />
            <Vector3D from={pp} to={qq} color={V_COLOR} />
            <Vector3D from={pp} to={rr} color={W_COLOR} />
            {nLen > 1e-9 && (
              <>
                <Vector3D from={centroid} to={add3(centroid, scale3(n, 0.5))} color={P_COLOR} />
                <MathLabel3D
                  at={add3(centroid, scale3(n, 0.5))}
                  tex="\mathbf{n}"
                  color={P_COLOR}
                  anchor="n"
                />
              </>
            )}
            {(
              [
                ['\\mathbf{p}', 0],
                ['\\mathbf{q}', 1],
                ['\\mathbf{r}', 2],
              ] as const
            ).map(([name, k]) => (
              <g key={k}>
                <MathLabel3D at={pts[k]} tex={name} color={vc.fg} anchor="sw" />
                <Point3D
                  at={pts[k]}
                  color={vc.fg}
                  r={3.5}
                  label={`Point ${name.slice(-2, -1)}`}
                  onDrag={
                    seq.running
                      ? undefined
                      : (q) =>
                          setPts((cur) => {
                            const next = [...cur] as [Vec3, Vec3, Vec3]
                            next[k] = snap3(q)
                            return next
                          })
                  }
                />
              </g>
            ))}
          </>
        )}

        {id === 'torque' && (
          <>
            <Path3D points={HEX} closed color={vc.muted} width={1.5} fill={alpha(vc.muted, 0.3)} />
            <Segment3D from={[0, 0, -0.6]} to={[0, 0, 0.3]} color={vc.muted} width={3} />
            {theta > 1 && <TurnArc3D from={r} to={F} r={0.6} color={vc.fg} opacity={0.8} />}
            <Vector3D to={rDraw} color={V_COLOR} width={4} />
            <MathLabel3D at={scale3(rDraw, 0.5)} tex="\mathbf{r}" color={V_COLOR} anchor="s" />
            <Vector3D from={rDraw} to={add3(rDraw, fDraw)} color={W_COLOR} />
            <MathLabel3D at={add3(rDraw, fDraw)} tex="\mathbf{F}" color={W_COLOR} anchor="e" />
            {length3(tDraw) > 0.05 && (
              <>
                <Vector3D to={tDraw} color={P_COLOR} />
                <MathLabel3D at={tDraw} tex="\boldsymbol{\tau}" color={P_COLOR} anchor="n" />
              </>
            )}
            <Pulse3D at={[0, 0, 0]} when={length3(tau) < 1e-6} color={P_COLOR} />
          </>
        )}
      </Stage3D>

      {id === 'order' && (
        <VizControls>
          <SegmentedControl
            value={order}
            onChange={(o) => {
              seq.cancel()
              setOrder(o)
            }}
            options={ORDERS}
            label="Order of the factors"
          />
        </VizControls>
      )}
      {id === 'torque' && (
        <VizControls>
          <LabeledSlider
            label="Handle length (m)"
            value={handle}
            onChange={(h) => {
              seq.cancel()
              setHandle(h)
            }}
            min={0.1}
            max={0.4}
            step={0.05}
          />
          <LabeledSlider
            label="Angle $\theta$ of the force"
            value={theta}
            onChange={(t) => {
              seq.cancel()
              setTheta(t)
            }}
            min={0}
            max={180}
            step={5}
            format={(t) => `${Math.round(t)}°`}
          />
        </VizControls>
      )}
    </>
  )
}
