import {
  angle,
  cross,
  dot,
  fmtPoint,
  fmtShort,
  fromPolar,
  length,
  lerpVec,
  scale,
  type Vec2,
} from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Arc,
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
  useSequence,
  useStepEffect,
  useVizParam,
  useVizStep,
  Vector,
} from '@/viz-kit'

const V_COLOR = vc.blue
const W_COLOR = vc.yellow
const SHADOW_COLOR = vc.teal

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
const num = (x: number) => fmtShort(x, 2)
/** A number inside a product, in parentheses when negative. */
const factor = (x: number) => (x < 0 ? `(${num(x)})` : num(x))
const degrees = (rad: number) => `${fmtShort((rad * 180) / Math.PI, 1)}°`

/** Word counts of three documents: mentions of "match" and of "election". */
const DOCS: readonly { name: string; at: Vec2 }[] = [
  { name: 'long sports article', at: [8, 2] },
  { name: 'short sports article', at: [3, 1] },
  { name: 'politics article', at: [1, 5] },
]

const cosine = (a: Vec2, b: Vec2) => dot(a, b) / (length(a) * length(b))

export default function DotProduct() {
  const { id } = useVizStep()
  const [vp, setVp] = useVizParam('v', { x: 3, y: 1 }, xy)
  const [wp, setWp] = useVizParam('w', { x: 1, y: 2 }, xy)
  const [qp, setQp] = useVizParam('q', { x: 2, y: 4 }, xy)
  const seq = useSequence()

  const v = toVec(vp)
  const w = toVec(wp)
  const q = toVec(qp)

  /** Moves w to `to` along a straight path. */
  const moveW = (to: Vec2, duration = 1.4) => {
    const from = w
    return seq.run(({ tween }) =>
      tween(0, 1, { duration, onUpdate: (t) => setWp(fromVec(lerpVec(from, to, t))) }),
    )
  }

  useStepEffect({
    components: () => seq.cancel(),
    projection: () =>
      void seq.run(async ({ tween, wait }) => {
        const from = w
        const to: Vec2 = [-2, 2]
        await wait(0.6)
        await tween(0, 1, { duration: 2, onUpdate: (t) => setWp(fromVec(lerpVec(from, to, t))) })
        await wait(0.4)
        await tween(0, 1, {
          duration: 1.6,
          onUpdate: (t) => setWp(fromVec(lerpVec(to, [2, 2], t))),
        })
      }),
    angle: () =>
      void seq.run(async ({ tween }) => {
        // One full turn of w around the origin, keeping its length.
        const r = length(w) || 2
        const a0 = angle(w)
        await tween(0, 2 * Math.PI, {
          duration: 5,
          onUpdate: (t) => setWp(fromVec(fromPolar(r, a0 + t))),
        })
      }),
    orthogonal: () => {
      setVp({ x: 3, y: 1 })
      void moveW([-1, 3])
    },
    bound: () =>
      void seq.run(async ({ tween, wait }) => {
        setVp({ x: 3, y: 1 })
        const from = w
        const to: Vec2 = [0, 2]
        await tween(0, 1, { duration: 1.2, onUpdate: (t) => setWp(fromVec(lerpVec(from, to, t))) })
        await wait(0.4)
        // Turn w onto the line of v, where the shadow is the whole of w.
        const r = length(to)
        const a0 = angle(to)
        const a1 = angle(v)
        await tween(0, 1, {
          duration: 2,
          onUpdate: (t) => setWp(fromVec(fromPolar(r, a0 + (a1 - a0) * t))),
        })
      }),
    similarity: () => seq.cancel(),
  })

  const dragV = (p: Vec2) => {
    seq.cancel()
    setVp(fromVec(snapVec(p)))
  }
  const dragW = (p: Vec2) => {
    seq.cancel()
    setWp(fromVec(snapVec(p)))
  }
  const dragQ = (p: Vec2) => {
    seq.cancel()
    setQp(fromVec(snapVec(p)))
  }

  const lv = length(v)
  const lw = length(w)
  const d = dot(v, w)
  // Signed length of the shadow of w on the line of v, and the shadow itself.
  const shadow = lv > 1e-9 ? d / lv : 0
  const proj = lv > 1e-9 ? scale(v, d / (lv * lv)) : ([0, 0] as Vec2)
  // Signed angle from v to w, in (-pi, pi].
  const turn = Math.atan2(cross(v, w), d)
  const theta = Math.abs(turn)
  const degenerate = lv < 1e-9 || lw < 1e-9
  const isOrthogonal = !degenerate && Math.abs(d) < 1e-6

  const similarity = id === 'similarity'
  const showShadow = id === 'projection' || id === 'bound'
  const showAngle = id === 'angle' || id === 'orthogonal'

  const domain = similarity
    ? { x: [-1.5, 10] as const, y: [-1, 7] as const }
    : { x: [-4.5, 5.5] as const, y: [-2.5, 4] as const }

  /** Small square at the origin marking the right angle between v and w. */
  const rightAngle = () => {
    const s = 0.32
    const a = scale(v, s / lv)
    const b = scale(w, s / lw)
    return (
      <Path points={[a, [a[0] + b[0], a[1] + b[1]], b]} color={vc.fg} width={1.5} opacity={0.8} />
    )
  }

  const best = DOCS.reduce(
    (bi, doc, i) => (cosine(q, doc.at) > cosine(q, DOCS[bi]!.at) ? i : bi),
    0,
  )

  return (
    <Stage
      zoomable
      domain={domain}
      ariaLabel="Two vectors in the plane and their dot product"
      overlay={
        <Overlay corner="top-left">
          {!similarity && (
            <ReadoutPanel title="Dot product">
              <Readout label="$\mathbf{v}$" value={comps(v)} color={V_COLOR} />
              <Readout label="$\mathbf{w}$" value={comps(w)} color={W_COLOR} />
              {id === 'components' && (
                <Readout
                  label="$v_1 w_1 + v_2 w_2$"
                  value={`${factor(v[0])}·${factor(w[0])} + ${factor(v[1])}·${factor(w[1])}`}
                  hint="First components multiplied, plus second components multiplied."
                />
              )}
              {showShadow && (
                <>
                  <Readout
                    label="shadow"
                    value={num(shadow)}
                    color={SHADOW_COLOR}
                    hint="Signed length of the shadow of $\mathbf{w}$ on the line of $\mathbf{v}$: negative when it points away from $\mathbf{v}$."
                  />
                  <Readout label="$\lVert \mathbf{v} \rVert$" value={num(lv)} color={V_COLOR} />
                </>
              )}
              {showAngle && (
                <>
                  <Readout
                    label="$\lVert \mathbf{v} \rVert \lVert \mathbf{w} \rVert$"
                    value={num(lv * lw)}
                  />
                  <Readout label="$\theta$" value={degenerate ? 'undefined' : degrees(theta)} />
                  <Readout
                    label="$\cos\theta$"
                    value={degenerate ? 'undefined' : num(Math.cos(theta))}
                  />
                </>
              )}
              {id === 'bound' && (
                <Readout
                  label="$\lVert \mathbf{v} \rVert \lVert \mathbf{w} \rVert$"
                  value={num(lv * lw)}
                  hint="The largest value $\lvert \mathbf{v} \cdot \mathbf{w} \rvert$ can take for these lengths."
                />
              )}
              <Readout
                label="$\mathbf{v} \cdot \mathbf{w}$"
                value={isOrthogonal ? '0, orthogonal' : num(d)}
                hint={
                  id === 'components'
                    ? undefined
                    : 'Computed from the components, $v_1 w_1 + v_2 w_2$, and equal to the product above.'
                }
              />
            </ReadoutPanel>
          )}
          {similarity && (
            <ReadoutPanel title="Cosine similarity to q">
              <Readout label="$\mathbf{q}$" value={comps(q)} color={W_COLOR} />
              {DOCS.map((doc, i) => (
                <Readout
                  key={doc.name}
                  label={doc.name}
                  value={length(q) < 1e-9 ? 'undefined' : fmtShort(cosine(q, doc.at), 3)}
                  color={i === best ? V_COLOR : undefined}
                  hint={`Counts ${comps(doc.at)}. The score is $\\frac{\\mathbf{q} \\cdot \\mathbf{d}}{\\lVert \\mathbf{q} \\rVert \\lVert \\mathbf{d} \\rVert}$.`}
                />
              ))}
            </ReadoutPanel>
          )}
        </Overlay>
      }
    >
      <Grid />
      <Axes />

      {!similarity && (
        <>
          {showShadow && !degenerate && (
            <>
              <Segment from={[0, 0]} to={v} extend color={vc.muted} width={1} dash="3 6" />
              <Segment from={w} to={proj} color={vc.muted} width={1.5} dash="4 5" />
              <Vector to={proj} color={SHADOW_COLOR} width={5} opacity={0.75} />
              <MathLabel
                at={proj}
                tex="\text{shadow}"
                color={SHADOW_COLOR}
                anchor={shadow >= 0 ? 'se' : 'sw'}
                offset={10}
                size={13}
              />
            </>
          )}
          {showAngle && !degenerate && (
            <>
              {isOrthogonal ? (
                rightAngle()
              ) : (
                <Arc
                  r={0.7}
                  from={angle(v)}
                  to={angle(v) + turn}
                  color={vc.fg}
                  width={1.5}
                  fill={vc.fg}
                  fillOpacity={0.08}
                />
              )}
              <MathLabel at={fromPolar(1.05, angle(v) + turn / 2)} tex="\theta" size={14} />
            </>
          )}
          <Vector to={v} color={V_COLOR} />
          <Vector to={w} color={W_COLOR} />
          {showAngle && <Pulse at={[0, 0]} when={isOrthogonal} />}
          <Point at={v} color={V_COLOR} onDrag={dragV} label="Tip of v" />
          <Point at={w} color={W_COLOR} onDrag={dragW} label="Tip of w" />
          <MathLabel at={v} tex="\mathbf{v}" color={V_COLOR} anchor="ne" offset={10} />
          <MathLabel at={w} tex="\mathbf{w}" color={W_COLOR} anchor="nw" offset={10} />
        </>
      )}

      {similarity && (
        <>
          {DOCS.map((doc, i) => (
            <g key={doc.name}>
              <Vector
                to={doc.at}
                color={i === best ? V_COLOR : vc.muted}
                width={i === best ? 3 : 2}
                opacity={i === best ? 1 : 0.7}
              />
              <MathLabel
                at={doc.at}
                tex={`\\mathbf{d}_${i + 1}`}
                color={i === best ? V_COLOR : vc.muted}
                anchor={i === 1 ? 'se' : 'ne'}
                offset={8}
              />
            </g>
          ))}
          <Vector to={q} color={W_COLOR} />
          <Point at={q} color={W_COLOR} onDrag={dragQ} label="Tip of the query q" />
          <MathLabel at={q} tex="\mathbf{q}" color={W_COLOR} anchor="se" offset={10} />
          <TextLabel at={[9.6, -0.5]} align="end" color={vc.muted}>
            match
          </TextLabel>
          <TextLabel at={[-0.2, 5.5]} align="end" color={vc.muted}>
            election
          </TextLabel>
        </>
      )}
    </Stage>
  )
}
