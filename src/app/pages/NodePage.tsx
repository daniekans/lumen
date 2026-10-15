import { Navigate, useLocation } from 'react-router'
import { resolvePath } from '@/catalog'
import { AreaPage } from './AreaPage'
import { CoursePage } from './CoursePage'
import { ItemPage } from './ItemPage'
import { NotFoundPage } from './NotFoundPage'
import { UnitPage } from './UnitPage'

/** Renders whatever the path points to in the content tree, at any depth. */
export function NodePage() {
  const { pathname } = useLocation()
  const result = resolvePath(pathname)
  if ('redirect' in result) return <Navigate to={result.redirect} replace />
  if ('notFound' in result) return <NotFoundPage />
  const { node } = result
  switch (node.type) {
    case 'area':
      return <AreaPage key={node.id} area={node} />
    case 'course':
      return <CoursePage key={node.id} course={node} />
    case 'unit':
      return <UnitPage key={node.id} unit={node} />
    case 'item':
      // Keyed so each item starts from a clean state.
      return <ItemPage key={node.id} item={node} />
  }
}
