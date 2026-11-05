import { MDXProvider } from '@mdx-js/react'
import clsx from 'clsx'
import { BookOpen, ChevronLeft, ChevronRight, CodeXml, Pin, PinOff } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { ancestors, type Item } from '@/catalog'
import type { CodeEntry } from '@/lib/code'
import { msg } from '@/i18n'
import { isItemComplete, itemProgress, useProgress } from '@/progress'
import { ASIDE_WIDTH, useUi } from '@/state/ui'
import { ease, spring } from '@/styles/motion'
import { Badge, IconButton, ResizeHandle, RichText } from '../atoms'
import {
  CodeLinksContext,
  CodeTabs,
  CodeView,
  DoneToggle,
  PlaybackButton,
  SegmentedControl,
  StepList,
  type CodeLinks,
} from '../molecules'
import { ErrorBoundary } from './ErrorBoundary'
import styles from './ExplanationPane.module.css'
import { mdxComponents } from './mdxComponents'
import prose from './Prose.module.css'
import surfaces from '@/styles/surfaces.module.css'
import { useHighlightScope } from '@/viz-kit/stage'

/** What the pane shows under the steps. `code` exists only on items with a `code.mdx`. */
export type PaneTab = 'explanation' | 'code'

interface ExplanationPaneProps {
  entry: Item
  stepIndex: number
  onStep: (index: number) => void
  /** Whether the step's animation is playing, and replaying it. */
  playback?: ComponentProps<typeof PlaybackButton>
  tab?: PaneTab
  onTab?: (tab: PaneTab) => void
}

/** The snippets of an item's `code.mdx` linked to steps, once its chunk has loaded. */
const useStepCode = (entry: Item) => {
  const [loaded, setLoaded] = useState<{ id: string; entries: readonly CodeEntry[] }>()
  useEffect(() => {
    let live = true
    entry
      .loadCode?.()
      .then((m) => live && setLoaded({ id: entry.id, entries: m.snippets ?? [] }))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [entry])
  return loaded?.id === entry.id ? loaded.entries : undefined
}

/**
 * Links the code inside to the page's highlight (two-way hover with the stage). Only the code
 * views re-render on a hover, not the pane or its MDX.
 */
function CodeLinksProvider({
  activeStep,
  codeSteps,
  children,
}: Pick<CodeLinks, 'activeStep' | 'codeSteps'> & { children: ReactNode }) {
  const h = useHighlightScope()
  const active = h?.active ?? h?.hint ?? null
  const set = h?.set
  const onHoverKey = useCallback(
    (key: string, on: boolean) => {
      if (!set) return
      if (on) set(key)
      else if (active === key) set(null)
    },
    [set, active],
  )
  const value = useMemo<CodeLinks>(
    () => ({ activeKey: active, onHoverKey, activeStep, codeSteps }),
    [active, onHoverKey, activeStep, codeSteps],
  )
  return <CodeLinksContext value={value}>{children}</CodeLinksContext>
}

/** The code of one step: its blocks in order, the blocks of one `CodeTabs` as tabs again. */
const stepPeek = (entries: readonly CodeEntry[], stepId: string) => {
  const mine = entries.filter((e) => e.snippet.step === stepId)
  const shown = new Set<number>()
  return mine.map((e, i) => {
    if (e.group === undefined) return <CodeView key={i} snippet={e.snippet} tokens={e.tokens} />
    if (shown.has(e.group)) return null
    shown.add(e.group)
    return (
      <CodeTabs key={i}>
        {mine
          .filter((g) => g.group === e.group)
          .map((g, k) => (
            <CodeView key={k} snippet={g.snippet} tokens={g.tokens} />
          ))}
      </CodeTabs>
    )
  })
}

export function ExplanationPane({
  entry,
  stepIndex,
  onStep,
  playback,
  tab = 'explanation',
  onTab,
}: ExplanationPaneProps) {
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
  const Code = entry.Code
  const showCode = tab === 'code' && Code !== undefined
  const stepCode = useStepCode(entry)
  const codeSteps = useMemo(
    () => new Set(stepCode?.flatMap((e) => (e.snippet.step ? [e.snippet.step] : []))),
    [stepCode],
  )
  const [peekOpen, setPeekOpen] = useState(false)
  const stepId = steps[stepIndex]?.id
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
            {entry.hasCode && (
              <Badge>
                <span className={styles.codeMark} title={msg.item.hasCode}>
                  <CodeXml size={11} aria-hidden />
                  {msg.item.code}
                </span>
              </Badge>
            )}
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
        <p className={styles.summary}>
          <RichText>{entry.summary}</RichText>
        </p>
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
                {playback && <PlaybackButton {...playback} />}
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
            <CodeLinksProvider>
              <StepList
                steps={steps}
                active={stepIndex}
                onSelect={onStep}
                solved={solved}
                onCheck={(id, correct) => recordCheck(entry.id, id, correct)}
                onClearCheck={(id) => clearCheck(entry.id, id)}
                codeSteps={codeSteps}
                peekOpen={peekOpen}
                onPeekOpen={setPeekOpen}
                renderPeek={stepCode && ((id) => stepPeek(stepCode, id))}
              />
            </CodeLinksProvider>
          </section>
        )}

        {(Explanation || Code) && (
          <>
            <hr className={styles.rule} />
            {Code ? (
              <SegmentedControl
                label={msg.item.paneTabs}
                className={styles.tabs}
                value={showCode ? 'code' : 'explanation'}
                onChange={(t) => onTab?.(t)}
                options={[
                  {
                    value: 'explanation',
                    label: msg.item.explanation,
                    icon: <BookOpen size={13} aria-hidden />,
                  },
                  { value: 'code', label: msg.item.code, icon: <CodeXml size={13} aria-hidden /> },
                ]}
              />
            ) : (
              <div className={styles.label} style={{ marginBottom: 'var(--space-3)' }}>
                {msg.item.explanation}
              </div>
            )}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={showCode ? 'code' : 'explanation'}
                className={clsx(prose.prose, showCode && styles.codeProse)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: ease.out }}
              >
                <MDXProvider components={mdxComponents}>
                  <ErrorBoundary compact>
                    <Suspense fallback={<p className={styles.loading}>{msg.common.loading}</p>}>
                      {showCode ? (
                        <CodeLinksProvider activeStep={stepId} codeSteps={codeSteps}>
                          <Code />
                        </CodeLinksProvider>
                      ) : (
                        Explanation && (
                          <CodeLinksProvider>
                            <Explanation />
                          </CodeLinksProvider>
                        )
                      )}
                    </Suspense>
                  </ErrorBoundary>
                </MDXProvider>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.aside>
  )
}
