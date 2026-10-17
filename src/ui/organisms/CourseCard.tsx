import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { hasItems, type Course } from '@/catalog'
import { unitSummary, useProgress } from '@/progress'
import { Badge, ProgressRing } from '../atoms'
import { CourseGlyph } from './CourseGlyph'
import styles from './CourseCard.module.css'
import { msg } from '@/i18n'

const accents = [
  'var(--viz-blue)',
  'var(--viz-yellow)',
  'var(--viz-teal)',
  'var(--viz-red)',
  'var(--viz-purple)',
]

/** Card linking to a course, with its progress. Courses without content show as planned. */
export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const data = useProgress((s) => s.data)
  const units = course.units.filter(hasItems)
  const fraction = units.length
    ? units.reduce((s, u) => s + unitSummary(u, data).fraction, 0) / units.length
    : 0
  const planned = units.length === 0
  return (
    <Link
      to={course.path}
      className={clsx(styles.card, planned && styles.planned)}
      onPointerEnter={() => units[0]?.items[0]?.preload()}
      style={{ '--accent': accents[index % accents.length] } as CSSProperties}
    >
      <span className={styles.glyph}>
        <CourseGlyph course={course.slug} size={40} />
      </span>
      <h3 className={styles.title}>{course.title}</h3>
      <p className={styles.summary}>{course.description}</p>
      <div className={styles.foot}>
        {planned ? (
          <Badge>{msg.common.planned}</Badge>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ProgressRing value={fraction} />
            <Badge>{msg.progress.units(course.units.length)}</Badge>
          </span>
        )}
        <ArrowRight size={16} className={styles.arrow} />
      </div>
    </Link>
  )
}

export const CourseGrid = ({ children }: { children: ReactNode }) => (
  <div className={styles.grid}>{children}</div>
)
