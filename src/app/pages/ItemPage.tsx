import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CurrentItemContext, neighbours, type Item } from '@/catalog'
import { useProgress } from '@/progress'
import { useUi } from '@/state/ui'
import { ease } from '@/styles/motion'
import { IconButton } from '@/ui/atoms'
import { Breadcrumbs } from '@/ui/molecules'
import { ControlDock, ExplanationPane, LissajousMark, TopBar } from '@/ui/organisms'
import { VizLayout } from '@/ui/templates'
import { VizRuntimeContext, type VizRuntimeValue } from '@/viz-kit/runtime'
import { crumbsFor } from '../crumbs'
import { ErrorBoundary } from '@/ui/organisms'
import { isTyping } from '../useGlobalHotkeys'
import { usePageTitle } from '../usePageTitle'
import styles from './ItemPage.module.css'
import { msg } from '@/i18n'

export function ItemPage({ item }: { item: Item }) {
  const steps = useMemo(() => item.steps ?? [], [item])
  const [stepIndex, setStepIndex] = useState(0)
  const [dock, setDock] = useState<HTMLDivElement | null>(null)
  const asideOpen = useUi((s) => s.asideOpen)
  const toggleAside = useUi((s) => s.toggleAside)
  const visitStep = useProgress((s) => s.visitStep)
  const hydrated = useProgress((s) => s.hydrated)
  const Viz = item.Component
  const { next } = neighbours(item)
  usePageTitle(item.title)

  const goToStep = useCallback(
    (i: number) => setStepIndex(Math.max(0, Math.min(steps.length - 1, i))),
    [steps.length],
  )

  // Record visits once stored progress is loaded, so the first visit is not overwritten.
  const stepId = steps[stepIndex]?.id
  useEffect(() => {
    if (hydrated) visitStep(item.id, stepId)
  }, [hydrated, item.id, stepId, visitStep])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey || useUi.getState().paletteOpen) return
      if (e.key === 'ArrowRight') setStepIndex((i) => Math.min(steps.length - 1, i + 1))
      else if (e.key === 'ArrowLeft') setStepIndex((i) => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [steps.length])

  const runtime = useMemo<VizRuntimeValue>(
    () => ({ steps, stepIndex, goToStep, dock }),
    [steps, stepIndex, goToStep, dock],
  )

  return (
    <CurrentItemContext.Provider value={item}>
      <VizRuntimeContext.Provider value={runtime}>
        <VizLayout
          topBar={
            <TopBar
              actions={
                <>
                  {next && (
                    <Link
                      to={next.path}
                      className={styles.next}
                      onPointerEnter={() => void next.preload()}
                    >
                      {msg.common.next(next.title)}
                    </Link>
                  )}
                  <IconButton
                    label={asideOpen ? msg.item.hideExplanation : msg.item.showExplanation}
                    shortcut="]"
                    onClick={toggleAside}
                  >
                    {asideOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                  </IconButton>
                </>
              }
            >
              <Breadcrumbs items={crumbsFor(item)} />
            </TopBar>
          }
          stage={
            <motion.div
              className={styles.fill}
              data-print-flow
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: ease.out }}
            >
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className={styles.loading}>
                      <LissajousMark size={40} />
                    </div>
                  }
                >
                  <Viz />
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          }
          floating={<ControlDock ref={setDock} />}
          aside={<ExplanationPane entry={item} stepIndex={stepIndex} onStep={goToStep} />}
        />
      </VizRuntimeContext.Provider>
    </CurrentItemContext.Provider>
  )
}
