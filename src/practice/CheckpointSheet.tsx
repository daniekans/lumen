import { Check, Printer, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import type { Item } from '@/catalog'
import {
  answerTex,
  checkAnswer,
  createRng,
  randomSeed,
  type CheckResult,
  type Problem,
  type ProblemGenerator,
  type Response,
} from '@/lib/practice'
import { CHECKPOINT_PASS, useProgress } from '@/progress'
import { Button, RichText, Tex } from '@/ui/atoms'
import { AnswerField } from './AnswerField'
import styles from './Practice.module.css'

interface Entry {
  id: string
  title: string
  problem: Problem
}

/** Picks `count` problems covering every generator at least once when possible, easiest first. */
const buildSheet = (generators: readonly ProblemGenerator[], count: number): Entry[] => {
  const seed = randomSeed()
  const rng = createRng(seed)
  const order = rng.shuffle(generators)
  const picked = Array.from({ length: count }, (_, i) => order[i % order.length]!)
  return picked
    .sort((a, b) => a.difficulty - b.difficulty)
    .map((g, i) => ({
      id: `${g.id}-${i}`,
      title: g.title,
      problem: g.generate(createRng(seed + 1 + i)),
    }))
}

/**
 * A checkpoint as a worksheet: all problems on one page, solved on paper (or printed), answered in
 * any order and checked together. Self-graded problems are scored by the learner after checking.
 */
export function CheckpointSheet({
  item,
  generators,
}: {
  item: Item
  generators: readonly ProblemGenerator[]
}) {
  const count = item.problemCount ?? 8
  const recordCheckpoint = useProgress((s) => s.recordCheckpoint)
  const [entries, setEntries] = useState(() => buildSheet(generators, count))
  const [responses, setResponses] = useState<Record<string, Response | null>>({})
  const [results, setResults] = useState<Record<string, CheckResult> | null>(null)
  const [selfGrades, setSelfGrades] = useState<Record<string, boolean>>({})

  const tally = (r: Record<string, CheckResult> | null, grades: Record<string, boolean>) => {
    const isGraded =
      r !== null &&
      !entries.some((e) => r[e.id]?.verdict === 'invalid') &&
      entries.every((e) => e.problem.answer.kind !== 'self' || e.id in grades)
    const right = entries.filter((e) =>
      e.problem.answer.kind === 'self' ? grades[e.id] === true : r?.[e.id]?.verdict === 'correct',
    ).length
    return { graded: isGraded, correct: right, score: right / entries.length }
  }
  const { graded, correct, score } = tally(results, selfGrades)
  const invalid = results ? entries.filter((e) => results[e.id]?.verdict === 'invalid') : []

  /** Stores the score once grading is complete. Called from the handlers that finish grading. */
  const finish = (r: Record<string, CheckResult> | null, grades: Record<string, boolean>) => {
    const t = tally(r, grades)
    if (t.graded) recordCheckpoint(item.id, t.score)
  }

  const checkAll = () => {
    const r: Record<string, CheckResult> = {}
    for (const e of entries) {
      if (e.problem.answer.kind === 'self') continue
      const response = responses[e.id]
      r[e.id] = response
        ? checkAnswer(e.problem.answer, response)
        : { verdict: 'incorrect', message: 'No answer.' }
    }
    setResults(r)
    finish(r, selfGrades)
  }

  const gradeSelf = (id: string, right: boolean) => {
    const grades = { ...selfGrades, [id]: right }
    setSelfGrades(grades)
    finish(results, grades)
  }

  const restart = () => {
    setEntries(buildSheet(generators, count))
    setResponses({})
    setResults(null)
    setSelfGrades({})
  }

  return (
    <div className={styles.scroll}>
      <div className={`${styles.column} ${styles.sheet}`}>
        <div className={styles.sheetHead}>
          <div>
            <h2 className={styles.sheetTitle}>{item.title}</h2>
            <p className={styles.sheetIntro}>
              {entries.length} problems. Work them out on paper, enter your answers, then check them
              all.
              {` ${Math.round(CHECKPOINT_PASS * 100)}% passes.`}
            </p>
          </div>
          <span className={`${styles.actionGroup} ${styles.noPrint}`}>
            <Button variant="ghost" icon={<Printer size={14} />} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="ghost" icon={<RotateCcw size={14} />} onClick={restart}>
              New set
            </Button>
          </span>
        </div>

        {graded && (
          <article className={styles.card} role="status">
            <p className={styles.summaryScore}>
              {correct} of {entries.length} ({Math.round(score * 100)}%)
            </p>
            <p className={styles.note} style={{ margin: 0 }}>
              {score >= CHECKPOINT_PASS
                ? 'Passed. The unit checkpoint is done.'
                : 'Not passed yet. Review the solutions below, then try a new set when you are ready.'}
            </p>
          </article>
        )}

        {entries.map((e, i) => {
          const r = results?.[e.id]
          const self = e.problem.answer.kind === 'self'
          const final = answerTex(e.problem.answer)
          return (
            <article key={e.id} className={styles.card} aria-label={`Problem ${i + 1}`}>
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
              <AnswerField
                answer={e.problem.answer}
                response={responses[e.id] ?? null}
                onChange={(resp) => {
                  setResponses((all) => ({ ...all, [e.id]: resp }))
                  if (results && !graded)
                    setResults((all) => {
                      if (!all) return all
                      const { [e.id]: _stale, ...rest } = all
                      return rest
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
                label={`Answer to problem ${i + 1}`}
                readOnly={graded}
              />
              {r?.verdict === 'invalid' && <p className={styles.feedback}>{r.message}</p>}
              {results && self && !(e.id in selfGrades) && (
                <div className={styles.actions}>
                  <span className={styles.note}>
                    Compare with the solution below. Did you get it?
                  </span>
                  <span className={styles.actionGroup}>
                    <Button onClick={() => gradeSelf(e.id, true)}>Yes</Button>
                    <Button variant="ghost" onClick={() => gradeSelf(e.id, false)}>
                      No
                    </Button>
                  </span>
                </div>
              )}
              {results && (self || r?.verdict !== 'correct' || graded) && (
                <div className={styles.panel}>
                  <p className={styles.panelTitle}>Solution</p>
                  <ol>
                    {e.problem.solution.map((line, k) => (
                      <li key={k}>
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
        })}

        {!graded && (
          <div className={`${styles.actions} ${styles.noPrint}`}>
            <span className={styles.note}>
              {results
                ? invalid.length
                  ? `Fix the ${invalid.length === 1 ? 'answer' : 'answers'} that could not be read, then check again.`
                  : 'Grade the self-checked problems to see your score.'
                : 'Unanswered problems count as incorrect.'}
            </span>
            <Button variant="primary" onClick={checkAll}>
              {results ? 'Check again' : 'Check answers'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
