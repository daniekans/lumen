import { useState } from 'react'
import { clamp, range, type Vec2 } from '@/lib/math'
import { tex } from '@/lib/practice'
import { alpha, vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel, SegmentedControl } from '@/ui/molecules'
import {
  Grid,
  MathLabel,
  Overlay,
  Path,
  Stage,
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

/** Drawn length of x, in grid units. */
const X = 4
/** x in the difference of squares step, larger so the cut square fits. */
const XD = 5

type Kind = 'square' | 'strip' | 'unit'

interface Box {
  at: Vec2
  w: number
  h: number
}

interface Tile {
  kind: Kind
  from: Box
  to: Box
}

const color: Record<Kind, string> = { square: vc.blue, strip: vc.teal, unit: vc.yellow }

const box = (x: number, y: number, w: number, h: number): Box => ({ at: [x, y], w, h })

/** Tiles of (x + p)(x + q): the square, p strips on the right, q on top, a p by q block of units. */
const rectangle = (p: number, q: number) => [
  { kind: 'square' as const, box: box(0, 0, X, X) },
  ...range(p).map((i) => ({ kind: 'strip' as const, box: box(X + i, 0, 1, X) })),
  ...range(q).map((j) => ({ kind: 'strip' as const, box: box(0, X + j, X, 1) })),
  ...range(q).flatMap((j) =>
    range(p).map((i) => ({ kind: 'unit' as const, box: box(X + i, X + j, 1, 1) })),
  ),
]

/** The same tiles before arranging: strips standing in a row, units in rows of six. */
const loose = (p: number, q: number): Box[] => [
  box(0, 0, X, X),
  ...range(p + q).map((i) => box(X + 0.8 + i * 1.3, 0, 1, X)),
  ...range(p * q).map((k) => box(X + 0.8 + (k % 6) * 1.3, X + 0.9 + Math.floor(k / 6) * 1.3, 1, 1)),
]

const product = (p: number, q: number): Tile[] =>
  rectangle(p, q).map(({ kind, box }) => ({ kind, from: box, to: box }))

const factored = (p: number, q: number): Tile[] => {
  const start = loose(p, q)
  return rectangle(p, q).map(({ kind, box }, i) => ({ kind, from: start[i]!, to: box }))
}

/** 3x² + 6x: three squares and six strips, arranged as three columns of x² + 2x. */
const common: Tile[] = [
  ...range(3).map((c) => ({
    kind: 'square' as const,
    from: box(c * (X + 0.6), 0, X, X),
    to: box(c * X, 0, X, X),
  })),
  ...range(6).map((k) => ({
    kind: 'strip' as const,
    from: box((k % 3) * (X + 0.6), X + 0.9 + Math.floor(k / 3) * 1.5, X, 1),
    to: box((k % 3) * X, X + Math.floor(k / 3), X, 1),
  })),
]

const TRINOMIALS = [
  { p: 1, q: 2 },
  { p: 2, q: 2 },
  { p: 2, q: 3 },
  { p: 2, q: 4 },
  { p: 3, q: 4 },
] as const

const trinomial = (p: number, q: number) => tex.poly([1, p + q, p * q])
const binomial = (p: number, v = 'x') =>
  tex.sum([
    [1, v],
    [p, ''],
  ])
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (t: number) => t * t * (3 - 2 * t)

/** Each tile starts a little after the previous one, so the arrangement reads as a sequence. */
const stagger = (t: number, i: number, n: number) => {
  const d = n > 1 ? 0.5 / (n - 1) : 0
  return smooth(clamp((t - i * d) / 0.5, 0, 1))
}

const interpolate = (a: Box, b: Box, t: number): Box => ({
  at: [lerp(a.at[0], b.at[0], t), lerp(a.at[1], b.at[1], t)],
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
})

const corners = ({ at: [x, y], w, h }: Box, inset = 0.06): Vec2[] => [
  [x + inset, y + inset],
  [x + w - inset, y + inset],
  [x + w - inset, y + h - inset],
  [x + inset, y + h - inset],
]

function TilePath({ points, kind }: { points: Vec2[]; kind: Kind }) {
  return (
    <Path
      points={points}
      closed
      color={color[kind]}
      width={1.5}
      fill={alpha(color[kind], kind === 'square' ? 0.16 : 0.22)}
    />
  )
}

/** The strip cut from x² - q² turns a quarter turn about its center while moving on top. */
const movedStrip = (q: number, t: number): Vec2[] => {
  const start: Vec2 = [XD - q / 2, (XD - q) / 2]
  const end: Vec2 = [(XD - q) / 2, XD + q / 2]
  const c: Vec2 = [lerp(start[0], end[0], t), lerp(start[1], end[1], t)]
  const angle = (t * Math.PI) / 2
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
  const [hw, hh] = [q / 2 - 0.06, (XD - q) / 2 - 0.06]
  const local: Vec2[] = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ]
  return local.map(([dx, dy]) => [c[0] + dx * cos - dy * sin, c[1] + dx * sin + dy * cos])
}

type Arranged = 'loose' | 'rect'

export default function FactoringAsArea() {
  const { id } = useVizStep()
  const [p, setP] = useState(2)
  const [q, setQ] = useState(3)
  const [choice, setChoice] = useState(2)
  const [d, setD] = useState(2)
  const [t, setT] = useState(1)
  const [target, setTarget] = useState<Arranged>('rect')
  const seq = useSequence()

  const animate = (from: number, to: number, delay = 0) => {
    setTarget(to === 1 ? 'rect' : 'loose')
    setT(from)
    void seq.run(async ({ tween, wait }) => {
      if (delay) await wait(delay)
      await tween(from, to, { duration: 1.6, onUpdate: setT })
    })
  }

  useStepEffect({
    product: () => {
      seq.cancel()
      setT(1)
    },
    factor: () => animate(0, 1, 0.5),
    common: () => animate(0, 1, 0.5),
    difference: () => animate(0, 1, 0.6),
  })

  const toggle = (v: Arranged) => animate(t, v === 'rect' ? 1 : 0)
  const { p: fp, q: fq } = TRINOMIALS[choice]!

  const tiles = id === 'product' ? product(p, q) : id === 'factor' ? factored(fp, fq) : common
  const labels = clamp((t - 0.85) / 0.15, 0, 1)

  // Difference of squares: the cut square fades first, then the strip moves.
  const cut = clamp(t / 0.3, 0, 1)
  const move = smooth(clamp((t - 0.3) / 0.7, 0, 1))

  const [sp, sq] = id === 'product' ? [p, q] : [fp, fq]

  return (
    <>
      <Stage
        domain={{ x: [-1.2, 14.2], y: [-1.2, 9.2] }}
        ariaLabel="Algebra tiles arranged into rectangles whose sides are the factors"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {(id === 'product' || id === 'factor') && (
                <>
                  <Readout label="area" value={<Tex>{trinomial(sp, sq)}</Tex>} color={vc.blue} />
                  <Readout
                    label="sides"
                    value={<Tex>{`(${binomial(sp)})(${binomial(sq)})`}</Tex>}
                    color={vc.blue}
                  />
                </>
              )}
              {id === 'factor' &&
                range(fp * fq)
                  .map((i) => i + 1)
                  .filter((a) => (fp * fq) % a === 0 && a * a <= fp * fq)
                  .map((a) => {
                    const b = (fp * fq) / a
                    return (
                      <Readout
                        key={a}
                        label={`$${a} \\cdot ${b}$`}
                        value={<Tex>{`${a} + ${b} = ${a + b}`}</Tex>}
                        color={a + b === fp + fq ? vc.yellow : vc.muted}
                      />
                    )
                  })}
              {id === 'common' && (
                <Readout
                  label="area"
                  value={<Tex>{'3x^2 + 6x = 3x(x + 2)'}</Tex>}
                  color={vc.blue}
                />
              )}
              {id === 'difference' && (
                <Readout
                  label="area"
                  value={<Tex>{`x^2 - ${d * d} = (x + ${d})(x - ${d})`}</Tex>}
                  color={vc.blue}
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Grid />

        {id !== 'difference' &&
          tiles.map((tile, i) => (
            <TilePath
              key={`${id}-${i}`}
              kind={tile.kind}
              points={corners(interpolate(tile.from, tile.to, stagger(t, i, tiles.length)))}
            />
          ))}

        {(id === 'product' || id === 'factor') && (
          <>
            <MathLabel opacity={labels} at={[X / 2, X / 2]} tex="x^2" color={vc.blue} />
            <MathLabel
              opacity={labels}
              at={[X / 2, 0]}
              tex="x"
              color={vc.blue}
              anchor="s"
              offset={10}
            />
            <MathLabel
              opacity={labels}
              at={[0, X / 2]}
              tex="x"
              color={vc.blue}
              anchor="w"
              offset={10}
            />
            {sp > 0 && (
              <MathLabel
                opacity={labels}
                at={[X + sp / 2, 0]}
                tex={String(sp)}
                color={vc.teal}
                anchor="s"
                offset={10}
              />
            )}
            {sq > 0 && (
              <MathLabel
                opacity={labels}
                at={[0, X + sq / 2]}
                tex={String(sq)}
                color={vc.teal}
                anchor="w"
                offset={10}
              />
            )}
          </>
        )}

        {id === 'common' && (
          <>
            <MathLabel
              opacity={labels}
              at={[(3 * X) / 2, 0]}
              tex="3x"
              color={vc.blue}
              anchor="s"
              offset={10}
            />
            <MathLabel
              opacity={labels}
              at={[0, (X + 2) / 2]}
              tex="x + 2"
              color={vc.teal}
              anchor="w"
              offset={10}
            />
          </>
        )}

        {id === 'difference' && (
          <>
            <TilePath kind="square" points={corners(box(0, 0, XD - d, XD))} />
            <Path
              points={corners(box(XD - d, XD - d, d, d))}
              closed
              color={vc.yellow}
              width={1.5}
              dash="5 5"
              fill={alpha(vc.yellow, 0.22 * (1 - cut))}
              opacity={1 - 0.6 * cut}
            />
            <TilePath kind="strip" points={movedStrip(d, move)} />
            <>
              <MathLabel
                opacity={1 - labels}
                at={[XD / 2, 0]}
                tex="x"
                color={vc.blue}
                anchor="s"
                offset={10}
              />
              <MathLabel
                opacity={1 - labels}
                at={[XD - d / 2, XD]}
                tex={`${d}^2`}
                color={vc.yellow}
                anchor="n"
                offset={10}
              />
            </>
            <>
              <MathLabel
                opacity={labels}
                at={[(XD - d) / 2, 0]}
                tex={`x - ${d}`}
                color={vc.blue}
                anchor="s"
                offset={10}
              />
              <MathLabel
                opacity={labels}
                at={[0, (XD + d) / 2]}
                tex={`x + ${d}`}
                color={vc.blue}
                anchor="w"
                offset={10}
              />
            </>
          </>
        )}
      </Stage>

      <VizControls>
        {id === 'product' && (
          <>
            <LabeledSlider
              label="$p$"
              value={p}
              onChange={(v) => setP(Math.round(v))}
              min={0}
              max={4}
              step={1}
              format={(v) => String(Math.round(v))}
              color={vc.teal}
            />
            <LabeledSlider
              label="$q$"
              value={q}
              onChange={(v) => setQ(Math.round(v))}
              min={0}
              max={4}
              step={1}
              format={(v) => String(Math.round(v))}
              color={vc.teal}
            />
          </>
        )}
        {id === 'factor' && (
          <SegmentedControl
            label="Polynomial"
            value={String(choice)}
            onChange={(v) => {
              setChoice(Number(v))
              animate(0, 1, 0.3)
            }}
            options={TRINOMIALS.map((tr, i) => ({
              value: String(i),
              label: `$${trinomial(tr.p, tr.q)}$`,
            }))}
          />
        )}
        {id === 'difference' && (
          <LabeledSlider
            label="$q$"
            value={d}
            onChange={(v) => setD(Math.round(v))}
            min={1}
            max={3}
            step={1}
            format={(v) => String(Math.round(v))}
            color={vc.yellow}
          />
        )}
        {id !== 'product' && (
          <SegmentedControl
            label="Arrangement"
            value={target}
            onChange={toggle}
            options={[
              { value: 'loose', label: id === 'difference' ? 'Square' : 'Tiles' },
              { value: 'rect', label: 'Rectangle' },
            ]}
          />
        )}
      </VizControls>
    </>
  )
}
