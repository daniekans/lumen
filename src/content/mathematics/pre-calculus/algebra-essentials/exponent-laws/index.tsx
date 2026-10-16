import { useState } from 'react'
import { range, type Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { Tex } from '@/ui/atoms'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  MathLabel,
  Overlay,
  Path,
  Segment,
  Stage,
  useAnimatedValue,
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

/** Tile slots: 0 to 5 hold the first power (above the bar), 6 to 11 the second (below it). */
const SLOTS = 12
const HALF = 6
const SIZE = 0.84
/** Height of the rows above and below the fraction bar. */
const ROW = 0.75

type Mode = 'row' | 'product' | 'fraction' | 'power'

const modeOf = (id: string | undefined): Mode =>
  id === 'product'
    ? 'product'
    : id === 'quotient' || id === 'zero' || id === 'negative'
      ? 'fraction'
      : id === 'power'
        ? 'power'
        : 'row'

interface Tile {
  at: Vec2
  shown: boolean
  color: string
}

/**
 * Where every slot goes. Hidden slots sit where they would appear next, so tiles added with a
 * slider fade in place instead of flying in.
 */
const layout = (mode: Mode, m: number, n: number, joined: boolean): Tile[] => {
  const tiles: Tile[] = []
  if (mode === 'row') {
    const start = -(m - 1) / 2
    for (const i of range(SLOTS)) tiles.push({ at: [start + i, 0], shown: i < m, color: vc.blue })
  } else if (mode === 'product') {
    const gap = joined ? 0 : 1.4
    const start = -(m + n + gap - 1) / 2
    for (const i of range(HALF)) tiles.push({ at: [start + i, 0], shown: i < m, color: vc.blue })
    for (const j of range(HALF))
      tiles.push({ at: [start + m + gap + j, 0], shown: j < n, color: vc.yellow })
  } else if (mode === 'fraction') {
    // Both rows start at the same x, so cancelling pairs line up vertically.
    const start = -(Math.max(m, n) - 1) / 2
    for (const i of range(HALF)) tiles.push({ at: [start + i, ROW], shown: i < m, color: vc.blue })
    for (const j of range(HALF))
      tiles.push({ at: [start + j, -ROW], shown: j < n, color: vc.yellow })
  } else {
    // n rows of m columns; slot = row * 4 + column.
    for (const s of range(SLOTS)) {
      const r = Math.floor(s / 4)
      const c = s % 4
      tiles.push({
        at: [c - (m - 1) / 2, (n - 1) / 2 - r],
        shown: r < n && c < m,
        color: r % 2 === 0 ? vc.blue : vc.yellow,
      })
    }
  }
  return tiles
}

/** a^e as TeX with a given exponent: a^{3}, 1, a. */
const pow = (e: number) => (e === 1 ? 'a' : `a^{${e}}`)

const equationTex = (mode: Mode, m: number, n: number) => {
  switch (mode) {
    case 'row':
      if (m === 0) return 'a^{0} = 1'
      return `${pow(m)} = ${range(m)
        .map(() => 'a')
        .join(' \\cdot ')}`
    case 'product':
      return `${pow(m)} \\cdot ${pow(n)} = ${pow(m + n)}`
    case 'fraction': {
      const e = m - n
      const lhs = `\\dfrac{${pow(m)}}{${pow(n)}}`
      if (e > 0) return `${lhs} = ${pow(e)}`
      if (e === 0) return `${lhs} = 1 = a^{0}`
      return `${lhs} = \\dfrac{1}{${pow(-e)}} = a^{${e}}`
    }
    case 'power':
      return `(${pow(m)})^{${n}} = ${pow(m * n)}`
  }
}

const exponentOf = (mode: Mode, m: number, n: number) =>
  mode === 'row' ? m : mode === 'product' ? m + n : mode === 'fraction' ? m - n : m * n

/** a^e for an integer e, as TeX: 8, \frac{1}{8}. */
const valueTex = (a: number, e: number) =>
  e >= 0 ? String(a ** e) : `\\frac{1}{${String(a ** -e)}}`

const limits: Record<Mode, { m: [number, number]; n: [number, number] }> = {
  row: { m: [0, 6], n: [0, 0] },
  product: { m: [0, 4], n: [0, 4] },
  fraction: { m: [0, 6], n: [0, 6] },
  power: { m: [1, 4], n: [1, 3] },
}

const int = (v: number) => String(Math.round(v))

export default function ExponentLaws() {
  const { id } = useVizStep()
  const mode = modeOf(id)
  const [a, setA] = useState(2)
  const [m, setM] = useState(3)
  const [n, setN] = useState(2)
  // Joining the two rows of a product and cancelling pairs in a quotient play after a short pause.
  const [joined, setJoined] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const seq = useSequence()

  const enter = (mm: number, nn: number, after?: (on: boolean) => void) => {
    setM(mm)
    setN(nn)
    after?.(false)
    seq.run(async ({ wait }) => {
      await wait(0.9)
      after?.(true)
    })
  }

  useStepEffect({
    repeated: () => enter(3, 0),
    product: () => enter(3, 2, setJoined),
    quotient: () => enter(5, 2, setCancelled),
    zero: () => enter(3, 3, setCancelled),
    negative: () => enter(1, 4, setCancelled),
    power: () => enter(3, 2),
  })

  const tiles = layout(mode, m, n, joined)
  const pairs = mode === 'fraction' && cancelled ? Math.min(m, n) : 0
  const cancelledSlot = (s: number) => (s < HALF ? s < pairs : s - HALF < pairs)

  // One animated array: x, y and opacity for each slot.
  const target = tiles.flatMap((t, s) => [
    t.at[0],
    t.at[1],
    t.shown ? (cancelledSlot(s) ? 0.22 : 1) : 0,
  ])
  const anim = useAnimatedValue(target, { duration: 0.7 })
  const strikes = useAnimatedValue(
    range(HALF).map((i) => (i < pairs ? 1 : 0)),
    { duration: 0.5 },
  )
  const dot = useAnimatedValue(mode === 'product' && !joined && m > 0 && n > 0 ? 1 : 0, {
    duration: 0.4,
  })
  const bar = useAnimatedValue(mode === 'fraction' ? 1 : 0, { duration: 0.5 })

  const e = exponentOf(mode, m, n)
  const lim = limits[mode]
  const barHalf = Math.max(m, n, 1) / 2 + 0.3
  const fracStart = -(Math.max(m, n) - 1) / 2

  return (
    <>
      <Stage
        domain={{ x: [-5.5, 5.5], y: [-2, 2.9] }}
        ariaLabel="Factors of a power drawn as tiles that join, cancel and repeat"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              <Readout label="exponent" value={e} color={vc.blue} />
              <Readout label={`value for $a = ${a}$`} value={<Tex>{valueTex(a, e)}</Tex>} />
            </ReadoutPanel>
          </Overlay>
        }
      >
        <MathLabel at={[0, 2.35]} tex={equationTex(mode, m, n)} size={22} />

        <Segment from={[-barHalf, 0]} to={[barHalf, 0]} color={vc.fg} width={2} opacity={bar} />

        {range(SLOTS).map((s) => {
          const x = anim[3 * s]!
          const y = anim[3 * s + 1]!
          const o = anim[3 * s + 2]!
          const color = tiles[s]!.color
          const h = SIZE / 2
          return (
            <g key={s} style={{ opacity: o }}>
              <Path
                points={[
                  [x - h, y - h],
                  [x + h, y - h],
                  [x + h, y + h],
                  [x - h, y + h],
                ]}
                closed
                color={color}
                width={1.5}
                fill={alpha(color, 0.16)}
              />
              <MathLabel at={[x, y]} tex="a" color={color} opacity={o} size={18} />
            </g>
          )
        })}

        {range(HALF).map((i) => (
          <Segment
            key={i}
            from={[fracStart + i - 0.46, ROW + 0.46]}
            to={[fracStart + i + 0.46, -ROW - 0.46]}
            color={vc.fg}
            width={1.5}
            opacity={strikes[i]! * 0.8}
          />
        ))}

        <MathLabel at={[(m - n) / 2, 0]} tex="\cdot" size={22} opacity={dot} />

        {mode === 'power' &&
          range(n).map((r) => (
            <MathLabel
              key={r}
              at={[-(m - 1) / 2 - 0.75, (n - 1) / 2 - r]}
              tex={pow(m)}
              color={r % 2 === 0 ? vc.blue : vc.yellow}
              anchor="w"
            />
          ))}
      </Stage>

      <VizControls>
        <LabeledSlider
          label="$a$"
          value={a}
          onChange={(v) => setA(Math.round(v))}
          min={2}
          max={5}
          step={1}
          format={int}
        />
        <LabeledSlider
          label="$m$"
          value={m}
          onChange={(v) => setM(Math.round(v))}
          min={lim.m[0]}
          max={lim.m[1]}
          step={1}
          format={int}
          color={vc.blue}
        />
        {mode !== 'row' && (
          <LabeledSlider
            label="$n$"
            value={n}
            onChange={(v) => setN(Math.round(v))}
            min={lim.n[0]}
            max={lim.n[1]}
            step={1}
            format={int}
            color={mode === 'power' ? vc.fg : vc.yellow}
          />
        )}
      </VizControls>
    </>
  )
}
