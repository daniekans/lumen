import * as Dialog from '@radix-ui/react-dialog'
import { Search } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { searchViz } from '@/content/registry'
import { sections } from '@/content/sections'
import { useUi } from '@/state/ui'
import { Kbd } from '../atoms'
import styles from './CommandPalette.module.css'

const sectionTitle = (id: string) => sections.find((s) => s.id === id)?.title ?? id

export function CommandPalette() {
  const open = useUi((s) => s.paletteOpen)
  const setOpen = useUi((s) => s.setPaletteOpen)
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <Dialog.Title
            className="sr-only"
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          >
            Search visualizations
          </Dialog.Title>
          {open && <PaletteBody onDone={() => setOpen(false)} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PaletteBody({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const results = useMemo(() => searchViz(query), [query])

  const go = (i: number) => {
    const v = results[i]
    if (!v) return
    navigate(`/${v.id}`)
    onDone()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(results.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      go(active)
    }
  }

  return (
    <>
      <div className={styles.inputRow}>
        <Search size={16} />
        <input
          autoFocus
          className={styles.input}
          placeholder="Search by title, topic or tag"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
        />
        <Kbd>Esc</Kbd>
      </div>
      {results.length === 0 ? (
        <div className={styles.empty}>No matches for “{query}”.</div>
      ) : (
        <ul className={styles.list} role="listbox">
          {results.map((v, i) => (
            <li
              key={v.id}
              role="option"
              aria-selected={i === active}
              data-active={i === active}
              className={styles.item}
              onMouseMove={() => setActive(i)}
              onClick={() => go(i)}
            >
              <span className={styles.itemTitle}>{v.title}</span>
              <span className={styles.itemSection}>{sectionTitle(v.section)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
