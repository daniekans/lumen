import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { ease } from '@/styles/motion'
import { IconButton } from '@/ui/atoms'
import styles from './VizSheet.module.css'

interface VizSheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** Usually a second <Stage> showing an enlarged part of the visualization. */
  children: ReactNode
}

/**
 * Large glass panel over the stage for a closer look at one part of a visualization. The control
 * dock stays visible and usable below it. Escape closes it.
 */
export function VizSheet({ open, onClose, title, children }: VizSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.sheet}
          role="dialog"
          aria-label={title}
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 6 }}
          transition={{ duration: 0.32, ease: ease.out }}
        >
          <div className={styles.header}>
            <span className={styles.title}>{title}</span>
            <IconButton label="Close" shortcut="Esc" size="sm" onClick={onClose}>
              <X size={15} />
            </IconButton>
          </div>
          <div className={styles.body}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
