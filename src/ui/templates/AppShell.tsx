import type { ReactNode } from 'react'
import { CommandPalette, SettingsDialog, Sidebar } from '../organisms'
import { TooltipProvider } from '../atoms'
import styles from './AppShell.module.css'

/** Persistent frame: sidebar on the left, routed content on the right, global overlays. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={150}>
      <div className={styles.shell} data-print-flow>
        <Sidebar />
        <main className={styles.main} data-print-flow>
          {children}
        </main>
      </div>
      <CommandPalette />
      <SettingsDialog />
    </TooltipProvider>
  )
}
