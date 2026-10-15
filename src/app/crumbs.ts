import { ancestors, type CatalogNode } from '@/catalog'
import type { Crumb } from '@/ui/molecules'

/** Breadcrumb trail from the area down to `node`. */
export const crumbsFor = (node: CatalogNode): Crumb[] => {
  const { area, course, unit } = ancestors(node)
  return [area, course, unit, node]
    .filter((n, i, all): n is CatalogNode => !!n && all.indexOf(n) === i)
    .map((n) => ({ label: n.title, to: n.path }))
}
