import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import type { VizEntry } from '@/content/types'
import { Badge } from '../atoms'
import { SectionGlyph } from './SectionGlyph'
import styles from './VizCard.module.css'

const accents = [
  'var(--viz-blue)',
  'var(--viz-yellow)',
  'var(--viz-teal)',
  'var(--viz-red)',
  'var(--viz-purple)',
]

export function VizCard({ entry, index = 0 }: { entry: VizEntry; index?: number }) {
  return (
    <Link
      to={`/${entry.id}`}
      onPointerEnter={() => void entry.preload()}
      className={styles.card}
      style={{ '--accent': accents[index % accents.length] } as CSSProperties}
    >
      <span className={styles.glyph}>
        <SectionGlyph section={entry.section} size={40} />
      </span>
      <h3 className={styles.title}>{entry.title}</h3>
      <p className={styles.summary}>{entry.summary}</p>
      <div className={styles.foot}>
        <Badge>{entry.level}</Badge>
        <ArrowRight size={16} className={styles.arrow} />
      </div>
    </Link>
  )
}
