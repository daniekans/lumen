import clsx from 'clsx'
import type { CodeHue, CodeToken } from '@/lib/code'
import styles from './CodeTokenSpan.module.css'
import { codeTokenStyle } from './codeTokenStyle'

export interface CodeNameLinks {
  /** Names drawn in a stage color, such as `{ A: 'blue' }`. */
  colors?: Readonly<Record<string, CodeHue>>
  /** Names linked to a shape's `hoverKey`, such as `{ A: 'matrix' }`. */
  hoverKeys?: Readonly<Record<string, string>>
  /** The hover key lit now (a shape or a name is hovered). */
  activeKey?: string | null
  /** Called with a name's hover key when the pointer enters (`on`) or leaves it. */
  onHoverKey?: (key: string, on: boolean) => void
}

/**
 * One token of highlighted code. A name with a hover key lights its shape when hovered and
 * lights up itself while that shape is hovered (two-way hover, shared by `CodeView` and the
 * stage's `CodeBlock`).
 */
export function CodeTokenSpan({
  token,
  colors,
  hoverKeys,
  activeKey,
  onHoverKey,
}: CodeNameLinks & { token: CodeToken }) {
  const key = token.kind === 'name' ? hoverKeys?.[token.text] : undefined
  const style = codeTokenStyle(token, colors)
  if (!key) return <span style={style}>{token.text}</span>
  return (
    <span
      style={style}
      className={clsx(styles.linked, activeKey === key && styles.active)}
      onPointerEnter={() => onHoverKey?.(key, true)}
      onPointerLeave={() => onHoverKey?.(key, false)}
    >
      {token.text}
    </span>
  )
}
