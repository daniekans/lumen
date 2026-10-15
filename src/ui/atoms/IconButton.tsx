import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'
import { Tooltip } from './Tooltip'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name, also shown as the tooltip. */
  label: string
  shortcut?: string
  variant?: 'default' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function IconButton({
  label,
  shortcut,
  variant = 'ghost',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <Tooltip content={label} shortcut={shortcut}>
      <button
        type={type}
        aria-label={label}
        className={clsx(
          styles.button,
          styles.icon,
          variant === 'ghost' && styles.ghost,
          size === 'sm' && styles.sm,
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    </Tooltip>
  )
}
