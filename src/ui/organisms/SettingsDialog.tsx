import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import { Download, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useProgress } from '@/progress'
import { useUi } from '@/state/ui'
import surfaces from '@/styles/surfaces.module.css'
import { Button, IconButton } from '../atoms'
import styles from './SettingsDialog.module.css'

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'never'

/** Progress backup (export and import) and reset. Progress lives only in this browser. */
export function SettingsDialog() {
  const open = useUi((s) => s.settingsOpen)
  const setOpen = useUi((s) => s.setSettingsOpen)
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={clsx(surfaces.glass, styles.content)}
          aria-describedby={undefined}
          tabIndex={-1}
          // Focus the dialog itself rather than its first button, so no tooltip pops up on open.
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            ;(e.currentTarget as HTMLElement | null)?.focus()
          }}
        >
          <div className={styles.head}>
            <Dialog.Title className={styles.title}>Progress and backup</Dialog.Title>
            <Dialog.Close asChild>
              <IconButton label="Close" shortcut="Esc" size="sm">
                <X size={15} />
              </IconButton>
            </Dialog.Close>
          </div>
          {open && <ProgressSettings />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ProgressSettings() {
  const data = useProgress((s) => s.data)
  const storeError = useProgress((s) => s.error)
  const exportJson = useProgress((s) => s.exportJson)
  const importJson = useProgress((s) => s.importJson)
  const reset = useProgress((s) => s.reset)
  const file = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ text: string; error?: boolean }>()
  const [confirmReset, setConfirmReset] = useState(false)
  const skills = Object.keys(data.skills).length
  const items = Object.keys(data.items).length

  const download = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lumen-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ text: 'Progress exported.' })
  }

  const upload = async (f: File | undefined) => {
    if (!f) return
    try {
      importJson(await f.text())
      setMessage({ text: `Imported progress from ${f.name}.` })
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : 'Could not read that file.',
        error: true,
      })
    } finally {
      if (file.current) file.current.value = ''
    }
  }

  return (
    <>
      <div className={styles.group}>
        <p className={styles.label}>How progress works</p>
        <dl className={styles.terms}>
          <dt>Units</dt>
          <dd>
            Each course is split into units. A unit holds explorations (interactive visuals with
            steps) and lessons (the same, plus questions).
          </dd>
          <dt>Done</dt>
          <dd>
            An exploration is done once you have visited all its steps; a lesson also needs every
            question answered correctly. You can mark anything done or not done yourself.
          </dd>
          <dt>Progress rings</dt>
          <dd>How much of a unit is done. An empty ring means not started.</dd>
          <dt>Skills</dt>
          <dd>
            What a unit teaches, rated by you from new to mastered. Ratings never change the rings.
          </dd>
        </dl>
      </div>
      <div className={styles.group}>
        <p className={styles.label}>Backup</p>
        <p className={styles.text}>
          Progress is stored in this browser only: {items} visited {items === 1 ? 'item' : 'items'},{' '}
          {skills} {skills === 1 ? 'skill status' : 'skill statuses'}. Export a file to keep a copy
          or to move to another browser. Last export: {formatDate(data.lastExportAt)}.
        </p>
        <div className={styles.row}>
          <Button icon={<Download size={14} />} onClick={download}>
            Export
          </Button>
          <Button icon={<Upload size={14} />} onClick={() => file.current?.click()}>
            Import
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => void upload(e.target.files?.[0])}
          />
        </div>
        {message && (
          <p className={clsx(styles.message, message.error && styles.error)}>{message.text}</p>
        )}
        {storeError && (
          <p className={clsx(styles.message, styles.error)}>Storage problem: {storeError}</p>
        )}
      </div>
      <div className={styles.group}>
        <p className={styles.label}>Reset</p>
        <p className={styles.text}>
          Clears all progress in this browser. Exported files are not affected.
        </p>
        <div className={styles.row}>
          {confirmReset ? (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  reset()
                  setConfirmReset(false)
                  setMessage({ text: 'Progress cleared.' })
                }}
              >
                Clear all progress
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setConfirmReset(true)}>Reset progress</Button>
          )}
        </div>
      </div>
    </>
  )
}
