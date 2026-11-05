import clsx from 'clsx'
import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { scrollBehavior } from '@/styles/motion'
import { msg } from '@/i18n'
import type { CodeSnippet, CodeTokens } from '@/lib/code'
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
}: CodeViewProps) {
  const links = useCodeLinks()
  const key = activeKey === undefined ? links.activeKey : activeKey
  const onHover = onHoverKey ?? links.onHoverKey
  const following = links.activeStep !== undefined && links.codeSteps?.has(links.activeStep)
  const current = following && snippet.step === links.activeStep
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
  const highlighted = new Set(snippet.highlight)
  const title = hideTitle ? undefined : snippet.title
  const stepButton = links.onStep && snippet.step && !hideTitle
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
      data-step={snippet.step}
    >
      {(title || stepButton) && (
        <figcaption className={styles.title}>
          <span>{title}</span>
          {stepButton && <StepButton stepId={snippet.step!} />}
        </figcaption>
      )}
      <div className={styles.body}>
        <pre className={styles.pre}>
          <code className={styles.code}>
            {tokens.map((line, i) => (
              <span
                key={i}
                className={clsx(styles.line, highlighted.has(i + 1) && styles.highlighted)}
              >
                {line.map((token, k) => (
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
