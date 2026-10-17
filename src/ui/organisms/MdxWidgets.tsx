import * as Popover from '@radix-ui/react-popover'
import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { getTerm } from '@/catalog'
import { msg } from '@/i18n'
import surfaces from '@/styles/surfaces.module.css'
import { useVizRuntime } from '@/viz-kit/runtime'
import { RichText, Tex, usePortalContainer } from '../atoms'
import styles from './MdxWidgets.module.css'

/** Link in an explanation that jumps the visualization to a step: <StepLink step="limit">...</StepLink> */
export function StepLink({ step, children }: { step: string; children: ReactNode }) {
  const { steps, goToStep } = useVizRuntime()
  const index = steps.findIndex((s) => s.id === step)
  return (
    <button
      type="button"
      onClick={() => index >= 0 && goToStep(index)}
      style={{
        padding: 0,
        border: 0,
        background: 'none',
        color: 'var(--fg)',
        textDecoration: 'underline dotted',
        textUnderlineOffset: 3,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

/** Colored inline term that matches a color used in the visualization: <C c="blue">f(x)</C> */
export function C({ c, children }: { c: string; children: ReactNode }) {
  return <span style={{ color: `var(--viz-${c})`, fontWeight: 500 }}>{children}</span>
}

/**
 * A word with a glossary entry: <Term id="domain">domain</Term>. Clicking it opens the summary in
 * place, with a link to the glossary, so reading never leaves the page by accident. These tags are
 * also how the glossary knows which items use a term (termUsesPlugin.ts).
 */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const container = usePortalContainer()
  const term = getTerm(id)
  if (!term) return <>{children}</>
  return (
    <Popover.Root>
      <Popover.Trigger className={styles.trigger}>{children ?? term.title}</Popover.Trigger>
      <Popover.Portal container={container}>
        <Popover.Content
          side="top"
          sideOffset={6}
          collisionPadding={12}
          className={clsx(surfaces.glass, styles.popover)}
        >
          <span className={styles.head}>
            <strong>{term.title}</strong>
            {term.tex && <Tex>{term.tex}</Tex>}
          </span>
          <span className={styles.summary}>
            <RichText>{term.summary}</RichText>
          </span>
          <Link to={term.path} className={styles.link}>
            {msg.glossary.openEntry}
            <ArrowRight size={12} />
          </Link>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
