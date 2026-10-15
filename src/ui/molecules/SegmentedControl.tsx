import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { motion } from 'motion/react'
import { useId } from 'react'
import { spring } from '@/styles/motion'
import { RichText } from '../atoms'
import styles from './SegmentedControl.module.css'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  label?: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: SegmentedControlProps<T>) {
  const id = useId()
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      className={styles.root}
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
    >
      {options.map((o) => (
        <ToggleGroup.Item key={o.value} value={o.value} className={styles.item}>
          {o.value === value && (
            <motion.span layoutId={id} className={styles.indicator} transition={spring.snappy} />
          )}
          <span className={styles.label}>
            <RichText>{o.label}</RichText>
          </span>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
