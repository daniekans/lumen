/*
 * Query string state for the item page: the active step and, opt-in, visualization parameters.
 * Writes go through history.replaceState (no router navigation, no new history entries) and are
 * batched, because sliders and tweens change values every frame and browsers throttle
 * replaceState calls (Safari throws after about 100 in 30 seconds).
 */

const WRITE_DELAY_MS = 250

let pending = new Map<string, string | null>()
let pendingPath = ''
let timer: ReturnType<typeof setTimeout> | undefined

/** The current value of a query parameter, including writes that are still pending. */
export const readQuery = (key: string): string | null => {
  if (pendingPath === window.location.pathname && pending.has(key)) return pending.get(key) ?? null
  return new URLSearchParams(window.location.search).get(key)
}

const flush = () => {
  timer = undefined
  const url = new URL(window.location.href)
  // Writes made on a page the learner has since left are dropped.
  if (pending.size === 0 || url.pathname !== pendingPath) {
    pending = new Map()
    return
  }
  for (const [key, value] of pending) {
    if (value === null) url.searchParams.delete(key)
    else url.searchParams.set(key, value)
  }
  pending = new Map()
  if (url.href === window.location.href) return
  // Keep the router's own history state so back and forward still work.
  window.history.replaceState(window.history.state, '', url)
}

/** Sets (or, with null, removes) a query parameter after a short delay. */
export const writeQuery = (key: string, value: string | null) => {
  if (pendingPath !== window.location.pathname) pending = new Map()
  pendingPath = window.location.pathname
  pending.set(key, value)
  timer ??= setTimeout(flush, WRITE_DELAY_MS)
}
