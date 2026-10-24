import clsx from 'clsx'
import { ChevronDown, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { msg } from '@/i18n'
import { IconButton, RichText, Tooltip } from '../atoms'
import styles from './Readout.module.css'
import { displayStyle, setLargeReadouts, useLargeReadouts } from './readoutSize'
import surfaces from '@/styles/surfaces.module.css'

interface ReadoutProps {
  /** Plain text with optional $TeX$. */
  label: string
  /** A node, or plain text with optional $TeX$. */
  value: ReactNode
  color?: string
  /** One line on what the value means, shown as a tooltip on the label. Plain text with $TeX$. */
  hint?: string
  /** Lit because the matching shape is hovered (see `useHighlight` in the kit). */
  highlighted?: boolean
  /** Hovering the row lights up the matching shape. */
  onHoverChange?: (on: boolean) => void
}

export function Readout({ label, value, color, hint, highlighted, onHoverChange }: ReadoutProps) {
  const large = useLargeReadouts()
  const text = (
    <span className={clsx(styles.label, hint && styles.hinted)} tabIndex={hint ? 0 : undefined}>
      {color && <span className={styles.swatch} style={{ background: color }} />}
      <RichText>{large ? displayStyle(label) : label}</RichText>
    </span>
  )
  return (
    <div
      className={clsx(styles.row, highlighted && styles.highlighted)}
      onPointerEnter={onHoverChange && (() => onHoverChange(true))}
      onPointerLeave={onHoverChange && (() => onHoverChange(false))}
    >
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

/**
 * Glass panel grouping several readouts. A button beside it switches every panel between the
 * normal and the large size, and the choice is remembered.
 */
export function ReadoutPanel({ title, onExpand, children }: ReadoutPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const large = useLargeReadouts()
  return (
    <div
      className={clsx(
        surfaces.glass,
        styles.readouts,
        collapsed && styles.collapsed,
        large && styles.large,
      )}
    >
      {!collapsed && (
        <span className={styles.size}>
          <IconButton
            label={large ? msg.viz.smallerReadouts : msg.viz.largerReadouts}
            size="sm"
            onClick={() => setLargeReadouts(!large)}
          >
            {large ? <ZoomOut size={13} /> : <ZoomIn size={13} />}
          </IconButton>
        </span>
      )}
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
      {!collapsed && (title ? <div className={styles.content}>{children}</div> : children)}
    </div>
  )
}
