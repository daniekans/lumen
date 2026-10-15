import { motion } from 'motion/react'
import { PanelLeftClose, Search } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { populatedSections, registry, vizBySection } from '@/content/registry'
import { useUi } from '@/state/ui'
import { spring } from '@/styles/motion'
import { IconButton, Kbd } from '../atoms'
import { LissajousMark } from './LissajousMark'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const open = useUi((s) => s.sidebarOpen)
  const toggle = useUi((s) => s.toggleSidebar)
  const openPalette = useUi((s) => s.setPaletteOpen)

  return (
    <motion.aside
      className={styles.sidebar}
      initial={false}
      animate={{ width: open ? 'var(--sidebar-width)' : 0, opacity: open ? 1 : 0 }}
      transition={spring.pane}
      aria-hidden={!open}
      inert={!open}
    >
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <LissajousMark size={22} />
            Lumen
          </Link>
          <IconButton label="Hide sidebar" shortcut="[" size="sm" onClick={toggle}>
            <PanelLeftClose size={16} />
          </IconButton>
        </div>
        <button type="button" className={styles.search} onClick={() => openPalette(true)}>
          <Search size={14} />
          <span>Search</span>
          <Kbd>Ctrl K</Kbd>
        </button>
        <nav className={styles.nav}>
          {populatedSections().map((s) => (
            <div key={s.id} className={styles.section}>
              <div className={styles.sectionTitle}>{s.title}</div>
              {vizBySection(s.id).map((v) => (
                <NavLink key={v.id} to={`/${v.id}`} className={styles.item}>
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className={styles.indicator}
                          transition={spring.snappy}
                        />
                      )}
                      <span className={styles.itemLabel}>{v.title}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className={styles.footer}>
          {registry.length} {registry.length === 1 ? 'visualization' : 'visualizations'}
        </div>
      </div>
    </motion.aside>
  )
}
