import clsx from 'clsx'
import { Circle, CircleCheck, RotateCcw } from 'lucide-react'
import { IconButton, Tooltip } from '../atoms'
import styles from './DoneToggle.module.css'

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
      <Tooltip
        content={
          done
            ? 'Click to mark as not done and clear its progress'
            : 'Visiting every step and answering every question does this for you'
        }
      >
        <button
          type="button"
          aria-pressed={done}
          className={clsx(styles.toggle, done && styles.done)}
          onClick={onToggle}
        >
          {done ? <CircleCheck size={16} /> : <Circle size={16} />}
          {done ? 'Done' : 'Mark as done'}
        </button>
      </Tooltip>
      {onReset && !done && (
        <IconButton label="Reset progress" size="sm" onClick={onReset}>
          <RotateCcw size={14} />
        </IconButton>
      )}
    </span>
  )
}
