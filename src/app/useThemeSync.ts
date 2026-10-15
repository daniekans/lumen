import { useEffect } from 'react'
import { useUi } from '@/state/ui'

/** Mirrors the theme from the store onto <html data-theme>, which the CSS tokens key off. */
export const useThemeSync = () => {
  const theme = useUi((s) => s.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
