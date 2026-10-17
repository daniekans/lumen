import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { hasItems, type Course } from '@/catalog'
import { msg } from '@/i18n'
import { isItemComplete, nextItem, nextUnit, unitSummary, useProgress } from '@/progress'
import { Badge, KindIcon, ProgressRing, Tooltip } from '@/ui/atoms'
import { Breadcrumbs } from '@/ui/molecules'
import { TopBar } from '@/ui/organisms'
import { DocumentLayout, DocumentSection } from '@/ui/templates'
import { crumbsFor } from '../crumbs'
import { usePageTitle } from '../usePageTitle'
import styles from './CoursePage.module.css'

/** A course as a map: its units on a path, with the next one to take called out. */
export function CoursePage({ course }: { course: Course }) {
  usePageTitle(course.title)
  const data = useProgress((s) => s.data)
  const current = nextUnit(course.units, data)
  return (
    <DocumentLayout
      topBar={
        <TopBar>
          <Breadcrumbs items={crumbsFor(course)} />
        </TopBar>
      }
      eyebrow={msg.pages.course.eyebrow}
      title={course.title}
      description={course.description}
    >
      <DocumentSection title={msg.pages.course.units}>
        <ol className={styles.path}>
          {course.units.map((u, i) => {
            const planned = !hasItems(u)
            const summary = unitSummary(u, data)
            const next = u === current ? nextItem(u, data) : undefined
            return (
              <li
                key={u.id}
                className={clsx(styles.stop, planned && styles.planned, next && styles.current)}
              >
                <span className={styles.node}>
                  {planned ? (
                    <span className={styles.dot} />
                  ) : (
                    <ProgressRing value={summary.fraction} size={22} />
                  )}
                </span>
                <div className={styles.card}>
                  <Link to={u.path} className={styles.unit}>
                    <span className={styles.number}>{msg.pages.course.unitNumber(i + 1)}</span>
                    <span className={styles.title}>{u.title}</span>
                    <span className={styles.description}>{u.description}</span>
                  </Link>
                  {planned ? (
                    <Badge>{msg.common.planned}</Badge>
                  ) : (
                    <div className={styles.meta}>
                      <span className={styles.kinds}>
                        {u.items.map((item) => (
                          <Tooltip key={item.id} content={item.title}>
                            <Link
                              to={item.path}
                              aria-label={item.title}
                              className={clsx(
                                styles.kind,
                                isItemComplete(item, data.items[item.id]) && styles.kindDone,
                              )}
                            >
                              <KindIcon kind={item.kind} size={13} aria-hidden />
                            </Link>
                          </Tooltip>
                        ))}
                      </span>
                      {msg.progress.itemsDone(summary.itemsDone, summary.itemsTotal)}
                    </div>
                  )}
                  {next && (
                    <Link
                      to={next.path}
                      className={styles.continue}
                      onPointerEnter={() => void next.preload()}
                    >
                      {msg.pages.course.continueWith(next.title)}
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </DocumentSection>
    </DocumentLayout>
  )
}
