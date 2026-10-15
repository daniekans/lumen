import type { ReactNode } from 'react'
import { CommandPalette, Sidebar } from '../organisms'
import { TooltipProvider } from '../atoms'
import styles from './AppShell.module.css'

/** Persistent frame: sidebar on the left, routed content on the right, global overlays. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={400} skipDelayDuration={150}>
      <div className={styles.shell}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
      <CommandPalette />
    </TooltipProvider>
  )
}
