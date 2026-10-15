import { useAnimationFrame, useReducedMotion } from 'motion/react'
import { useRef } from 'react'

interface LissajousMarkProps {
  size?: number
  a?: number
  b?: number
  color?: string
  strokeWidth?: number
  /** Radians per second of phase drift. */
  speed?: number
  /** Draws a dot tracing the curve with projection guides to the axes. */
  tracer?: boolean
}

/**
 * Slowly drifting Lissajous curve x = sin(a t + phi), y = sin(b t). Used as the logo mark and as
 * the home page figure. The path is written directly to the DOM each frame to avoid re-renders.
 */
export function LissajousMark({
  size = 22,
  a = 3,
  b = 2,
  color = 'var(--viz-blue)',
  strokeWidth = 1.75,
  speed = 0.25,
  tracer = false,
}: LissajousMarkProps) {
  const path = useRef<SVGPathElement>(null)
  const dot = useRef<SVGCircleElement>(null)
  const guideX = useRef<SVGLineElement>(null)
  const guideY = useRef<SVGLineElement>(null)
  const reduced = useReducedMotion()
  const pad = strokeWidth * 2 + (tracer ? 10 : 0)
  const r = size / 2 - pad
  const c = size / 2

  useAnimationFrame((ms) => {
    const t = ms / 1000
    const phi = reduced ? Math.PI / 4 : Math.PI / 4 + t * speed
    if (path.current) {
      const n = 220
      let d = ''
      for (let k = 0; k <= n; k++) {
        const s = (k / n) * Math.PI * 2
        d += `${k ? 'L' : 'M'}${(c + r * Math.sin(a * s + phi)).toFixed(2)},${(c + r * Math.sin(b * s)).toFixed(2)}`
      }
      path.current.setAttribute('d', d)
    }
    if (tracer && dot.current && guideX.current && guideY.current) {
      const s = reduced ? 0.6 : t * 0.45
      const x = c + r * Math.sin(a * s + phi)
      const y = c + r * Math.sin(b * s)
      dot.current.setAttribute('cx', String(x))
      dot.current.setAttribute('cy', String(y))
      guideX.current.setAttribute('x1', String(x))
      guideX.current.setAttribute('x2', String(x))
      guideX.current.setAttribute('y1', String(y))
      guideY.current.setAttribute('y1', String(y))
      guideY.current.setAttribute('y2', String(y))
      guideY.current.setAttribute('x1', String(x))
    }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      {tracer && (
        <g style={{ stroke: 'var(--fg-subtle)' }} strokeWidth={1} strokeDasharray="2 5">
          <line ref={guideX} y2={size - 2} />
          <line ref={guideY} x2={size - 2} />
        </g>
      )}
      <path
        ref={path}
        fill="none"
        style={{ stroke: color }}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {tracer && <circle ref={dot} r={5} style={{ fill: 'var(--viz-yellow)' }} />}
    </svg>
  )
}
