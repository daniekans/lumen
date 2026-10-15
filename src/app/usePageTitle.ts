import { useEffect } from 'react'

/** Sets the document title while the page is mounted. */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} · Lumen`
    return () => {
      document.title = 'Lumen'
    }
  }, [title])
}
