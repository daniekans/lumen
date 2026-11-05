import { MDXProvider } from '@mdx-js/react'
import clsx from 'clsx'
import { ChevronDown, CodeXml, FileCode2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import type { CodeCorner, Item } from '@/catalog'
import { msg } from '@/i18n'
import type { CodeEntry } from '@/lib/code'
import { ease } from '@/styles/motion'
import surfaces from '@/styles/surfaces.module.css'
import { VizSheet } from '@/viz-kit/stage'
import { IconButton, RichText, Tooltip } from '../atoms'
import { CodeTabs, CodeView } from '../molecules'
import styles from './CodePanel.module.css'
import { CodeLinksProvider } from './CodeLinksProvider'
import { ErrorBoundary } from './ErrorBoundary'
import { mdxComponents } from './mdxComponents'
import prose from './Prose.module.css'

interface CodePanelProps {
  item: Item
  stepIndex: number
  onStep: (index: number) => void
  /** The item's step snippets (`useItemCode`), undefined while `code.mdx` loads. */
  entries: readonly CodeEntry[] | undefined
  codeSteps: ReadonlySet<string>
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The control dock, so the panel sits above it in the bottom corners. */
  dock: HTMLElement | null
}

const cornerClass: Record<CodeCorner, string | undefined> = {
  'top-left': styles.topLeft,
  'top-right': styles.topRight,
  'bottom-left': styles.bottomLeft,
  'bottom-right': styles.bottomRight,
}

/** The height of an element, kept up to date (0 when it is missing or hidden). */
function useHeight(el: HTMLElement | null) {
  const [height, setHeight] = useState(0)
  useLayoutEffect(() => {
    if (!el) return
    // The observer reports the first size right after `observe`, then every change.
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return el ? height : 0
}

/** The code of one step: its blocks in order, the blocks of one `CodeTabs` as tabs again. */
function StepCode({ entries }: { entries: readonly CodeEntry[] }) {
  const shown = new Set<number>()
  return entries.map((e, i) => {
    if (e.group === undefined) return <CodeView key={i} snippet={e.snippet} tokens={e.tokens} />
    if (shown.has(e.group)) return null
    shown.add(e.group)
    return (
      <CodeTabs key={i}>
        {entries
          .filter((g) => g.group === e.group)
          .map((g, k) => (
            <CodeView key={k} snippet={g.snippet} tokens={g.tokens} />
          ))}
      </CodeTabs>
    )
  })
}

/** Leads in order, each once (blocks of one `CodeTabs` share theirs). */
const leadsOf = (entries: readonly CodeEntry[]) => [
  ...new Set(entries.flatMap((e) => (e.lead ? [e.lead] : []))),
]

/** A box whose height glides to its content's, up to the cap its parent sets; then it scrolls. */
function GlideHeight({ children }: { children: ReactNode }) {
  const [inner, setInner] = useState<HTMLDivElement | null>(null)
  const height = useHeight(inner)
  return (
    <div className={styles.glide} style={height ? { height } : undefined}>
      <div ref={setInner}>{children}</div>
    </div>
  )
}

/**
 * The code of the active step, beside the visual: a glass panel docked to a corner of the stage
 * (above the control dock), owned by the item page, so items need nothing to get it. It reads the
 * snippets of `code.mdx` by `step=`, with the paragraph before each block as its lead. Closed, it
 * is a small chip. "Whole file" opens the walkthrough in a sheet over the stage, where each block
 * goes to its step. Names link to the stage both ways, as in the explanation.
 */
export function CodePanel({
  item,
  stepIndex,
  onStep,
  entries,
  codeSteps,
  open,
  onOpenChange,
  dock,
}: CodePanelProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const dockHeight = useHeight(dock)
  const steps = useMemo(() => item.steps ?? [], [item])
  const stepId = steps[stepIndex]?.id
  const mine = entries?.filter((e) => e.snippet.step === stepId) ?? []
  // Steps that share their code keep it in place; anything else cross-fades.
  const contentKey = mine.length ? entries!.indexOf(mine[0]!) : entries ? 'none' : 'loading'
  const corner = item.codeCorner ?? 'bottom-left'
  const Code = item.Code
  const closeSheet = useCallback(() => setSheetOpen(false), [])
  const goToStep = useCallback(
    (id: string) =>
      onStep(
        Math.max(
          0,
          steps.findIndex((s) => s.id === id),
        ),
      ),
    [onStep, steps],
  )
  const stepInfo = useCallback(
    (id: string) => {
      const index = steps.findIndex((s) => s.id === id)
      return index < 0 ? undefined : { index: index + 1, title: steps[index]!.title }
    },
    [steps],
  )

  return (
    <>
      <div
        className={clsx(styles.anchor, cornerClass[corner])}
        style={{ '--dock-h': `${dockHeight}px` } as CSSProperties}
        data-print-hide
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {open && !sheetOpen ? (
            <motion.section
              key="panel"
              className={clsx(surfaces.glass, styles.panel)}
              aria-label={msg.code.panel}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.24, ease: ease.out }}
            >
              <div className={styles.head}>
                <span className={styles.label}>
                  <CodeXml size={13} aria-hidden />
                  {msg.item.code}
                </span>
                <span className={styles.actions}>
                  {Code && (
                    <IconButton
                      label={msg.code.wholeFile}
                      size="sm"
                      onClick={() => setSheetOpen(true)}
                    >
                      <FileCode2 size={14} />
                    </IconButton>
                  )}
                  <IconButton
                    label={msg.code.hidePanel}
                    shortcut="C"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                  >
                    <ChevronDown size={15} />
                  </IconButton>
                </span>
              </div>
              <GlideHeight>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={contentKey}
                    className={styles.content}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16, ease: ease.out }}
                  >
                    {mine.length > 0 ? (
                      <CodeLinksProvider>
                        {leadsOf(mine).map((lead) => (
                          <p key={lead} className={styles.lead}>
                            <RichText>{lead}</RichText>
                          </p>
                        ))}
                        <StepCode entries={mine} />
                      </CodeLinksProvider>
                    ) : (
                      entries && <p className={styles.empty}>{msg.code.noStepCode}</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </GlideHeight>
            </motion.section>
          ) : (
            !sheetOpen && (
              <motion.div
                key="chip"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: ease.out }}
              >
                <Tooltip content={msg.code.showPanel} shortcut="C" side="top">
                  <button
                    type="button"
                    className={clsx(surfaces.glass, styles.chip)}
                    aria-label={msg.code.showPanel}
                    aria-expanded={false}
                    onClick={() => onOpenChange(true)}
                  >
                    <CodeXml size={14} aria-hidden />
                    {msg.item.code}
                  </button>
                </Tooltip>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
      {Code && (
        <VizSheet open={sheetOpen} onClose={closeSheet} title={msg.code.wholeFileTitle}>
          <div className={clsx(prose.prose, styles.file)}>
            <MDXProvider components={mdxComponents}>
              <ErrorBoundary compact>
                <Suspense fallback={<p className={styles.empty}>{msg.common.loading}</p>}>
                  <CodeLinksProvider
                    activeStep={stepId}
                    codeSteps={codeSteps}
                    onStep={goToStep}
                    stepInfo={stepInfo}
                  >
                    <Code />
                  </CodeLinksProvider>
                </Suspense>
              </ErrorBoundary>
            </MDXProvider>
          </div>
        </VizSheet>
      )}
    </>
  )
}
