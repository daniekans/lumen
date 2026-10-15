import { memo } from 'react'
import { vc } from '@/styles/viz-colors'
import { useCoords } from '../stage'
import type { NetworkLayout } from './layout'
import styles from './NeuralNet.module.css'

export type NeuronRef = readonly [layer: number, index: number]

export interface EdgeStyle {
  color: string
  /** Stroke width in pixels. */
  width: number
  opacity: number
}

export interface NeuronStyle {
  /** Fill level from 0 (hollow) to 1 (solid). */
  fill: number
  fillColor?: string
  outline?: string
  /** Optional outer ring, used for gradients or highlights. */
  ring?: { color: string; opacity: number }
  /** Text drawn inside the neuron, usually the activation. */
  value?: string
}

interface NeuralNetProps {
  layout: NetworkLayout
  /** Style of the edge from neuron i in layer l to neuron j in layer l + 1. */
  edgeStyle: (l: number, j: number, i: number) => EdgeStyle
  neuronStyle: (l: number, i: number) => NeuronStyle
  onHover?: (n: NeuronRef | null) => void
  onSelect?: (n: NeuronRef) => void
}

/**
 * Generic layered network drawing. It owns geometry and transitions only; the visualization
 * decides what fills, colors and widths mean (activations, weights, gradients...). Style changes
 * animate through CSS transitions, so callers can set new targets without a render loop.
 */
export const NeuralNet = memo(function NeuralNet({
  layout,
  edgeStyle,
  neuronStyle,
  onHover,
  onSelect,
}: NeuralNetProps) {
  const c = useCoords()
  const r = layout.radius * c.unit
  const { neurons } = layout

  return (
    <g>
      <g strokeLinecap="round">
        {neurons.slice(0, -1).map((layer, l) =>
          layer.map((from, i) =>
            neurons[l + 1]!.map((to, j) => {
              const s = edgeStyle(l, j, i)
              const [x1, y1] = c.toPx(from)
              const [x2, y2] = c.toPx(to)
              const len = Math.hypot(x2 - x1, y2 - y1)
              const ux = (x2 - x1) / len
              const uy = (y2 - y1) / len
              return (
                <line
                  key={`${l}-${i}-${j}`}
                  className={styles.edge}
                  x1={x1 + ux * r}
                  y1={y1 + uy * r}
                  x2={x2 - ux * r}
                  y2={y2 - uy * r}
                  style={{ stroke: s.color, strokeWidth: s.width, opacity: s.opacity }}
                />
              )
            }),
          ),
        )}
      </g>
      {neurons.map((layer, l) =>
        layer.map((p, i) => {
          const s = neuronStyle(l, i)
          const [x, y] = c.toPx(p)
          const fillColor = s.fillColor ?? vc.fg
          return (
            <g
              key={`${l}-${i}`}
              className={styles.neuron}
              onPointerEnter={onHover && (() => onHover([l, i]))}
              onPointerLeave={onHover && (() => onHover(null))}
              onClick={onSelect && (() => onSelect([l, i]))}
            >
              <circle
                className={styles.ring}
                cx={x}
                cy={y}
                r={r + 6}
                style={{
                  fill: 'none',
                  stroke: s.ring?.color ?? 'transparent',
                  opacity: s.ring?.opacity ?? 0,
                }}
                strokeWidth={2}
              />
              <circle cx={x} cy={y} r={r} style={{ fill: 'var(--bg)' }} />
              <circle
                className={styles.fill}
                cx={x}
                cy={y}
                r={r}
                style={{ fill: fillColor, fillOpacity: Math.max(0, Math.min(1, s.fill)) }}
              />
              <circle
                className={styles.outline}
                cx={x}
                cy={y}
                r={r}
                style={{ fill: 'none', stroke: s.outline ?? vc.fg }}
                strokeWidth={1.5}
              />
              {s.value !== undefined && (
                <text
                  className={styles.value}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fill: s.fill > 0.55 ? 'var(--bg)' : vc.fg,
                    fontSize: Math.max(9, r * 0.5),
                  }}
                >
                  {s.value}
                </text>
              )}
            </g>
          )
        }),
      )}
    </g>
  )
})
