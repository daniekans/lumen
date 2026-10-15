import * as RadixSlider from '@radix-ui/react-slider'
import type { CSSProperties } from 'react'
import styles from './Slider.module.css'

export interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  /** Accent color for the filled range and thumb, usually a palette color. */
  color?: string
  disabled?: boolean
  label?: string
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 0.01,
  color,
  disabled,
  label,
}: SliderProps) {
  return (
    <RadixSlider.Root
      className={styles.root}
      style={{ '--accent': color } as CSSProperties}
      value={[value]}
      onValueChange={([v]) => v !== undefined && onChange(v)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <RadixSlider.Track className={styles.track}>
        <RadixSlider.Range className={styles.range} />
      </RadixSlider.Track>
      <RadixSlider.Thumb className={styles.thumb} aria-label={label} />
    </RadixSlider.Root>
  )
}
