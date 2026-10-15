import katex from 'katex'
import { memo } from 'react'

interface TexProps {
  children: string
  display?: boolean
  className?: string
}

/** Renders a TeX string with KaTeX. Memoized because KaTeX parsing is not free. */
export const Tex = memo(function Tex({ children, display = false, className }: TexProps) {
  const html = katex.renderToString(children, { displayMode: display, throwOnError: false })
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
})

/** Renders plain text where segments wrapped in $...$ are TeX. */
export function RichText({ children }: { children: string }) {
  const parts = children.split(/(\$[^$]+\$)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('$') && p.endsWith('$') && p.length > 1 ? (
          <Tex key={i}>{p.slice(1, -1)}</Tex>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}
