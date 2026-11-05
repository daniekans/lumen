import clsx from 'clsx'
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { msg } from '@/i18n'
import { CodeView, type CodeViewProps } from './CodeView'
import styles from './CodeTabs.module.css'
import { setCodeTab, useCodeTab } from './codeTab'
import { SegmentedControl } from './SegmentedControl'

const isCodeView = (node: ReactNode): node is ReactElement<CodeViewProps> =>
  isValidElement<CodeViewProps>(node) && node.props.snippet !== undefined

/**
 * The same idea in two or more libraries (NumPy | PyTorch, SQL | PySpark), one tab each. In MDX,
 * wrap fenced blocks: each tab is labeled by its fence's `tab=` (or its title, or its
 * language). The chosen tab is remembered and shared by every item, and the switch cross-fades.
 */
export function CodeTabs({ children }: { children: ReactNode }) {
  const views = Children.toArray(children).filter(isCodeView)
  const remembered = useCodeTab()
  const labels = views.map(({ props: { snippet } }) => snippet.tab ?? snippet.title ?? snippet.lang)
  const active = Math.max(0, labels.indexOf(remembered ?? ''))
  return (
    <div className={styles.tabs}>
      <div className={styles.bar}>
        <SegmentedControl
          label={msg.code.versions}
          value={String(active)}
          onChange={(v) => setCodeTab(labels[Number(v)]!)}
          options={labels.map((label, i) => ({ value: String(i), label }))}
        />
      </div>
      <div className={styles.panels}>
        {views.map(({ props }, i) => (
          <div
            key={i}
            className={clsx(styles.panel, i === active && styles.active)}
            inert={i !== active}
          >
            <CodeView {...props} hideTitle={props.snippet.tab === undefined} />
          </div>
        ))}
      </div>
    </div>
  )
}
