import {
  add3,
  dot3,
  fmtPoint3,
  fmtShort,
  length3,
  lerp3,
  scale3,
  sub3,
  type Vec3,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes3D,
  edgeOnCamera,
  Grid3D,
  Line3D,
  MathLabel3D,
  numbersCodec,
  Overlay,
  Plane3D,
  Point3D,
  Path3D,
  Pulse3D,
  Stage3D,
  useHighlight,
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  Vector3D,
  VizControls,
} from '@/viz-kit'

const V_COLOR = vc.blue
const W_COLOR = vc.yellow
const N_COLOR = vc.orange
const SET_COLOR = vc.teal

/** The line of the first two steps: (2, -1, 0) + t(-1, 2, 1). */
const LINE_P: Vec3 = [2, -1, 0]
const LINE_V: Vec3 = [-1, 2, 1]

/** The plane x + 2y + 2z = 6 through P along V and W, with normal N. */
const P: Vec3 = [2, 0, 2]
const V: Vec3 = [2, -1, 0]
const W: Vec3 = [0, 1, -1]
const N: Vec3 = [1, 2, 2]
/**
 * Where x starts: p - v/2 + w = (1, 1.5, 1), close to p (inside the plane patch) and in a
 * direction where the right angle with n reads well from the home view.
 */
const X0 = add3(sub3(P, scale3(V, 0.5)), W)
const D0 = dot3(N, P)
const N2 = dot3(N, N)

const paramsCodec = numbersCodec(['s', 't', 'd'])
const xyz = numbersCodec(['x', 'y', 'z'])
const toVec = (p: { x: number; y: number; z: number }): Vec3 => [p.x, p.y, p.z]
const fromVec = ([x, y, z]: Vec3) => ({ x, y, z })

const comps = (p: Vec3) => fmtPoint3(p)
const num = (x: number) => fmtShort(x, 2)

/** Snaps a dragged coordinate to the nearest whole or half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.12 ? r : v
}

export default function LinesAndPlanes() {
  const { id } = useVizStep()
  const [params, setParams] = useVizParam('std', { s: 0, t: 1, d: D0 }, paramsCodec)
  const [xp, setXp] = useVizParam('x', fromVec(X0), xyz)
  // How far the line's base point has moved toward the origin (0: at p, 1: at the origin).
  const [toOrigin, setToOrigin] = useVizParam<number>('o', 0)
  const seq = useSequence()
  const hl = useHighlight()
  const { s, t, d } = params
  const x = toVec(xp)

  const lineStep = id === 'line' || id === 'shifted-span'
  const base = lineStep ? lerp3(LINE_P, [0, 0, 0], toOrigin) : P
  // In the last step the plane is n · x = d: P moved along n so that n · base = d.
  const planeBase = id === 'through-origin' ? add3(P, scale3(N, (d - D0) / N2)) : P

  useStepEffect({
    line: () =>
      void seq.run(async ({ tween, wait }) => {
        setToOrigin(0)
        await wait(0.4)
        await tween(t, -1.5, { duration: 1.4, onUpdate: (v) => setParams({ s, t: v, d }) })
        await tween(-1.5, 2, { duration: 2.2, onUpdate: (v) => setParams({ s, t: v, d }) })
      }),
    'shifted-span': () =>
      void seq.run(async ({ tween, wait }) => {
        setParams({ s, t: 1, d })
        await wait(0.4)
        await tween(0, 1, { duration: 1.8, onUpdate: setToOrigin })
        await wait(1.2)
        await tween(1, 0, { duration: 1.8, onUpdate: setToOrigin })
      }),
    plane: () =>
      void seq.run(async ({ tween, wait }) => {
        await wait(0.3)
        await tween(0, 1, {
          duration: 2.2,
          onUpdate: (v) => setParams({ s: -1 + 2 * v, t: 1 - 2 * v, d: D0 }),
        })
        await tween(0, 1, {
          duration: 1.4,
          onUpdate: (v) => setParams({ s: 1 - 0.5 * v, t: -1 + 2 * v, d: D0 }),
        })
      }),
    normal: () => seq.cancel(),
    equation: () => seq.cancel(),
    'through-origin': () =>
      void seq.run(async ({ tween, wait }) => {
        await wait(0.4)
        await tween(D0, 0, { duration: 2, onUpdate: (v) => setParams({ s: 0, t: 0, d: v }) })
        await wait(1)
        await tween(0, 3, { duration: 1.6, onUpdate: (v) => setParams({ s: 0, t: 0, d: v }) })
      }),
  })

  const setParam = (key: 's' | 't' | 'd') => (v: number) => {
    seq.cancel()
    setParams({ ...params, [key]: v })
  }
  const setLift = (v: number) => {
    seq.cancel()
    setToOrigin(v)
  }
  const dragX = (q: Vec3) => {
    seq.cancel()
    // Snap the coordinates when the snapped point is still on the plane.
    const snapped: Vec3 = [snap(q[0]), snap(q[1]), snap(q[2])]
    setXp(fromVec(Math.abs(dot3(N, snapped) - D0) < 1e-9 ? snapped : q))
  }

  const linePoint = add3(base, scale3(LINE_V, t))
  const planePoint = add3(planeBase, add3(scale3(V, s), scale3(W, t)))
  const xRel = sub3(x, P)
  const showX = id === 'normal' || id === 'equation'
  const planeStep = !lineStep

  return (
    <>
      <Stage3D
        radius={4.6}
        views={lineStep ? [] : [{ label: 'Along the plane', camera: edgeOnCamera(N, 1.2) }]}
        highlight={hl}
        ariaLabel="A line and a plane in space, given by a point and directions or by a normal vector"
        overlay={
          <Overlay corner="top-left">
            {lineStep && (
              <ReadoutPanel title="Line">
                <Readout label="$\mathbf{p}$" value={comps(base)} />
                <Readout
                  label="$\mathbf{v}$"
                  value={comps(LINE_V)}
                  color={V_COLOR}
                  {...hl.bind('v')}
                />
                <Readout label="$t$" value={num(t)} />
                <Readout
                  label="$\mathbf{p} + t\mathbf{v}$"
                  value={comps(linePoint)}
                  color={SET_COLOR}
                  {...hl.bind('point')}
                />
              </ReadoutPanel>
            )}
            {(id === 'plane' || id === 'through-origin') && (
              <ReadoutPanel title="Plane">
                <Readout label="$\mathbf{p}$" value={comps(planeBase)} />
                <Readout label="$\mathbf{v}$" value={comps(V)} color={V_COLOR} {...hl.bind('v')} />
                <Readout label="$\mathbf{w}$" value={comps(W)} color={W_COLOR} {...hl.bind('w')} />
                {id === 'plane' && (
                  <Readout
                    label="$\mathbf{p} + s\mathbf{v} + t\mathbf{w}$"
                    value={comps(planePoint)}
                    color={SET_COLOR}
                    {...hl.bind('point')}
                  />
                )}
                {id === 'through-origin' && (
                  <>
                    <Readout label="equation" value={`x + 2y + 2z = ${num(d)}`} color={SET_COLOR} />
                    <Readout
                      label="through the origin"
                      value={Math.abs(d) < 1e-6 ? 'yes, a span' : 'no'}
                      hint="The origin satisfies the equation only when $d = 0$."
                    />
                  </>
                )}
              </ReadoutPanel>
            )}
            {showX && (
              <ReadoutPanel title="Normal form">
                <Readout label="$\mathbf{n}$" value={comps(N)} color={N_COLOR} {...hl.bind('n')} />
                <Readout
                  label="$\mathbf{x}$"
                  value={comps(x)}
                  color={SET_COLOR}
                  {...hl.bind('x')}
                />
                <Readout label="$\mathbf{x} - \mathbf{p}$" value={comps(xRel)} />
                <Readout
                  label="$\mathbf{n} \cdot (\mathbf{x} - \mathbf{p})$"
                  value={num(dot3(N, xRel))}
                  hint="Zero exactly when $\mathbf{x}$ is on the plane."
                />
                {id === 'equation' && (
                  <Readout
                    label="$x + 2y + 2z$"
                    value={num(dot3(N, x))}
                    color={SET_COLOR}
                    hint="Equal to $\mathbf{n} \cdot \mathbf{p} = 6$ on the plane."
                  />
                )}
              </ReadoutPanel>
            )}
          </Overlay>
        }
      >
        <Grid3D extent={4} />
        <Axes3D extent={4} />

        {lineStep && (
          <>
            {toOrigin > 0.01 && (
              <Line3D direction={LINE_V} color={SET_COLOR} width={1.5} opacity={0.3} dash="4 6" />
            )}
            <Line3D
              through={base}
              direction={LINE_V}
              color={SET_COLOR}
              width={2}
              opacity={0.8}
              hoverKey="set"
            />
            <Vector3D from={base} to={add3(base, LINE_V)} color={V_COLOR} hoverKey="v" />
            <MathLabel3D
              at={add3(base, LINE_V)}
              tex="\mathbf{v}"
              color={V_COLOR}
              hoverKey="v"
              anchor="se"
            />
            {toOrigin > 0.01 && <Vector3D to={base} color={vc.fg} width={2} opacity={0.6} />}
            <Point3D at={base} color={vc.fg} />
            <MathLabel3D at={base} tex="\mathbf{p}" anchor="nw" />
            <Point3D at={linePoint} color={SET_COLOR} hoverKey="point" />
            <Pulse3D at={[0, 0, 0]} when={toOrigin > 0.999} color={SET_COLOR} />
          </>
        )}

        {planeStep && (
          <>
            {id === 'through-origin' && (
              <Plane3D
                basis={[V, W]}
                size={1.8}
                color={SET_COLOR}
                fillOpacity={0.04}
                gridOpacity={0}
                opacity={0.8}
              />
            )}
            <Plane3D
              point={planeBase}
              basis={[V, W]}
              size={1.8}
              color={SET_COLOR}
              fillOpacity={0.14}
              gridOpacity={0.35}
              hoverKey="set"
            />
            <Vector3D from={planeBase} to={add3(planeBase, V)} color={V_COLOR} hoverKey="v" />
            <Vector3D from={planeBase} to={add3(planeBase, W)} color={W_COLOR} hoverKey="w" />
            <MathLabel3D
              at={add3(planeBase, V)}
              tex="\mathbf{v}"
              color={V_COLOR}
              hoverKey="v"
              anchor="se"
            />
            <MathLabel3D
              at={add3(planeBase, W)}
              tex="\mathbf{w}"
              color={W_COLOR}
              hoverKey="w"
              anchor="sw"
            />
            {(showX || id === 'through-origin') && (
              <>
                <Vector3D
                  from={planeBase}
                  to={add3(planeBase, N)}
                  color={N_COLOR}
                  width={2.5}
                  hoverKey="n"
                />
                <MathLabel3D
                  at={add3(planeBase, N)}
                  tex="\mathbf{n}"
                  color={N_COLOR}
                  anchor="ne"
                  hoverKey="n"
                />
              </>
            )}
            {showX && (
              <>
                <Path3D
                  points={[
                    add3(P, scale3(N, 0.3 / Math.sqrt(N2))),
                    add3(
                      add3(P, scale3(N, 0.3 / Math.sqrt(N2))),
                      scale3(xRel, 0.3 / Math.max(length3(xRel), 1e-9)),
                    ),
                    add3(P, scale3(xRel, 0.3 / Math.max(length3(xRel), 1e-9))),
                  ]}
                  color={vc.fg}
                  width={1.5}
                  opacity={length3(xRel) > 0.3 ? 0.8 : 0}
                />
                <Vector3D from={P} to={x} color={SET_COLOR} width={2.5} hoverKey="x" />
                <Point3D
                  at={x}
                  color={SET_COLOR}
                  onDrag={dragX}
                  dragPlane={{ normal: N, point: P }}
                  label="Point x on the plane"
                  hoverKey="x"
                />
                <MathLabel3D
                  at={x}
                  tex="\mathbf{x}"
                  color={SET_COLOR}
                  hoverKey="x"
                  anchor="e"
                  offset={12}
                />
              </>
            )}
            {id === 'plane' && <Point3D at={planePoint} color={SET_COLOR} hoverKey="point" />}
            {id === 'through-origin' && (
              <Pulse3D at={[0, 0, 0]} when={Math.abs(d) < 1e-6} color={SET_COLOR} />
            )}
            <Point3D at={planeBase} color={vc.fg} />
            <MathLabel3D at={planeBase} tex="\mathbf{p}" anchor="nw" offset={10} />
          </>
        )}
      </Stage3D>

      <VizControls>
        {lineStep && (
          <LabeledSlider
            label="$t$"
            value={t}
            onChange={setParam('t')}
            min={-2.5}
            max={2.5}
            step={0.1}
            format={num}
            color={SET_COLOR}
          />
        )}
        {id === 'shifted-span' && (
          <LabeledSlider
            label="$\mathbf{p} \to \mathbf{0}$"
            value={toOrigin}
            onChange={setLift}
            min={0}
            max={1}
            step={0.05}
            format={num}
          />
        )}
        {id === 'plane' && (
          <>
            <LabeledSlider
              label="$s$"
              value={s}
              onChange={setParam('s')}
              min={-1.5}
              max={1.5}
              step={0.1}
              format={num}
              color={V_COLOR}
            />
            <LabeledSlider
              label="$t$"
              value={t}
              onChange={setParam('t')}
              min={-1.5}
              max={1.5}
              step={0.1}
              format={num}
              color={W_COLOR}
            />
          </>
        )}
        {id === 'through-origin' && (
          <LabeledSlider
            label="$d$"
            value={d}
            onChange={setParam('d')}
            min={-6}
            max={9}
            step={0.5}
            format={num}
            color={SET_COLOR}
          />
        )}
      </VizControls>
    </>
  )
}
