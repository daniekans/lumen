import { catalog } from './registry'
import { redirects } from './redirects'
import type { Area, CatalogNode, Course, Item, Term, Unit } from './types'

export const getNode = (id: string): CatalogNode | undefined => catalog.byId.get(id)

const getAs = <T extends CatalogNode>(id: string, type: T['type']) => {
  const n = catalog.byId.get(id)
  return n?.type === type ? (n as T) : undefined
}
export const getArea = (id: string) => getAs<Area>(id, 'area')
export const getCourse = (id: string) => getAs<Course>(id, 'course')
export const getUnit = (id: string) => getAs<Unit>(id, 'unit')
export const getItem = (id: string) => getAs<Item>(id, 'item')
export const getTerm = (id: string): Term | undefined => catalog.termsById.get(id)

/** The node a route path points to, or a redirect target for paths that moved. */
export const resolvePath = (
  path: string,
): { node: CatalogNode } | { redirect: string } | { notFound: true } => {
  const id = path.replace(/^\/+|\/+$/g, '')
  const node = catalog.byId.get(id)
  if (node) return { node }
  const target = redirects[id]
  if (target) return { redirect: `/${target}` }
  return { notFound: true }
}

/** Area, course and unit above a node, as far as they exist. */
export const ancestors = (node: CatalogNode) => {
  const parts = node.id.split('/')
  return {
    area: getArea(parts[0]!),
    course: parts.length > 1 ? getCourse(parts.slice(0, 2).join('/')) : undefined,
    unit: parts.length > 2 ? getUnit(parts.slice(0, 3).join('/')) : undefined,
  }
}

/** Courses and units are shown in navigation only when they contain at least one item. */
export const hasItems = (node: Course | Unit): boolean =>
  node.type === 'unit' ? node.items.length > 0 : node.units.some(hasItems)

export const visibleCourses = (area: Area) => area.courses.filter(hasItems)

/** Previous and next item in reading order. */
export const neighbours = (item: Item) => {
  const i = catalog.items.findIndex((v) => v.id === item.id)
  return {
    prev: i > 0 ? catalog.items[i - 1] : undefined,
    next: i >= 0 ? catalog.items[i + 1] : undefined,
  }
}

export interface SearchResult {
  node: Item | Unit | Course | Term
  /** Human-readable location, e.g. "Mathematics / Calculus 1". */
  context: string
}

export const search = (query: string): SearchResult[] => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const results: SearchResult[] = []
  for (const area of catalog.areas)
    for (const course of area.courses) {
      if (!hasItems(course)) continue
      results.push({ node: course, context: area.title })
      for (const unit of course.units) {
        if (!hasItems(unit)) continue
        results.push({ node: unit, context: `${area.title} / ${course.title}` })
        for (const item of unit.items)
          results.push({ node: item, context: `${course.title} / ${unit.title}` })
      }
    }
  for (const term of catalog.terms) {
    const unit = getUnit(term.unitId)
    if (unit) results.push({ node: term, context: unit.title })
  }
  if (terms.length === 0) return results.filter((r) => r.node.type === 'item')
  const titled = (r: SearchResult) => terms.every((t) => r.node.title.toLowerCase().includes(t))
  return results
    .filter(({ node, context }) => {
      const tags = node.type === 'item' ? node.tags : []
      const text = node.type === 'item' || node.type === 'term' ? node.summary : node.description
      const hay = [node.title, text, context, ...tags].join(' ').toLowerCase()
      return terms.every((t) => hay.includes(t))
    })
    .sort((a, b) => Number(titled(b)) - Number(titled(a)))
}
