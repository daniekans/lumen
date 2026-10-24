import { hashInt, movesOnResize } from '@/lib/partitioning'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Chip,
  Overlay,
  Segment,
  Stage,
  TextLabel,
  useAnimatedValue,
  useCoords,
  useStepEffect,
  useVizParam,
  useVizStep,
  VizControls,
} from '@/viz-kit'

const STEPS = [
  'remainders',
  'add-bucket',
  'period',
  'real-keys',
  'any-n',
  'doubling',
  'fewest',
] as const
type StepId = (typeof STEPS)[number]
const after = (step: StepId, from: StepId) => STEPS.indexOf(step) >= STEPS.indexOf(from)

const N0 = 4
/** Hash values 0 to 29 in the strip: a period of 20 for n = 4 and the start of the next. */
const CELLS = 30
const CELL_X0 = 130
const CELL_W = 20
const ROW_Y = [62, 92, 122] as const
/** Hashes of customer ids 1 to 400, one dot each. */
const HASHES = Array.from({ length: 400 }, (_, i) => hashInt(i + 1))
const COLS = 20
const DOT_X0 = 38
const DOT_Y0 = 222
const DOT_GAP = 16
const BAR_X = 400
const BAR_W = 330
const BAR_Y = [232, 300, 368] as const

const STAY = vc.blue
const MOVE = vc.orange
const FEWEST = vc.yellow

/** The keys as a grid of dots, colored by whether they move. */
function Dots({ moves, shown }: { moves: (h: number) => boolean | null; shown: number }) {
  const c = useCoords()
  const u = c.unit
  return (
    <g style={{ opacity: shown }}>
      {HASHES.map((h, i) => {
        const [x, y] = c.toPx([
          DOT_X0 + (i % COLS) * DOT_GAP,
          DOT_Y0 + Math.floor(i / COLS) * DOT_GAP,
        ])
        const m = moves(h)
        const color = m === null ? vc.subtle : m ? MOVE : STAY
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={5 * u}
            style={{ fill: color, transition: 'fill var(--dur-slow) var(--ease-out)' }}
          />
        )
      })}
    </g>
  )
}

/** A horizontal bar for a count of keys out of 400, with its label above. */
function Bar({
  y,
  count,
  color,
  label,
  shown,
}: {
  y: number
  count: number
  color: string
  label: string
  shown: number
}) {
  const c = useCoords()
  const u = c.unit
  const [x0, y0] = c.toPx([BAR_X, y])
  const width = useAnimatedValue((count / HASHES.length) * BAR_W)
  return (
    <g style={{ opacity: shown }}>
      <text
        x={x0}
        y={y0 - 12 * u}
        dominantBaseline="central"
        style={{ fill: vc.muted, fontSize: 12 * u }}
      >
        {label}
      </text>
      <rect
        x={x0}
        y={y0}
        width={BAR_W * u}
        height={18 * u}
        rx={3 * u}
        style={{ fill: 'none', stroke: vc.gridStrong }}
      />
      <rect x={x0} y={y0} width={width * u} height={18 * u} rx={3 * u} style={{ fill: color }} />
    </g>
  )
}

export default function Rehashing() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '')
    ? (id as StepId)
    : 'remainders'
  const [nParam, setN] = useVizParam<number>('n', N0)
  useStepEffect(Object.fromEntries(STEPS.map((s) => [s, () => setN(N0)])))

  const n = step === 'any-n' || step === 'doubling' ? nParam : N0
  const m = step === 'doubling' ? 2 * n : n + 1
  const compared = after(step, 'add-bucket')
  const moves = (h: number) => (compared ? movesOnResize(h, n, m) : null)
  const moved = HASHES.filter((h) => movesOnResize(h, n, m)).length
  const period = step === 'doubling' ? m : n * m
  const showPeriod = after(step, 'period') && period <= CELLS

  const rowM = useAnimatedValue(compared ? 1 : 0)
  const dots = useAnimatedValue(after(step, 'real-keys') ? 1 : 0)
  const fewestShown = useAnimatedValue(step === 'fewest' ? 1 : 0)
  const bracket = useAnimatedValue(showPeriod ? 1 : 0)

  const pct = (x: number) => `${(100 * x).toFixed(1)}%`
  const expected = step === 'doubling' ? 0.5 : n / (n + 1)
  const readouts: [string, string | number, string?, string?][] = !after(step, 'real-keys')
    ? [
        ['buckets', compared ? `${n} → ${m}` : n],
        ...(compared
          ? ([
              [
                'stay per block',
                `${n} of ${period}`,
                STAY,
                'Hash values in one period whose two remainders agree.',
              ],
            ] as [string, string, string, string][])
          : []),
      ]
    : [
        ['buckets', `${n} → ${m}`],
        ['keys moved', `${moved} / ${HASHES.length}`, MOVE],
        [
          step === 'doubling' ? 'expected, 1/2' : 'expected, n/(n+1)',
          pct(expected),
          undefined,
          'The share of hash values that move, from the pattern in the strip.',
        ],
        ...(step === 'fewest'
          ? ([
              [
                'fewest, 1/(n+1)',
                Math.round(HASHES.length / m),
                FEWEST,
                'Keys the new bucket needs for an even split: its share of all keys.',
              ],
            ] as [string, number, string, string][])
          : []),
      ]

  const cellX = (h: number) => CELL_X0 + h * CELL_W
  const header = compared ? `bucket = h mod ${n}  →  h mod ${m}` : `bucket = h mod ${n}`

  return (
    <>
      <Stage
        domain={{ x: [0, 760], y: [10, 560] }}
        yUp={false}
        ariaLabel="A strip of hash values with their remainders for two bucket counts, and a grid of 400 keys colored by whether they change bucket"
        overlay={
          <Overlay corner="bottom-right">
            <ReadoutPanel>
              {readouts.map(([l, v, color, hint]) => (
                <Readout key={l} label={l} value={v} color={color} hint={hint} />
              ))}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <TextLabel at={[20, 26]} align="start" size={13} mono color={vc.fg}>
          {header}
        </TextLabel>

        {(['h', `h mod ${n}`, `h mod ${m}`] as const).map((label, r) => (
          <TextLabel
            key={r}
            at={[CELL_X0 - 12, ROW_Y[r]!]}
            align="end"
            size={11}
            mono
            opacity={r === 2 ? rowM : 1}
          >
            {label}
          </TextLabel>
        ))}

        {Array.from({ length: CELLS }, (_, h) => {
          const mv = moves(h)
          const tint = mv === null ? 'none' : alpha(mv ? MOVE : STAY, mv ? 0.14 : 0.28)
          const values = [h, h % n, h % m]
          return values.map((v, r) => (
            <Chip
              key={`${h}-${r}`}
              x={cellX(h) + 1}
              y={ROW_Y[r]! - 11}
              width={CELL_W - 2}
              height={22}
              text={String(v)}
              fill={r === 0 ? 'none' : tint}
              stroke={r === 0 ? 'none' : vc.grid}
              textColor={r === 0 ? vc.muted : vc.fg}
              opacity={r === 2 ? rowM : 1}
            />
          ))
        })}

        <g style={{ opacity: bracket }}>
          <Segment
            from={[cellX(0) + 1, 148]}
            to={[cellX(period) - 1, 148]}
            color={vc.muted}
            width={1.25}
          />
          <Segment
            from={[cellX(0) + 1, 143]}
            to={[cellX(0) + 1, 153]}
            color={vc.muted}
            width={1.25}
          />
          <Segment
            from={[cellX(period) - 1, 143]}
            to={[cellX(period) - 1, 153]}
            color={vc.muted}
            width={1.25}
          />
          <TextLabel at={[cellX(period / 2), 166]} size={11} mono>
            {step === 'doubling' ? `period 2n = ${period}` : `period n(n+1) = ${period}`}
          </TextLabel>
        </g>

        <TextLabel at={[DOT_X0 - 6, DOT_Y0 - 24]} align="start" size={11} mono opacity={dots}>
          400 customer ids
        </TextLabel>
        <Dots
          moves={(h) => (after(step, 'real-keys') ? movesOnResize(h, n, m) : null)}
          shown={dots}
        />

        <Bar
          y={BAR_Y[0]}
          count={moved}
          color={MOVE}
          label={`moved by modulo: ${moved}`}
          shown={dots}
        />
        <Bar
          y={BAR_Y[1]}
          count={HASHES.length - moved}
          color={STAY}
          label={`stay: ${HASHES.length - moved}`}
          shown={dots}
        />
        <Bar
          y={BAR_Y[2]}
          count={Math.round(HASHES.length / m)}
          color={FEWEST}
          label={`fewest a new bucket needs: ${Math.round(HASHES.length / m)}`}
          shown={fewestShown}
        />
      </Stage>

      <VizControls>
        {step === 'any-n' || step === 'doubling' ? (
          <LabeledSlider
            label="$n$"
            value={nParam}
            onChange={(v) => setN(Math.round(v))}
            min={2}
            max={step === 'doubling' ? 12 : 16}
            step={1}
            format={(v) => String(Math.round(v))}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            {compared ? 'Blue: stays. Orange: moves.' : 'Hash values and their buckets'}
          </span>
        )}
      </VizControls>
    </>
  )
}
