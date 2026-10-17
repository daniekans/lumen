import { MDXProvider } from '@mdx-js/react'
import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Pin, PinOff } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense, useState, type CSSProperties } from 'react'
import { ancestors, type Item } from '@/catalog'
import { msg } from '@/i18n'
import { isItemComplete, itemProgress, useProgress } from '@/progress'
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
  const resetItem = useProgress((s) => s.resetItem)
  const done = isItemComplete(entry, progress)
  const inProgress = itemProgress(entry, progress).state === 'in-progress'
  const solved = new Set(progress?.correctChecks)
  // Undoing "done" starts the item over; a "not done" mark over a full ring would be confusing.
  const toggleDone = () => {
    if (done) return resetItem(entry.id)
    const derived = isItemComplete(entry, progress && { ...progress, manual: undefined })
    setManual(entry.id, derived ? undefined : 'done')
  }

  return (
    <motion.aside
      key={mode}
      className={clsx(styles.aside, floating ? [surfaces.glass, styles.floating] : styles.docked)}
      data-print-hide
      style={{ '--aside-width': `${width}px` } as CSSProperties}
      initial={false}
      animate={{ width: open ? width : 0, opacity: open ? 1 : 0 }}
      transition={resizing ? { duration: 0 } : spring.pane}
      aria-label={msg.item.explanation}
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
          label={msg.item.resizeExplanation}
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
            <Badge>{msg.catalog.kind[entry.kind]}</Badge>
            <Badge>{msg.catalog.level[entry.level]}</Badge>
          </div>
          <IconButton
            label={floating ? msg.item.dock : msg.item.float}
            size="sm"
            onClick={toggleMode}
          >
            {floating ? <Pin size={14} /> : <PinOff size={14} />}
          </IconButton>
        </div>
        <h1 className={styles.title}>{entry.title}</h1>
        <p className={styles.summary}>{entry.summary}</p>
        <div className={styles.status}>
          <DoneToggle
            done={done}
            onToggle={toggleDone}
            onReset={inProgress ? () => resetItem(entry.id) : undefined}
          />
          {progress?.manual && <span className={styles.manual}>{msg.item.setByYou}</span>}
        </div>

        {steps.length > 0 && (
          <section>
            <div className={styles.stepsHead}>
              <span className={styles.label}>{msg.item.steps}</span>
              <span className={styles.stepNav}>
                <IconButton
                  label={msg.item.previousStep}
                  shortcut="←"
                  size="sm"
                  disabled={stepIndex === 0}
                  onClick={() => onStep(stepIndex - 1)}
                >
                  <ChevronLeft size={15} />
                </IconButton>
                {stepIndex + 1} / {steps.length}
                <IconButton
                  label={msg.item.nextStep}
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
              {msg.item.explanation}
            </div>
            <div className={prose.prose}>
              <MDXProvider components={mdxComponents}>
                <ErrorBoundary compact>
                  <Suspense fallback={<p className={styles.loading}>{msg.common.loading}</p>}>
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
