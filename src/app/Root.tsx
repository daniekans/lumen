import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { startProgressPersistence } from '@/progress'
import { AppShell } from '@/ui/templates'
import { useGlobalHotkeys } from './useGlobalHotkeys'
import { useThemeSync } from './useThemeSync'

export function Root() {
  useThemeSync()
  useGlobalHotkeys()
  useEffect(() => startProgressPersistence(), [])
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
