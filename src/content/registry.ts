import { lazy, type ComponentType } from 'react'
import { isSectionId, sections, type SectionId } from './sections'
import type { VizEntry, VizMeta } from './types'

/*
 * Visualizations are discovered from the folder structure:
 *   src/visualizations/<section>/<slug>/{meta.ts, index.tsx, explanation.mdx}
 * Metadata is bundled eagerly (it is tiny). Components and explanations are separate chunks.
 */
const metas = import.meta.glob<VizMeta>('../visualizations/*/*/meta.ts', {
  eager: true,
  import: 'meta',
})
const components = import.meta.glob<{ default: ComponentType }>('../visualizations/*/*/index.tsx')
const explanations = import.meta.glob<{ default: ComponentType }>(
  '../visualizations/*/*/explanation.mdx',
)

const parsePath = (path: string) => {
  const match = /visualizations\/([^/]+)\/([^/]+)\//.exec(path)
  if (!match) throw new Error(`Unexpected visualization path: ${path}`)
  return { section: match[1]!, slug: match[2]! }
}

/** Builds entries from the globbed files. Broken folders are reported and skipped, not fatal. */
export const buildRegistry = (): VizEntry[] =>
  Object.entries(metas).flatMap(([path, meta]): VizEntry[] => {
    const { section, slug } = parsePath(path)
    const dir = path.replace(/meta\.ts$/, '')
    const load = components[`${dir}index.tsx`]
    if (!isSectionId(section) || !load) {
      console.error(
        `Skipping ${dir}: ${!load ? 'missing index.tsx' : `unknown section "${section}"`}`,
      )
      return []
    }
    const loadExplanation = explanations[`${dir}explanation.mdx`]
    return [
      {
        ...meta,
        id: `${section}/${slug}`,
        section,
        slug,
        Component: lazy(load),
        Explanation: loadExplanation && lazy(loadExplanation),
        preload: load,
      },
    ]
  })

export const registry: readonly VizEntry[] = buildRegistry()
  .filter((v) => import.meta.env.DEV || v.status !== 'draft')
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const getViz = (section: string, slug: string) =>
  registry.find((v) => v.section === section && v.slug === slug)

export const vizBySection = (id: SectionId) => registry.filter((v) => v.section === id)

/** Sections that contain at least one visualization, in taxonomy order. */
export const populatedSections = () => sections.filter((s) => vizBySection(s.id).length > 0)

/** Previous and next visualization in reading order (sections, then `order`). */
export const neighbours = (id: string) => {
  const flat = populatedSections().flatMap((s) => vizBySection(s.id))
  const i = flat.findIndex((v) => v.id === id)
  return { prev: i > 0 ? flat[i - 1] : undefined, next: i >= 0 ? flat[i + 1] : undefined }
}

export const searchViz = (query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return [...registry]
  const terms = q.split(/\s+/)
  return registry.filter((v) => {
    const hay = [v.title, v.summary, v.section, ...v.tags].join(' ').toLowerCase()
    return terms.every((t) => hay.includes(t))
  })
}
