import katex from 'katex'
import { memo } from 'react'
import { texMacros } from '@/lib/texMacros'
import styles from './Tex.module.css'

interface TexProps {
  children: string
  display?: boolean
  className?: string
}

/** Renders a TeX string with KaTeX. Memoized because KaTeX parsing is not free. */
export const Tex = memo(function Tex({ children, display = false, className }: TexProps) {
  const html = katex.renderToString(children, {
    displayMode: display,
    throwOnError: false,
    macros: texMacros(),
  })
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
})

const isInline = (p: string) =>
  p.startsWith('$') && p.endsWith('$') && p.length > 1 && !p.startsWith('$$')

/** TeX, not copy. */
const DISPLAY_STYLE = '\\displaystyle ' // i18n-ignore

/**
 * Renders plain text where segments wrapped in $...$ (inline) or $$...$$ (display) are TeX, and
 * segments wrapped in backticks are code (HTML, so long SQL wraps like text). The single wrapper keeps text and math
 * flowing as one line of text, even inside flex containers.
 *
 * `displayStyle` sets inline math at full size (fractions, limits) while it stays in the line.
 * Problem statements use it, where the math is the subject rather than part of a sentence.
 */
export function RichText({
  children,
  displayStyle = false,
}: {
  children: string
  displayStyle?: boolean
}) {
  const parts = children.split(/(\$\$[^$]+\$\$|\$[^$]+\$|`[^`]+`)/g)
  // Punctuation right after inline math stays on its line, as in "the limit of $x$, is".
  const glued = parts.map((p, i) =>
    isInline(p) ? (/^[,.;:!?)]+/.exec(parts[i + 1] ?? '')?.[0] ?? '') : '',
  )
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith('$$') && p.endsWith('$$') && p.length > 4 ? (
          <Tex key={i} display>
            {p.slice(2, -2)}
          </Tex>
        ) : isInline(p) ? (
          <span key={i} className={glued[i] ? styles.nowrap : undefined}>
            <Tex>{(displayStyle ? DISPLAY_STYLE : '') + p.slice(1, -1)}</Tex>
            {glued[i]}
          </span>
        ) : p.startsWith('`') && p.endsWith('`') && p.length > 2 ? (
          <code key={i} className={styles.code}>
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p.slice(i > 0 ? glued[i - 1]!.length : 0)}</span>
        ),
      )}
    </span>
  )
}
