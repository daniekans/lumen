import { Check, Printer, RotateCcw, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import type { Item } from '@/catalog'
import {
  answerTex,
  checkAnswer,
  createRng,
  randomSeed,
  type CheckResult,
  type Problem,
  type ProblemGenerator,
} from '@/lib/practice'
import { CHECKPOINT_PASS, useProgress, type CheckpointSheetState } from '@/progress'
import { Button, RichText, Tex } from '@/ui/atoms'
import { AnswerField } from './AnswerField'
import styles from './Practice.module.css'
import { msg } from '@/i18n'

interface Entry {
  id: string
  title: string
  problem: Problem
}

/**
 * The sheet's problems, generated from one seed: every generator appears at least once when
 * possible, easiest first. The same seed always produces the same sheet.
 */
const buildSheet = (
  generators: readonly ProblemGenerator[],
  count: number,
  seed: number,
): Entry[] => {
  const order = createRng(seed).shuffle(generators)
  return Array.from({ length: count }, (_, i) => order[i % order.length]!)
    .sort((a, b) => a.difficulty - b.difficulty)
    .map((g, i) => ({
      id: `${g.id}-${i}`,
      title: g.title,
      problem: g.generate(createRng(seed + 1 + i)),
    }))
}

const freshSheet = (): CheckpointSheetState => ({
  seed: randomSeed(),
  responses: {},
  checked: false,
  selfGrades: {},
  scored: false,
})

/**
 * A checkpoint as a worksheet: all problems on one page, solved on paper (or printed), answered in
 * any order and checked together. The sheet and its answers are stored until a new set is drawn.
 */
export function CheckpointSheet({
  item,
  generators,
}: {
  item: Item
  generators: readonly ProblemGenerator[]
}) {
  const count = item.problemCount ?? 8
  const hydrated = useProgress((s) => s.hydrated)
  const sheet = useProgress((s) => s.data.items[item.id]?.sheet)
  const setSheet = useProgress((s) => s.setSheet)
  const recordCheckpoint = useProgress((s) => s.recordCheckpoint)

  useEffect(() => {
    if (hydrated && !sheet) setSheet(item.id, freshSheet())
  }, [hydrated, sheet, item.id, setSheet])

  const entries = useMemo(
    () => (sheet ? buildSheet(generators, count, sheet.seed) : []),
    [generators, count, sheet],
  )

  if (!sheet) return <div className={styles.scroll} />

  const results: Record<string, CheckResult> = {}
  if (sheet.checked)
    for (const e of entries) {
      if (e.problem.answer.kind === 'self') continue
      const r = sheet.responses[e.id]
      results[e.id] = r
        ? checkAnswer(e.problem.answer, r)
        : { verdict: 'incorrect', issue: { kind: 'no-answer' } }
    }

  const tally = (s: CheckpointSheetState) => {
    const invalid = entries.some((e) => {
      if (e.problem.answer.kind === 'self') return false
      const r = s.responses[e.id]
      return !!r && checkAnswer(e.problem.answer, r).verdict === 'invalid'
    })
    const graded =
      s.checked &&
      !invalid &&
      entries.every((e) => e.problem.answer.kind !== 'self' || e.id in s.selfGrades)
    const correct = entries.filter((e) => {
      if (e.problem.answer.kind === 'self') return s.selfGrades[e.id] === true
      const r = s.responses[e.id]
      return !!r && checkAnswer(e.problem.answer, r).verdict === 'correct'
    }).length
    return { graded, correct, score: correct / entries.length }
  }

  /** Saves the sheet and, the first time it is fully graded, stores its score. */
  const save = (next: CheckpointSheetState) => {
    const t = tally(next)
    if (t.graded && !next.scored) {
      recordCheckpoint(item.id, t.score)
      next = { ...next, scored: true }
    }
    setSheet(item.id, next)
  }

  const { graded, correct, score } = tally(sheet)
  const invalidCount = Object.values(results).filter((r) => r.verdict === 'invalid').length

  return (
    <div className={styles.scroll} data-print-sheet>
      <div className={`${styles.column} ${styles.sheet}`}>
        <div className={styles.sheetHead}>
          <div>
            <h2 className={styles.sheetTitle}>{item.title}</h2>
            <p className={styles.sheetIntro}>
              {msg.checkpoint.intro(entries.length, CHECKPOINT_PASS)}
            </p>
          </div>
          <span className={`${styles.actionGroup} ${styles.noPrint}`}>
            <Button variant="ghost" icon={<Printer size={14} />} onClick={() => window.print()}>
              {msg.checkpoint.print}
            </Button>
            <Button
              variant="ghost"
              icon={<RotateCcw size={14} />}
              onClick={() => setSheet(item.id, freshSheet())}
            >
              {msg.checkpoint.newSet}
            </Button>
          </span>
        </div>

        {graded && (
          <article className={`${styles.card} ${styles.noPrint}`} role="status">
            <p className={styles.summaryScore}>{msg.checkpoint.score(correct, entries.length)}</p>
            <p className={styles.note} style={{ margin: 0 }}>
              {score >= CHECKPOINT_PASS ? msg.checkpoint.passed : msg.checkpoint.notPassed}
            </p>
          </article>
        )}

        {entries.map((e, i) => {
          const r = results[e.id]
          const self = e.problem.answer.kind === 'self'
          const final = answerTex(e.problem.answer)
          return (
            <article key={e.id} className={styles.card} aria-label={msg.checkpoint.problem(i + 1)}>
              <div className={styles.head}>
                <span className={styles.meta}>
                  <span className={styles.number}>{i + 1}</span>
                  {e.title}
                </span>
                {r && r.verdict !== 'invalid' && (
                  <span className={r.verdict === 'correct' ? styles.right : styles.wrong}>
                    {r.verdict === 'correct' ? <Check size={16} /> : <X size={16} />}
                  </span>
                )}
              </div>
              <div className={styles.prompt}>
                <RichText>{e.problem.prompt}</RichText>
              </div>
              <div className={styles.noPrint}>
                <AnswerField
                  answer={e.problem.answer}
                  response={sheet.responses[e.id] ?? null}
                  onChange={(resp) => {
                    const { [e.id]: _old, ...others } = sheet.responses
                    // Editing after a check hides the results until the next check.
                    save({
                      ...sheet,
                      checked: false,
                      responses: resp ? { ...others, [e.id]: resp } : others,
                    })
                  }}
                  revealChoice={!!r}
                  status={
                    r?.verdict === 'correct'
                      ? 'correct'
                      : r?.verdict === 'incorrect'
                        ? 'incorrect'
                        : undefined
                  }
                  label={msg.checkpoint.answerTo(i + 1)}
                  readOnly={graded}
                />
              </div>
              <div className={styles.printSpace} aria-hidden />
              {r?.verdict === 'invalid' && r.issue && (
                <p className={styles.feedback}>{msg.practice.issue(r.issue)}</p>
              )}
              {sheet.checked && self && !(e.id in sheet.selfGrades) && (
                <div className={`${styles.actions} ${styles.noPrint}`}>
                  <span className={styles.note}>{msg.checkpoint.selfGrade}</span>
                  <span className={styles.actionGroup}>
                    <Button
                      onClick={() =>
                        save({ ...sheet, selfGrades: { ...sheet.selfGrades, [e.id]: true } })
                      }
                    >
                      {msg.checkpoint.yes}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        save({ ...sheet, selfGrades: { ...sheet.selfGrades, [e.id]: false } })
                      }
                    >
                      {msg.checkpoint.no}
                    </Button>
                  </span>
                </div>
              )}
              {sheet.checked && (self || r?.verdict !== 'correct' || graded) && (
                <div className={`${styles.panel} ${styles.noPrint}`}>
                  <p className={styles.panelTitle}>{msg.common.solution}</p>
                  <ol>
                    {e.problem.solution.map((line, k) => (
                      <li key={k}>
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
        })}

        {!graded && (
          <div className={`${styles.actions} ${styles.noPrint}`}>
            <span className={styles.note}>
              {sheet.checked
                ? invalidCount
                  ? msg.checkpoint.fixInvalid(invalidCount)
                  : msg.checkpoint.gradeSelfChecked
                : msg.checkpoint.unansweredCount}
            </span>
            <Button variant="primary" onClick={() => save({ ...sheet, checked: true })}>
              {sheet.checked ? msg.checkpoint.checkAgain : msg.checkpoint.checkAnswers}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
