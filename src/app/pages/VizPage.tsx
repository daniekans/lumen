import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getViz, neighbours } from '@/content/registry'
import { sections } from '@/content/sections'
import type { VizEntry } from '@/content/types'
import { useUi } from '@/state/ui'
import { ease } from '@/styles/motion'
import { IconButton } from '@/ui/atoms'
import { Breadcrumbs } from '@/ui/molecules'
import { ControlDock, ExplanationPane, LissajousMark, TopBar } from '@/ui/organisms'
import { VizLayout } from '@/ui/templates'
import { VizRuntimeContext, type VizRuntimeValue } from '@/viz-kit/runtime'
import { ErrorBoundary } from '../ErrorBoundary'
import { isTyping } from '../useGlobalHotkeys'
import { NotFoundPage } from './NotFoundPage'
import styles from './VizPage.module.css'

export function VizPage() {
  const { section = '', slug = '' } = useParams()
  const entry = getViz(section, slug)
  if (!entry) return <NotFoundPage />
  // Keyed so each visualization starts from a clean state.
  return <VizView key={entry.id} entry={entry} />
}

function VizView({ entry }: { entry: VizEntry }) {
  const steps = useMemo(() => entry.steps ?? [], [entry])
  const [stepIndex, setStepIndex] = useState(0)
  const [dock, setDock] = useState<HTMLDivElement | null>(null)
  const asideOpen = useUi((s) => s.asideOpen)
  const toggleAside = useUi((s) => s.toggleAside)
  const Viz = entry.Component
  const sectionTitle = sections.find((s) => s.id === entry.section)?.title
  const { next } = neighbours(entry.id)

  const goToStep = useCallback(
    (i: number) => setStepIndex(Math.max(0, Math.min(steps.length - 1, i))),
    [steps.length],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey || useUi.getState().paletteOpen) return
      if (e.key === 'ArrowRight') setStepIndex((i) => Math.min(steps.length - 1, i + 1))
      else if (e.key === 'ArrowLeft') setStepIndex((i) => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [steps.length])

  useEffect(() => {
    document.title = `${entry.title} · Lumen`
    return () => {
      document.title = 'Lumen'
    }
  }, [entry.title])

  const runtime = useMemo<VizRuntimeValue>(
    () => ({ steps, stepIndex, goToStep, dock }),
    [steps, stepIndex, goToStep, dock],
  )

  return (
    <VizRuntimeContext.Provider value={runtime}>
      <VizLayout
        topBar={
          <TopBar
            actions={
              <>
                {next && (
                  <Link to={`/${next.id}`} className={styles.next}>
                    Next: {next.title}
                  </Link>
                )}
                <IconButton
                  label={asideOpen ? 'Hide explanation' : 'Show explanation'}
                  shortcut="]"
                  onClick={toggleAside}
                >
                  {asideOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                </IconButton>
              </>
            }
          >
            <Breadcrumbs
              items={[{ label: sectionTitle ?? entry.section, to: '/' }, { label: entry.title }]}
            />
          </TopBar>
        }
        stage={
          <motion.div
            className={styles.fill}
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
        aside={<ExplanationPane entry={entry} stepIndex={stepIndex} onStep={goToStep} />}
      />
    </VizRuntimeContext.Provider>
  )
}
