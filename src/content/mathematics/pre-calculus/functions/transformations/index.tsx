import { lerp, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Divider, Tex } from '@/ui/atoms'
import { LabeledSlider, SegmentedControl } from '@/ui/molecules'
import {
  Axes,
  FunctionPlot,
  Grid,
  Overlay,
  Point,
  Stage,
  useSequence,
  numbersCodec,
  useStepEffect,
  useVizParam,
  type ParamCodec,
  Vector,
  VizControls,
} from '@/viz-kit'

interface Base {
  label: string
  f: (x: number) => number
  /** TeX of f applied to an inner expression. */
  apply: (inner: string) => string
  /** Points of the base graph to follow through the transformation. */
  marks: readonly Vec2[]
}

const bases = {
  square: {
    label: 'x²',
    f: (x) => x * x,
    apply: (u) => (u === 'x' ? 'x^2' : `\\left(${u}\\right)^2`),
    marks: [
      [-1, 1],
      [0, 0],
      [2, 4],
    ],
  },
  abs: {
    label: '|x|',
    f: Math.abs,
    apply: (u) => `\\left|${u}\\right|`,
    marks: [
      [-2, 2],
      [0, 0],
      [1, 1],
    ],
  },
  root: {
    label: '√x',
    f: Math.sqrt,
    apply: (u) => `\\sqrt{${u}}`,
    marks: [
      [0, 0],
      [1, 1],
      [4, 2],
    ],
  },
} satisfies Record<string, Base>

type BaseId = keyof typeof bases
interface Params {
  a: number
  b: number
  h: number
  k: number
}
const identity: Params = { a: 1, b: 1, h: 0, k: 0 }

const baseCodec: ParamCodec<BaseId> = {
  encode: (id) => id,
  decode: (t) => (t in bases ? (t as BaseId) : undefined),
}
const paramsCodec = numbersCodec(['a', 'b', 'h', 'k'] as const)

const num = (v: number) => String(+v.toFixed(2))

/** The transformed rule as TeX, written the way a person would: no "1x", no "+ -2". */
const ruleTex = (base: Base, p: Params) => {
  // Rounded first, so mid-animation values such as 0.9999 still print as 1 and are dropped.
  const [a, b, h, k] = [p.a, p.b, p.h, p.k].map((v) => +v.toFixed(2)) as [
    number,
    number,
    number,
    number,
  ]
  const shifted = h === 0 ? 'x' : `x ${h > 0 ? '-' : '+'} ${num(Math.abs(h))}`
  const inner =
    b === 1
      ? shifted
      : b === -1
        ? h === 0
          ? '-x'
          : `-(${shifted})`
        : h === 0
          ? `${num(b)}x`
          : `${num(b)}(${shifted})`
  const outer = a === 1 ? '' : a === -1 ? '-' : num(a)
  const tail = k === 0 ? '' : ` ${k > 0 ? '+' : '-'} ${num(Math.abs(k))}`
  return `y = ${outer}${base.apply(inner)}${tail}`
}

export default function Transformations() {
  const [baseId, setBaseId] = useVizParam<BaseId>('f', 'square', baseCodec)
  const [p, setP] = useVizParam('p', identity, paramsCodec)
  const seq = useSequence()
  const base: Base = bases[baseId]

  /** Animates all four parameters together toward `to`. */
  const go = (to: Partial<Params>, duration = 1.4) => {
    const from = p
    const target = { ...identity, ...to }
    return seq.run(({ tween }) =>
      tween(0, 1, {
        duration,
        onUpdate: (s) =>
          setP({
            a: lerp(from.a, target.a, s),
            b: lerp(from.b, target.b, s),
            h: lerp(from.h, target.h, s),
            k: lerp(from.k, target.k, s),
          }),
      }),
    )
  }

  useStepEffect({
    'vertical-shift': () => {
      setBaseId('square')
      go({ k: 2 })
    },
    'horizontal-shift': () => {
      setBaseId('square')
      go({ h: 2 })
    },
    'vertical-stretch': () => {
      setBaseId('square')
      go({ a: 2 })
    },
    reflect: () => {
      setBaseId('root')
      void seq.run(async ({ tween, wait }) => {
        const from = p
        await tween(0, 1, {
          duration: 1.2,
          onUpdate: (s) =>
            setP({
              a: lerp(from.a, -1, s),
              b: lerp(from.b, 1, s),
              h: lerp(from.h, 0, s),
              k: lerp(from.k, 0, s),
            }),
        })
        await wait(1)
        await tween(-1, 1, { duration: 1, onUpdate: (a) => setP((q) => ({ ...q, a })) })
        await tween(1, -1, { duration: 1.4, onUpdate: (b) => setP((q) => ({ ...q, b })) })
      })
    },
    'horizontal-stretch': () => {
      setBaseId('root')
      go({ b: 2 })
    },
    combine: () => {
      setBaseId('square')
      go({ a: -0.5, b: 1, h: 1, k: 3 }, 1.8)
    },
  })

  const set = (key: keyof Params) => (v: number) => {
    seq.cancel()
    setP((q) => ({ ...q, [key]: Math.round(v * 100) / 100 }))
  }

  const { a, b, h, k } = p
  const g = (x: number) => a * base.f(b * (x - h)) + k
  const moved = (m: Vec2): Vec2 | undefined => (b === 0 ? undefined : [m[0] / b + h, a * m[1] + k])

  return (
    <>
      <Stage
        zoomable
        domain={{ x: [-6, 6], y: [-4, 6] }}
        ariaLabel="Graph of a base function and its transformed copy, with tracked points"
        overlay={
          <Overlay corner="top-left">
            <div style={{ color: vc.blue, fontSize: 18 }}>
              <Tex>{ruleTex(base, p)}</Tex>
            </div>
          </Overlay>
        }
      >
        <Grid />
        <Axes />
        <FunctionPlot f={base.f} color={vc.muted} width={2} dash="5 6" />
        <FunctionPlot f={g} color={vc.blue} />
        {base.marks.map((m) => {
          const to = moved(m)
          return (
            <g key={m.join()}>
              <Point at={m} color={vc.muted} r={4} />
              {to && (
                <>
                  <Vector from={m} to={to} color={vc.yellow} width={1.5} head={9} opacity={0.75} />
                  <Point at={to} color={vc.yellow} r={5} />
                </>
              )}
            </g>
          )
        })}
      </Stage>

      <VizControls>
        <SegmentedControl
          label="f"
          value={baseId}
          onChange={setBaseId}
          options={(Object.keys(bases) as BaseId[]).map((v) => ({
            value: v,
            label: bases[v].label,
          }))}
        />
        <Divider />
        <LabeledSlider label="$a$" value={a} onChange={set('a')} min={-3} max={3} step={0.05} />
        <LabeledSlider label="$b$" value={b} onChange={set('b')} min={-3} max={3} step={0.05} />
        <LabeledSlider label="$h$" value={h} onChange={set('h')} min={-4} max={4} step={0.05} />
        <LabeledSlider label="$k$" value={k} onChange={set('k')} min={-3} max={4} step={0.05} />
      </VizControls>
    </>
  )
}
