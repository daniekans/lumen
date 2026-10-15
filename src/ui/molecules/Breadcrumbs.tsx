import { Fragment } from 'react'
import { Link } from 'react-router'
import styles from './Breadcrumbs.module.css'

export interface Crumb {
  label: string
  to?: string
}

/** Path of links where the last item is the current page. */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav className={styles.crumbs} aria-label="Breadcrumb">
      {items.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && <span className={styles.sep}>/</span>}
          {i === items.length - 1 || !c.to ? (
            <span className={styles.current} aria-current="page">
              {c.label}
            </span>
          ) : (
            <Link className={styles.link} to={c.to}>
              {c.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
