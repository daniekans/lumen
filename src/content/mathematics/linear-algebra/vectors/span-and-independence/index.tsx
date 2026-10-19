import { useRef, useState } from 'react'
import {
  add3,
  cross3,
  dot3,
  fmtPoint3,
  fmtShort,
  length3,
  lerp3,
  scale3,
  spanDimension3,
  sub3,
  type Vec3,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Axes3D,
  defaultCamera,
  edgeOnCamera,
  Grid3D,
  Line3D,
  MathLabel3D,
  numbersCodec,
  Overlay,
  Plane3D,
  Point3D,
  Pulse3D,
  Stage3D,
  useHighlight,
  useSequence,
  useStepEffect,
  useStepStart,
  useVizParam,
  useVizStep,
  Vector3D,
  VizControls,
  type Camera,
  type SequenceContext,
} from '@/viz-kit'

const V_COLOR = vc.blue
const W_COLOR = vc.yellow
const SPAN_COLOR = vc.teal
const U_COLOR = vc.fg

const V: Vec3 = [1, 2, 0]
const W: Vec3 = [-1, 0, 2]
/** Normal of the plane spanned by v and w: v × w = (4, -2, 2). */
const N = cross3(V, W)
const U_IN = add3(V, W)
const U_OUT: Vec3 = [2, -1, 2]

const weightsCodec = numbersCodec(['a', 'b', 'c'])
const xyz = numbersCodec(['x', 'y', 'z'])
const toVec = (p: { x: number; y: number; z: number }): Vec3 => [p.x, p.y, p.z]
const fromVec = ([x, y, z]: Vec3) => ({ x, y, z })

/** Snaps a dragged coordinate to the nearest whole or half unit when it is close to it. */
const snap = (v: number) => {
  const r = Math.round(v * 2) / 2
  return Math.abs(r - v) < 0.15 ? r : v
}
/** Distance from the plane of v and w below which a dragged u lands on it. */
const PLANE_SNAP = 0.2
const snapU = (p: Vec3): Vec3 => {
  const s: Vec3 = [snap(p[0]), snap(p[1]), snap(p[2])]
  const off = dot3(s, N) / length3(N)
  return Math.abs(off) < PLANE_SNAP ? sub3(s, scale3(N, off / length3(N))) : s
}

const EDGE_CAMERA = edgeOnCamera(N, 1.33)

const lerpCamera = (from: Camera, to: Camera, t: number): Camera => ({
  azimuth: from.azimuth + (to.azimuth - from.azimuth) * t,
  elevation: from.elevation + (to.elevation - from.elevation) * t,
  zoom: from.zoom + (to.zoom - from.zoom) * t,
})

const comps = (p: Vec3) => fmtPoint3(p)
const num = (x: number) => fmtShort(x, 2)
const SPAN_NAMES = ['the origin', 'a line', 'a plane', 'all of space'] as const

export default function SpanAndIndependence() {
  const { id } = useVizStep()
  const [weights, setWeights] = useVizParam('abc', { a: 1, b: 1, c: 0 }, weightsCodec)
  const [up, setUp] = useVizParam('u', fromVec(id === 'space' ? U_OUT : U_IN), xyz)
  const [camera, setCamera] = useState<Camera>(defaultCamera)
  const seq = useSequence()
  const hl = useHighlight()
  const { a, b, c } = weights
  const u = toVec(up)
  // True while the camera is where a step's script put it, so the next step brings it home.
  const scripted = useRef(false)

  const cameraTo = (
    to: Camera,
    duration: number,
    { tween }: SequenceContext,
    from: Camera = camera,
  ) => {
    scripted.current = true
    return tween(0, 1, { duration, onUpdate: (t) => setCamera(lerpCamera(from, to, t)) })
  }
  /** Returns a scripted camera to the home view; a view the learner chose stays. */
  const cameraHome = async (ctx: SequenceContext, from: Camera = camera) => {
    if (!scripted.current) return
    await cameraTo(defaultCamera, 0.8, ctx, from)
    scripted.current = false
  }

  const start = useStepStart({ camera, u })
  useStepEffect({
    one: () =>
      void seq.run(async (ctx) => {
        const { tween, wait } = ctx
        await cameraHome(ctx)
        setWeights({ a: 1, b: 0, c: 0 })
        await wait(0.4)
        await tween(1, -1.5, { duration: 1.6, onUpdate: (t) => setWeights({ a: t, b: 0, c: 0 }) })
        await tween(-1.5, 1.5, { duration: 2, onUpdate: (t) => setWeights({ a: t, b: 0, c: 0 }) })
      }),
    two: () =>
      void seq.run(async (ctx) => {
        const { tween, wait } = ctx
        await cameraHome(ctx)
        await wait(0.3)
        await tween(0, 1, {
          duration: 2.4,
          onUpdate: (t) => setWeights({ a: 1.5 - 2.5 * t, b: -1 + 2 * t, c: 0 }),
        })
        await tween(0, 1, {
          duration: 1.4,
          onUpdate: (t) => setWeights({ a: -1 + 2 * t, b: 1 - 0.5 * t, c: 0 }),
        })
      }),
    'in-plane': () =>
      void seq.run(async (ctx) => {
        setUp(fromVec(U_IN))
        setWeights({ a: 0, b: 0, c: 1 })
        await ctx.wait(0.6)
        await cameraTo(EDGE_CAMERA, 2, ctx)
        await ctx.wait(1.6)
        // The camera object captured above is stale now, so go home from the edge-on view.
        scripted.current = true
        await ctx.tween(0, 1, {
          duration: 1.6,
          onUpdate: (t) => setCamera(lerpCamera(EDGE_CAMERA, defaultCamera, t)),
        })
        scripted.current = false
      }),
    redundant: (run) => {
      setUp(fromVec(U_IN))
      // A replay puts the camera back where the step found it, so the return home plays again.
      const from = start(run).camera
      if (run.replay && from !== camera) {
        setCamera(from)
        scripted.current = true
      }
      if (scripted.current) void seq.run((ctx) => cameraHome(ctx, from))
    },
    space: (run) =>
      void seq.run(async (ctx) => {
        const { tween, wait } = ctx
        await cameraHome(ctx)
        const from = start(run).u
        setWeights({ a: 0, b: 0, c: 0 })
        await tween(0, 1, {
          duration: 1.4,
          onUpdate: (t) => setUp(fromVec(lerp3(from, U_OUT, t))),
        })
        await wait(0.3)
        await tween(0, 1.2, { duration: 1.4, onUpdate: (t) => setWeights({ a: 0, b: 0, c: t }) })
        await tween(1.2, -1, { duration: 2, onUpdate: (t) => setWeights({ a: 0, b: 0, c: t }) })
        await tween(-1, 0.6, { duration: 1.4, onUpdate: (t) => setWeights({ a: 0, b: 0, c: t }) })
      }),
  })

  const setWeight = (key: 'a' | 'b' | 'c') => (x: number) => {
    seq.cancel()
    setWeights({ ...weights, [key]: x })
  }
  const dragU = (p: Vec3) => {
    seq.cancel()
    setUp(fromVec(snapU(p)))
  }
  const orbit = (next: Camera) => {
    seq.cancel()
    scripted.current = false
    setCamera(next)
  }

  const one = id === 'one'
  const withU = id === 'in-plane' || id === 'redundant' || id === 'space'
  const withC = id === 'in-plane' || id === 'space'
  const vectors = one ? [V] : withU ? [V, W, u] : [V, W]
  const dim = spanDimension3(vectors, 1e-6)
  const uInPlane = Math.abs(dot3(u, N)) < 1e-6 * length3(N)

  const av = scale3(V, a)
  const avbw = add3(av, scale3(W, one ? 0 : b))
  const tip = add3(avbw, scale3(u, withC ? c : 0))

  return (
    <>
      <Stage3D
        radius={4.2}
        camera={camera}
        onCameraChange={orbit}
        // The edge-on view must stay exact while it shows u lying in the plane.
        sway={id !== 'in-plane'}
        views={[{ label: 'Along the plane', camera: EDGE_CAMERA }]}
        highlight={hl}
        ariaLabel="Vectors in space and the line, plane or space they span"
        overlay={
          <Overlay corner="top-left">
            <ReadoutPanel title="Span">
              <Readout label="$\mathbf{v}$" value={comps(V)} color={V_COLOR} {...hl.bind('v')} />
              {!one && (
                <Readout label="$\mathbf{w}$" value={comps(W)} color={W_COLOR} {...hl.bind('w')} />
              )}
              {withU && (
                <Readout label="$\mathbf{u}$" value={comps(u)} color={U_COLOR} {...hl.bind('u')} />
              )}
              {id !== 'redundant' && (
                <Readout
                  label={
                    one
                      ? '$a\\mathbf{v}$'
                      : withC
                        ? '$a\\mathbf{v} + b\\mathbf{w} + c\\mathbf{u}$'
                        : '$a\\mathbf{v} + b\\mathbf{w}$'
                  }
                  value={comps(tip)}
                  color={SPAN_COLOR}
                  {...hl.bind('combo')}
                />
              )}
              {id === 'redundant' && (
                <Readout
                  label="$\mathbf{v} + \mathbf{w} - \mathbf{u}$"
                  value={comps(sub3(add3(V, W), u))}
                  color={SPAN_COLOR}
                  hint="Weights $1$, $1$, $-1$, not all zero, give the zero vector: the set is dependent."
                />
              )}
              {withU && (
                <Readout
                  label="$\mathbf{u}$ in the plane"
                  value={uInPlane ? 'yes' : 'no'}
                  hint="$\mathbf{u}$ lies in the plane of $\mathbf{v}$ and $\mathbf{w}$ exactly when it is a combination of them. Drag its tip close to the plane and it lands on it."
                />
              )}
              <Readout
                label="span"
                value={SPAN_NAMES[dim]}
                color={SPAN_COLOR}
                hint="Everything the combinations reach."
                {...hl.bind('span')}
              />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid3D extent={4} />
        <Axes3D extent={4} />

        {one && <Line3D direction={V} color={SPAN_COLOR} width={2} opacity={0.7} hoverKey="span" />}
        {!one && (
          <Plane3D
            basis={[V, W]}
            size={1.5}
            color={SPAN_COLOR}
            fillOpacity={0.14}
            gridOpacity={0.4}
            hoverKey="span"
          />
        )}
        {id === 'space' && Math.abs(c) > 0.02 && (
          <Plane3D
            point={scale3(u, c)}
            basis={[V, W]}
            size={1.5}
            color={SPAN_COLOR}
            fillOpacity={0.06}
            gridOpacity={0.15}
          />
        )}

        {id !== 'redundant' && (
          <>
            {!one && <Vector3D to={av} color={V_COLOR} width={2} opacity={0.5} />}
            {!one && <Vector3D from={av} to={avbw} color={W_COLOR} width={2} opacity={0.5} />}
            {withC && Math.abs(c) > 0.02 && (
              <Vector3D from={avbw} to={tip} color={U_COLOR} width={2} opacity={0.5} />
            )}
            <Vector3D to={tip} color={SPAN_COLOR} width={3} hoverKey="combo" />
          </>
        )}

        {id === 'redundant' ? (
          <>
            <Vector3D to={V} color={V_COLOR} hoverKey="v" />
            <Vector3D from={V} to={add3(V, W)} color={W_COLOR} hoverKey="w" />
            <Vector3D from={u} to={[0, 0, 0]} color={U_COLOR} hoverKey="u" />
            <MathLabel3D
              at={scale3(V, 0.5)}
              tex="\mathbf{v}"
              color={V_COLOR}
              hoverKey="v"
              anchor="se"
            />
            <MathLabel3D
              at={add3(V, scale3(W, 0.5))}
              tex="\mathbf{w}"
              color={W_COLOR}
              hoverKey="w"
              anchor="e"
            />
            <MathLabel3D
              at={scale3(u, 0.5)}
              tex="-\mathbf{u}"
              color={U_COLOR}
              hoverKey="u"
              anchor="nw"
            />
          </>
        ) : (
          <>
            <Vector3D to={V} color={V_COLOR} hoverKey="v" />
            <MathLabel3D at={V} tex="\mathbf{v}" color={V_COLOR} hoverKey="v" anchor="se" />
            {!one && (
              <>
                <Vector3D to={W} color={W_COLOR} hoverKey="w" />
                <MathLabel3D at={W} tex="\mathbf{w}" color={W_COLOR} hoverKey="w" anchor="nw" />
              </>
            )}
            {withU && (
              <>
                <Vector3D to={u} color={U_COLOR} hoverKey="u" />
                <Point3D at={u} color={U_COLOR} onDrag={dragU} label="Tip of u" hoverKey="u" />
                <Pulse3D at={u} when={uInPlane} color={SPAN_COLOR} />
                <MathLabel3D at={u} tex="\mathbf{u}" color={U_COLOR} hoverKey="u" anchor="ne" />
              </>
            )}
          </>
        )}
        {id !== 'redundant' && <Point3D at={tip} color={SPAN_COLOR} r={4} hoverKey="combo" />}
      </Stage3D>

      <VizControls>
        {id !== 'redundant' && (
          <LabeledSlider
            label="$a$"
            value={a}
            onChange={setWeight('a')}
            min={-2}
            max={2}
            step={0.1}
            format={num}
            color={V_COLOR}
          />
        )}
        {!one && id !== 'redundant' && (
          <LabeledSlider
            label="$b$"
            value={b}
            onChange={setWeight('b')}
            min={-2}
            max={2}
            step={0.1}
            format={num}
            color={W_COLOR}
          />
        )}
        {withC && (
          <LabeledSlider
            label="$c$"
            value={c}
            onChange={setWeight('c')}
            min={-2}
            max={2}
            step={0.1}
            format={num}
          />
        )}
      </VizControls>
    </>
  )
}
