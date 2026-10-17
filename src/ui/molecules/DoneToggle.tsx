import clsx from 'clsx'
import { Circle, CircleCheck, RotateCcw } from 'lucide-react'
import { IconButton, Tooltip } from '../atoms'
import styles from './DoneToggle.module.css'
import { msg } from '@/i18n'

interface DoneToggleProps {
  done: boolean
  /** Marks the item done, or (when it is done) returns it to not started. */
  onToggle: () => void
  /** Shown while the item is in progress: clears its partial progress. */
  onReset?: () => void
}

/** Pill that shows whether an item is done and switches it either way. */
export function DoneToggle({ done, onToggle, onReset }: DoneToggleProps) {
  return (
    <span className={styles.group}>
      <Tooltip content={done ? msg.item.undoneHint : msg.item.doneHint}>
        <button
          type="button"
          aria-pressed={done}
          className={clsx(styles.toggle, done && styles.done)}
          onClick={onToggle}
        >
          {done ? <CircleCheck size={16} /> : <Circle size={16} />}
          {done ? msg.progress.done : msg.item.markDone}
        </button>
      </Tooltip>
      {onReset && !done && (
        <IconButton label={msg.item.resetProgress} size="sm" onClick={onReset}>
          <RotateCcw size={14} />
        </IconButton>
      )}
    </span>
  )
}
