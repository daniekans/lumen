import { Play } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'
import { clamp, lerpVec, type Vec2 } from '@/lib/math'
import { alpha, vc } from '@/styles/viz-colors'
import { Button, Divider } from '@/ui/atoms'
import { LabeledSlider } from '@/ui/molecules'
import {
  Arc,
  connect,
  DiagramEdge,
  DiagramNode,
  HtmlBox,
  MathLabel,
  Packet,
  Point,
  Segment,
  Stage,
  TextLabel,
  useAnimatedValue,
  useCoords,
  useSequence,
  useStepEffect,
  useVizStep,
  VizControls,
  type Box,
  type Curve,
  type NodeState,
} from '@/viz-kit'
import { ContextPanel } from './ContextPanel'
import { chunks, queryPos, ranked, topicCenters, type Topic } from './data'

/* Layout in design units (y grows downward). */
const NODE_W = 118
const NODE_H = 54
const TOP = 88
const BOTTOM = 318
const node = (x: number, y: number): Box => ({ x, y, w: NODE_W, h: NODE_H })

const nodes = {
  docs: {
    box: node(70, TOP),
    label: 'Documents',
    sub: 'help center',
    color: vc.blue,
    phases: [0],
    description: 'Source material, here three short help-center articles for a note-taking app.',
  },
  chunker: {
    box: node(205, TOP),
    label: 'Chunker',
    sub: 'split',
    color: vc.blue,
    phases: [0, 1],
    description:
      'Splits each document into passages small enough to retrieve and read on their own.',
  },
  embedIndex: {
    box: node(340, TOP),
    label: 'Embed',
    sub: 'model',
    color: vc.blue,
    phases: [1],
    description:
      'Maps each chunk to a vector, so chunks with similar meaning end up close together.',
  },
  store: {
    box: node(475, TOP),
    label: 'Vector store',
    sub: 'index',
    color: vc.blue,
    phases: [1, 3],
    description: 'Keeps every vector next to its chunk text and answers nearest-neighbour queries.',
  },
  question: {
    box: node(70, BOTTOM),
    label: 'Question',
    sub: 'user',
    color: vc.yellow,
    phases: [2],
    description: 'The user question, in plain language.',
  },
  embedQuery: {
    box: node(205, BOTTOM),
    label: 'Embed',
    sub: 'same model',
    color: vc.yellow,
    phases: [2, 3],
    description: 'The same embedding model places the question in the same space as the chunks.',
  },
  search: {
    box: node(340, BOTTOM),
    label: 'Search',
    sub: 'top-k',
    color: vc.yellow,
    phases: [3, 4],
    description: 'Finds the k chunk vectors closest to the question vector.',
  },
  prompt: {
    box: node(475, BOTTOM),
    label: 'Prompt',
    sub: 'assembly',
    color: vc.yellow,
    phases: [4, 5],
    description: 'Places the retrieved chunks and the question into a single prompt.',
  },
  llm: {
    box: node(610, BOTTOM),
    label: 'LLM',
    sub: 'generator',
    color: vc.teal,
    phases: [5],
    description: 'Generates text conditioned on the prompt, so it can use the retrieved facts.',
  },
  answer: {
    box: node(745, BOTTOM),
    label: 'Answer',
    sub: 'with citations',
    color: vc.teal,
    phases: [5],
    description: 'The response, with numbers pointing back to the chunks it relied on.',
  },
}
type NodeId = keyof typeof nodes

interface EdgeDef {
  id: string
  curve: Curve
  phase: number
  /** Part of the phase, as [start, end] fractions, during which packets travel this edge. */
  window: [number, number]
  packets: number
  color: string
}

const edge = (
  id: string,
  a: NodeId,
  b: NodeId,
  phase: number,
  window: [number, number],
  packets = 1,
  opts = {},
): EdgeDef => ({
  id,
  curve: connect(nodes[a].box, nodes[b].box, opts),
  phase,
  window,
  packets,
  color: nodes[b].color,
})

const edges: EdgeDef[] = [
  edge('docs-chunker', 'docs', 'chunker', 0, [0, 0.55], 3),
  edge('chunker-embed', 'chunker', 'embedIndex', 1, [0, 0.4], 3),
  edge('embed-store', 'embedIndex', 'store', 1, [0.3, 0.7], 3),
  edge('question-embed', 'question', 'embedQuery', 2, [0, 0.5]),
  edge('embed-search', 'embedQuery', 'search', 3, [0, 0.45]),
  edge('store-search', 'store', 'search', 3, [0, 0.45], 2, {
    from: 'bottom',
    to: 'top',
    bend: 0.4,
  }),
  edge('search-prompt', 'search', 'prompt', 4, [0, 0.4], 2),
  edge('prompt-llm', 'prompt', 'llm', 5, [0, 0.25]),
  edge('llm-answer', 'llm', 'answer', 5, [0.2, 0.42]),
]

/** Duration of each phase, and the part of it during which its result is revealed. */
const phases = [
  { duration: 2.2, reveal: [0.25, 1] },
  { duration: 2.6, reveal: [0.35, 0.95] },
  { duration: 1.6, reveal: [0.45, 1] },
  { duration: 2.2, reveal: [0.4, 1] },
  { duration: 2.2, reveal: [0.3, 1] },
  { duration: 4.2, reveal: [0.4, 1] },
] as const

const local = (p: number, [a, b]: readonly [number, number]) => clamp((p - a) / (b - a), 0, 1)

/* Embedding space panel: maps the 2D projection into design units. */
const SPACE = { x: 568, y: 8, w: 244, h: 214 }
const SPACE_CENTER: Vec2 = [690, 134]
const SPACE_SCALE = 108
const toSpace = (p: Vec2): Vec2 => [
  SPACE_CENTER[0] + p[0] * SPACE_SCALE,
  SPACE_CENTER[1] - p[1] * SPACE_SCALE,
]

export default function RagPipeline() {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState<number[]>(() => phases.map(() => 0))
  const [k, setK] = useState(3)
  const [hovered, setHovered] = useState<NodeId | null>(null)
  const [selected, setSelected] = useState<NodeId | null>(null)
  const autoplay = useRef(false)
  const chaining = useRef(false)
  const seq = useSequence()
  const { index, goTo } = useVizStep()

  const play = (p: number) => {
    if (chaining.current) chaining.current = false
    else autoplay.current = false
    setPhase(p)
    setProgress(phases.map((_, i) => (i < p ? 1 : 0)))
    void seq.run(async ({ tween, wait }) => {
      await tween(0, 1, {
        duration: phases[p]!.duration,
        ease: 'linear',
        onUpdate: (v) => setProgress((prev) => prev.map((x, i) => (i === p ? v : x))),
      })
      if (autoplay.current && p < phases.length - 1) {
        await wait(0.6)
        chaining.current = true
        goTo(p + 1)
      } else {
        autoplay.current = false
      }
    })
  }

  const runQuery = () => {
    autoplay.current = true
    chaining.current = true
    if (index === 2) play(2)
    else goTo(2)
  }

  useStepEffect({
    indexing: () => play(0),
    embedding: () => play(1),
    query: () => play(2),
    retrieval: () => play(3),
    prompt: () => play(4),
    generation: () => play(5),
  })

  const reveal = (p: number) => local(progress[p] ?? 0, phases[p]!.reveal)
  const retrieved = ranked.slice(0, k)
  const radius = useAnimatedValue((retrieved.at(-1)?.distance ?? 0) * SPACE_SCALE + 7, {
    duration: 0.5,
  })
  const focusId = hovered ?? selected
  const focus = focusId
    ? { title: nodes[focusId].label, description: nodes[focusId].description }
    : undefined

  const nodeState = (id: NodeId): NodeState => {
    const ps = nodes[id].phases
    if (ps.includes(phase)) return 'active'
    return Math.min(...ps) < phase ? 'done' : 'idle'
  }
  const edgeState = (e: EdgeDef) =>
    e.phase === phase ? 'active' : e.phase < phase ? 'done' : 'idle'

  const q = toSpace(queryPos)
  const pointsReveal = phase > 1 ? 1 : phase === 1 ? reveal(1) : 0
  const queryReveal = phase > 2 ? 1 : phase === 2 ? reveal(2) : 0
  const retrieveReveal = phase > 3 ? 1 : phase === 3 ? reveal(3) : 0

  return (
    <>
      <Stage
        domain={{ x: [0, 820], y: [0, 640] }}
        yUp={false}
        ariaLabel="Retrieval-augmented generation pipeline"
      >
        <Frame x={8} y={8} w={544} h={142} title="Indexing, done ahead of time" />
        <Frame x={8} y={238} w={804} h={142} title="Query, for every question" />
        <Frame {...SPACE} title="Vector store, 2D view" />

        <TextLabel at={SPACE_CENTER} size={11} color={vc.subtle} opacity={pointsReveal > 0 ? 0 : 1}>
          Empty until chunks are embedded
        </TextLabel>
        {(Object.keys(topicCenters) as Topic[]).map((t) => (
          <TextLabel
            key={t}
            at={toSpace(topicCenters[t])}
            size={10.5}
            color={vc.subtle}
            opacity={pointsReveal > 0.5 ? 1 : 0}
          >
            {t}
          </TextLabel>
        ))}

        <ClipTo {...SPACE}>
          <Arc
            center={q}
            r={radius}
            from={0}
            to={Math.PI * 2}
            color={vc.yellow}
            width={1}
            dash="3 4"
            opacity={retrieveReveal * 0.7}
            fill={vc.yellow}
            fillOpacity={0.06}
          />
          {retrieved.map((r) => (
            <Segment
              key={r.chunk.id}
              from={q}
              to={lerpVec(q, toSpace(r.chunk.pos), retrieveReveal)}
              color={vc.yellow}
              width={1.25}
              opacity={0.8 * Math.min(1, retrieveReveal * 3)}
            />
          ))}
          {chunks.map((c, i) => {
            const rank = retrieveReveal > 0 ? retrieved.findIndex((r) => r.chunk.id === c.id) : -1
            return (
              <g key={c.id} style={{ opacity: clamp(pointsReveal * chunks.length - i, 0, 1) }}>
                <Point at={toSpace(c.pos)} r={4} color={rank >= 0 ? vc.yellow : vc.blue} />
                {rank >= 0 && (
                  <TextLabel
                    at={[toSpace(c.pos)[0] + 9, toSpace(c.pos)[1] - 8]}
                    size={10}
                    color={vc.yellow}
                    mono
                    align="start"
                    opacity={retrieveReveal}
                  >
                    {String(rank + 1)}
                  </TextLabel>
                )}
              </g>
            )
          })}
          <g style={{ opacity: queryReveal }}>
            <Point at={q} r={5.5} color={vc.yellow} hollow />
            <MathLabel
              at={q}
              tex="q"
              color={vc.yellow}
              anchor="w"
              offset={10}
              size={15}
              opacity={queryReveal}
            />
          </g>
        </ClipTo>

        {edges.map((e) => (
          <DiagramEdge key={e.id} curve={e.curve} state={edgeState(e)} color={e.color} />
        ))}
        {(Object.keys(nodes) as NodeId[]).map((id) => (
          <DiagramNode
            key={id}
            box={nodes[id].box}
            label={nodes[id].label}
            sublabel={id === 'search' ? `top-${k}` : nodes[id].sub}
            color={nodes[id].color}
            state={nodeState(id)}
            onHover={(h) => setHovered(h ? id : null)}
            onClick={() => setSelected((s) => (s === id ? null : id))}
          />
        ))}
        {edges
          .filter((e) => e.phase === phase)
          .flatMap((e) => {
            const raw = ((progress[phase] ?? 0) - e.window[0]) / (e.window[1] - e.window[0])
            const spread = 0.28
            return Array.from({ length: e.packets }, (_, n) => {
              const t = raw * (1 + spread * (e.packets - 1)) - spread * n
              return t > 0 && t < 1 ? (
                <Packet key={`${e.id}-${n}`} curve={e.curve} t={t} color={e.color} r={4.5} />
              ) : null
            })
          })}

        <HtmlBox x={8} y={396} width={804} height={244}>
          <ContextPanel
            phase={phase}
            reveal={reveal(phase)}
            retrieved={retrieved}
            k={k}
            focus={focus}
          />
        </HtmlBox>
      </Stage>

      <VizControls>
        <Button variant="primary" icon={<Play size={14} />} onClick={runQuery}>
          Run query
        </Button>
        <Divider />
        <LabeledSlider
          label="top-$k$"
          value={k}
          onChange={(v) => setK(Math.round(v))}
          min={1}
          max={5}
          step={1}
          color={vc.yellow}
          format={(v) => String(v)}
        />
      </VizControls>
    </>
  )
}

/** Light rounded region with a caption, grouping part of the diagram. */
function Frame({
  x,
  y,
  w,
  h,
  title,
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
}) {
  const c = useCoords()
  const [px, py] = c.toPx([x, y])
  return (
    <g pointerEvents="none">
      <rect
        x={px}
        y={py}
        width={w * c.unit}
        height={h * c.unit}
        rx={12 * c.unit}
        style={{ fill: alpha(vc.fg, 0.02), stroke: vc.grid }}
        strokeWidth={1}
      />
      <TextLabel at={[x + 14, y + 18]} size={10.5} color={vc.subtle} align="start" uppercase>
        {title}
      </TextLabel>
    </g>
  )
}

/** Clips children to a rounded rectangle given in design units. */
function ClipTo({
  x,
  y,
  w,
  h,
  children,
}: {
  x: number
  y: number
  w: number
  h: number
  children: ReactNode
}) {
  const c = useCoords()
  const id = useId()
  const [px, py] = c.toPx([x, y])
  return (
    <>
      <clipPath id={id}>
        <rect x={px} y={py} width={w * c.unit} height={h * c.unit} rx={12 * c.unit} />
      </clipPath>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  )
}
