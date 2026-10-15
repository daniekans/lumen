import { MDXProvider } from '@mdx-js/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense } from 'react'
import { sections } from '@/content/sections'
import type { VizEntry } from '@/content/types'
import { useUi } from '@/state/ui'
import { ease, spring } from '@/styles/motion'
import { Badge, IconButton } from '../atoms'
import { StepList } from '../molecules'
import styles from './ExplanationPane.module.css'
import { mdxComponents } from './mdxComponents'
import prose from './Prose.module.css'

interface ExplanationPaneProps {
  entry: VizEntry
  stepIndex: number
  onStep: (index: number) => void
}

export function ExplanationPane({ entry, stepIndex, onStep }: ExplanationPaneProps) {
  const open = useUi((s) => s.asideOpen)
  const steps = entry.steps ?? []
  const section = sections.find((s) => s.id === entry.section)
  const Explanation = entry.Explanation

  return (
    <motion.aside
      className={styles.aside}
      initial={false}
      animate={{ width: open ? 'var(--aside-width)' : 0, opacity: open ? 1 : 0 }}
      transition={spring.pane}
      aria-label="Explanation"
      aria-hidden={!open}
      inert={!open}
    >
      <motion.div
        key={entry.id}
        className={styles.inner}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: ease.out }}
      >
        <div className={styles.meta}>
          {section && <Badge>{section.title}</Badge>}
          <Badge>{entry.level}</Badge>
        </div>
        <h1 className={styles.title}>{entry.title}</h1>
        <p className={styles.summary}>{entry.summary}</p>

        {steps.length > 0 && (
          <section>
            <div className={styles.stepsHead}>
              <span className={styles.label}>Steps</span>
              <span className={styles.stepNav}>
                <IconButton
                  label="Previous step"
                  shortcut="←"
                  size="sm"
                  disabled={stepIndex === 0}
                  onClick={() => onStep(stepIndex - 1)}
                >
                  <ChevronLeft size={15} />
                </IconButton>
                {stepIndex + 1} / {steps.length}
                <IconButton
                  label="Next step"
                  shortcut="→"
                  size="sm"
                  disabled={stepIndex === steps.length - 1}
                  onClick={() => onStep(stepIndex + 1)}
                >
                  <ChevronRight size={15} />
                </IconButton>
              </span>
            </div>
            <StepList steps={steps} active={stepIndex} onSelect={onStep} />
          </section>
        )}

        {Explanation && (
          <>
            <hr className={styles.rule} />
            <div className={styles.label} style={{ marginBottom: 'var(--space-3)' }}>
              Explanation
            </div>
            <div className={prose.prose}>
              <MDXProvider components={mdxComponents}>
                <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
                  <Explanation />
                </Suspense>
              </MDXProvider>
            </div>
          </>
        )}
      </motion.div>
    </motion.aside>
  )
}
