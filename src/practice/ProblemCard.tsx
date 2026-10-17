import { ArrowRight, Check, Lightbulb, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { answerTex, checkAnswer, type Difficulty, type Problem } from '@/lib/practice'
import type { SessionEntry } from '@/progress'
import { Button, RichText, Tex } from '@/ui/atoms'
import { AnswerField } from './AnswerField'
import styles from './Practice.module.css'
import { msg } from '@/i18n'

interface ProblemCardProps {
  problem: Problem
  title: string
  difficulty: Difficulty
  /** Stored state of this problem: response, feedback, hints, solution and outcome. */
  entry: SessionEntry
  /** Applies a change to the entry. A patch with `outcome` records the first real answer. */
  onUpdate: (patch: Partial<SessionEntry>) => void
  /** Progress dots and counter, rendered in the header. */
  progress: ReactNode
  /** Reviewing an earlier problem: answers are shown but cannot change. */
  review?: boolean
  next: { label: string; onClick: () => void }
}

/**
 * One practice problem, fully controlled by its stored entry so it survives navigation. The first
 * answer counts; afterwards the learner can keep trying, open hints or read the worked solution.
 */
export function ProblemCard({
  problem,
  title,
  difficulty,
  entry,
  onUpdate,
  progress,
  review,
  next,
}: ProblemCardProps) {
  const { answer } = problem
  const { response, outcome, hints, solution } = entry
  const result =
    entry.checked && response && answer.kind !== 'self' ? checkAnswer(answer, response) : null
  const solved = result?.verdict === 'correct'
  const locked = review || solved

  const check = () => {
    if (!response || answer.kind === 'self' || review) return
    const r = checkAnswer(answer, response)
    onUpdate({
      checked: true,
      ...(r.verdict !== 'invalid' && !outcome
        ? { outcome: { correct: r.verdict === 'correct', helped: hints > 0 } }
        : {}),
    })
  }

  const finished = solved || solution || (answer.kind === 'self' && !!outcome)
  const submit = () => (finished && outcome ? next.onClick() : check())
  const final = answerTex(answer)

  return (
    <article className={styles.card} aria-label={title}>
      <div className={styles.head}>
        <span className={styles.meta}>
          <span>{title}</span>
          <span>·</span>
          <span>{msg.practice.level[difficulty]}</span>
          {review && <span className={styles.reviewBadge}>{msg.practice.review}</span>}
        </span>
        {progress}
      </div>

      <div className={styles.prompt}>
        <RichText>{problem.prompt}</RichText>
      </div>

      <div className={styles.answerRow}>
        <AnswerField
          answer={answer}
          response={response ?? null}
          onChange={(r) => {
            if (locked) return
            if (answer.kind === 'choice' && r) {
              const c = checkAnswer(answer, r)
              onUpdate({
                response: r,
                checked: true,
                ...(!outcome
                  ? { outcome: { correct: c.verdict === 'correct', helped: hints > 0 } }
                  : {}),
              })
            } else onUpdate({ response: r ?? undefined, checked: false })
          }}
          onSubmit={submit}
          revealChoice={answer.kind === 'choice' && entry.checked}
          status={
            result?.verdict === 'correct'
              ? 'correct'
              : result?.verdict === 'incorrect'
                ? 'incorrect'
                : undefined
          }
          label={msg.common.yourAnswer}
          autoFocus={!review}
          readOnly={locked}
        />
        {answer.kind !== 'choice' && answer.kind !== 'self' && !locked && (
          <Button variant="primary" onClick={check} disabled={!response}>
            {msg.common.check}
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
                ? msg.common.correct
                : result.verdict === 'incorrect'
                  ? msg.common.notQuite
                  : msg.practice.couldNotCheck}
            </strong>{' '}
            {result.issue
              ? msg.practice.issue(result.issue)
              : result.verdict === 'incorrect' && !review
                ? msg.practice.retryHint
                : ''}
          </span>
        </p>
      )}

      {answer.kind === 'self' && solution && !outcome && !review && (
        <div className={styles.actions}>
          <span className={styles.note}>{msg.practice.howDidItGo}</span>
          <span className={styles.actionGroup}>
            <Button onClick={() => onUpdate({ outcome: { correct: true, helped: hints > 0 } })}>
              {msg.practice.gotItRight}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onUpdate({ outcome: { correct: false, helped: hints > 0 } })}
            >
              {msg.practice.gotItWrong}
            </Button>
          </span>
        </div>
      )}
      {answer.kind === 'self' && outcome && (
        <p className={styles.feedback} role="status">
          <strong>{outcome.correct ? msg.practice.markedRight : msg.practice.markedWrong}</strong>
        </p>
      )}

      <div className={styles.actions}>
        <span className={styles.actionGroup}>
          {problem.hints && hints < problem.hints.length && !finished && !review && (
            <Button
              variant="ghost"
              icon={<Lightbulb size={14} />}
              onClick={() => onUpdate({ hints: hints + 1 })}
            >
              {hints === 0 ? msg.practice.hint : msg.practice.anotherHint}
            </Button>
          )}
          {!solution && (
            <Button
              variant="ghost"
              onClick={() =>
                onUpdate({
                  solution: true,
                  ...(answer.kind !== 'self' && !outcome && !review
                    ? { outcome: { correct: false, helped: true } }
                    : {}),
                })
              }
            >
              {solved || review ? msg.practice.showWorkedSolution : msg.practice.showSolution}
            </Button>
          )}
        </span>
        <Button variant={outcome || review ? 'primary' : 'ghost'} onClick={next.onClick}>
          {next.label}
          <ArrowRight size={14} />
        </Button>
      </div>

      {hints > 0 && problem.hints && (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>{msg.practice.hints}</p>
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
          <p className={styles.panelTitle}>{msg.common.solution}</p>
          <ol>
            {problem.solution.map((line, i) => (
              <li key={i}>
                <RichText>{line}</RichText>
              </li>
            ))}
          </ol>
          {final && (
            <p style={{ margin: 'var(--space-3) 0 0' }}>
              {msg.common.answer} <Tex>{final}</Tex>
            </p>
          )}
        </div>
      )}
    </article>
  )
}
