import { lazy } from 'react'
import termUses from 'virtual:lumen/term-uses'
import { areas } from '@/content/areas'
import { buildCatalog } from './build'
import type { CourseMeta, ItemMeta, Loader, ProblemsModule, UnitMeta } from './types'

/*
 * Content is discovered from the folder structure under src/content:
 *   <area>/<course>/course.ts
 *   <area>/<course>/<unit>/unit.ts
 *   <area>/<course>/<unit>/<item>/{meta.ts, index.tsx, explanation.mdx}
 * Metadata is bundled eagerly (it is tiny). Components and explanations are separate chunks.
 */
const courses = import.meta.glob<CourseMeta>('../content/*/*/course.ts', {
  eager: true,
  import: 'course',
})
const units = import.meta.glob<UnitMeta>('../content/*/*/*/unit.ts', {
  eager: true,
  import: 'unit',
})
const items = import.meta.glob<ItemMeta>('../content/*/*/*/*/meta.ts', {
  eager: true,
  import: 'meta',
})
const components = import.meta.glob<{ default: never }>('../content/*/*/*/*/index.tsx') as Record<
  string,
  Loader
>
const explanations = import.meta.glob<{ default: never }>(
  '../content/*/*/*/*/explanation.mdx',
) as Record<string, Loader>

const problems = import.meta.glob<ProblemsModule>('../content/*/*/*/*/problems.ts')

/** Problems found while building the catalog. A test keeps this empty. */
export const catalogProblems: string[] = []

export const catalog = buildCatalog({
  areas,
  courses,
  units,
  items,
  components,
  explanations,
  problems,
  termUses,
  practiceLoader: () => import('@/practice/PracticeItem'),
  lazy,
  includeDrafts: import.meta.env.DEV,
  onProblem: (message) => {
    catalogProblems.push(message)
    console.error(`[catalog] ${message}`)
  },
})
