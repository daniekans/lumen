import { RotateCcw } from 'lucide-react'
import { msg } from '@/i18n'
import { IconButton } from '../atoms'
import styles from './PlaybackButton.module.css'

interface PlaybackButtonProps {
  /** An animation of the step is running. */
  playing: boolean
  /** The step has an animation that finished or was stopped, so it can play again. */
  canReplay: boolean
  onReplay: () => void
}

/**
 * Shows that the step's animation is playing (three bars that rise and fall), and offers to replay
 * it once it is done. Keeps its place when there is nothing to show, so the step header does not
 * shift.
 */
export function PlaybackButton({ playing, canReplay, onReplay }: PlaybackButtonProps) {
  if (!playing && !canReplay) return <span className={styles.placeholder} aria-hidden />
  return (
    <IconButton
      label={playing ? msg.item.animationPlaying : msg.item.replayStep}
      size="sm"
      onClick={onReplay}
    >
      {playing ? (
        <span className={styles.bars} aria-hidden>
          <span />
          <span />
          <span />
        </span>
      ) : (
        <RotateCcw size={13} />
      )}
    </IconButton>
  )
}
