import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { populatedSections, registry, vizBySection } from '@/content/registry'
import { ease } from '@/styles/motion'
import { Button } from '@/ui/atoms'
import { LissajousMark, TopBar, VizCard } from '@/ui/organisms'
import styles from './HomePage.module.css'

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: ease.out, delay },
})

export function HomePage() {
  const navigate = useNavigate()
  const first = registry[0]
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
                Interactive visual explanations of mathematics, machine learning and computing. Each
                one is built around a single concept, with steps to follow and controls to change.
              </motion.p>
              {first && (
                <motion.div {...reveal(0.16)}>
                  <Button variant="primary" onClick={() => navigate(`/${first.id}`)}>
                    Start here
                    <ArrowRight size={15} />
                  </Button>
                </motion.div>
              )}
            </div>
            <motion.div className={styles.figure} {...reveal(0.2)}>
              <LissajousMark size={300} strokeWidth={2} speed={0.12} tracer />
            </motion.div>
          </section>

          {populatedSections().map((s, si) => (
            <motion.section key={s.id} className={styles.section} {...reveal(0.25 + si * 0.05)}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>{s.title}</h2>
                <p className={styles.sectionDesc}>{s.description}</p>
              </div>
              <div className={styles.grid}>
                {vizBySection(s.id).map((v, i) => (
                  <VizCard key={v.id} entry={v} index={si + i} />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </>
  )
}
