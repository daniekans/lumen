import { filesFor, formatBytes } from '@/lib/partitioning'
import { alpha, vc } from '@/styles/viz-colors'
import { Readout, ReadoutPanel } from '@/ui/molecules'
import {
  MathLabel,
  Overlay,
  SqlLabel,
  Stage,
  TextLabel,
  useAnimatedValue,
  useCoords,
  useVizStep,
} from '@/viz-kit'

const GB = 1e9
const DAYS = 365
const PER_DAY = 2 * GB
const TABLE = DAYS * PER_DAY
const TARGET = 1 * GB
const COUNTRIES = 50
const USERS = 1e7
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
/** The query's day, April 14 (from 0), and April's first day. */
const QUERY_DAY = 103
const APRIL = 90
const QUERY_COUNTRY = 17

/** The table rectangle and the size line below it. */
const RX = 70
const RY = 130
const RW = 640
const RH = 230
const LINE_Y = 500
const LOG_MIN = 2
const LOG_MAX = 12
const logX = (bytes: number) => RX + ((Math.log10(bytes) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * RW

const STEPS = ['area', 'by-day', 'by-month', 'day-country', 'by-user', 'rule'] as const
type StepId = (typeof STEPS)[number]

interface Layout {
  /** Partitions across (days or months) and down (countries or users) the rectangle. */
  across: 'none' | 'day' | 'month'
  down: 'none' | 'country' | 'user'
  partitions: number
  /** Bytes of one partition (the average for months), and how the readout words it. */
  size: number
  sizeText?: string
  files: number
  query: string
  /** Bytes the query reads, and the region it reads as day and row fractions. */
  read?: number
  region?: { day0: number; days: number; row0: number; rows: number }
}

const day = (where = '') => `WHERE day = '2026-04-14'${where}`
const wholeDay = { day0: QUERY_DAY, days: 1, row0: 0, rows: 1 }

const LAYOUTS: Record<StepId, Layout> = {
  area: {
    across: 'none',
    down: 'none',
    partitions: 1,
    size: TABLE,
    files: TABLE / TARGET,
    query: day(),
    read: TABLE,
    region: { day0: 0, days: DAYS, row0: 0, rows: 1 },
  },
  'by-day': {
    across: 'day',
    down: 'none',
    partitions: DAYS,
    size: PER_DAY,
    files: DAYS * filesFor(PER_DAY, TARGET),
    query: day(),
    read: PER_DAY,
    region: wholeDay,
  },
  'by-month': {
    across: 'month',
    down: 'none',
    partitions: 12,
    size: TABLE / 12,
    sizeText: '56 to 62 GB',
    files: MONTH_DAYS.reduce((s, d) => s + filesFor(d * PER_DAY, TARGET), 0),
    query: day(),
    read: 30 * PER_DAY,
    region: { day0: APRIL, days: 30, row0: 0, rows: 1 },
  },
  'day-country': {
    across: 'day',
    down: 'country',
    partitions: DAYS * COUNTRIES,
    size: PER_DAY / COUNTRIES,
    files: DAYS * COUNTRIES * filesFor(PER_DAY / COUNTRIES, TARGET),
    query: day(" AND country = 'PT'"),
    read: PER_DAY / COUNTRIES,
    region: { day0: QUERY_DAY, days: 1, row0: QUERY_COUNTRY / COUNTRIES, rows: 1 / COUNTRIES },
  },
  'by-user': {
    across: 'day',
    down: 'user',
    partitions: DAYS * USERS,
    size: PER_DAY / USERS,
    files: DAYS * USERS,
    query: day(' AND user_id = 42'),
    read: PER_DAY / USERS,
    region: { day0: QUERY_DAY, days: 1, row0: 0.4, rows: 0.004 },
  },
  rule: {
    across: 'day',
    down: 'none',
    partitions: DAYS,
    size: PER_DAY,
    files: DAYS * filesFor(PER_DAY, TARGET),
    query: day(),
    read: PER_DAY,
    region: wholeDay,
  },
}

/** Day boundaries at the end of each month but the last. */
const MONTH_ENDS = MONTH_DAYS.slice(0, -1).reduce<number[]>(
  (ends, d) => [...ends, (ends.at(-1) ?? 0) + d],
  [],
)

/** A family of parallel lines across the table rectangle, fading as a group. */
function Lines({
  at,
  vertical,
  opacity,
}: {
  at: readonly number[]
  vertical: boolean
  opacity: number
}) {
  const c = useCoords()
  const d = at
    .map((f) => {
      const [x0, y0] = c.toPx(vertical ? [RX + f * RW, RY] : [RX, RY + f * RH])
      const [x1, y1] = c.toPx(vertical ? [RX + f * RW, RY + RH] : [RX + RW, RY + f * RH])
      return `M${x0} ${y0}L${x1} ${y1}`
    })
    .join('')
  return (
    <path
      d={d}
      style={{ stroke: vc.gridStrong, opacity, transition: 'opacity var(--dur-slow)' }}
      strokeWidth={0.75}
      fill="none"
    />
  )
}

function Rect({
  x,
  y,
  w,
  h,
  fill,
  stroke,
  opacity = 1,
}: {
  x: number
  y: number
  w: number
  h: number
  fill: string
  stroke?: string
  opacity?: number
}) {
  const c = useCoords()
  const [px, py] = c.toPx([x, y])
  return (
    <rect
      x={px}
      y={py}
      width={Math.max(w * c.unit, 1.5)}
      height={Math.max(h * c.unit, 1.5)}
      style={{ fill, stroke, opacity, transition: 'opacity var(--dur-slow)' }}
      strokeWidth={stroke ? 1.25 : 0}
    />
  )
}

/** The size line: powers of ten of bytes, a log scale. */
function SizeLine({ size }: { size: number }) {
  const c = useCoords()
  const u = c.unit
  const [x0, y] = c.toPx([RX, LINE_Y])
  const [x1] = c.toPx([RX + RW, LINE_Y])
  const powers = Array.from({ length: LOG_MAX - LOG_MIN + 1 }, (_, k) => LOG_MIN + k)
  const [tx] = c.toPx([logX(TARGET), LINE_Y])
  const [sx] = c.toPx([logX(size), LINE_Y])
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} style={{ stroke: vc.axis }} strokeWidth={2} />
      {powers.map((p) => {
        const [px] = c.toPx([logX(10 ** p), LINE_Y])
        const major = p % 3 === 0
        return (
          <line
            key={p}
            x1={px}
            y1={y - (major ? 6 : 3) * u}
            x2={px}
            y2={y + (major ? 6 : 3) * u}
            style={{ stroke: vc.axis }}
            strokeWidth={1.5}
          />
        )
      })}
      <line
        x1={tx}
        y1={y - 16 * u}
        x2={tx}
        y2={y + 16 * u}
        style={{ stroke: vc.yellow }}
        strokeWidth={2}
      />
      <circle cx={sx} cy={y} r={6 * u} style={{ fill: vc.blue }} />
    </g>
  )
}

export default function HowFineToPartition() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '') ? (id as StepId) : 'area'
  const L = LAYOUTS[step]

  const dayLines = useAnimatedValue(L.across === 'day' ? 1 : 0)
  const monthLines = useAnimatedValue(L.across === 'month' ? 1 : 0)
  const countryLines = useAnimatedValue(L.down === 'country' ? 1 : 0)
  const userLines = useAnimatedValue(L.down === 'user' ? 1 : 0)
  const logSize = useAnimatedValue(Math.log10(L.size), { duration: 1 })
  const size = 10 ** logSize

  const fmtCount = (n: number) => n.toLocaleString('en-US')

  return (
    <Stage
      domain={{ x: [20, 760], y: [40, 580] }}
      yUp={false}
      ariaLabel="A year of events drawn as a rectangle with days across, cut into partitions by day, month, country or user, with the region a query reads and a log scale of partition sizes against the target file size"
      overlay={
        <Overlay corner="top-right">
          <ReadoutPanel>
            <Readout label="partitions" value={fmtCount(L.partitions)} />
            <Readout
              label="partition size"
              value={L.sizeText ?? formatBytes(L.size)}
              color={vc.blue}
            />
            <Readout label="files" value={fmtCount(L.files)} />
            {L.read !== undefined && (
              <Readout label="query reads" value={formatBytes(L.read)} color={vc.blue} />
            )}
          </ReadoutPanel>
        </Overlay>
      }
    >
      <SqlLabel at={[RX, 70]}>{`SELECT ... FROM events ${L.query}`}</SqlLabel>

      <Rect x={RX} y={RY} w={RW} h={RH} fill="var(--bg-elevated)" stroke={vc.gridStrong} />
      <Lines
        at={Array.from({ length: DAYS - 1 }, (_, k) => (k + 1) / DAYS)}
        vertical
        opacity={0.45 * dayLines}
      />
      <Lines at={MONTH_ENDS.map((d) => d / DAYS)} vertical opacity={monthLines} />
      <Lines
        at={Array.from({ length: COUNTRIES - 1 }, (_, k) => (k + 1) / COUNTRIES)}
        vertical={false}
        opacity={0.6 * countryLines}
      />
      <Lines
        at={Array.from({ length: 199 }, (_, k) => (k + 1) / 200)}
        vertical={false}
        opacity={0.6 * userLines}
      />
      {L.region && (
        <Rect
          x={RX + (L.region.day0 / DAYS) * RW}
          y={RY + L.region.row0 * RH}
          w={(L.region.days / DAYS) * RW}
          h={L.region.rows * RH}
          fill={alpha(vc.blue, 0.45)}
          stroke={vc.blue}
        />
      )}

      <TextLabel at={[RX + RW / 2, RY + RH + 20]} size={11} uppercase>
        days of the year
      </TextLabel>
      <TextLabel at={[RX - 12, RY + RH / 2]} align="end" size={11} uppercase opacity={countryLines}>
        country
      </TextLabel>
      <TextLabel at={[RX - 12, RY + RH / 2]} align="end" size={11} uppercase opacity={userLines}>
        user
      </TextLabel>

      <TextLabel at={[RX, LINE_Y - 50]} align="start" size={11} uppercase>
        partition size, log scale
      </TextLabel>
      <SizeLine size={size} />
      {(['100 B', '1 KB', '1 MB', '1 GB', '1 TB'] as const).map((label, k) => (
        <TextLabel key={label} at={[logX(10 ** (k === 0 ? 2 : 3 * k)), LINE_Y + 24]} size={11} mono>
          {label}
        </TextLabel>
      ))}
      <MathLabel at={[logX(TARGET), LINE_Y - 28]} tex="T" color={vc.yellow} size={16} />
      <TextLabel at={[logX(size), LINE_Y + 46]} size={12} mono color={vc.blue}>
        {formatBytes(L.size)}
      </TextLabel>
    </Stage>
  )
}
