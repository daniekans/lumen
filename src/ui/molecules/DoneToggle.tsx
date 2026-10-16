import clsx from 'clsx'
import { Circle, CircleCheck } from 'lucide-react'
import { Tooltip } from '../atoms'
import styles from './DoneToggle.module.css'

interface DoneToggleProps {
  done: boolean
  onToggle: () => void
}

/** Pill that shows whether an item is done and switches it either way. */
export function DoneToggle({ done, onToggle }: DoneToggleProps) {
  return (
    <Tooltip
      content={
        done
          ? 'Click to mark as not done'
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
  )
}
