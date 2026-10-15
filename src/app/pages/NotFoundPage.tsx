import { Link } from 'react-router'
import { TopBar } from '@/ui/organisms'

export function NotFoundPage() {
  return (
    <>
      <TopBar />
      <div style={{ display: 'grid', placeItems: 'center', flex: 1, color: 'var(--fg-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--fg)', fontSize: 'var(--text-lg)' }}>Nothing here.</p>
          <Link to="/" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Back to the index
          </Link>
        </div>
      </div>
    </>
  )
}
