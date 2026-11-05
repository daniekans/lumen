import clsx from 'clsx'
import { useContext, useMemo, type CSSProperties } from 'react'
import { tokenizeCode, type CodeSnippet, type CodeTokens } from '@/lib/code'
import type { Vec2 } from '@/lib/math'
import surfaces from '@/styles/surfaces.module.css'
import { CodeTokenSpan } from '@/ui/atoms'
import { HighlightContext, HtmlBox } from '../stage'
import styles from './CodeBlock.module.css'

export interface CodeBlockProps {
  snippet: CodeSnippet
  /** Tokens per line; by default from the in-house tokenizers. */
  tokens?: CodeTokens
  /** The corner the block hangs from, in stage units. */
  at: Vec2
  /** Which side of the block `at` is: its left edge, center or right edge, at the top. */
  align?: 'start' | 'middle' | 'end'
  /**
   * The highlighted line, 1-based (by default the first of `snippet.highlight`). It may be
   * fractional, such as an animated value; `null` hides the bar.
   */
  line?: number | null
  /** Lines other than the highlighted one fade a little, so the eye follows the bar. */
  dimOthers?: boolean
  /**
   * Whether the bar glides between lines with a CSS transition. Turn it off when `line` is
   * already an animated value, so the bar follows it without lag.
   */
  glide?: boolean
  /** Font size in pixels. */
  size?: number
  opacity?: number
}

const LINE_HEIGHT = 1.6

/**
 * Several lines of code on the stage, on a glass panel. A highlight bar marks the line that the
 * step (or an animated value) is at and glides between lines. Names take their shapes' colors
 * and link to them by hover, both ways (`useHighlight`, `snippet.hoverKeys`).
 */
export function CodeBlock({
  snippet,
  tokens,
  at,
  align = 'start',
  line,
  dimOthers = false,
  glide = true,
  size = 13,
  opacity = 1,
}: CodeBlockProps) {
  const h = useContext(HighlightContext)
  const lines = useMemo(
    () => tokens ?? tokenizeCode(snippet.lang, snippet.source),
    [tokens, snippet.lang, snippet.source],
  )
  const current = line === undefined ? snippet.highlight?.[0] : line
  const shown = current != null && current >= 1
  const lineHeight = size * LINE_HEIGHT
  const shift = align === 'middle' ? '-50%' : align === 'end' ? '-100%' : '0'
  const onHoverKey = (key: string, on: boolean) => {
    if (!h) return
    if (on) h.set(key)
    else if (h.active === key) h.set(null)
  }
  return (
    <HtmlBox
      x={at[0]}
      y={at[1]}
      width={0}
      height={0}
      style={{ width: 'max-content', height: 'auto', transform: `translateX(${shift})` }}
    >
      <figure
        className={clsx(surfaces.glass, styles.block)}
        data-lang={snippet.lang}
        style={
          {
            margin: 0,
            fontSize: size,
            opacity,
            transition: 'opacity var(--dur-slow) var(--ease-out)',
            '--code-line': `${lineHeight}px`,
          } as CSSProperties
        }
      >
        {snippet.title && <figcaption className={styles.title}>{snippet.title}</figcaption>}
        <div className={styles.body}>
          <div
            aria-hidden
            className={clsx(styles.bar, !glide && styles.still)}
            style={{
              transform: `translateY(${((shown ? current : 1) - 1) * lineHeight}px)`,
              opacity: shown ? 1 : 0,
            }}
          />
          <code>
            {lines.map((tokensOfLine, i) => (
              <span
                key={i}
                className={styles.line}
                style={{
                  opacity: dimOthers && shown && Math.abs(i + 1 - current) >= 0.5 ? 0.55 : 1,
                }}
              >
                {tokensOfLine.map((token, k) => (
                  <CodeTokenSpan
                    key={k}
                    token={token}
                    colors={snippet.colors}
                    hoverKeys={snippet.hoverKeys}
                    activeKey={h?.active ?? h?.hint}
                    onHoverKey={onHoverKey}
                  />
                ))}
              </span>
            ))}
          </code>
        </div>
        {snippet.output !== undefined && <div className={styles.output}>{snippet.output}</div>}
      </figure>
    </HtmlBox>
  )
}
