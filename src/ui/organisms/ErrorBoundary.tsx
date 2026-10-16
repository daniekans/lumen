import { Component, type ReactNode } from 'react'
import { isChunkLoadError } from '@/lib/errors'
import { ErrorNotice } from './ErrorNotice'

interface State {
  error: Error | null
}

/** Keeps a failing part of the page (a visualization, an explanation) from taking down the shell. */
export class ErrorBoundary extends Component<{ children: ReactNode; compact?: boolean }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <ErrorNotice error={error} stale={isChunkLoadError(error)} compact={this.props.compact} />
    )
  }
}
