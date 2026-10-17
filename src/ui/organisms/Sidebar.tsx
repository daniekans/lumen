import clsx from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronRight, PanelLeftClose, Search, Settings } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { catalog, getArea, hasItems, visibleCourses, type Item, type Unit } from '@/catalog'
import { itemProgress, unitSummary, useProgress } from '@/progress'
import { useUi } from '@/state/ui'
import { ease, spring } from '@/styles/motion'
import { AreaIcon, IconButton, Kbd, KindIcon, ProgressRing, Tooltip } from '../atoms'
import { LissajousMark } from './LissajousMark'
import styles from './Sidebar.module.css'
import { msg } from '@/i18n'

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

  return (
    <motion.aside
      className={styles.sidebar}
      data-print-hide
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
            {msg.app.name}
          </Link>
          <IconButton label={msg.shell.hideSidebar} shortcut="[" size="sm" onClick={toggle}>
            <PanelLeftClose size={16} />
          </IconButton>
        </div>
        <button type="button" className={styles.search} onClick={() => openPalette(true)}>
          <Search size={14} />
          <span>{msg.common.search}</span>
          <Kbd>{msg.keys.search}</Kbd>
        </button>

        <div className={styles.areas} role="tablist" aria-label={msg.shell.areas}>
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
          <Link to={area.path}>{msg.shell.areaOverview}</Link>
        </div>

        <nav className={styles.nav} aria-label={msg.shell.areaContents(area.title)}>
          {visibleCourses(area).length === 0 && (
            <p className={styles.empty}>{msg.shell.areaEmpty}</p>
          )}
          {visibleCourses(area).map((course) => (
            <Branch
              key={course.id}
              id={course.id}
              title={course.title}
              to={course.path}
              defaultOpen
              className={styles.course}
            >
              {course.units.filter(hasItems).map((unit) => (
                <Branch
                  key={unit.id}
                  id={unit.id}
                  title={unit.title}
                  to={unit.path}
                  defaultOpen={activeIds.has(unit.id)}
                  trailing={<UnitRing unit={unit} />}
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
                          <ItemIndicator item={item} />
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
          <button type="button" className={styles.footerButton} onClick={() => openSettings(true)}>
            <Settings size={14} />
            {msg.settings.title}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

function UnitRing({ unit }: { unit: Unit }) {
  const data = useProgress((s) => s.data)
  const { itemsDone, itemsTotal, fraction } = unitSummary(unit, data)
  return (
    <Tooltip content={msg.progress.itemsDoneInUnit(itemsDone, itemsTotal)} side="right">
      <span className={styles.status}>
        <ProgressRing
          value={fraction}
          size={13}
          label={msg.progress.itemsDone(itemsDone, itemsTotal)}
        />
      </span>
    </Tooltip>
  )
}

function ItemIndicator({ item }: { item: Item }) {
  // Select the stored record (stable between renders), then derive from it.
  const stored = useProgress((s) => s.data.items[item.id])
  const info = itemProgress(item, stored)
  return (
    <Tooltip content={info.detail} side="right">
      <span className={styles.status}>
        {info.state === 'done' ? (
          <Check size={13} className={styles.done} aria-label={msg.progress.done} />
        ) : (
          <ProgressRing value={info.fraction} size={11} label={info.detail} />
        )}
      </span>
    </Tooltip>
  )
}

/** Collapsible tree level: a chevron that expands it and a title that opens its page. */
function Branch({
  id,
  title,
  to,
  trailing,
  defaultOpen,
  className,
  children,
}: {
  id: string
  title: string
  to: string
  trailing?: ReactNode
  defaultOpen: boolean
  className?: string
  children: ReactNode
}) {
  const [choice, setChoice] = useState<boolean | undefined>(undefined)
  const open = choice ?? defaultOpen
  return (
    <div>
      <div className={clsx(styles.row, styles.branch, className, open && styles.open)}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={`branch-${id}`}
          aria-label={open ? msg.shell.collapse(title) : msg.shell.expand(title)}
          onClick={() => setChoice(!open)}
        >
          <ChevronRight size={13} className={styles.chevron} />
        </button>
        <NavLink to={to} end className={styles.branchLink}>
          {title}
        </NavLink>
        {trailing}
      </div>
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
