import type { Answer, Response } from '@/lib/practice'
import { ChoiceOptions, MathInput } from '@/ui/molecules'
import styles from './Practice.module.css'
import { msg } from '@/i18n'

interface AnswerFieldProps {
  answer: Answer
  response: Response | null
  onChange: (response: Response | null) => void
  onSubmit?: () => void
  /** Show which option was right after checking (choices only). */
  revealChoice?: boolean
  status?: 'correct' | 'incorrect'
  label: string
  autoFocus?: boolean
  readOnly?: boolean
}

/** The right input for an answer kind: math field, options, or a note for self-graded work. */
export function AnswerField({
  answer,
  response,
  onChange,
  onSubmit,
  revealChoice,
  status,
  label,
  autoFocus,
  readOnly,
}: AnswerFieldProps) {
  if (answer.kind === 'choice')
    return (
      <ChoiceOptions
        label={label}
        options={answer.options}
        picked={response && 'choice' in response ? response.choice : null}
        onPick={(i) => onChange(i === null ? null : { choice: i })}
        reveal={revealChoice ? { correct: answer.correct } : undefined}
        disabled={readOnly}
      />
    )
  if (answer.kind === 'self') return <p className={styles.note}>{msg.practice.selfGraded}</p>
  return (
    <MathInput
      label={label}
      value={response && 'tex' in response ? response.tex : ''}
      onChange={(tex) => onChange(tex ? { tex } : null)}
      onSubmit={onSubmit}
      placeholder={msg.practice.placeholder[answer.kind]}
      status={status}
      autoFocus={autoFocus}
      readOnly={readOnly}
    />
  )
}
