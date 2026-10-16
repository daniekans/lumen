import clsx from 'clsx'
import { RichText } from '../atoms'
import styles from './StepCheckView.module.css'

interface ChoiceOptionsProps {
  options: readonly string[]
  /** Index chosen by the learner, if any. */
  picked: number | null
  onPick: (index: number | null) => void
  /** When set, the options show which one was right (and the picked one if wrong). */
  reveal?: { correct: number }
  label: string
  disabled?: boolean
}

/**
 * Single-choice options as a radio group. Picking the chosen option again clears it. Shared by
 * lesson checks and practice problems.
 */
export function ChoiceOptions({
  options,
  picked,
  onPick,
  reveal,
  label,
  disabled,
}: ChoiceOptionsProps) {
  return (
    <div className={styles.options} role="radiogroup" aria-label={label}>
      {options.map((o, i) => {
        const chosen = picked === i
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={chosen}
            disabled={disabled}
            className={clsx(
              styles.option,
              reveal && i === reveal.correct && chosen && styles.right,
              reveal && chosen && i !== reveal.correct && styles.wrong,
            )}
            onClick={() => onPick(chosen ? null : i)}
          >
            <RichText>{o}</RichText>
          </button>
        )
      })}
    </div>
  )
}
