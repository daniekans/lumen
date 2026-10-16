import { Button } from '../atoms'

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
          {stale
            ? 'This page was updated since it was opened.'
            : 'This part of the page failed to load.'}
        </p>
        <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-sm)' }}>
          {stale ? (
            'Reload to get the current version.'
          ) : (
            <code style={{ fontSize: 12 }}>{message}</code>
          )}
        </p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    </div>
  )
}
