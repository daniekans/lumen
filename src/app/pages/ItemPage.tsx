import { Maximize, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CurrentItemContext, neighbours, type Item } from '@/catalog'
import { useProgress } from '@/progress'
import { useUi } from '@/state/ui'
import { ease } from '@/styles/motion'
import { IconButton, PortalContainerContext } from '@/ui/atoms'
import { Breadcrumbs } from '@/ui/molecules'
import {
  CodePanel,
  ControlDock,
  ExplanationPane,
  FullscreenBar,
  LissajousMark,
  TopBar,
  useItemCode,
} from '@/ui/organisms'
import { VizLayout } from '@/ui/templates'
import {
  createActivity,
  createUrlParams,
  readQuery,
  useActivity,
  VizRuntimeContext,
  writeQuery,
  type VizRuntimeValue,
} from '@/viz-kit/runtime'
import { CodeFocusScope, HighlightScope } from '@/viz-kit/stage'
import { crumbsFor } from '../crumbs'
import { ErrorBoundary } from '@/ui/organisms'
import { isTyping } from '../useGlobalHotkeys'
import { useFullscreen } from '../useFullscreen'
import { usePageTitle } from '../usePageTitle'
import styles from './ItemPage.module.css'
import { msg } from '@/i18n'

export function ItemPage({ item }: { item: Item }) {
  const steps = useMemo(() => item.steps ?? [], [item])
  // A link can open an exact step: ?step=<id>.
  const [stepIndex, setStepIndex] = useState(() =>
    Math.max(
      0,
      steps.findIndex((s) => s.id === readQuery('step')),
    ),
  )
  const code = useItemCode(item)
  const codeOpen = useUi((s) => s.codePanelOpen)
  const setCodeOpen = useUi((s) => s.setCodePanelOpen)
  const [dock, setDock] = useState<HTMLDivElement | null>(null)
  const [urlParams] = useState(createUrlParams)
  const [activity] = useState(createActivity)
  const { running, playedStep } = useActivity(activity)
  const playback = {
    playing: running > 0,
    canReplay: playedStep === stepIndex,
    onReplay: activity.replay,
  }
  const [stageArea, setStageArea] = useState<HTMLDivElement | null>(null)
  const fullscreen = useFullscreen(stageArea)
  const toggleFullscreen = fullscreen.toggle
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
    if (stepId) writeQuery('step', stepIndex === 0 ? null : stepId)
  }, [stepId, stepIndex])

  // Links to the old Code tab (?tab=code) open the code panel instead.
  useEffect(() => {
    if (readQuery('tab') !== 'code') return
    writeQuery('tab', null)
    if (item.hasCode) useUi.getState().setCodePanelOpen(true)
  }, [item.hasCode])

  // `c` opens and closes the code panel.
  const toggleCode = useCallback(() => {
    if (!item.hasCode) return
    const ui = useUi.getState()
    ui.setCodePanelOpen(!ui.codePanelOpen)
  }, [item.hasCode])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A focused 3D stage uses the arrow keys to turn the view and marks them handled.
      if (e.defaultPrevented) return
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey || useUi.getState().paletteOpen) return
      if (e.key === 'ArrowRight') setStepIndex((i) => Math.min(steps.length - 1, i + 1))
      else if (e.key === 'ArrowLeft') setStepIndex((i) => Math.max(0, i - 1))
      else if (e.key === 'f') toggleFullscreen()
      else if (e.key === 'c') toggleCode()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [steps.length, toggleFullscreen, toggleCode])

  const runtime = useMemo<VizRuntimeValue>(
    () => ({ steps, stepIndex, goToStep, dock, urlParams, activity }),
    [steps, stepIndex, goToStep, dock, urlParams, activity],
  )

  return (
    <CurrentItemContext.Provider value={item}>
      {/* One highlight for the stage and the pane, so code in the pane links to the shapes. */}
      <HighlightScope>
        {/* The code line an item drives from its animation, read by the code panel. */}
        <CodeFocusScope>
          <VizRuntimeContext.Provider value={runtime}>
            {/* Tooltips portal into the stage area in fullscreen, since the rest of the page is hidden. */}
            <PortalContainerContext value={fullscreen.active ? stageArea : undefined}>
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
                          label={msg.item.fullscreen}
                          shortcut="F"
                          onClick={fullscreen.enter}
                        >
                          <Maximize size={16} />
                        </IconButton>
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
                floating={
                  <>
                    <ControlDock ref={setDock} />
                    {item.hasCode && (
                      <CodePanel
                        item={item}
                        stepIndex={stepIndex}
                        onStep={goToStep}
                        entries={code.entries}
                        codeSteps={code.codeSteps}
                        open={codeOpen}
                        onOpenChange={setCodeOpen}
                        dock={dock}
                      />
                    )}
                    {fullscreen.active && (
                      <FullscreenBar
                        title={steps[stepIndex]?.title}
                        index={stepIndex}
                        count={steps.length}
                        onStep={goToStep}
                        onExit={fullscreen.exit}
                        playback={playback}
                      />
                    )}
                  </>
                }
                stageRef={setStageArea}
                fullscreen={fullscreen.active}
                aside={
                  <ExplanationPane
                    entry={item}
                    stepIndex={stepIndex}
                    onStep={goToStep}
                    playback={playback}
                    codeSteps={code.codeSteps}
                    codeOpen={codeOpen}
                    onCodeOpen={setCodeOpen}
                  />
                }
              />
            </PortalContainerContext>
          </VizRuntimeContext.Provider>
        </CodeFocusScope>
      </HighlightScope>
    </CurrentItemContext.Provider>
  )
}
