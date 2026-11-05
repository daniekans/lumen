import clsx from 'clsx'
import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { msg } from '@/i18n'
import type { CodeSnippet, CodeTokens } from '@/lib/code'
import { CodeTokenSpan, IconButton, type CodeNameLinks } from '../atoms'
import styles from './CodeView.module.css'

export interface CodeViewProps {
  snippet: CodeSnippet
  /** Tokens per line, made at build time (Shiki) or by an in-house tokenizer. */
  tokens: CodeTokens
  /** Hides the title, when a tab already shows it. */
  hideTitle?: boolean
  className?: string
  /** Two-way hover with the stage: the lit hover key, and a callback when a name is hovered. */
  activeKey?: CodeNameLinks['activeKey']
  onHoverKey?: CodeNameLinks['onHoverKey']
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
 * stage colors, an optional output and a copy button. The one renderer for code in the
 * explanation (MDX fences become `<CodeView>` at build time), later also for step peeks and the
 * Code tab.
 */
export function CodeView({
  snippet,
  tokens,
  hideTitle,
  className,
  activeKey,
  onHoverKey,
}: CodeViewProps) {
  const highlighted = new Set(snippet.highlight)
  const title = hideTitle ? undefined : snippet.title
  return (
    <figure className={clsx(styles.view, className)} data-lang={snippet.lang}>
      {title && <figcaption className={styles.title}>{title}</figcaption>}
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
                    activeKey={activeKey}
                    onHoverKey={onHoverKey}
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
