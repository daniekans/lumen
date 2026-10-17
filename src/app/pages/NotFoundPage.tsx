import { Link } from 'react-router'
import { TopBar } from '@/ui/organisms'
import { msg } from '@/i18n'

export function NotFoundPage() {
  return (
    <>
      <TopBar />
      <div style={{ display: 'grid', placeItems: 'center', flex: 1, color: 'var(--fg-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--fg)', fontSize: 'var(--text-lg)' }}>
            {msg.pages.notFound.title}
          </p>
          <Link to="/" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {msg.pages.notFound.back}
          </Link>
        </div>
      </div>
    </>
  )
}
