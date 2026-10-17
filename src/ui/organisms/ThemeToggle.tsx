import { AnimatePresence, motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { useUi } from '@/state/ui'
import { IconButton } from '../atoms'
import { msg } from '@/i18n'

export function ThemeToggle() {
  const theme = useUi((s) => s.theme)
  const toggle = useUi((s) => s.toggleTheme)
  return (
    <IconButton
      label={theme === 'dark' ? msg.shell.lightTheme : msg.shell.darkTheme}
      shortcut="T"
      onClick={toggle}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          style={{ display: 'inline-flex' }}
          initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </motion.span>
      </AnimatePresence>
    </IconButton>
  )
}
