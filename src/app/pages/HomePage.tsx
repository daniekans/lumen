import { ArrowRight, Shuffle } from 'lucide-react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router'
import { catalog, getItem } from '@/catalog'
import { useProgress } from '@/progress'
import { ease } from '@/styles/motion'
import { AreaIcon, Button } from '@/ui/atoms'
import { CourseCard, CourseGrid, LissajousMark, TopBar } from '@/ui/organisms'
import styles from './HomePage.module.css'

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: ease.out, delay },
})

export function HomePage() {
  const navigate = useNavigate()
  const lastItem = useProgress((s) => (s.data.lastItemId ? getItem(s.data.lastItemId) : undefined))
  const start = lastItem ?? catalog.items[0]
  return (
    <>
      <TopBar />
      <div className={styles.page}>
        <div className={styles.ambient} aria-hidden />
        <div className={styles.content}>
          <section className={styles.hero}>
            <div>
              <motion.h1 className={styles.title} {...reveal(0)}>
                See the idea,
                <br />
                then the formula.
              </motion.h1>
              <motion.p className={styles.lede} {...reveal(0.08)}>
                A personal course in mathematics, data engineering, machine learning and AI
                engineering. Each concept is something to see, then to read, then to practice.
              </motion.p>
              <motion.div className={styles.actions} {...reveal(0.16)}>
                {start && (
                  <Button variant="primary" onClick={() => navigate(start.path)}>
                    {lastItem ? `Continue: ${lastItem.title}` : 'Start here'}
                    <ArrowRight size={15} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  icon={<Shuffle size={14} />}
                  onClick={() => navigate('/practice')}
                >
                  Mixed practice
                </Button>
              </motion.div>
            </div>
            <motion.div className={styles.figure} {...reveal(0.2)}>
              <LissajousMark size={300} strokeWidth={2} speed={0.12} tracer />
            </motion.div>
          </section>

          {catalog.areas.map((area, ai) => (
            <motion.section key={area.id} className={styles.section} {...reveal(0.25 + ai * 0.05)}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>
                  <AreaIcon icon={area.icon} size={17} />
                  {area.title}
                </h2>
                <p className={styles.sectionDesc}>{area.description}</p>
              </div>
              <CourseGrid>
                {area.courses.map((c, i) => (
                  <CourseCard key={c.id} course={c} index={ai + i} />
                ))}
              </CourseGrid>
            </motion.section>
          ))}
        </div>
      </div>
    </>
  )
}
