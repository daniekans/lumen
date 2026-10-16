import { MDXProvider } from '@mdx-js/react'
import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Pin, PinOff } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense, useState, type CSSProperties } from 'react'
import { ancestors, kindLabel, type Item } from '@/catalog'
import { isItemComplete, useProgress } from '@/progress'
import { ASIDE_WIDTH, useUi } from '@/state/ui'
import { ease, spring } from '@/styles/motion'
import { Badge, IconButton, ResizeHandle } from '../atoms'
import { DoneToggle, StepList } from '../molecules'
import { ErrorBoundary } from './ErrorBoundary'
import styles from './ExplanationPane.module.css'
import { mdxComponents } from './mdxComponents'
import prose from './Prose.module.css'
import surfaces from '@/styles/surfaces.module.css'

interface ExplanationPaneProps {
  entry: Item
  stepIndex: number
  onStep: (index: number) => void
}

export function ExplanationPane({ entry, stepIndex, onStep }: ExplanationPaneProps) {
  const open = useUi((s) => s.asideOpen)
  const mode = useUi((s) => s.asideMode)
  const width = useUi((s) => s.asideWidth)
  const setWidth = useUi((s) => s.setAsideWidth)
  const toggleMode = useUi((s) => s.toggleAsideMode)
  const [resizing, setResizing] = useState(false)
  const floating = mode === 'floating'
  const steps = entry.steps ?? []
  const { unit } = ancestors(entry)
  const Explanation = entry.Explanation
  const progress = useProgress((s) => s.data.items[entry.id])
  const recordCheck = useProgress((s) => s.recordCheck)
  const clearCheck = useProgress((s) => s.clearCheck)
  const setManual = useProgress((s) => s.setItemManual)
  const done = isItemComplete(entry, progress)
  const solved = new Set(progress?.correctChecks)
  const toggleDone = () => {
    // Prefer clearing an override over stacking a second one that agrees with the derived state.
    const derived = isItemComplete(entry, progress && { ...progress, manual: undefined })
    setManual(entry.id, derived === !done ? undefined : done ? 'not-done' : 'done')
  }

  return (
    <motion.aside
      key={mode}
      className={clsx(styles.aside, floating ? [surfaces.glass, styles.floating] : styles.docked)}
      style={{ '--aside-width': `${width}px` } as CSSProperties}
      initial={false}
      animate={{ width: open ? width : 0, opacity: open ? 1 : 0 }}
      transition={resizing ? { duration: 0 } : spring.pane}
      aria-label="Explanation"
      aria-hidden={!open}
      inert={!open}
    >
      {open && (
        <ResizeHandle
          edge="left"
          width={width}
          onResize={setWidth}
          onResizeStart={() => setResizing(true)}
          onResizeEnd={() => setResizing(false)}
          defaultWidth={ASIDE_WIDTH.default}
          label="Resize explanation"
        />
      )}
      <motion.div
        key={entry.id}
        className={styles.inner}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: ease.out }}
      >
        <div className={styles.head}>
          <div className={styles.meta}>
            {unit && <Badge>{unit.title}</Badge>}
            <Badge>{kindLabel[entry.kind]}</Badge>
            <Badge>{entry.level}</Badge>
          </div>
          <IconButton
            label={floating ? 'Dock to the side' : 'Float over the stage'}
            size="sm"
            onClick={toggleMode}
          >
            {floating ? <Pin size={14} /> : <PinOff size={14} />}
          </IconButton>
        </div>
        <h1 className={styles.title}>{entry.title}</h1>
        <p className={styles.summary}>{entry.summary}</p>
        <div className={styles.status}>
          <DoneToggle done={done} onToggle={toggleDone} />
          {progress?.manual && <span className={styles.manual}>set by you</span>}
        </div>

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
            <StepList
              steps={steps}
              active={stepIndex}
              onSelect={onStep}
              solved={solved}
              onCheck={(stepId, correct) => recordCheck(entry.id, stepId, correct)}
              onClearCheck={(stepId) => clearCheck(entry.id, stepId)}
            />
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
                <ErrorBoundary compact>
                  <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
                    <Explanation />
                  </Suspense>
                </ErrorBoundary>
              </MDXProvider>
            </div>
          </>
        )}
      </motion.div>
    </motion.aside>
  )
}
