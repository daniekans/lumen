import { useEffect } from 'react'
import { useUi } from '@/state/ui'

/**
 * True when a key press belongs to a focused control (text fields, sliders, segmented controls,
 * anything in the control dock), so page-level shortcuts must not react to it.
 */
export const isTyping = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement | null
  if (!el) return false
  return (
    el.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) ||
    !!el.closest(
      '[role="slider"], [role="radiogroup"], [role="group"], [role="toolbar"], [role="listbox"]',
    )
  )
}

/** Shortcuts available everywhere: [ sidebar, ] explanation, t theme, Ctrl/Cmd+K or / search. */
export const useGlobalHotkeys = () => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ui = useUi.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ui.setPaletteOpen(!ui.paletteOpen)
        return
      }
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey || ui.paletteOpen) return
      if (e.key === '[') ui.toggleSidebar()
      else if (e.key === ']') ui.toggleAside()
      else if (e.key === 't') ui.toggleTheme()
      else if (e.key === '/') {
        e.preventDefault()
        ui.setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
