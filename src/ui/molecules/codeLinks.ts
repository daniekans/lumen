import { createContext, useContext } from 'react'
import type { CodeNameLinks } from '../atoms'

/**
 * What code in the explanation pane links to: the lit hover key and a hover callback (shared
 * with the stage), and, in the Code tab, the active step. Set by the pane, read by every
 * `CodeView` inside it (MDX blocks, `CodeTabs`, step peeks), so content passes nothing.
 */
export interface CodeLinks extends Pick<CodeNameLinks, 'activeKey' | 'onHoverKey'> {
  /** The active step's id. Set only where blocks follow the steps (the Code tab). */
  activeStep?: string
  /** Steps that have a block, so others dim only while the active step has one. */
  codeSteps?: ReadonlySet<string>
}

export const CodeLinksContext = createContext<CodeLinks>({})

export const useCodeLinks = () => useContext(CodeLinksContext)
