import { Shuffle } from 'lucide-react'
import { useState } from 'react'
import type { Item } from '@/catalog'
import {
  createRng,
  nextGenerator,
  randomSeed,
  type Attempt,
  type DifficultyChoice,
  type ProblemGenerator,
} from '@/lib/practice'
import { useProgress } from '@/progress'
import { Button } from '@/ui/atoms'
import { SegmentedControl } from '@/ui/molecules'
import { VizControls } from '@/viz-kit'
import { ProblemCard } from './ProblemCard'
import { SessionSummary } from './SessionSummary'
import styles from './Practice.module.css'

const SESSION_LENGTH = 8

const difficultyOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '1', label: 'Easy' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Hard' },
] as const

const draw = (
  generators: readonly ProblemGenerator[],
  history: readonly Attempt[],
  choice: DifficultyChoice,
) => {
  const seed = randomSeed()
  const generator = nextGenerator(generators, history, choice, createRng(seed))
  return { generator, seed, problem: generator.generate(createRng(seed + 1)) }
}

/** On-demand practice: problems one at a time, sessions of eight, difficulty auto or chosen. */
export function PracticeSession({
  item,
  generators,
}: {
  item: Item
  generators: readonly ProblemGenerator[]
}) {
  const recordPractice = useProgress((s) => s.recordPractice)
  const [choice, setChoice] = useState<DifficultyChoice>('auto')
  const [history, setHistory] = useState<Attempt[]>([])
  const [current, setCurrent] = useState(() => draw(generators, [], 'auto'))
  const [finished, setFinished] = useState(false)

  const next = () => {
    if (history.length >= SESSION_LENGTH) setFinished(true)
    else setCurrent(draw(generators, history, choice))
  }

  const restart = () => {
    setHistory([])
    setFinished(false)
    setCurrent(draw(generators, [], choice))
  }

  return (
    <div className={styles.scroll}>
      <div className={styles.column}>
        {finished ? (
          <SessionSummary item={item} attempts={history} onRestart={restart} />
        ) : (
          <ProblemCard
            key={current.seed}
            problem={current.problem}
            title={current.generator.title}
            difficulty={current.generator.difficulty}
            results={history.map((a) => a.correct)}
            total={SESSION_LENGTH}
            onOutcome={({ correct, helped }) => {
              recordPractice(item.id, correct)
              setHistory((h) => [
                ...h,
                {
                  generatorId: current.generator.id,
                  skills: current.generator.skills,
                  difficulty: current.generator.difficulty,
                  correct,
                  helped,
                },
              ])
            }}
            onNext={next}
          />
        )}
      </div>
      <VizControls>
        <SegmentedControl
          label="Difficulty"
          value={String(choice)}
          options={difficultyOptions}
          onChange={(v) => setChoice(v === 'auto' ? 'auto' : (Number(v) as 1 | 2 | 3))}
        />
        <Button
          variant="ghost"
          icon={<Shuffle size={14} />}
          onClick={() => setCurrent(draw(generators, history, choice))}
          disabled={finished}
        >
          Different problem
        </Button>
      </VizControls>
    </div>
  )
}
