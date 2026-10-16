import clsx from 'clsx'
import { ArrowRight, Check, Lightbulb, X } from 'lucide-react'
import { useState } from 'react'
import {
  answerTex,
  checkAnswer,
  type CheckResult,
  type Problem,
  type Response,
} from '@/lib/practice'
import type { Difficulty } from '@/lib/practice'
import { Button, RichText, Tex } from '@/ui/atoms'
import { AnswerField } from './AnswerField'
import styles from './Practice.module.css'

export interface ProblemOutcome {
  correct: boolean
  /** Hints or the solution were used before the first answer. */
  helped: boolean
}

interface ProblemCardProps {
  problem: Problem
  title: string
  difficulty: Difficulty
  /** Results so far in the session, for the progress dots. */
  results: readonly boolean[]
  total: number
  /** Called once per problem, with the first real answer (or giving up). */
  onOutcome: (outcome: ProblemOutcome) => void
  onNext: () => void
}

const levels: Record<Difficulty, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

/**
 * One practice problem. The first answer counts; afterwards the learner can keep trying, open
 * hints, or read the worked solution, then move on.
 */
export function ProblemCard({
  problem,
  title,
  difficulty,
  results,
  total,
  onOutcome,
  onNext,
}: ProblemCardProps) {
  const [response, setResponse] = useState<Response | null>(null)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [recorded, setRecorded] = useState(false)
  const [hints, setHints] = useState(0)
  const [solution, setSolution] = useState(false)
  const { answer } = problem
  const solved = result?.verdict === 'correct'

  const record = (correct: boolean, helped: boolean) => {
    if (recorded) return
    setRecorded(true)
    onOutcome({ correct, helped })
  }

  const check = () => {
    if (!response || answer.kind === 'self') return
    const r = checkAnswer(answer, response)
    setResult(r)
    if (r.verdict !== 'invalid') record(r.verdict === 'correct', hints > 0)
  }

  const showSolution = () => {
    setSolution(true)
    if (answer.kind !== 'self') record(false, true)
  }

  const finished = solved || solution
  const submit = () => (finished && recorded ? onNext() : check())
  const final = answerTex(answer)

  return (
    <article className={styles.card} aria-label={title}>
      <div className={styles.head}>
        <span className={styles.meta}>
          <span>{title}</span>
          <span>·</span>
          <span>{levels[difficulty]}</span>
        </span>
        <span className={styles.meta}>
          <span className={styles.dots} aria-label={`Problem ${results.length + 1} of ${total}`}>
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={clsx(
                  styles.dot,
                  results[i] === true && styles.dotRight,
                  results[i] === false && styles.dotWrong,
                  i === results.length && styles.dotCurrent,
                )}
              />
            ))}
          </span>
          {Math.min(results.length + 1, total)} / {total}
        </span>
      </div>

      <div className={styles.prompt}>
        <RichText>{problem.prompt}</RichText>
      </div>

      <div className={styles.answerRow}>
        <AnswerField
          answer={answer}
          response={response}
          onChange={(r) => {
            setResponse(r)
            if (result && !solved) setResult(null)
            if (answer.kind === 'choice' && r) {
              const c = checkAnswer(answer, r)
              setResult(c)
              record(c.verdict === 'correct', hints > 0)
            }
          }}
          onSubmit={submit}
          revealChoice={answer.kind === 'choice' && result !== null}
          status={
            result?.verdict === 'correct'
              ? 'correct'
              : result?.verdict === 'incorrect'
                ? 'incorrect'
                : undefined
          }
          label="Your answer"
          autoFocus
          readOnly={solved}
        />
        {answer.kind !== 'choice' && answer.kind !== 'self' && !solved && (
          <Button variant="primary" onClick={check} disabled={!response}>
            Check
          </Button>
        )}
      </div>

      {result && (
        <p className={styles.feedback} role="status">
          {result.verdict === 'correct' ? (
            <Check size={16} className={styles.right} />
          ) : result.verdict === 'incorrect' ? (
            <X size={16} className={styles.wrong} />
          ) : null}
          <span>
            <strong>
              {result.verdict === 'correct'
                ? 'Correct.'
                : result.verdict === 'incorrect'
                  ? 'Not quite.'
                  : 'Could not check that.'}
            </strong>{' '}
            {result.message ??
              (result.verdict === 'incorrect'
                ? 'Try again, open a hint, or see the solution.'
                : '')}
          </span>
        </p>
      )}

      {answer.kind === 'self' && solution && !recorded && (
        <div className={styles.actions}>
          <span className={styles.note}>How did it go?</span>
          <span className={styles.actionGroup}>
            <Button onClick={() => record(true, hints > 0)}>I got it right</Button>
            <Button variant="ghost" onClick={() => record(false, hints > 0)}>
              I got it wrong
            </Button>
          </span>
        </div>
      )}

      <div className={styles.actions}>
        <span className={styles.actionGroup}>
          {problem.hints && hints < problem.hints.length && !finished && (
            <Button
              variant="ghost"
              icon={<Lightbulb size={14} />}
              onClick={() => setHints((h) => h + 1)}
            >
              {hints === 0 ? 'Hint' : 'Another hint'}
            </Button>
          )}
          {!solution && (
            <Button variant="ghost" onClick={showSolution}>
              {answer.kind === 'self'
                ? 'Show the solution'
                : solved
                  ? 'Show the worked solution'
                  : 'Show the solution'}
            </Button>
          )}
        </span>
        <Button variant={recorded ? 'primary' : 'ghost'} onClick={onNext}>
          {recorded ? 'Next problem' : 'Skip'}
          <ArrowRight size={14} />
        </Button>
      </div>

      {hints > 0 && problem.hints && (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>Hints</p>
          <ol>
            {problem.hints.slice(0, hints).map((h, i) => (
              <li key={i}>
                <RichText>{h}</RichText>
              </li>
            ))}
          </ol>
        </div>
      )}

      {solution && (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>Solution</p>
          <ol>
            {problem.solution.map((line, i) => (
              <li key={i}>
                <RichText>{line}</RichText>
              </li>
            ))}
          </ol>
          {final && (
            <p style={{ margin: 'var(--space-3) 0 0' }}>
              Answer: <Tex>{final}</Tex>
            </p>
          )}
        </div>
      )}
    </article>
  )
}
