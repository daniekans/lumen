import { useEffect } from 'react'
import { msg } from '@/i18n'

/** Sets the document title while the page is mounted. */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = msg.app.pageTitle(title)
    return () => {
      document.title = msg.app.name
    }
  }, [title])
}
