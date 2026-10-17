import { RotateCcw } from 'lucide-react'
import { Link } from 'react-router'
import { getUnit } from '@/catalog'
import { attemptsBySkill, suggestStatus, type Attempt } from '@/lib/practice'
import { msg } from '@/i18n'
import { SKILL_STATUSES, skillStatus, useProgress } from '@/progress'
import { Button, StatusDots } from '@/ui/atoms'
import styles from './Practice.module.css'

interface SessionSummaryProps {
  /** Attempts with global skill keys (`unit#skill`). */
  attempts: readonly Attempt[]
  onRestart: () => void
  /** Opens the session's problems read-only, starting from the first. */
  onReview: () => void
  next?: { title: string; path: string }
}

const skillTitle = (key: string) =>
  getUnit(key.split('#')[0]!)?.skills.find((s) => s.key === key)?.title ?? key

/** End of a session: the score, and status suggestions per skill that the learner may apply. */
export function SessionSummary({ attempts, onRestart, onReview, next }: SessionSummaryProps) {
  const data = useProgress((s) => s.data)
  const apply = useProgress((s) => s.applySuggestedStatus)
  const correct = attempts.filter((a) => a.correct).length
  const bySkill = [...attemptsBySkill(attempts)].map(([key, list]) => {
    const current = skillStatus(data, key)
    const suggested = suggestStatus(list)
    const higher = suggested && SKILL_STATUSES.indexOf(suggested) > SKILL_STATUSES.indexOf(current)
    return {
      key,
      title: skillTitle(key),
      current,
      suggested: higher ? suggested : undefined,
    }
  })

  return (
    <article className={styles.card}>
      <p className={styles.summaryScore}>
        {correct} of {attempts.length} correct
      </p>
      <p className={styles.note} style={{ margin: '0 0 var(--space-4)' }}>
        First answers count. Retries, hints and solutions help you learn but do not raise the score.
      </p>
      {bySkill.map((s) => (
        <div key={s.key} className={styles.skillRow}>
          <div>
            {s.title}
            <br />
            <span>
              <StatusDots status={s.current} /> {msg.progress.skillStatus[s.current]}
              {s.suggested && ` · this session suggests ${msg.progress.skillStatus[s.suggested].toLowerCase()}`}
            </span>
          </div>
          {s.suggested && (
            <Button size="sm" onClick={() => apply(s.key, s.suggested!)}>
              Set to {msg.progress.skillStatus[s.suggested]}
            </Button>
          )}
        </div>
      ))}
      <div className={styles.actions}>
        <span className={styles.actionGroup}>
          <Button variant="primary" icon={<RotateCcw size={14} />} onClick={onRestart}>
            Practice again
          </Button>
          <Button variant="ghost" onClick={onReview}>
            Review answers
          </Button>
        </span>
        {next && (
          <Link to={next.path} className={styles.note}>
            Next: {next.title}
          </Link>
        )}
      </div>
    </article>
  )
}
