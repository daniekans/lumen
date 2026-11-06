import clsx from 'clsx'
import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { scrollBehavior } from '@/styles/motion'
import { msg } from '@/i18n'
import { focusLines, type CodeSnippet, type CodeTokens } from '@/lib/code'
import { CodeTokenSpan, IconButton, type CodeNameLinks } from '../atoms'
import { useCodeLinks } from './codeLinks'
import styles from './CodeView.module.css'

export interface CodeViewProps {
  snippet: CodeSnippet
  /** Tokens per line, made at build time (Shiki) or by an in-house tokenizer. */
  tokens: CodeTokens
  /** Hides the title, when a tab already shows it. */
  hideTitle?: boolean
  className?: string
  /**
   * Two-way hover with the stage: the lit hover key, and a callback when a name is hovered.
   * Inside the explanation pane both come from `CodeLinksContext`.
   */
  activeKey?: CodeNameLinks['activeKey']
  onHoverKey?: CodeNameLinks['onHoverKey']
  /**
   * The step the block is shown for (the code panel), so its `focus=` lines for that step are
   * highlighted. In the whole-file view the active step applies to its own blocks.
   */
  step?: string
  /**
   * A line driven by the visualization (`useCodeFocus`), 1-based and fractional while it glides.
   * Replaces the step's lines while set.
   */
  line?: number | null
}

/** How long a step change takes to settle (the sheet and step list), before a block scrolls. */
const SETTLE_MS = 360

/** The step a block explains, as a button that goes to it (whole-file view only). */
function StepButton({ stepId }: { stepId: string }) {
  const { onStep, stepInfo, activeStep } = useCodeLinks()
  const info = stepInfo?.(stepId)
  if (!onStep || !info) return null
  return (
    <button
      type="button"
      className={styles.stepButton}
      title={msg.code.goToStep(info.index, info.title)}
      aria-current={activeStep === stepId ? 'step' : undefined}
      onClick={() => onStep(stepId)}
    >
      {msg.code.stepLabel(info.index)}
    </button>
  )
}

/** How long the focus bar glides (`--dur-slow`), before a scroll measures where it landed. */
const BAR_GLIDE_MS = 500

/** Runs of consecutive lines, as first and last line: `[2, 3, 5]` gives `[[2, 3], [5, 5]]`. */
const runsOf = (lines: readonly number[]) => {
  const runs: [number, number][] = []
  for (const n of [...lines].sort((a, b) => a - b)) {
    const last = runs[runs.length - 1]
    if (last && n <= last[1] + 1) last[1] = Math.max(last[1], n)
    else runs.push([n, n])
  }
  return runs
}

/**
 * The highlight: one bar per run of lines, placed in line heights, so a change of step or a
 * driven line moves the bar instead of switching line tints. Bars keep their index as key, so
 * the first bar glides from one place to the next.
 */
function FocusBars({
  runs,
  driven,
  follow,
}: {
  runs: readonly [number, number][]
  driven: boolean
  /** Scrolls the first bar into view when it moves (the code panel scrolls long blocks). */
  follow: boolean
}) {
  const first = useRef<HTMLSpanElement>(null)
  const at = runs[0] ? Math.round(runs[0][0]) : 0
  // Only a move scrolls, not the first render (the panel's height is still gliding then). A
  // gliding bar is measured where it lands, so the scroll waits for its transition.
  const last = useRef(at)
  useEffect(() => {
    const el = first.current
    if (last.current === at) return
    last.current = at
    if (!follow || !at || !el || el.closest('[inert]')) return
    const timer = window.setTimeout(
      () => el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: scrollBehavior() }),
      driven ? 0 : BAR_GLIDE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [follow, at, driven])
  return runs.map(([from, to], i) => (
    <span
      key={i}
      ref={i === 0 ? first : undefined}
      className={clsx(styles.bar, driven && styles.driven)}
      style={{ '--from': from - 1, '--count': to - from + 1 } as CSSProperties}
      aria-hidden
    />
  ))
}

/** Copies the snippet's exact source; the icon turns into a check for a moment. */
function CopyButton({ source }: { source: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 1600)
  }
  const label =
    state === 'copied' ? msg.code.copied : state === 'failed' ? msg.code.copyFailed : msg.code.copy
  return (
    <IconButton label={label} size="sm" className={styles.copy} onClick={copy}>
      {state === 'copied' ? <Check size={14} /> : <Copy size={14} />}
    </IconButton>
  )
}

/**
 * A read-only block of code with the shared code palette: highlighted lines, names in their
 * stage colors, an optional output and a copy button. The one renderer for code outside the
 * drawing: the explanation (MDX fences become `<CodeView>` at build time) and the code panel.
 * In the panel's whole-file view, a block linked to the active step is marked and scrolls into
 * view, the others dim a little, and each block's step label goes to its step.
 */
export function CodeView({
  snippet,
  tokens,
  hideTitle,
  className,
  activeKey,
  onHoverKey,
  step,
  line,
}: CodeViewProps) {
  const links = useCodeLinks()
  const key = activeKey === undefined ? links.activeKey : activeKey
  const onHover = onHoverKey ?? links.onHoverKey
  const following = links.activeStep !== undefined && links.codeSteps?.has(links.activeStep)
  const current = following && snippet.steps?.includes(links.activeStep!) === true
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    // A hidden tab of a CodeTabs scrolls nothing; its visible sibling does. The wait lets the
    // step list settle (captions open and close), so the block lands where it ends up.
    if (!current || !el || el.closest('[inert]')) return
    const timer = window.setTimeout(
      () => el.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() }),
      SETTLE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [current])
  const driven = line !== undefined && line !== null
  const runs: [number, number][] = driven
    ? [[line, line]]
    : runsOf(focusLines(snippet, step ?? (current ? links.activeStep : undefined)))
  const focused = (n: number) =>
    runs.some(([from, to]) => n >= Math.round(from) && n <= Math.round(to))
  const title = hideTitle ? undefined : snippet.title
  const stepButtons = links.onStep && !hideTitle ? (snippet.steps ?? []) : []
  return (
    <figure
      ref={ref}
      className={clsx(
        styles.view,
        current && styles.current,
        following && !current && styles.dimmed,
        className,
      )}
      data-lang={snippet.lang}
      data-step={snippet.steps?.join(' ')}
    >
      {(title || stepButtons.length > 0) && (
        <figcaption className={styles.title}>
          <span>{title}</span>
          {stepButtons.length > 0 && (
            <span className={styles.stepButtons}>
              {stepButtons.map((id) => (
                <StepButton key={id} stepId={id} />
              ))}
            </span>
          )}
        </figcaption>
      )}
      <div className={styles.body}>
        <pre className={styles.pre}>
          <code className={styles.code}>
            <FocusBars runs={runs} driven={driven} follow={step !== undefined} />
            {tokens.map((tokenLine, i) => (
              <span key={i} className={styles.line} data-focus={focused(i + 1) || undefined}>
                {tokenLine.map((token, k) => (
                  <CodeTokenSpan
                    key={k}
                    token={token}
                    colors={snippet.colors}
                    hoverKeys={snippet.hoverKeys}
                    activeKey={key}
                    onHoverKey={onHover}
                  />
                ))}
                {'\n'}
              </span>
            ))}
          </code>
        </pre>
        <CopyButton source={snippet.source} />
      </div>
      {snippet.output !== undefined && (
        <div className={styles.output}>
          <span className={styles.outputLabel}>{msg.code.output}</span>
          <pre className={styles.pre}>
            <code className={styles.code}>{snippet.output}</code>
          </pre>
        </div>
      )}
    </figure>
  )
}
