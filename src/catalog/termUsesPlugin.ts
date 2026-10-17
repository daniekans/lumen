import { readdirSync, readFileSync } from 'node:fs'
import { join, sep } from 'node:path'
import type { Plugin } from 'vite'

/*
 * Build-time scan of every explanation.mdx for <Term id="..."> links. The result is a virtual
 * module mapping item folders to the term ids they link, so the glossary knows where each term is
 * used without shipping any MDX source. Imported by vite.config.ts only (it uses node:fs).
 */

export const TERM_USES_ID = 'virtual:lumen/term-uses'
const RESOLVED = `\0${TERM_USES_ID}`
const EXPLANATION = 'explanation.mdx'

/** Term ids linked in one MDX source, in order of first appearance. */
export const scanTermIds = (source: string): string[] => {
  const ids = [...source.matchAll(/<Term\b[^>]*?\bid=["']([^"']+)["']/g)].map((m) => m[1]!)
  return [...new Set(ids)]
}

/** `{ 'area/course/unit/item': ['term-id', ...] }` for every explanation that links a term. */
export const scanContent = (contentDir: string): Record<string, string[]> => {
  const uses: Record<string, string[]> = {}
  const files = readdirSync(contentDir, { recursive: true, encoding: 'utf8' })
  for (const rel of files.filter((f) => f.endsWith(`${sep}${EXPLANATION}`)).sort()) {
    const ids = scanTermIds(readFileSync(join(contentDir, rel), 'utf8'))
    const dir = rel.slice(0, -EXPLANATION.length - 1).split(sep).join('/')
    if (ids.length > 0) uses[dir] = ids
  }
  return uses
}

export function termUses(contentDir: string): Plugin {
  let last = ''
  const render = () => {
    last = JSON.stringify(scanContent(contentDir))
    return `export default ${last}` // i18n-ignore
  }
  return {
    name: 'lumen-term-uses',
    resolveId: (id) => (id === TERM_USES_ID ? RESOLVED : undefined),
    load: (id) => (id === RESOLVED ? render() : undefined),
    configureServer(server) {
      // The registry reads the map once, so a changed map reloads the page; MDX edits that do not
      // touch <Term> keep their normal hot update.
      const refresh = (file: string) => {
        if (!file.endsWith(EXPLANATION)) return
        const before = last
        if (JSON.stringify(scanContent(contentDir)) === before) return
        const mod = server.moduleGraph.getModuleById(RESOLVED)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', refresh)
      server.watcher.on('change', refresh)
      server.watcher.on('unlink', refresh)
    },
  }
}
