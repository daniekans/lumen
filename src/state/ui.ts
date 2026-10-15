import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'
export type AsideMode = 'docked' | 'floating'

export const ASIDE_WIDTH = { min: 320, default: 400, max: 760 } as const

interface UiState {
  theme: Theme
  sidebarOpen: boolean
  asideOpen: boolean
  asideMode: AsideMode
  asideWidth: number
  paletteOpen: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
  toggleAside: () => void
  toggleAsideMode: () => void
  setAsideWidth: (width: number) => void
  setPaletteOpen: (open: boolean) => void
}

/** Storage that survives private windows and blocked site data by failing quietly. */
const safeStorage = createJSONStorage(() => ({
  getItem: (k) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* ignore */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}))

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      asideOpen: true,
      asideMode: 'docked',
      asideWidth: ASIDE_WIDTH.default,
      paletteOpen: false,
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleAside: () => set((s) => ({ asideOpen: !s.asideOpen })),
      toggleAsideMode: () =>
        set((s) => ({
          asideMode: s.asideMode === 'docked' ? 'floating' : 'docked',
          asideOpen: true,
        })),
      setAsideWidth: (w) =>
        set({ asideWidth: Math.round(Math.min(ASIDE_WIDTH.max, Math.max(ASIDE_WIDTH.min, w))) }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
    }),
    {
      name: 'lumen:ui',
      storage: safeStorage,
      partialize: ({ theme, sidebarOpen, asideOpen, asideMode, asideWidth }) => ({
        theme,
        sidebarOpen,
        asideOpen,
        asideMode,
        asideWidth,
      }),
    },
  ),
)
