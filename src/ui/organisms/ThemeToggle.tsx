import { AnimatePresence, motion } from 'motion/react'
import { BookOpen, Moon, Sun } from 'lucide-react'
import { nextTheme, type Theme, useUi } from '@/state/ui'
import { IconButton } from '../atoms'
import { msg } from '@/i18n'

/** The button names and shows the theme it switches to. */
const NEXT: Record<Theme, { label: string; icon: typeof Sun }> = {
  dark: { label: msg.shell.darkTheme, icon: Moon },
  light: { label: msg.shell.lightTheme, icon: Sun },
  paper: { label: msg.shell.paperTheme, icon: BookOpen },
}

export function ThemeToggle() {
  const theme = useUi((s) => s.theme)
  const toggle = useUi((s) => s.toggleTheme)
  const { label, icon: Icon } = NEXT[nextTheme(theme)]
  return (
    <IconButton label={label} shortcut="T" onClick={toggle}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          style={{ display: 'inline-flex' }}
          initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={16} />
        </motion.span>
      </AnimatePresence>
    </IconButton>
  )
}
