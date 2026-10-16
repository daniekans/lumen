/*
 * Code-split chunks can fail to load when the files changed underneath an open tab: after a new
 * deploy (old hashed files are gone) or when the dev server re-optimizes dependencies. A reload
 * fetches the current files and fixes it.
 */

const KEY = 'lumen:chunk-reload-at'

/** Reloads the page, at most once every 10 seconds, so a persistent failure cannot loop. */
export const reloadOnce = () => {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last < 10_000) return false
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    // Without storage there is no loop guard; prefer showing the error to reloading blindly.
    return false
  }
  window.location.reload()
  return true
}

/** In production builds, Vite reports failed chunk preloads with this event. */
export const installChunkErrorRecovery = () => {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnce()) event.preventDefault()
  })
}
