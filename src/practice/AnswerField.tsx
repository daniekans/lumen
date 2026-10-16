import type { Answer, Response } from '@/lib/practice'
import { ChoiceOptions, MathInput } from '@/ui/molecules'
import styles from './Practice.module.css'

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

/** Hints shown in the empty field. Plain text with optional $TeX$. */
const placeholders: Partial<Record<Answer['kind'], string>> = {
  number: 'A number, like $\\frac{3}{4}$ or $\\sqrt{2}$',
  expression: 'An expression',
  list: 'Numbers separated by commas',
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
  if (answer.kind === 'self')
    return (
      <p className={styles.note}>
        Work this out on paper, then compare with the solution and grade yourself.
      </p>
    )
  return (
    <MathInput
      label={label}
      value={response && 'tex' in response ? response.tex : ''}
      onChange={(tex) => onChange(tex ? { tex } : null)}
      onSubmit={onSubmit}
      placeholder={placeholders[answer.kind]}
      status={status}
      autoFocus={autoFocus}
      readOnly={readOnly}
    />
  )
}
