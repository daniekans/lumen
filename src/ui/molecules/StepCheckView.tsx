import clsx from 'clsx'
import { useState, type FormEvent } from 'react'
import type { StepCheck } from '@/catalog/types'
import { Button, RichText } from '../atoms'
import styles from './StepCheckView.module.css'

interface StepCheckViewProps {
  check: StepCheck
  /** Already answered correctly in an earlier visit. */
  solved: boolean
  onAnswer: (correct: boolean) => void
  /** Called when the learner clears their answer to start over. */
  onClear: () => void
}

/**
 * A question inside a lesson step. Answers give feedback and can be changed or cleared at any time;
 * nothing is locked. A question solved earlier shows its correct answer.
 */
export function StepCheckView({ check, solved, onAnswer, onClear }: StepCheckViewProps) {
  const [picked, setPicked] = useState<number | null>(
    solved && check.kind === 'choice' ? check.answer : null,
  )
  const [text, setText] = useState(solved && check.kind === 'number' ? String(check.answer) : '')
  const [result, setResult] = useState<boolean | null>(solved ? true : null)

  const submit = (correct: boolean) => {
    setResult(correct)
    onAnswer(correct)
  }

  const clear = () => {
    setPicked(null)
    setText('')
    setResult(null)
    onClear()
  }

  return (
    <div className={styles.check}>
      <span className={styles.prompt}>
        <RichText>{check.prompt}</RichText>
      </span>
      {check.kind === 'choice' ? (
        <div
          className={styles.options}
          role="radiogroup"
          aria-label={check.prompt.replace(/\$/g, '')}
        >
          {check.options.map((o, i) => {
            const chosen = picked === i
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={chosen}
                className={clsx(
                  styles.option,
                  result !== null && i === check.answer && (chosen || result) && styles.right,
                  result === false && chosen && styles.wrong,
                )}
                onClick={() => {
                  if (chosen) return clear()
                  setPicked(i)
                  submit(i === check.answer)
                }}
              >
                <RichText>{o}</RichText>
              </button>
            )
          })}
        </div>
      ) : (
        <form
          className={styles.row}
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            const value = Number(text.replace(',', '.'))
            if (text.trim() === '' || Number.isNaN(value)) return
            submit(Math.abs(value - check.answer) <= (check.tolerance ?? 1e-6))
          }}
        >
          <input
            className={styles.input}
            inputMode="decimal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your answer"
            aria-label="Your answer"
          />
          <Button type="submit" size="sm">
            Check
          </Button>
          {result !== null && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
          )}
        </form>
      )}
      {check.kind === 'choice' && picked !== null && (
        <span className={styles.hint}>Click your answer again to clear it.</span>
      )}
      {result !== null && (
        <p className={styles.feedback} role="status">
          <span>
            <strong>{result ? 'Correct.' : 'Not quite.'}</strong>{' '}
            {check.explanation && <RichText>{check.explanation}</RichText>}
            {!result && !check.explanation && 'Try again.'}
          </span>
        </p>
      )}
    </div>
  )
}
