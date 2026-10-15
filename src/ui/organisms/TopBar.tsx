import { AnimatePresence, motion } from 'motion/react'
import { PanelLeftOpen, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useUi } from '@/state/ui'
import { IconButton } from '../atoms'
import { ThemeToggle } from './ThemeToggle'
import styles from './TopBar.module.css'

interface TopBarProps {
  /** Breadcrumb or title content on the left. */
  children?: ReactNode
  /** Extra actions placed before the global ones. */
  actions?: ReactNode
}

export function TopBar({ children, actions }: TopBarProps) {
  const sidebarOpen = useUi((s) => s.sidebarOpen)
  const toggleSidebar = useUi((s) => s.toggleSidebar)
  const openPalette = useUi((s) => s.setPaletteOpen)
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <AnimatePresence initial={false}>
          {!sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              style={{ display: 'inline-flex', overflow: 'hidden' }}
            >
              <IconButton label="Show sidebar" shortcut="[" onClick={toggleSidebar}>
                <PanelLeftOpen size={16} />
              </IconButton>
            </motion.span>
          )}
        </AnimatePresence>
        {children}
      </div>
      <div className={styles.right}>
        {actions}
        <IconButton label="Search" shortcut="Ctrl K" onClick={() => openPalette(true)}>
          <Search size={16} />
        </IconButton>
        <ThemeToggle />
      </div>
    </header>
  )
}
