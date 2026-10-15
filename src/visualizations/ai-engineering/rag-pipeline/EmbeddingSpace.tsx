import { useState } from 'react'
import { createPortal } from 'react-dom'
import { clamp, fmt, lerpVec, type Vec2 } from '@/lib/math'
import { vc } from '@/styles/viz-colors'
import { Arc, MathLabel, Point, Segment, TextLabel, useStage } from '@/viz-kit'
import { chunks, queryPos, topicCenters, type Chunk, type Ranked, type Topic } from './data'
import styles from './ContextPanel.module.css'

interface EmbeddingSpaceProps {
  /** Maps embedding coordinates to stage units. */
  toSpace: (p: Vec2) => Vec2
  /** Stage units per embedding unit, used to draw the search radius. */
  scale: number
  pointsReveal: number
  queryReveal: number
  retrieveReveal: number
  retrieved: readonly Ranked[]
  /** Distance of the farthest retrieved chunk, animated by the caller. */
  searchDistance: number
  /** Larger marks, hover details and distances, for the expanded view. */
  detailed?: boolean
}

/** The 2D view of the vector store: chunk points by topic, the query and its nearest chunks. */
export function EmbeddingSpace({
  toSpace,
  scale,
  pointsReveal,
  queryReveal,
  retrieveReveal,
  retrieved,
  searchDistance,
  detailed = false,
}: EmbeddingSpaceProps) {
  const { coords } = useStage()
  const [hovered, setHovered] = useState<Chunk | null>(null)
  const q = toSpace(queryPos)
  const pointR = detailed ? 6 : 4
  const radius = searchDistance * scale + (detailed ? 12 : 7) / coords.unit

  return (
    <g>
      {(Object.keys(topicCenters) as Topic[]).map((t) => (
        <TextLabel
          key={t}
          at={toSpace(topicCenters[t])}
          size={detailed ? 12 : 10.5}
          color={vc.subtle}
          uppercase={detailed}
          opacity={pointsReveal > 0.5 ? 1 : 0}
        >
          {t}
        </TextLabel>
      ))}
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
          width={detailed ? 1.5 : 1.25}
          opacity={0.8 * Math.min(1, retrieveReveal * 3)}
        />
      ))}
      {chunks.map((c, i) => {
        const rank = retrieveReveal > 0 ? retrieved.findIndex((r) => r.chunk.id === c.id) : -1
        const at = toSpace(c.pos)
        const [px, py] = coords.toPx(at)
        return (
          <g
            key={c.id}
            style={{ opacity: clamp(pointsReveal * chunks.length - i, 0, 1) }}
            onPointerEnter={detailed ? () => setHovered(c) : undefined}
            onPointerLeave={detailed ? () => setHovered(null) : undefined}
          >
            {detailed && <circle cx={px} cy={py} r={14} fill="transparent" />}
            <Point
              at={at}
              r={hovered?.id === c.id ? pointR + 2 : pointR}
              color={rank >= 0 ? vc.yellow : vc.blue}
            />
            {rank >= 0 && (
              <TextLabel
                at={coords.fromPx(px + (detailed ? 12 : 9), py - (detailed ? 11 : 8))}
                size={detailed ? 12 : 10}
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
        <Point at={q} r={detailed ? 7 : 5.5} color={vc.yellow} hollow />
        <MathLabel
          at={q}
          tex="q"
          color={vc.yellow}
          anchor="w"
          offset={detailed ? 14 : 10}
          size={detailed ? 18 : 15}
          opacity={queryReveal}
        />
      </g>
      {detailed && hovered && <ChunkTip chunk={hovered} at={toSpace(hovered.pos)} />}
    </g>
  )
}

/** Hover card with a chunk's text and its distance to the question. */
function ChunkTip({ chunk, at }: { chunk: Chunk; at: Vec2 }) {
  const { coords, labelLayer } = useStage()
  if (!labelLayer) return null
  const [x, y] = coords.toPx(at)
  const d = Math.hypot(chunk.pos[0] - queryPos[0], chunk.pos[1] - queryPos[1])
  return createPortal(
    <div className={styles.tip} style={{ transform: `translate(${x + 14}px, ${y + 12}px)` }}>
      <div className={styles.tipMeta}>
        chunk {chunk.id} · {chunk.topic} · d = {fmt(d)}
      </div>
      {chunk.text}
    </div>,
    labelLayer,
  )
}
