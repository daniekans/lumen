import { Outlet } from 'react-router'
import { AppShell } from '@/ui/templates'
import { useGlobalHotkeys } from './useGlobalHotkeys'
import { useThemeSync } from './useThemeSync'

export function Root() {
  useThemeSync()
  useGlobalHotkeys()
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
