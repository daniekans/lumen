import { createContext, useContext } from 'react'
import type { CodeNameLinks } from '../atoms'

/**
 * What code views link to: the lit hover key and a hover callback (shared with the stage), and,
 * in the whole-file view of the code panel, the steps. Set by the pane and the code panel, read
 * by every `CodeView` inside them (MDX blocks, `CodeTabs`), so content passes nothing.
 */
export interface CodeLinks extends Pick<CodeNameLinks, 'activeKey' | 'onHoverKey'> {
  /** The active step's id. Set only where blocks follow the steps (the whole-file view). */
  activeStep?: string
  /** Steps that have a block, so others dim only while the active step has one. */
  codeSteps?: ReadonlySet<string>
  /** Goes to a step by id. Where set, a block linked to a step shows a button for it. */
  onStep?: (stepId: string) => void
  /** The step's number and title, for that button. */
  stepInfo?: (stepId: string) => { index: number; title: string } | undefined
}

export const CodeLinksContext = createContext<CodeLinks>({})

export const useCodeLinks = () => useContext(CodeLinksContext)
