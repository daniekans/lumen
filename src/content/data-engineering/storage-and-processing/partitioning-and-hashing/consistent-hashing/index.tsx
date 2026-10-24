import type { Vec2 } from '@/lib/math'
import {
  arcShares,
  clockwise,
  hashInt,
  keysMovedByModulo,
  ownerOfKey,
  RING,
  ringPoints,
  type RingPoint,
} from '@/lib/partitioning'
import { alpha, vc } from '@/styles/viz-colors'
import { LabeledSlider, Readout, ReadoutPanel } from '@/ui/molecules'
import {
  Arc,
  MathLabel,
  Overlay,
  Pulse,
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
  'ring',
  'nodes',
  'owner',
  'arcs',
  'join',
  'leave',
  'virtual',
  'virtual-join',
] as const
type StepId = (typeof STEPS)[number]
const after = (step: StepId, from: StepId) => STEPS.indexOf(step) >= STEPS.indexOf(from)

const FOUR = ['node-A', 'node-B', 'node-C', 'node-D']
const FIVE = [...FOUR, 'node-E']
const NODE_COLOR: Record<string, string> = {
  'node-A': vc.blue,
  'node-B': vc.green,
  'node-C': vc.purple,
  'node-D': vc.teal,
  'node-E': vc.orange,
}
const KEYS = Array.from({ length: 24 }, (_, i) => 1001 + i)
const KEY0 = 1002
const V0 = 32

const CENTER: Vec2 = [-90, 0]
const R = 210
const KEY_R = R - 26

/** The angle of a ring position: 0 at the top, growing clockwise. */
const angle = (at: number) => Math.PI / 2 - (2 * Math.PI * at) / RING
const onRing = (at: number, r: number): Vec2 => [
  CENTER[0] + r * Math.cos(angle(at)),
  CENTER[1] + r * Math.sin(angle(at)),
]
const pct = (x: number) => `${(100 * x).toFixed(1)}%`

/** Nodes, points per node and the node shown leaving, for each step. */
const layout = (step: StepId, v: number) => {
  if (step === 'join') return { nodes: FIVE, v: 1, before: FOUR }
  if (step === 'leave') return { nodes: FIVE.filter((n) => n !== 'node-A'), v: 1, before: FIVE }
  if (step === 'virtual') return { nodes: FOUR, v, before: null }
  if (step === 'virtual-join') return { nodes: FIVE, v: V0, before: FOUR }
  return { nodes: FOUR, v: 1, before: null }
}

/** A dot in stage units with a pixel radius and a fill that cross-fades. */
function Dot({
  at,
  r,
  fill,
  stroke,
  opacity = 1,
}: {
  at: Vec2
  r: number
  fill: string
  stroke?: string
  opacity?: number
}) {
  const c = useCoords()
  const [x, y] = c.toPx(at)
  return (
    <circle
      cx={x}
      cy={y}
      r={r * c.unit}
      strokeWidth={stroke ? 2 : 0}
      style={{
        fill,
        stroke,
        opacity,
        transition: 'fill var(--dur-slow), stroke var(--dur-slow), opacity var(--dur-slow)',
      }}
    />
  )
}

export default function ConsistentHashing() {
  const { id } = useVizStep()
  const step: StepId = (STEPS as readonly string[]).includes(id ?? '') ? (id as StepId) : 'ring'
  const [key, setKey] = useVizParam<number>('key', KEY0)
  const [vParam, setV] = useVizParam<number>('v', V0)
  useStepEffect(
    Object.fromEntries(
      STEPS.map((s) => [
        s,
        () => {
          setKey(KEY0)
          setV(V0)
        },
      ]),
    ),
  )

  const { nodes, v, before } = layout(step, vParam)
  const points = ringPoints(nodes, v)
  const beforePoints = before ? ringPoints(before, step === 'virtual-join' ? V0 : 1) : null
  const shares = arcShares(points)
  const owners = new Map(KEYS.map((k) => [k, ownerOfKey(k, points)]))
  const moved = new Set(
    beforePoints ? KEYS.filter((k) => ownerOfKey(k, beforePoints) !== owners.get(k)) : [],
  )
  const keysOf = (n: string) => KEYS.filter((k) => owners.get(k) === n).length

  const nodesShown = useAnimatedValue(after(step, 'nodes') ? 1 : 0)
  const keysShown = useAnimatedValue(after(step, 'owner') ? 1 : 0)
  const arcsShown = useAnimatedValue(after(step, 'arcs') ? 1 : 0)
  const colored = after(step, 'owner')
  const labeled = v === 1

  const selected = step === 'owner' ? key : null
  const selPoint =
    selected === null ? null : (points.find((p) => p.at >= hashInt(selected)) ?? points[0]!)

  const shareRows = (list: readonly string[]) =>
    list.map(
      (n) =>
        [n, `${pct(shares.get(n) ?? 0)} · ${keysOf(n)} keys`, NODE_COLOR[n]] as [
          string,
          string,
          string,
        ],
    )
  const maxOverMean = Math.max(...shares.values()) * nodes.length

  const readouts: Record<StepId, [string, string | number, string?, string?][]> = {
    ring: [
      [
        'top',
        '$0$ and $2^{32}$',
        undefined,
        'The ring closes: the largest value sits next to $0$.',
      ],
      ['quarter turn', '$2^{30}$'],
    ],
    nodes: FOUR.map((n) => [
      `h(${n})`,
      `${pct(ringPoints([n])[0]!.at / RING)} of a turn`,
      NODE_COLOR[n],
    ]),
    owner: [
      ['key', key, vc.yellow],
      ['point', `${pct(hashInt(key) / RING)} of a turn`],
      ['node', owners.get(key)!, NODE_COLOR[owners.get(key)!]],
    ],
    arcs: [
      ...shareRows(['node-A', 'node-B', 'node-C', 'node-D']),
      [
        'max / mean',
        maxOverMean.toFixed(2),
        undefined,
        'The largest share over the fair share $\\frac{1}{4}$.',
      ],
    ],
    join: [
      ...shareRows(['node-A', 'node-E', 'node-B', 'node-D', 'node-C']),
      ['moved, ring', `${moved.size} / ${KEYS.length}`],
      [
        'moved, modulo',
        `${keysMovedByModulo(KEYS, 4, 5)} / ${KEYS.length}`,
        undefined,
        'Keys whose bucket changes from $h \\bmod 4$ to $h \\bmod 5$.',
      ],
    ],
    leave: [
      ...shareRows(['node-E', 'node-B', 'node-D', 'node-C']),
      ['moved', `${moved.size} / ${KEYS.length}`],
    ],
    virtual: [
      ['points per node $V$', v],
      ...shareRows(FOUR),
      ['max / mean', maxOverMean.toFixed(2)],
    ],
    'virtual-join': [
      ...shareRows(FIVE),
      [
        'max / mean',
        maxOverMean.toFixed(2),
        undefined,
        'The largest share over the fair share $\\frac{1}{5}$.',
      ],
      ['moved', `${moved.size} / ${KEYS.length}`],
    ],
  }

  const ownedArc = (p: RingPoint, i: number, list: readonly RingPoint[]) => {
    const prev = list[(i + list.length - 1) % list.length]!
    const span = list.length === 1 ? RING : clockwise(prev.at, p.at)
    const from = angle(p.at)
    return { from, to: from + (2 * Math.PI * span) / RING }
  }

  const leaving = step === 'leave' ? ringPoints(['node-A'])[0]! : null
  const joining = step === 'join' ? ringPoints(['node-E'])[0]! : null
  const ticks: [number, string][] = [
    [0, '0'],
    [RING / 4, '2^{30}'],
    [RING / 2, '2^{31}'],
    [(3 * RING) / 4, '3 \\cdot 2^{30}'],
  ]

  return (
    <>
      <Stage
        domain={{ x: [-330, 330], y: [-270, 270] }}
        ariaLabel="A ring of hash values with nodes and keys placed on it; each node owns the arc that ends at it"
        overlay={
          <Overlay corner="top-right">
            <ReadoutPanel>
              {readouts[step].map(([l, val, color, hint]) => (
                <Readout key={l} label={l} value={val} color={color} hint={hint} />
              ))}
            </ReadoutPanel>
          </Overlay>
        }
      >
        <Arc center={CENTER} r={R} from={0} to={2 * Math.PI} color={vc.gridStrong} width={1.5} />
        {ticks.map(([at, label]) => {
          return (
            <g key={label}>
              <Arc
                center={CENTER}
                r={R}
                from={angle(at) - 0.004}
                to={angle(at) + 0.004}
                color={vc.muted}
                width={8}
                opacity={0.6}
              />
              <MathLabel at={onRing(at, R - 52)} tex={label} color={vc.muted} size={13} />
            </g>
          )
        })}
        <TextLabel
          at={[CENTER[0] + 26, CENTER[1] + R + 8]}
          align="start"
          size={11}
          mono
          opacity={1 - nodesShown}
        >
          clockwise →
        </TextLabel>

        <g style={{ opacity: arcsShown }}>
          {points.map((p, i) => {
            const { from, to } = ownedArc(p, i, points)
            return (
              <Arc
                key={`${p.node}-${p.at}`}
                center={CENTER}
                r={R}
                from={from}
                to={to}
                color={alpha(NODE_COLOR[p.node]!, 0.75)}
                width={7}
              />
            )
          })}
        </g>

        {selected !== null && selPoint && (
          <Arc
            center={CENTER}
            r={KEY_R}
            from={angle(hashInt(selected))}
            to={
              angle(hashInt(selected)) -
              (2 * Math.PI * clockwise(hashInt(selected), selPoint.at)) / RING
            }
            color={vc.yellow}
            width={2}
          />
        )}

        <g style={{ opacity: keysShown }}>
          {KEYS.filter((k) => moved.has(k)).map((k) => (
            <Dot key={`m${k}`} at={onRing(hashInt(k), KEY_R)} r={9.5} fill="none" stroke={vc.fg} />
          ))}
          {KEYS.map((k) => {
            const owner = owners.get(k)!
            const isSel = k === selected
            return (
              <Dot
                key={k}
                at={onRing(hashInt(k), KEY_R)}
                r={isSel ? 6.5 : 5}
                fill={colored ? NODE_COLOR[owner]! : vc.subtle}
                stroke={isSel ? vc.yellow : undefined}
                opacity={selected === null || isSel ? 1 : 0.45}
              />
            )
          })}
        </g>

        {leaving && (
          <Dot at={onRing(leaving.at, R)} r={7} fill="var(--bg)" stroke={vc.muted} opacity={0.8} />
        )}
        {leaving && (
          <TextLabel at={onRing(leaving.at, R + 56)} size={11} mono>
            node-A left
          </TextLabel>
        )}

        <g style={{ opacity: nodesShown }}>
          {points.map((p) => (
            <Dot
              key={`${p.node}-${p.at}`}
              at={onRing(p.at, R)}
              r={labeled ? 7 : 4}
              fill={NODE_COLOR[p.node]!}
            />
          ))}
          {labeled &&
            points.map((p) => (
              <TextLabel
                key={p.node}
                at={onRing(p.at, R + 30)}
                size={12}
                mono
                color={NODE_COLOR[p.node]}
              >
                {p.node}
              </TextLabel>
            ))}
        </g>
        {joining && <Pulse at={onRing(joining.at, R)} when={step === 'join'} color={vc.orange} />}
      </Stage>

      <VizControls>
        {step === 'owner' ? (
          <LabeledSlider
            label="key"
            value={key}
            onChange={(x) => setKey(Math.round(x))}
            min={KEYS[0]!}
            max={KEYS.at(-1)!}
            step={1}
            format={(x) => String(Math.round(x))}
            color={vc.yellow}
          />
        ) : step === 'virtual' ? (
          <LabeledSlider
            label="$V$"
            value={Math.log2(vParam)}
            onChange={(x) => setV(2 ** Math.round(x))}
            min={0}
            max={7}
            step={1}
            format={(x) => String(2 ** Math.round(x))}
          />
        ) : (
          <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>
            {after(step, 'join') ? 'Ringed: a key that moved' : 'Hash values on a ring'}
          </span>
        )}
      </VizControls>
    </>
  )
}
