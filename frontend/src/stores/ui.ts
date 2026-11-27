import { create } from 'zustand'
import type { StatusId } from '@/api/types'

// UI state the server doesn't own. Server data lives in TanStack Query; shareable view state lives in the URL.

export type Theme = 'light' | 'dark' | 'system'
export type TourStep = 'lens' | 'open' | 'move' | 'palette'
export const TOUR_STEPS: TourStep[] = ['lens', 'open', 'move', 'palette']

export interface ToastMsg {
  id: number
  text: string
  undo?: () => void
}

interface UiState {
  /** hover preview of a teammate's work; the pinned lens is in the URL (?lens=) */
  hoverLens: string | null
  composer: StatusId | null
  sidebarOpen: boolean
  inboxOpen: boolean
  paletteOpen: boolean
  theme: Theme
  tour: TourStep[]
  toast: ToastMsg | null
  lastUndo: (() => void) | null
  setHoverLens: (id: string | null) => void
  setComposer: (s: StatusId | null) => void
  setSidebar: (open: boolean) => void
  setInbox: (open: boolean) => void
  setPalette: (open: boolean) => void
  setTheme: (t: Theme) => void
  tourDone: (s: TourStep) => void
  showToast: (text: string, undo?: () => void) => void
  hideToast: () => void
  setLastUndo: (fn: (() => void) | null) => void
}

const THEME_KEY = 'taskora-theme'
const TOUR_KEY = 'taskora-tour'

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    // per-device convenience only
  }
}

export function applyTheme(t: Theme) {
  const root = document.documentElement
  root.classList.add('no-tx') // every surface switches in the same frame
  if (t === 'system') delete root.dataset.theme
  else root.dataset.theme = t
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('no-tx')))
}
export const isDark = (t: Theme) => t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)

let toastSeq = 0

export const useUi = create<UiState>((set) => ({
  hoverLens: null,
  composer: null,
  sidebarOpen: false,
  inboxOpen: false,
  paletteOpen: false,
  theme: (() => {
    try {
      const t = localStorage.getItem(THEME_KEY)
      return t === 'light' || t === 'dark' ? t : 'system'
    } catch {
      return 'system'
    }
  })(),
  tour: read<TourStep[]>(TOUR_KEY, []),
  toast: null,
  lastUndo: null,
  setHoverLens: (hoverLens) => set({ hoverLens }),
  setComposer: (composer) => set({ composer }),
  setSidebar: (sidebarOpen) => set({ sidebarOpen }),
  setInbox: (inboxOpen) => set({ inboxOpen }),
  setPalette: (paletteOpen) => set({ paletteOpen }),
  setTheme: (theme) => {
    try {
      if (theme === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, theme)
    } catch {
      // per-device convenience only
    }
    applyTheme(theme)
    set({ theme })
  },
  tourDone: (s) =>
    set((st) => {
      if (st.tour.includes(s)) return st
      const tour = [...st.tour, s]
      write(TOUR_KEY, tour)
      return { tour }
    }),
  showToast: (text, undo) => set({ toast: { id: ++toastSeq, text, undo } }),
  hideToast: () => set({ toast: null }),
  setLastUndo: (lastUndo) => set({ lastUndo }),
}))

export const toast = (text: string, undo?: () => void) => useUi.getState().showToast(text, undo)
