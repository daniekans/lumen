import { useCallback, useMemo, type ReactNode } from 'react'
import { useHighlightScope } from '@/viz-kit/stage'
import { CodeLinksContext, type CodeLinks } from '../molecules'

/**
 * Links the code inside to the page's highlight (two-way hover with the stage). Only the code
 * views re-render on a hover, not the pane, the panel or their MDX.
 */
export function CodeLinksProvider({
  children,
  ...links
}: Omit<CodeLinks, 'activeKey' | 'onHoverKey'> & { children: ReactNode }) {
  const { activeStep, codeSteps, onStep, stepInfo } = links
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
    () => ({ activeKey: active, onHoverKey, activeStep, codeSteps, onStep, stepInfo }),
    [active, onHoverKey, activeStep, codeSteps, onStep, stepInfo],
  )
  return <CodeLinksContext value={value}>{children}</CodeLinksContext>
}
