import clsx from 'clsx'
import { Check, CodeXml } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizStep } from '@/catalog/types'
import { ease, spring } from '@/styles/motion'
import { IconButton, RichText } from '../atoms'
import { StepCheckView } from './StepCheckView'
import styles from './StepList.module.css'
import { msg } from '@/i18n'

interface StepListProps {
  steps: readonly VizStep[]
  active: number
  onSelect: (index: number) => void
  /** Ids of steps whose check is already answered correctly. */
  solved?: ReadonlySet<string>
  onCheck?: (stepId: string, correct: boolean) => void
  onClearCheck?: (stepId: string) => void
  /** Steps with linked code: their rows get a code button that opens a peek under the caption. */
  codeSteps?: ReadonlySet<string>
  /** Whether peeks are open. One switch for all steps, so the code follows as steps change. */
  peekOpen?: boolean
  onPeekOpen?: (open: boolean) => void
  /** The code of a step, shown in its peek. */
  renderPeek?: (stepId: string) => ReactNode
}

const reveal = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.32, ease: ease.out },
} as const

export function StepList({
  steps,
  active,
  onSelect,
  solved,
  onCheck,
  onClearCheck,
  codeSteps,
  peekOpen = false,
  onPeekOpen,
  renderPeek,
}: StepListProps) {
  return (
    <ol className={styles.list}>
      {steps.map((s, i) => {
        const isActive = i === active
        const isSolved = solved?.has(s.id) ?? false
        const hasCode = (codeSteps?.has(s.id) ?? false) && renderPeek !== undefined
        const peeking = hasCode && isActive && peekOpen
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
              className={clsx(styles.step, hasCode && styles.withCode)}
              onClick={() => onSelect(i)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className={styles.index}>{i + 1}</span>
              <span className={styles.title}>
                <RichText>{s.title}</RichText>
                {s.check && isSolved && (
                  <Check size={12} className={styles.solved} aria-label={msg.item.answered} />
                )}
              </span>
            </button>
            {hasCode && (
              <span className={styles.codeSlot}>
                <IconButton
                  label={peeking ? msg.item.hideStepCode : msg.item.showStepCode}
                  size="sm"
                  className={clsx(styles.codeToggle, peeking && styles.peeking)}
                  aria-pressed={peeking}
                  onClick={() => {
                    if (!isActive) onSelect(i)
                    onPeekOpen?.(!peeking)
                  }}
                >
                  <CodeXml size={14} />
                </IconButton>
              </span>
            )}
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div className={styles.caption} {...reveal}>
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
                    <AnimatePresence initial={false}>
                      {peeking && (
                        <motion.div key="peek" className={styles.peek} {...reveal}>
                          <div className={styles.peekInner}>{renderPeek(s.id)}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
