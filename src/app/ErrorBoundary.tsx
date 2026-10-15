import { Component, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/** Keeps a failing visualization from taking down the whole shell. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div
        style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--fg-muted)' }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <p style={{ color: 'var(--fg)', fontWeight: 500 }}>
            This visualization failed to render.
          </p>
          <code style={{ fontSize: 12 }}>{this.state.error.message}</code>
        </div>
      </div>
    )
  }
}
