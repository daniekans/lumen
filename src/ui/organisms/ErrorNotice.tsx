import { Button } from '../atoms'
import { msg } from '@/i18n'

interface ErrorNoticeProps {
  error: unknown
  /** The failure came from files that changed since the page loaded; a reload fixes it. */
  stale: boolean
  compact?: boolean
}

export function ErrorNotice({ error, stale, compact = false }: ErrorNoticeProps) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div
      role="alert"
      style={{
        display: 'grid',
        placeItems: 'center',
        height: compact ? 'auto' : '100%',
        padding: compact ? 'var(--space-3) 0' : 'var(--space-6)',
        color: 'var(--fg-muted)',
      }}
    >
      <div style={{ maxWidth: 440, textAlign: compact ? 'left' : 'center' }}>
        <p style={{ margin: '0 0 var(--space-2)', color: 'var(--fg)', fontWeight: 500 }}>
          {stale ? msg.errors.staleTitle : msg.errors.failedTitle}
        </p>
        <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-sm)' }}>
          {stale ? msg.errors.staleHint : <code style={{ fontSize: 12 }}>{message}</code>}
        </p>
        <Button onClick={() => window.location.reload()}>{msg.errors.reload}</Button>
      </div>
    </div>
  )
}
