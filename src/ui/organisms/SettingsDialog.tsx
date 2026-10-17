import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import { Download, Upload, X } from 'lucide-react'
import { Fragment, useRef, useState } from 'react'
import { useProgress } from '@/progress'
import { useUi } from '@/state/ui'
import surfaces from '@/styles/surfaces.module.css'
import { Button, IconButton } from '../atoms'
import styles from './SettingsDialog.module.css'
import { msg } from '@/i18n'

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
            <Dialog.Title className={styles.title}>{msg.settings.title}</Dialog.Title>
            <Dialog.Close asChild>
              <IconButton label={msg.common.close} shortcut={msg.keys.escape} size="sm">
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
    setMessage({ text: msg.settings.exported })
  }

  const upload = async (f: File | undefined) => {
    if (!f) return
    try {
      importJson(await f.text())
      setMessage({ text: msg.settings.imported(f.name) })
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : msg.settings.unreadableFile,
        error: true,
      })
    } finally {
      if (file.current) file.current.value = ''
    }
  }

  return (
    <>
      <div className={styles.group}>
        <p className={styles.label}>{msg.settings.howItWorks}</p>
        <dl className={styles.terms}>
          {msg.settings.terms.map(({ term, text }) => (
            <Fragment key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
      <div className={styles.group}>
        <p className={styles.label}>{msg.settings.backup}</p>
        <p className={styles.text}>{msg.settings.backupStatus(items, skills, data.lastExportAt)}</p>
        <div className={styles.row}>
          <Button icon={<Download size={14} />} onClick={download}>
            {msg.settings.export}
          </Button>
          <Button icon={<Upload size={14} />} onClick={() => file.current?.click()}>
            {msg.settings.import}
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
          <p className={clsx(styles.message, styles.error)}>
            {msg.settings.storageProblem(storeError)}
          </p>
        )}
      </div>
      <div className={styles.group}>
        <p className={styles.label}>{msg.settings.reset}</p>
        <p className={styles.text}>{msg.settings.resetHint}</p>
        <div className={styles.row}>
          {confirmReset ? (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  reset()
                  setConfirmReset(false)
                  setMessage({ text: msg.settings.cleared })
                }}
              >
                {msg.settings.clearAll}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                {msg.common.cancel}
              </Button>
            </>
          ) : (
            <Button onClick={() => setConfirmReset(true)}>{msg.settings.resetProgress}</Button>
          )}
        </div>
      </div>
    </>
  )
}
