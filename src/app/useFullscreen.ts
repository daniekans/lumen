import { useCallback, useEffect, useState } from 'react'

/**
 * Shows one element over the whole screen. It uses the browser's fullscreen when available and
 * always sets a flag, so a CSS fallback (a fixed layer over the page) works where the Fullscreen
 * API does not, such as Safari on iPhone. Escape leaves either mode.
 */
export const useFullscreen = (el: HTMLElement | null) => {
  const [active, setActive] = useState(false)

  const enter = useCallback(() => {
    setActive(true)
    if (el?.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => undefined)
    }
  }, [el])

  const exit = useCallback(() => {
    setActive(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!active) return
    // Escape in browser fullscreen only fires fullscreenchange; in the fallback it is a key press.
    const onChange = () => {
      if (!document.fullscreenElement) setActive(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) setActive(false)
    }
    document.addEventListener('fullscreenchange', onChange)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      window.removeEventListener('keydown', onKey)
    }
  }, [active])

  // Leaving the page leaves fullscreen too.
  useEffect(
    () => () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    },
    [],
  )

  return { active, enter, exit, toggle: active ? exit : enter }
}
