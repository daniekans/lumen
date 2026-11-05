import type { Vec2 } from '@/lib/math'
import { tokenizeSql, type SqlTokenKind } from '@/lib/sql'
import { codeColor } from '@/styles/viz-colors'
import { useCoords } from '../stage'

interface SqlLabelProps {
  at: Vec2
  children: string
  /** Color of string and number literals: orange, or the item's own filter color. */
  literalColor?: string
  /** Font size in pixels. */
  size?: number
  align?: 'start' | 'middle' | 'end'
  opacity?: number
}

/**
 * A line of SQL in monospace with light highlighting: keywords in purple, functions in teal,
 * names in the foreground, operators and punctuation muted, literals in `literalColor`.
 */
export function SqlLabel({
  at,
  children,
  literalColor = codeColor.string,
  size = 13,
  align = 'start',
  opacity = 1,
}: SqlLabelProps) {
  const c = useCoords()
  const [x, y] = c.toPx(at)
  const fill: Record<SqlTokenKind, string> = {
    keyword: codeColor.keyword,
    function: codeColor.function,
    other: codeColor.operator,
    identifier: codeColor.name,
    string: literalColor,
    number: literalColor,
  }
  return (
    <text
      x={x}
      y={y}
      textAnchor={align}
      dominantBaseline="central"
      pointerEvents="none"
      style={{
        fontSize: size,
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'pre',
        opacity,
        transition: 'opacity var(--dur-slow) var(--ease-out)',
      }}
    >
      {tokenizeSql(children).map((t, k) => (
        <tspan key={k} style={{ fill: fill[t.kind], fontWeight: t.kind === 'keyword' ? 600 : 400 }}>
          {t.text}
        </tspan>
      ))}
    </text>
  )
}
