import * as Menu from '@radix-ui/react-dropdown-menu'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import { SKILL_STATUSES, statusLabel, type SkillStatus } from '@/progress/types'
import surfaces from '@/styles/surfaces.module.css'
import { StatusDots } from '../atoms'
import styles from './StatusPicker.module.css'

interface StatusPickerProps {
  status: SkillStatus
  /** True when the learner set the status themselves. */
  manual: boolean
  onChange: (status: SkillStatus) => void
  /** Removes the learner's choice. Omit when there is nothing to clear. */
  onClear?: () => void
  label: string
}

/** Shows a skill status and lets the learner set any status, in either direction. */
export function StatusPicker({ status, manual, onChange, onClear, label }: StatusPickerProps) {
  return (
    <Menu.Root>
      <Menu.Trigger className={styles.trigger} aria-label={`${label}: ${statusLabel[status]}`}>
        <StatusDots status={status} />
        {statusLabel[status]}
        <ChevronDown size={12} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content className={clsx(surfaces.glass, styles.menu)} align="end" sideOffset={6}>
          <Menu.RadioGroup value={status} onValueChange={(v) => onChange(v as SkillStatus)}>
            {SKILL_STATUSES.map((s) => (
              <Menu.RadioItem key={s} value={s} className={styles.item}>
                {statusLabel[s]}
                <StatusDots status={s} />
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
          {manual && onClear && (
            <>
              <Menu.Separator className={styles.separator} />
              <Menu.Item className={styles.item} onSelect={onClear}>
                Clear my choice
              </Menu.Item>
            </>
          )}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
