import * as RadixSwitch from '@radix-ui/react-switch'
import type { CSSProperties } from 'react'
import styles from './Switch.module.css'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  color?: string
  id?: string
  label?: string
}

export const Switch = ({ checked, onChange, color, id, label }: SwitchProps) => (
  <RadixSwitch.Root
    id={id}
    aria-label={label}
    className={styles.root}
    style={{ '--accent': color } as CSSProperties}
    checked={checked}
    onCheckedChange={onChange}
  >
    <RadixSwitch.Thumb className={styles.thumb} />
  </RadixSwitch.Root>
)
