import { bucketOf, saltedKey, type Key } from '@/lib/partitioning'
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
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const N = 10_000
const HOT = 9999
const HOT_ROWS = 3000
const MAX_N = 16
const S0 = 8

const STEPS = ['loads', 'ratio', 'many-keys', 'hot-key', 'more-buckets', 'salting'] as const
type StepId = (typeof STEPS)[number]

/** `count` keys from 1 on, `each` rows per key. */
const uniform = (count: number, each: number) =>
  Array.from({ length: count }, (_, i) => [i + 1, each] as [Key, number])

/** The keys and their frequencies in each step, and whether the hot key is salted. */
const DATA: Record<StepId, { keys: [Key, number][]; n: number; each: number }> = {
  loads: { keys: uniform(40, 250), n: 8, each: 250 },
  ratio: { keys: uniform(40, 250), n: 8, each: 250 },
  'many-keys': { keys: uniform(1000, 10), n: 8, each: 10 },
  'hot-key': { keys: [...uniform(700, 10), [HOT, HOT_ROWS]], n: 8, each: 10 },
  'more-buckets': { keys: [...uniform(700, 10), [HOT, HOT_ROWS]], n: 16, each: 10 },
  salting: { keys: [...uniform(700, 10), [HOT, HOT_ROWS]], n: 8, each: 10 },
}

/** Loads of the other keys and of the hot key per bucket, with the hot key's rows salted `salts` ways. */
const loadsOf = (step: StepId, salts: number) => {
  const { keys, n } = DATA[step]
  const rest = Array<number>(n).fill(0)
  const hot = Array<number>(n).fill(0)
  for (const [key, f] of keys) {
    if (key !== HOT) rest[bucketOf(key, n)]! += f
    else if (step !== 'salting') hot[bucketOf(key, n)]! += f
    else
      for (let s = 0; s < salts; s++) {
        // Rows take salts in turn, so the salts get the rows as evenly as whole rows allow.
        const rows = Math.floor(f / salts) + (s < f % salts ? 1 : 0)
        hot[bucketOf(saltedKey(key, s), n)]! += rows
      }
  }
  return { rest, hot }
}

/** Chart: rows up, buckets across. */
const CX = 120
const CW = 600
const BASE = 560
const ROWS_MAX = 4000
const PER_ROW = 440 / ROWS_MAX
const yOf = (rows: number) => BASE - rows * PER_ROW
const TICKS = [0, 1000, 2000, 3000, 4000]

/** The padded array of a fixed length, so loads animate between bucket counts. */
const pad = (xs: readonly number[]) => [...xs, ...Array<number>(MAX_N - xs.length).fill(0)]

function Bars({
  rest,
  hot,
  n,
  each,
  separators,
  maxAt,
}: {
  rest: readonly number[]
  hot: readonly number[]
  n: number
  each: number
  separators: number
  maxAt: number
}) {
  const c = useCoords()
  const slot = CW / n
  const w = slot * 0.7
  return (
    <g>
      {Array.from({ length: MAX_N }, (_, k) => {
        const x = CX + k * slot + (slot - w) / 2
        const r = rest[k]!
        const h = hot[k]!
        if (r + h < 0.5) return null
        const [x0, yRest] = c.toPx([x, yOf(r)])
        const [x1, yBase] = c.toPx([x + w, BASE])
        const [, yTop] = c.toPx([x, yOf(r + h)])
        const lines = Math.floor(r / each + 1e-6)
        const d = Array.from({ length: Math.max(0, lines - 1) }, (_, j) => {
          const [, yy] = c.toPx([x, yOf((j + 1) * each)])
          return `M${x0} ${yy}H${x1}`
        }).join('')
        return (
          <g key={k}>
            <rect
              x={x0}
              y={yRest}
              width={x1 - x0}
              height={Math.max(0, yBase - yRest)}
              style={{ fill: alpha(vc.blue, k === maxAt ? 0.55 : 0.35), stroke: vc.blue }}
              strokeWidth={1.25}
            />
            {h > 0.5 && (
              <rect
                x={x0}
                y={yTop}
                width={x1 - x0}
                height={Math.max(0, yRest - yTop)}
                style={{ fill: alpha(vc.red, 0.45), stroke: vc.red }}
                strokeWidth={1.25}
              />
            )}
            <path
              d={d}
              style={{ stroke: vc.bg, opacity: separators }}
              strokeWidth={1.5}
              fill="none"
            />
          </g>
        )
      })}
    </g>
  )
}

export default function Skew() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '') ? (id as StepId) : 'loads'
  const [salts, setSalts] = useVizParam<number>('salts', S0)
  useStepEffect(Object.fromEntries(STEPS.map((s) => [s, () => setSalts(S0)])))

  const { n, each } = DATA[step]
  const { rest, hot } = loadsOf(step, salts)
  const loads = rest.map((r, k) => r + hot[k]!)
  const mean = N / n
  const max = Math.max(...loads)
  const maxAt = loads.indexOf(max)
  const keyCount = DATA[step].keys.length + (step === 'salting' ? salts - 1 : 0)

  const anim = useAnimatedValue([...pad(rest), ...pad(hot), n], { duration: 0.9 })
  const nShown = anim[2 * MAX_N]!
  const meanShown = N / nShown
  const separators = useAnimatedValue(each >= 250 ? 1 : 0)
  const showMax = step !== 'loads'

  const slot = CW / n
  const maxX = CX + maxAt * slot + slot / 2

  return (
    <>
      <Stage
        domain={{ x: [20, 760], y: [60, 620] }}
        yUp={false}
        ariaLabel="A bar chart of rows per bucket, with the mean load as a dashed line and the rows of a hot key stacked on top of one bucket"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel title="Loads">
              <Readout label="rows $N$" value={N.toLocaleString('en-US')} />
              <Readout label="keys" value={keyCount.toLocaleString('en-US')} />
              <Readout label="buckets $n$" value={n} />
              <Readout
                label="mean $N / n$"
                value={mean.toLocaleString('en-US')}
                color={vc.yellow}
              />
              {showMax && (
                <Readout
                  label="largest load"
                  value={max.toLocaleString('en-US')}
                  color={vc.blue}
                  hint="The rows of the largest bucket, the task the stage waits for."
                />
              )}
              {showMax && (
                <Readout
                  label="skew ratio"
                  value={(max / mean).toFixed(2)}
                  hint="The largest load over the mean load. $1$ is a perfectly even split."
                />
              )}
              {(step === 'hot-key' || step === 'more-buckets') && (
                <Readout
                  label="lower bound $pn$"
                  value={((HOT_ROWS / N) * n).toFixed(1)}
                  color={vc.red}
                  hint="The hot key holds a share $p = 0.3$ of the rows, all in one bucket."
                />
              )}
            </ReadoutPanel>
          </Overlay>
        }
      >
        {TICKS.map((t) => (
          <g key={t}>
            <TextLabel at={[CX - 14, yOf(t)]} align="end" size={11} mono>
              {t.toLocaleString('en-US')}
            </TextLabel>
          </g>
        ))}
        <TickLines />
        <TextLabel at={[CX - 14, yOf(ROWS_MAX) - 30]} align="end" size={11} uppercase>
          rows
        </TextLabel>

        <Bars
          rest={anim.slice(0, MAX_N)}
          hot={anim.slice(MAX_N, 2 * MAX_N)}
          n={nShown}
          each={each}
          separators={separators}
          maxAt={showMax ? maxAt : -1}
        />

        {Array.from({ length: n }, (_, k) => (
          <TextLabel key={`${n}-${k}`} at={[CX + k * slot + slot / 2, BASE + 16]} size={11} mono>
            {String(k)}
          </TextLabel>
        ))}
        <TextLabel at={[CX + CW / 2, BASE + 40]} size={11} uppercase>
          bucket
        </TextLabel>

        <MeanLine y={yOf(meanShown)} />
        <MathLabel at={[CX + CW + 22, yOf(meanShown)]} tex="\tfrac{N}{n}" color={vc.yellow} />
        {showMax && (
          <TextLabel at={[maxX, yOf(max) - 14]} size={12} mono color={vc.fg}>
            {`${(max / mean).toFixed(2)} × mean`}
          </TextLabel>
        )}
      </Stage>

      <VizControls>
        {step === 'salting' ? (
          <LabeledSlider
            label="$S$"
            value={salts}
            onChange={(v) => setSalts(Math.round(v))}
            min={1}
            max={32}
            step={1}
            format={(v) => String(Math.round(v))}
            color={vc.red}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            {step === 'hot-key' || step === 'more-buckets'
              ? 'One key with 3000 of the rows'
              : `${keyCount.toLocaleString('en-US')} keys with ${each} rows each`}
          </span>
        )}
      </VizControls>
    </>
  )
}

function TickLines() {
  const c = useCoords()
  const d = TICKS.map((t) => {
    const [x0, y] = c.toPx([CX, yOf(t)])
    const [x1] = c.toPx([CX + CW, yOf(t)])
    return `M${x0} ${y}H${x1}`
  }).join('')
  return <path d={d} style={{ stroke: vc.grid }} strokeWidth={1} fill="none" />
}

function MeanLine({ y }: { y: number }) {
  const c = useCoords()
  const [x0, py] = c.toPx([CX - 4, y])
  const [x1] = c.toPx([CX + CW + 4, y])
  return (
    <line
      x1={x0}
      y1={py}
      x2={x1}
      y2={py}
      style={{ stroke: vc.yellow }}
      strokeWidth={2}
      strokeDasharray="6 5"
    />
  )
}
