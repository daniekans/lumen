import { createContext, useContext } from 'react'
import type { Item } from './types'

/** The item whose page is open. Provided by the item page for components that serve any item. */
export const CurrentItemContext = createContext<Item | null>(null)

export const useCurrentItem = () => {
  const item = useContext(CurrentItemContext)
  if (!item) throw new Error('useCurrentItem must be used inside an item page')
  return item
}
