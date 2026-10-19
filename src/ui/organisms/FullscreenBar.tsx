import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Minimize } from 'lucide-react'
import { msg } from '@/i18n'
import surfaces from '@/styles/surfaces.module.css'
import type { ComponentProps } from 'react'
import { IconButton, RichText } from '../atoms'
import { PlaybackButton } from '../molecules'
import styles from './FullscreenBar.module.css'

interface FullscreenBarProps {
  title?: string
  index: number
  count: number
  onStep: (index: number) => void
  onExit: () => void
  playback?: ComponentProps<typeof PlaybackButton>
}

/** Step navigation and the exit button, shown over the stage in fullscreen mode. */
export const FullscreenBar = ({
  title,
  index,
  count,
  onStep,
  onExit,
  playback,
}: FullscreenBarProps) => (
  <div className={clsx(surfaces.glass, styles.bar)} data-print-hide>
    {count > 1 && (
      <>
        <IconButton
          label={msg.item.previousStep}
          shortcut="←"
          size="sm"
          disabled={index === 0}
          onClick={() => onStep(index - 1)}
        >
          <ChevronLeft size={15} />
        </IconButton>
        <span className={styles.count}>{msg.item.stepOf(index + 1, count)}</span>
      </>
    )}
    {title && (
      <span className={styles.title}>
        <RichText>{title}</RichText>
      </span>
    )}
    {count > 1 && (
      <IconButton
        label={msg.item.nextStep}
        shortcut="→"
        size="sm"
        disabled={index === count - 1}
        onClick={() => onStep(index + 1)}
      >
        <ChevronRight size={15} />
      </IconButton>
    )}
    {playback && <PlaybackButton {...playback} />}
    <span className={styles.divider} />
    <IconButton label={msg.item.exitFullscreen} shortcut="F" size="sm" onClick={onExit}>
      <Minimize size={15} />
    </IconButton>
  </div>
)
