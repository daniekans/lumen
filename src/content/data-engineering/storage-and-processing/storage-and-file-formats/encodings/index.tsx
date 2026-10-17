import { useState } from 'react'
import { type Vec2 } from '@/lib/math'
import {
  bitsFor,
  codeBits,
  deltaEncode,
  dictionaryEncode,
  packedBytes,
  runLengths,
} from '@/lib/storage'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  MathLabel,
  Overlay,
  Stage,
  TextLabel,
  useAnimatedValue,
  useCoords,
  useStepEffect,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const CITIES = [
  'Lisbon',
  'Oslo',
  'Lisbon',
  'Recife',
  'Tokyo',
  'Oslo',
  'Lisbon',
  'Recife',
  'Recife',
  'Lisbon',
  'Tokyo',
  'Oslo',
  'Lisbon',
  'Recife',
  'Oslo',
  'Lisbon',
]
const N = CITIES.length
const { dictionary: DICT, codes: CODES } = dictionaryEncode(CITIES)
const D = DICT.length
const TEXT_BYTES = CITIES.reduce((s, c) => s + c.length, 0)
const DICT_BYTES = DICT.reduce((s, c) => s + c.length, 0)

/** Sorted position of each value: by code, ties in their original order. */
const SORTED_AT = (() => {
  const order = CODES.map((c, i) => [c, i] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const at = Array<number>(N)
  order.forEach(([, i], k) => (at[i] = k))
  return at
})()
const SORTED = [...CITIES].sort((a, b) => DICT.indexOf(a) - DICT.indexOf(b))

const TS = [
  1760659200, 1760659204, 1760659205, 1760659212, 1760659215, 1760659215, 1760659220, 1760659222,
]
const DELTAS = deltaEncode(TS)
const DELTA_BITS = bitsFor(Math.max(...DELTAS.slice(1)))

/** The column runs down the stage, one value per line. */
const TOP = 110
const CH = 26
const VAL_X = 60
const VAL_W = 96
const CODE_X = 190
const CODE_W = 76
const SIDE_X = 310
const TS_W = 128
const DELTA_X = 230
const rowY = (i: number) => TOP + i * CH

const STEPS = ['plain', 'dictionary', 'bit-packing', 'runs', 'sorted', 'delta'] as const
type StepId = (typeof STEPS)[number]

function Cell({
  at,
  width,
  text,
  tone = 'idle',
  size = 12,
  opacity = 1,
}: {
  at: Vec2
  width: number
  text: string
  tone?: 'idle' | 'code' | 'faded'
  size?: number
  opacity?: number
}) {
  const c = useCoords()
  const u = c.unit
  const [x, y] = c.toPx(at)
  return (
    <g
      style={{
        opacity: (tone === 'faded' ? 0.4 : 1) * opacity,
        transition: 'opacity var(--dur-slow) var(--ease-out)',
      }}
    >
      <rect
        x={x + 2 * u}
        y={y + 2 * u}
        width={(width - 4) * u}
        height={(CH - 4) * u}
        rx={4 * u}
        style={{
          fill: tone === 'code' ? alpha(vc.blue, 0.3) : 'var(--bg-elevated)',
          stroke: tone === 'code' ? vc.blue : vc.gridStrong,
          transition: 'fill var(--dur-slow), stroke var(--dur-slow)',
        }}
        strokeWidth={1.25}
      />
      <text
        x={x + (width / 2) * u}
        y={y + (CH / 2) * u}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: vc.fg, fontSize: size * u, fontFamily: 'var(--font-mono)' }}
      >
        {text}
      </text>
    </g>
  )
}

/** A yellow frame around values `from` to `to - 1` of the column. */
function RunFrame({ from, to, opacity }: { from: number; to: number; opacity: number }) {
  const c = useCoords()
  const u = c.unit
  const [x, y] = c.toPx([VAL_X, rowY(from)])
  return (
    <rect
      x={x - 1 * u}
      y={y - 1 * u}
      width={(VAL_W + 2) * u}
      height={((to - from) * CH + 2) * u}
      rx={6 * u}
      style={{ fill: 'none', stroke: vc.yellow, opacity, transition: 'opacity var(--dur-slow)' }}
      strokeWidth={1.75}
    />
  )
}

const binary = (n: number, bits: number) => n.toString(2).padStart(bits, '0')

export default function Encodings() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '') ? (id as StepId) : 'plain'
  const [d, setD] = useState(D)
  useStepEffect(Object.fromEntries(STEPS.map((s) => [s, () => setD(D)])))

  const sortT = useAnimatedValue(step === 'sorted' ? 1 : 0, { duration: 1.2 })
  const settled = sortT === 0 || sortT === 1
  const sorted = step === 'sorted'
  const delta = step === 'delta'
  const showCodes = step === 'dictionary' || step === 'bit-packing'
  const showRuns = (step === 'runs' || sorted) && settled
  const runs = runLengths(sorted ? SORTED : CITIES)
  const bits = codeBits(d)

  const readouts: Record<StepId, [string, string | number, string?][]> = {
    plain: [
      ['values', N],
      ['distinct', D],
      ['bytes', TEXT_BYTES],
    ],
    dictionary: [
      ['dictionary', `${DICT_BYTES} B`],
      ['codes', `${N} B`],
      ['bytes', DICT_BYTES + N, vc.blue],
    ],
    'bit-packing': [
      ['$d$', d],
      ['bits per code', bits, vc.blue],
      ['codes', `${packedBytes(N, bits)} B`],
    ],
    runs: [
      ['values', N],
      ['runs', runLengths(CITIES).length, vc.yellow],
    ],
    sorted: [
      ['values', N],
      ['runs', runLengths(SORTED).length, vc.yellow],
    ],
    delta: [
      ['plain', `${TS.length * 64} bits`],
      ['bits per delta', DELTA_BITS, vc.blue],
      ['deltas', `64 + ${(TS.length - 1) * DELTA_BITS} bits`],
    ],
  }

  const formula: Record<StepId, string> = {
    plain: `\\text{${N} values, } ${TEXT_BYTES} \\text{ bytes of text}`,
    dictionary: `${DICT_BYTES} + ${N} \\cdot 1 = ${DICT_BYTES + N} \\text{ bytes}`,
    'bit-packing': `\\lceil \\log_2 ${d} \\rceil = ${bits} \\text{ bits}, \\quad \\left\\lceil \\tfrac{${N} \\cdot ${bits}}{8} \\right\\rceil = ${packedBytes(N, bits)} \\text{ bytes}`,
    runs: `${runLengths(CITIES).length} \\text{ runs for } ${N} \\text{ values}`,
    sorted: `${D} \\text{ runs: one per distinct value}`,
    delta: `\\max \\Delta = ${Math.max(...DELTAS.slice(1))}, \\quad \\lceil \\log_2 (${Math.max(...DELTAS.slice(1))} + 1) \\rceil = ${DELTA_BITS} \\text{ bits}`,
  }

  const label = delta
    ? 'ts (seconds)'
    : sorted
      ? 'city, sorted'
      : step === 'plain'
        ? 'city, as text'
        : 'city'

  return (
    <>
      <Stage
        domain={{ x: [30, 720], y: [70, 610] }}
        yUp={false}
        ariaLabel="A column of sixteen city names with its dictionary codes, bit widths and runs, and a column of timestamps with its deltas"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {readouts[step].map(([l, v, color]) => (
                <Readout key={l} label={l} value={v} color={color} />
              ))}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <TextLabel at={[VAL_X, TOP - 18]} align="start" size={12} mono color={vc.fg}>
          {label}
        </TextLabel>

        {/* The city column, which slides into sorted order. */}
        {CITIES.map((city, i) => {
          const y = rowY(i + (SORTED_AT[i]! - i) * sortT)
          return (
            <Cell
              key={i}
              at={[VAL_X, y]}
              width={VAL_W}
              text={city}
              tone={showCodes ? 'faded' : 'idle'}
              opacity={delta ? 0 : 1}
            />
          )
        })}
        {runs.map((r, k) => (
          <RunFrame
            key={`${sorted}${k}`}
            from={r.start}
            to={r.start + r.length}
            opacity={showRuns ? 1 : 0}
          />
        ))}

        {/* Codes, as numbers or as bits. */}
        <g style={{ opacity: showCodes ? 1 : 0, transition: 'opacity var(--dur-slow)' }}>
          <TextLabel at={[CODE_X, TOP - 18]} align="start" size={12} mono>
            {step === 'bit-packing' ? `codes, ${bits} bits` : 'codes, 1 byte'}
          </TextLabel>
          {CODES.map((code, i) => (
            <Cell
              key={i}
              at={[CODE_X, rowY(i)]}
              width={CODE_W}
              text={step === 'bit-packing' ? binary(code, bits) : String(code)}
              tone="code"
            />
          ))}
        </g>

        {/* The dictionary, or the run-length pairs of the sorted column. */}
        <g style={{ opacity: showCodes ? 1 : 0, transition: 'opacity var(--dur-slow)' }}>
          <TextLabel at={[SIDE_X, TOP - 18]} align="start" size={12} mono>
            dictionary
          </TextLabel>
          {DICT.map((city, k) => (
            <g key={city}>
              <Cell at={[SIDE_X, rowY(k)]} width={40} text={String(k)} tone="code" />
              <Cell at={[SIDE_X + 40, rowY(k)]} width={VAL_W} text={city} />
            </g>
          ))}
        </g>
        <g style={{ opacity: sorted && settled ? 1 : 0, transition: 'opacity var(--dur-slow)' }}>
          <TextLabel at={[SIDE_X, TOP - 18]} align="start" size={12} mono>
            runs (value, count)
          </TextLabel>
          {runLengths(SORTED).map((r, k) => (
            <Cell
              key={r.value}
              at={[SIDE_X, rowY(runLengths(SORTED)[k]!.start)]}
              width={136}
              text={`(${r.value}, ${r.length})`}
            />
          ))}
        </g>

        {/* The timestamp column and its deltas. */}
        <g style={{ opacity: delta ? 1 : 0, transition: 'opacity var(--dur-slow)' }}>
          {TS.map((t, i) => (
            <Cell key={i} at={[VAL_X, rowY(i)]} width={TS_W} text={String(t)} />
          ))}
          <TextLabel at={[DELTA_X, TOP - 18]} align="start" size={12} mono>
            delta
          </TextLabel>
          {DELTAS.map((v, i) => (
            <Cell
              key={i}
              at={[DELTA_X, rowY(i)]}
              width={TS_W}
              text={i === 0 ? String(v) : `+${v}`}
              tone={i === 0 ? 'idle' : 'code'}
            />
          ))}
        </g>

        <MathLabel at={[360, 580]} tex={formula[step]} size={18} />
      </Stage>

      <VizControls>
        {step === 'bit-packing' ? (
          <LabeledSlider
            label="$d$"
            value={d}
            onChange={(v) => setD(Math.round(v))}
            min={4}
            max={64}
            step={1}
            format={(v) => String(Math.round(v))}
            color={vc.blue}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            {delta
              ? 'Eight timestamps, a few seconds apart'
              : 'Sixteen values, four of them distinct'}
          </span>
        )}
      </VizControls>
    </>
  )
}
