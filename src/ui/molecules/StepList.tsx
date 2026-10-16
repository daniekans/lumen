import clsx from 'clsx'
import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { VizStep } from '@/catalog/types'
import { ease, spring } from '@/styles/motion'
import { RichText } from '../atoms'
import { StepCheckView } from './StepCheckView'
import styles from './StepList.module.css'

interface StepListProps {
  steps: readonly VizStep[]
  active: number
  onSelect: (index: number) => void
  /** Ids of steps whose check is already answered correctly. */
  solved?: ReadonlySet<string>
  onCheck?: (stepId: string, correct: boolean) => void
  onClearCheck?: (stepId: string) => void
}

export function StepList({
  steps,
  active,
  onSelect,
  solved,
  onCheck,
  onClearCheck,
}: StepListProps) {
  return (
    <ol className={styles.list}>
      {steps.map((s, i) => {
        const isActive = i === active
        const isSolved = solved?.has(s.id) ?? false
        return (
          <li
            key={s.id}
            className={clsx(styles.entry, isActive && styles.active, i < active && styles.done)}
          >
            {isActive && (
              <motion.span
                layoutId="step-indicator"
                className={styles.indicator}
                transition={spring.snappy}
              />
            )}
            <button
              type="button"
              className={styles.step}
              onClick={() => onSelect(i)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className={styles.index}>{i + 1}</span>
              <span className={styles.title}>
                {s.title}
                {s.check && isSolved && (
                  <Check size={12} className={styles.solved} aria-label="Answered" />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  className={styles.caption}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: ease.out }}
                >
                  <div className={styles.captionInner}>
                    <p className={styles.captionText}>
                      <RichText>{s.caption}</RichText>
                    </p>
                    {s.check && (
                      <StepCheckView
                        key={s.id}
                        check={s.check}
                        solved={isSolved}
                        onAnswer={(correct) => onCheck?.(s.id, correct)}
                        onClear={() => onClearCheck?.(s.id)}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ol>
  )
}
