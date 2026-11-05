import * as ToggleGroup from '@radix-ui/react-toggle-group'
import clsx from 'clsx'
import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'
import { spring } from '@/styles/motion'
import { RichText } from '../atoms'
import styles from './SegmentedControl.module.css'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  /** A small icon before the label. */
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  label?: string
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentedControlProps<T>) {
  const id = useId()
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      className={clsx(styles.root, className)}
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
    >
      {options.map((o) => (
        <ToggleGroup.Item key={o.value} value={o.value} className={styles.item}>
          {o.value === value && (
            <motion.span layoutId={id} className={styles.indicator} transition={spring.snappy} />
          )}
          <span className={styles.label}>
            {o.icon}
            <RichText>{o.label}</RichText>
          </span>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
