import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ease } from '@/styles/motion'
import styles from './DocumentLayout.module.css'

interface DocumentLayoutProps {
  topBar: ReactNode
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** Rendered behind the content, e.g. an ambient background. */
  backdrop?: ReactNode
  children?: ReactNode
}

/** Scrolling text page (home, area, course, unit) with a consistent header. */
export function DocumentLayout({
  topBar,
  eyebrow,
  title,
  description,
  actions,
  backdrop,
  children,
}: DocumentLayoutProps) {
  return (
    <>
      {topBar}
      <div className={styles.page}>
        {backdrop}
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: ease.out }}
        >
          <header className={styles.header}>
            {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
            <h1 className={styles.title}>{title}</h1>
            {description && <p className={styles.description}>{description}</p>}
            {actions && <div className={styles.actions}>{actions}</div>}
          </header>
          {children}
        </motion.div>
      </div>
    </>
  )
}

/** Titled block inside a DocumentLayout. */
export const DocumentSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    {children}
  </section>
)
