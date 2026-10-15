import { RichText, Slider, type SliderProps } from '../atoms'
import styles from './LabeledSlider.module.css'

interface LabeledSliderProps extends SliderProps {
  /** Plain text, with optional $TeX$ segments. */
  label: string
  format?: (v: number) => string
}

export function LabeledSlider({
  label,
  format = (v) => v.toFixed(2),
  ...slider
}: LabeledSliderProps) {
  return (
    <div className={styles.field}>
      <div className={styles.head}>
        <span>
          <RichText>{label}</RichText>
        </span>
        <span className={styles.value}>{format(slider.value)}</span>
      </div>
      <Slider label={label.replace(/\$/g, '')} {...slider} />
    </div>
  )
}
