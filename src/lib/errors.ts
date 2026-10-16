const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i

/**
 * True for errors raised when a code-split chunk cannot be loaded, typically because the files
 * changed under an open tab (a new deploy, or the dev server re-bundling dependencies).
 */
export const isChunkLoadError = (error: unknown) =>
  error instanceof Error && CHUNK_ERROR.test(error.message)
