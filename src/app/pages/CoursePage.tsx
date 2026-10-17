import clsx from 'clsx'
import { Link } from 'react-router'
import { hasItems, type Course } from '@/catalog'
import { unitSummary, useProgress } from '@/progress'
import { Badge, ProgressRing } from '@/ui/atoms'
import { Breadcrumbs } from '@/ui/molecules'
import { TopBar } from '@/ui/organisms'
import { DocumentLayout, DocumentSection } from '@/ui/templates'
import { crumbsFor } from '../crumbs'
import { usePageTitle } from '../usePageTitle'
import styles from './lists.module.css'
import { msg } from '@/i18n'

export function CoursePage({ course }: { course: Course }) {
  usePageTitle(course.title)
  const data = useProgress((s) => s.data)
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
        <ol className={styles.list}>
          {course.units.map((u, i) => {
            const planned = !hasItems(u)
            const summary = unitSummary(u, data)
            return (
              <li key={u.id}>
                <Link to={u.path} className={clsx(styles.row, planned && styles.planned)}>
                  <span className={styles.lead}>{i + 1}</span>
                  <span className={styles.body}>
                    <span className={styles.title}>{u.title}</span>
                    <span className={styles.description}>{u.description}</span>
                  </span>
                  <span className={styles.trail}>
                    {planned ? (
                      <Badge>{msg.common.planned}</Badge>
                    ) : (
                      <>
                        {msg.progress.itemsDone(summary.itemsDone, summary.itemsTotal)}
                        <ProgressRing value={summary.fraction} size={16} />
                      </>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </DocumentSection>
    </DocumentLayout>
  )
}
