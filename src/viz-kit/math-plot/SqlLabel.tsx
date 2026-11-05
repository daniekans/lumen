import type { Vec2 } from '@/lib/math'
import { CodeLabel } from '../code'

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

/** A line of SQL on the stage: `CodeLabel` with an optional color for literals. */
export function SqlLabel({ children, literalColor, ...rest }: SqlLabelProps) {
  return (
    <CodeLabel
      lang="sql"
      kindColors={literalColor ? { string: literalColor, number: literalColor } : undefined}
      {...rest}
    >
      {children}
    </CodeLabel>
  )
}
