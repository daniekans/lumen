import { createContext, useContext } from 'react'

/**
 * Where floating UI (tooltips) portals to. Undefined means document.body. An element in browser
 * fullscreen sets itself here, because content outside the fullscreen element is not shown.
 */
export const PortalContainerContext = createContext<HTMLElement | null | undefined>(undefined)

export const usePortalContainer = () => useContext(PortalContainerContext) ?? undefined
