import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'

interface UiState {
  theme: Theme
  sidebarOpen: boolean
  asideOpen: boolean
  paletteOpen: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
  toggleAside: () => void
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
      paletteOpen: false,
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleAside: () => set((s) => ({ asideOpen: !s.asideOpen })),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
    }),
    {
      name: 'lumen:ui',
      storage: safeStorage,
      partialize: ({ theme, sidebarOpen, asideOpen }) => ({ theme, sidebarOpen, asideOpen }),
    },
  ),
)
