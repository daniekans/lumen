import type {
  Area,
  AreaMeta,
  CatalogNode,
  Course,
  CourseMeta,
  Item,
  ItemMeta,
  LazyComponent,
  Loader,
  ProblemsLoader,
  Term,
  Unit,
  UnitMeta,
} from './types'

/** Raw module maps keyed by file path, as produced by import.meta.glob. */
export interface CatalogSources {
  areas: readonly AreaMeta[]
  courses: Record<string, CourseMeta>
  units: Record<string, UnitMeta>
  items: Record<string, ItemMeta>
  components: Record<string, Loader>
  explanations: Record<string, Loader>
  /** problems.ts modules of practice and checkpoint items. */
  problems?: Record<string, ProblemsLoader>
  /** Wraps a loader into a renderable component (React.lazy in the app). */
  lazy: (load: Loader) => LazyComponent
  /** The shared practice runner, which practice and checkpoint items render instead of index.tsx. */
  practiceLoader?: Loader
  /** Term ids each explanation links with <Term id="...">, keyed by item folder (`a/b/c/d`). */
  termUses?: Record<string, readonly string[]>
  /** Include items marked as draft. */
  includeDrafts: boolean
  onProblem?: (message: string) => void
}

export interface Catalog {
  areas: readonly Area[]
  byId: ReadonlyMap<string, CatalogNode>
  /** Every published item in reading order: areas, courses, units, then item order. */
  items: readonly Item[]
  /** Every glossary term, sorted by title. */
  terms: readonly Term[]
  termsById: ReadonlyMap<string, Term>
}

export const GLOSSARY_PATH = '/glossary'

const CONTENT_ROOT = /^.*?content\//

/** `../content/a/b/c/meta.ts` -> { dir: 'a/b/c', file: 'meta.ts' } */
const split = (path: string) => {
  const rel = path.replace(CONTENT_ROOT, '')
  const i = rel.lastIndexOf('/')
  return { dir: rel.slice(0, i), file: rel.slice(i + 1) }
}

const byOrder = <T extends { order: number; title: string }>(a: T, b: T) =>
  a.order - b.order || a.title.localeCompare(b.title)

/**
 * Assembles the content tree from globbed modules. Pure: no React and no globals, so it is unit
 * tested directly. Broken entries (unknown parent, missing component) are reported and skipped.
 */
export const buildCatalog = (src: CatalogSources): Catalog => {
  const problem = src.onProblem ?? (() => {})
  const node = (id: string) => ({ id, slug: id.slice(id.lastIndexOf('/') + 1), path: `/${id}` })

  const byDir = (m: Record<string, Loader>) =>
    new Map(Object.entries(m).map(([p, load]) => [split(p).dir, load]))
  const components = byDir(src.components)
  const explanations = byDir(src.explanations)
  const problemSets = new Map(
    Object.entries(src.problems ?? {}).map(([p, load]) => [split(p).dir, load]),
  )

  const unitItems = new Map<string, Item[]>()
  /** Item folders skipped as drafts, so terms they introduce are dropped quietly. */
  const draftDirs = new Set<string>()
  for (const [path, meta] of Object.entries(src.items)) {
    const { dir } = split(path)
    const parts = dir.split('/')
    if (parts.length !== 4) {
      problem(`Item ${dir} is not at area/course/unit/item depth`)
      continue
    }
    if (meta.status === 'draft' && !src.includeDrafts) {
      draftDirs.add(dir)
      continue
    }
    const kind = meta.kind ?? 'explore'
    const practices = kind === 'practice' || kind === 'checkpoint'
    const loadProblems = problemSets.get(dir)
    if (practices && !loadProblems) {
      problem(`${kind} item ${dir} has no problems.ts`)
      continue
    }
    const load = practices ? src.practiceLoader : components.get(dir)
    if (!load) {
      problem(`Item ${dir} has no ${practices ? 'practice runner' : 'index.tsx'}`)
      continue
    }
    const explanation = explanations.get(dir)
    if (!explanation && (kind === 'explore' || kind === 'lesson')) {
      problem(`${kind} item ${dir} has no explanation.mdx`)
    }
    const [a, c, u] = parts
    const unitId = `${a}/${c}/${u}`
    const item: Item = {
      ...meta,
      ...node(dir),
      type: 'item',
      kind,
      areaId: a!,
      courseId: `${a}/${c}`,
      unitId,
      skillKeys: (meta.skills ?? []).map((s) => `${unitId}#${s}`),
      Component: src.lazy(load),
      Explanation: explanation && src.lazy(explanation),
      preload: load,
      loadProblems,
    }
    unitItems.set(unitId, [...(unitItems.get(unitId) ?? []), item])
  }

  const termsById = new Map<string, Term & { usedIn: string[] }>()
  const droppedTerms = new Set<string>()
  const courseUnits = new Map<string, Unit[]>()
  for (const [path, meta] of Object.entries(src.units)) {
    const { dir } = split(path)
    const parts = dir.split('/')
    if (parts.length !== 3) {
      problem(`Unit ${dir} is not at area/course/unit depth`)
      continue
    }
    const items = (unitItems.get(dir) ?? []).sort(byOrder)
    unitItems.delete(dir)
    const skillIds = new Set((meta.skills ?? []).map((s) => s.id))
    for (const it of items)
      for (const s of it.skills ?? [])
        if (!skillIds.has(s)) problem(`Item ${it.id} references unknown skill "${s}"`)
    const terms: Term[] = []
    for (const t of meta.terms ?? []) {
      const introducedIn = `${dir}/${t.introducedIn}`
      if (termsById.has(t.id) || droppedTerms.has(t.id)) {
        problem(`Term "${t.id}" in ${dir} is already declared`)
        continue
      }
      if (!items.some((it) => it.id === introducedIn)) {
        if (!draftDirs.has(introducedIn))
          problem(`Term "${t.id}" in ${dir} is introduced in unknown item "${t.introducedIn}"`)
        droppedTerms.add(t.id)
        continue
      }
      const term = {
        ...t,
        type: 'term' as const,
        path: `${GLOSSARY_PATH}#${t.id}`,
        unitId: dir,
        introducedIn,
        usedIn: [],
      }
      termsById.set(t.id, term)
      terms.push(term)
    }
    const unit: Unit = {
      ...meta,
      ...node(dir),
      type: 'unit',
      areaId: parts[0]!,
      courseId: `${parts[0]}/${parts[1]}`,
      skills: (meta.skills ?? []).map((s) => ({ ...s, key: `${dir}#${s.id}`, unitId: dir })),
      terms,
      items,
    }
    const courseId = unit.courseId
    courseUnits.set(courseId, [...(courseUnits.get(courseId) ?? []), unit])
  }
  for (const orphan of unitItems.keys()) problem(`Items in ${orphan} have no unit.ts`)

  const areaCourses = new Map<string, Course[]>()
  for (const [path, meta] of Object.entries(src.courses)) {
    const { dir } = split(path)
    const parts = dir.split('/')
    if (parts.length !== 2) {
      problem(`Course ${dir} is not at area/course depth`)
      continue
    }
    const units = (courseUnits.get(dir) ?? []).sort(byOrder)
    courseUnits.delete(dir)
    const course: Course = { ...meta, ...node(dir), type: 'course', areaId: parts[0]!, units }
    areaCourses.set(course.areaId, [...(areaCourses.get(course.areaId) ?? []), course])
  }
  for (const orphan of courseUnits.keys()) problem(`Units in ${orphan} have no course.ts`)

  const areas: Area[] = src.areas.map((meta) => {
    const courses = (areaCourses.get(meta.id) ?? []).sort(byOrder)
    areaCourses.delete(meta.id)
    return { ...meta, ...node(meta.id), type: 'area', courses }
  })
  for (const orphan of areaCourses.keys()) problem(`Courses in ${orphan} belong to no area`)

  const byId = new Map<string, CatalogNode>()
  const items: Item[] = []
  for (const area of areas) {
    byId.set(area.id, area)
    for (const course of area.courses) {
      byId.set(course.id, course)
      for (const unit of course.units) {
        byId.set(unit.id, unit)
        for (const item of unit.items) {
          byId.set(item.id, item)
          items.push(item)
        }
      }
    }
  }

  // Uses are recorded in reading order, after every unit has declared its terms.
  for (const item of items)
    for (const id of new Set(src.termUses?.[item.id] ?? [])) {
      const term = termsById.get(id)
      if (!term) {
        if (!droppedTerms.has(id)) problem(`Item ${item.id} links unknown term "${id}"`)
        continue
      }
      if (term.introducedIn !== item.id) term.usedIn.push(item.id)
    }
  const terms = [...termsById.values()].sort((a, b) => a.title.localeCompare(b.title))
  return { areas, byId, items, terms, termsById }
}
