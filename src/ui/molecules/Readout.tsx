import clsx from 'clsx'
import { ChevronDown, Maximize2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { msg } from '@/i18n'
import { IconButton, RichText, Tooltip } from '../atoms'
import styles from './Readout.module.css'
import surfaces from '@/styles/surfaces.module.css'

interface ReadoutProps {
  /** Plain text with optional $TeX$. */
  label: string
  /** A node, or plain text with optional $TeX$. */
  value: ReactNode
  color?: string
  /** One line on what the value means, shown as a tooltip on the label. Plain text with $TeX$. */
  hint?: string
}

export function Readout({ label, value, color, hint }: ReadoutProps) {
  const text = (
    <span className={clsx(styles.label, hint && styles.hinted)} tabIndex={hint ? 0 : undefined}>
      {color && <span className={styles.swatch} style={{ background: color }} />}
      <RichText>{label}</RichText>
    </span>
  )
  return (
    <div className={styles.row}>
      {hint ? (
        <Tooltip content={<RichText>{hint}</RichText>} side="right">
          {text}
        </Tooltip>
      ) : (
        text
      )}
      <span className={styles.value}>
        {typeof value === 'string' ? <RichText>{value}</RichText> : value}
      </span>
    </div>
  )
}

interface ReadoutPanelProps {
  /** Header of the panel. A titled panel can collapse to it, so it never hides the drawing. */
  title?: string
  /** Adds a button that opens a larger view, usually a `VizSheet` the item controls. */
  onExpand?: () => void
  children: ReactNode
}

/** Glass panel grouping several readouts. */
export function ReadoutPanel({ title, onExpand, children }: ReadoutPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className={clsx(surfaces.glass, styles.readouts, collapsed && styles.collapsed)}>
      {(title || onExpand) && (
        <div className={styles.header}>
          {title && (
            <button
              type="button"
              className={styles.title}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
            >
              <ChevronDown size={13} className={styles.chevron} />
              <RichText>{title}</RichText>
            </button>
          )}
          {onExpand && (
            <IconButton label={msg.viz.expandPanel} size="sm" onClick={onExpand}>
              <Maximize2 size={13} />
            </IconButton>
          )}
        </div>
      )}
      {!collapsed && children}
    </div>
  )
}
