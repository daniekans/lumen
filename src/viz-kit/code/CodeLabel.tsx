import { useContext } from 'react'
import { tokenizeCode, type CodeHue, type CodeLang, type CodeTokenKind } from '@/lib/code'
import type { Vec2 } from '@/lib/math'
import { codeTokenStyle } from '@/ui/atoms'
import { HighlightContext, useCoords } from '../stage'

export interface CodeLabelProps {
  at: Vec2
  /** One line of code. */
  children: string
  lang: CodeLang
  /** Names drawn in a stage color, such as `{ A: 'blue' }`. */
  colors?: Readonly<Record<string, CodeHue>>
  /** Names linked to a shape's `hoverKey`: hovering one lights the other (`useHighlight`). */
  hoverKeys?: Readonly<Record<string, string>>
  /** Colors that replace the palette's for some kinds, such as an item's own literal color. */
  kindColors?: Partial<Record<CodeTokenKind, string>>
  /** Font size in pixels. */
  size?: number
  align?: 'start' | 'middle' | 'end'
  opacity?: number
}

/**
 * A line of code in SVG with the shared code palette (keywords purple, calls teal, literals
 * orange, names in the foreground, operators muted). Names may take their shape's color and
 * link to it by hover, both ways.
 */
export function CodeLabel({
  at,
  children,
  lang,
  colors,
  hoverKeys,
  kindColors,
  size = 13,
  align = 'start',
  opacity = 1,
}: CodeLabelProps) {
  const c = useCoords()
  const h = useContext(HighlightContext)
  const [x, y] = c.toPx(at)
  const lit = h?.active ?? h?.hint
  const tokens = tokenizeCode(lang, children)[0] ?? []
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
      {tokens.map((t, k) => {
        const style = codeTokenStyle(t, colors)
        const fill = (!colors?.[t.text] && kindColors?.[t.kind]) || style.color
        const key = t.kind === 'name' ? hoverKeys?.[t.text] : undefined
        const on = key !== undefined && lit === key
        return (
          <tspan
            key={k}
            style={{
              fill,
              fontWeight: on ? 700 : style.fontWeight,
              fontStyle: style.fontStyle,
              textDecoration: key ? (on ? 'underline' : 'underline dotted') : undefined,
              transition: 'font-weight var(--dur-fast) var(--ease-out)',
            }}
            pointerEvents={key && h ? 'visiblePainted' : undefined}
            onPointerEnter={key && h ? () => h.set(key) : undefined}
            onPointerLeave={key && h ? () => h.active === key && h.set(null) : undefined}
          >
            {t.text}
          </tspan>
        )
      })}
    </text>
  )
}
