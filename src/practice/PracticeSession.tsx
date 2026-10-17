import clsx from 'clsx'
import { RotateCcw, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  createRng,
  nextGenerator,
  randomSeed,
  type Attempt,
  type DifficultyChoice,
  type ProblemGenerator,
} from '@/lib/practice'
import { useProgress, type PracticeSessionState, type SessionEntry } from '@/progress'
import { Button } from '@/ui/atoms'
import { SegmentedControl } from '@/ui/molecules'
import { VizControls } from '@/viz-kit'
import { ProblemCard } from './ProblemCard'
import { SessionSummary } from './SessionSummary'
import styles from './Practice.module.css'

export const SESSION_LENGTH = 8

const difficultyOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '1', label: 'Easy' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Hard' },
] as const

const attemptsOf = (
  entries: readonly SessionEntry[],
  byId: ReadonlyMap<string, ProblemGenerator>,
): Attempt[] =>
  entries.flatMap((e) => {
    const g = byId.get(e.generatorId)
    return g && e.outcome
      ? [{ generatorId: g.id, skills: g.skills, difficulty: g.difficulty, ...e.outcome }]
      : []
  })

const drawEntry = (
  generators: readonly ProblemGenerator[],
  history: readonly Attempt[],
  choice: DifficultyChoice,
): SessionEntry => {
  const seed = randomSeed()
  const g = nextGenerator(generators, history, choice, createRng(seed))
  return { generatorId: g.id, seed, checked: false, hints: 0, solution: false }
}

interface PracticeSessionProps {
  /** Every generator a stored problem may come from, with global skill keys (`withSkillKeys`). */
  generators: readonly ProblemGenerator[]
  /** Where new problems are drawn from. Defaults to `generators`. */
  pool?: readonly ProblemGenerator[]
  stored: PracticeSessionState | undefined
  onSave: (session: PracticeSessionState) => void
  /** Called once per problem, with its first answer. */
  onAnswer?: (correct: boolean) => void
  /** Linked from the summary. */
  next?: { title: string; path: string }
}

/**
 * On-demand practice in sessions of eight problems. The session is stored with the learner's
 * progress, so leaving and coming back continues where it stopped; "Start over" draws a new one.
 * Earlier problems of the session can be reviewed (read-only) from the progress dots.
 */
export function PracticeSession({
  generators,
  pool: wanted,
  stored,
  onSave: save,
  onAnswer,
  next,
}: PracticeSessionProps) {
  const hydrated = useProgress((s) => s.hydrated)
  const [viewing, setViewing] = useState<number | null>(null)
  const byId = useMemo(() => new Map(generators.map((g) => [g.id, g])), [generators])
  const pool = wanted?.length ? wanted : generators

  // A stored session is usable only if every problem still exists in the current problem set.
  const session =
    stored && stored.entries.length > 0 && stored.entries.every((e) => byId.has(e.generatorId))
      ? stored
      : undefined

  const fresh = (difficulty: DifficultyChoice): PracticeSessionState => ({
    entries: [drawEntry(pool, [], difficulty)],
    difficulty,
    finished: false,
  })

  useEffect(() => {
    if (hydrated && !session) save(fresh(stored?.difficulty ?? 'auto'))
    // `fresh` and `save` only read props; re-running when they change is not needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, session])

  if (!session) return <div className={styles.scroll} />

  const { entries, difficulty, finished } = session
  const last = entries.length - 1
  const index = viewing ?? last
  const entry = entries[index]!
  const generator = byId.get(entry.generatorId)!
  const problem = generator.generate(createRng(entry.seed + 1))
  const update = (i: number, patch: Partial<SessionEntry>) => {
    const before = entries[i]!
    if (patch.outcome && !before.outcome) onAnswer?.(patch.outcome.correct)
    save({ ...session, entries: entries.map((e, k) => (k === i ? { ...e, ...patch } : e)) })
  }

  const replaceCurrent = (choice: DifficultyChoice = difficulty) =>
    save({
      ...session,
      difficulty: choice,
      entries: [
        ...entries.slice(0, last),
        drawEntry(pool, attemptsOf(entries.slice(0, last), byId), choice),
      ],
    })

  const advance = () => {
    if (!entries[last]!.outcome) return replaceCurrent()
    if (entries.length >= SESSION_LENGTH) return save({ ...session, finished: true })
    save({
      ...session,
      entries: [...entries, drawEntry(pool, attemptsOf(entries, byId), difficulty)],
    })
  }

  const restart = () => {
    setViewing(null)
    save(fresh(difficulty))
  }

  const progress = (
    <span className={styles.meta}>
      <span className={styles.dots}>
        {Array.from({ length: SESSION_LENGTH }, (_, i) => {
          const e = entries[i]
          const reachable = i <= last
          return (
            <button
              key={i}
              type="button"
              disabled={!reachable}
              aria-label={`Problem ${i + 1}${e?.outcome ? (e.outcome.correct ? ', right' : ', wrong') : ''}`}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => setViewing(!finished && i === last ? null : i)}
              className={clsx(
                styles.dot,
                e?.outcome?.correct === true && styles.dotRight,
                e?.outcome?.correct === false && styles.dotWrong,
                i === index && styles.dotCurrent,
              )}
            />
          )
        })}
      </span>
      {index + 1} / {SESSION_LENGTH}
    </span>
  )

  // Reviewing: an earlier problem of an active session, or any problem of a finished one.
  const reviewing = viewing !== null && (finished || viewing < last)
  const nextAction = reviewing
    ? finished
      ? index < last
        ? { label: 'Next', onClick: () => setViewing(index + 1) }
        : { label: 'Back to the summary', onClick: () => setViewing(null) }
      : index + 1 === last
        ? { label: 'Back to the current problem', onClick: () => setViewing(null) }
        : { label: 'Next', onClick: () => setViewing(index + 1) }
    : {
        label: entry.outcome
          ? entries.length >= SESSION_LENGTH
            ? 'See results'
            : 'Next problem'
          : 'Skip',
        onClick: advance,
      }

  return (
    <div className={styles.scroll}>
      <div className={styles.column}>
        {finished && !reviewing ? (
          <SessionSummary
            next={next}
            attempts={attemptsOf(entries, byId)}
            onRestart={restart}
            onReview={() => setViewing(0)}
          />
        ) : (
          <ProblemCard
            key={`${index}-${entry.seed}`}
            problem={problem}
            title={generator.title}
            difficulty={generator.difficulty}
            entry={entry}
            onUpdate={(patch) => update(index, patch)}
            progress={progress}
            review={reviewing}
            next={nextAction}
          />
        )}
      </div>
      <VizControls>
        <SegmentedControl
          label="Difficulty"
          value={String(difficulty)}
          options={difficultyOptions}
          onChange={(v) => {
            const choice: DifficultyChoice = v === 'auto' ? 'auto' : (Number(v) as 1 | 2 | 3)
            // An unanswered problem is replaced right away; an answered one keeps its place and the
            // new difficulty applies from the next problem.
            if (!finished && !entries[last]!.outcome) {
              setViewing(null)
              replaceCurrent(choice)
            } else save({ ...session, difficulty: choice })
          }}
        />
        <Button
          variant="ghost"
          icon={<Shuffle size={14} />}
          onClick={() => {
            setViewing(null)
            replaceCurrent()
          }}
          disabled={finished || !!entries[last]!.outcome}
        >
          Different problem
        </Button>
        <Button variant="ghost" icon={<RotateCcw size={14} />} onClick={restart}>
          Start over
        </Button>
      </VizControls>
    </div>
  )
}
