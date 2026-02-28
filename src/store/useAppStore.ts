import { create } from 'zustand'
import type { ExecutionHistoryEntry } from '../types'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'loading'
  title: string
  message?: string
}

interface AppState {
  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Execution History Cache
  executionHistory: Record<string, ExecutionHistoryEntry[]>
  setExecutionHistory: (tokenId: string, history: ExecutionHistoryEntry[]) => void
  addExecutionHistory: (tokenId: string, entry: ExecutionHistoryEntry) => void

  // UI State
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Gas State
  currentGasPrice: bigint | null
  setGasPrice: (price: bigint) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    // Auto-remove after 5 seconds for non-loading toasts
    if (toast.type !== 'loading') {
      setTimeout(() => {
        get().removeToast(id)
      }, 5000)
    }
    return id
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  // Execution History Cache
  executionHistory: {},
  setExecutionHistory: (tokenId, history) => {
    set((state) => ({
      executionHistory: {
        ...state.executionHistory,
        [tokenId]: history,
      },
    }))
  },
  addExecutionHistory: (tokenId, entry) => {
    set((state) => ({
      executionHistory: {
        ...state.executionHistory,
        [tokenId]: [entry, ...(state.executionHistory[tokenId] || [])],
      },
    }))
  },

  // UI State
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // Gas State
  currentGasPrice: null,
  setGasPrice: (price) => set({ currentGasPrice: price }),
}))
