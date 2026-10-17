import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { getTerm } from '@/catalog'
import { useVizRuntime } from '@/viz-kit/runtime'
import { RichText, Tex, Tooltip } from '../atoms'

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
 * A word linked to its glossary entry: <Term id="domain">domain</Term>. Hover shows the summary.
 * These links are also how the glossary knows which items use a term (termUsesPlugin.ts).
 */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const term = getTerm(id)
  if (!term) return <>{children}</>
  return (
    <Tooltip
      content={
        <span style={{ display: 'block', maxWidth: 300, lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 600 }}>{term.title}</strong>
          {term.tex && (
            <>
              {' '}
              <Tex>{term.tex}</Tex>
            </>
          )}
          <span style={{ display: 'block', color: 'var(--fg-muted)' }}>
            <RichText>{term.summary}</RichText>
          </span>
        </span>
      }
    >
      <Link
        to={term.path}
        style={{ color: 'inherit', textDecoration: 'underline dotted', textUnderlineOffset: 3 }}
      >
        {children ?? term.title}
      </Link>
    </Tooltip>
  )
}
