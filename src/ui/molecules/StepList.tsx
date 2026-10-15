import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import type { VizStep } from '@/content/types'
import { ease, spring } from '@/styles/motion'
import { RichText } from '../atoms'
import styles from './StepList.module.css'

interface StepListProps {
  steps: readonly VizStep[]
  active: number
  onSelect: (index: number) => void
}

export function StepList({ steps, active, onSelect }: StepListProps) {
  return (
    <ol className={styles.list}>
      {steps.map((s, i) => (
        <li key={s.id}>
          <button
            type="button"
            className={clsx(styles.step, i === active && styles.active, i < active && styles.done)}
            onClick={() => onSelect(i)}
            aria-current={i === active ? 'step' : undefined}
          >
            {i === active && (
              <motion.span
                layoutId="step-indicator"
                className={styles.indicator}
                transition={spring.snappy}
              />
            )}
            <span className={styles.index}>{i + 1}</span>
            <span className={styles.body}>
              <span className={styles.title}>{s.title}</span>
              <AnimatePresence initial={false}>
                {i === active && (
                  <motion.span
                    className={styles.caption}
                    style={{ display: 'block' }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: ease.out }}
                  >
                    <span className={styles.captionText}>
                      <RichText>{s.caption}</RichText>
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}
