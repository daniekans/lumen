import { useState, type FormEvent } from 'react'
import type { StepCheck } from '@/catalog/types'
import { Button, RichText } from '../atoms'
import { ChoiceOptions } from './ChoiceOptions'
import styles from './StepCheckView.module.css'
import { msg } from '@/i18n'

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
        <ChoiceOptions
          label={check.prompt.replace(/\$/g, '')}
          options={check.options}
          picked={picked}
          reveal={result !== null ? { correct: check.answer } : undefined}
          onPick={(i) => {
            if (i === null) return clear()
            setPicked(i)
            submit(i === check.answer)
          }}
        />
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
            placeholder={msg.common.yourAnswer}
            aria-label={msg.common.yourAnswer}
          />
          <Button type="submit" size="sm">
            {msg.common.check}
          </Button>
          {result !== null && (
            <Button variant="ghost" size="sm" onClick={clear}>
              {msg.common.clear}
            </Button>
          )}
        </form>
      )}
      {check.kind === 'choice' && picked !== null && (
        <span className={styles.hint}>{msg.item.clearChoiceHint}</span>
      )}
      {result !== null && (
        <p className={styles.feedback} role="status">
          <span>
            <strong>{result ? msg.common.correct : msg.common.notQuite}</strong>{' '}
            {check.explanation && <RichText>{check.explanation}</RichText>}
            {!result && !check.explanation && msg.item.tryAgain}
          </span>
        </p>
      )}
    </div>
  )
}
