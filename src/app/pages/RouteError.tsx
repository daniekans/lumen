import { useRouteError } from 'react-router'
import { isChunkLoadError } from '@/lib/errors'
import { ErrorNotice } from '@/ui/organisms'

/** Fallback for errors that escape every other boundary, instead of the router's default screen. */
export function RouteError() {
  const error = useRouteError()
  return (
    <div style={{ height: '100vh' }}>
      <ErrorNotice error={error} stale={isChunkLoadError(error)} />
    </div>
  )
}
