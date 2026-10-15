import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronRight, PanelLeftClose, Search, Settings } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { catalog, getArea, hasItems, visibleCourses, type Unit } from '@/catalog'
import { isItemComplete, unitSummary, useProgress } from '@/progress'
import { useUi } from '@/state/ui'
import { ease, spring } from '@/styles/motion'
import { AreaIcon, IconButton, Kbd, KindIcon, ProgressRing, Tooltip } from '../atoms'
import { LissajousMark } from './LissajousMark'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const open = useUi((s) => s.sidebarOpen)
  const toggle = useUi((s) => s.toggleSidebar)
  const openPalette = useUi((s) => s.setPaletteOpen)
  const openSettings = useUi((s) => s.setSettingsOpen)
  const storedArea = useUi((s) => s.sidebarArea)
  const setStoredArea = useUi((s) => s.setSidebarArea)
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  const routeArea = getArea(segments[0] ?? '')

  // The tree follows the current page's area. A tab click shows another area until the next
  // navigation; on pages outside any area (home) the last chosen area is shown.
  const [picked, setPicked] = useState<{ area: string; at: string }>()
  const area =
    (picked?.at === pathname ? getArea(picked.area) : routeArea) ??
    getArea(storedArea) ??
    catalog.areas[0]!
  const pickArea = (id: string) => {
    setPicked({ area: id, at: pathname })
    setStoredArea(id)
  }
  const activeIds = new Set(segments.map((_, i) => segments.slice(0, i + 1).join('/')))
  const count = catalog.items.length

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

        <div className={styles.areas} role="tablist" aria-label="Areas">
          {catalog.areas.map((a) => (
            <Tooltip key={a.id} content={a.title}>
              <button
                type="button"
                role="tab"
                aria-selected={a.id === area.id}
                aria-label={a.title}
                className={styles.areaTab}
                onClick={() => pickArea(a.id)}
              >
                {a.id === area.id && (
                  <motion.span
                    layoutId="area-indicator"
                    className={styles.areaIndicator}
                    transition={spring.snappy}
                  />
                )}
                <AreaIcon icon={a.icon} size={15} />
              </button>
            </Tooltip>
          ))}
        </div>
        <div className={styles.areaTitle}>
          {area.title}
          <Link to={area.path}>Overview</Link>
        </div>

        <nav className={styles.nav} aria-label={`${area.title} contents`}>
          {visibleCourses(area).length === 0 && (
            <p className={styles.empty}>Nothing here yet. Content for this area is on the way.</p>
          )}
          {visibleCourses(area).map((course) => (
            <Branch
              key={course.id}
              id={course.id}
              defaultOpen
              header={<span className={clsx(styles.label)}>{course.title}</span>}
              className={styles.course}
            >
              {course.units.filter(hasItems).map((unit) => (
                <Branch
                  key={unit.id}
                  id={unit.id}
                  defaultOpen={activeIds.has(unit.id)}
                  header={<UnitHeader unit={unit} />}
                >
                  {unit.items.map((item) => (
                    <NavLink key={item.id} to={item.path} className={clsx(styles.row, styles.item)}>
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="nav-indicator"
                              className={styles.indicator}
                              transition={spring.snappy}
                            />
                          )}
                          <KindIcon kind={item.kind} className={styles.kind} />
                          <span className={styles.label}>{item.title}</span>
                          <ItemDone id={item.id} />
                        </>
                      )}
                    </NavLink>
                  ))}
                </Branch>
              ))}
            </Branch>
          ))}
        </nav>
        <div className={styles.footer}>
          {count} {count === 1 ? 'item' : 'items'}
          <IconButton label="Settings and progress" size="sm" onClick={() => openSettings(true)}>
            <Settings size={15} />
          </IconButton>
        </div>
      </div>
    </motion.aside>
  )
}

function UnitHeader({ unit }: { unit: Unit }) {
  const data = useProgress((s) => s.data)
  const { fraction } = unitSummary(unit, data)
  return (
    <>
      <span className={styles.label}>{unit.title}</span>
      <ProgressRing value={fraction} size={13} />
    </>
  )
}

function ItemDone({ id }: { id: string }) {
  const item = catalog.byId.get(id)
  const done = useProgress((s) => item?.type === 'item' && isItemComplete(item, s.data.items[id]))
  return done ? <Check size={13} className={styles.done} aria-label="Done" /> : null
}

/** Collapsible tree level. Remembers the learner's choice; otherwise uses `defaultOpen`. */
function Branch({
  id,
  header,
  defaultOpen,
  className,
  children,
}: {
  id: string
  header: ReactNode
  defaultOpen: boolean
  className?: string
  children: ReactNode
}) {
  const [choice, setChoice] = useState<boolean | undefined>(undefined)
  const open = choice ?? defaultOpen
  return (
    <div>
      <button
        type="button"
        className={clsx(styles.row, className, open && styles.open)}
        aria-expanded={open}
        aria-controls={`branch-${id}`}
        onClick={() => setChoice(!open)}
      >
        <ChevronRight size={13} className={styles.chevron} />
        {header}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`branch-${id}`}
            className={styles.children}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: ease.out }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
