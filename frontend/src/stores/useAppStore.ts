import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // UI State
  isMobileMenuOpen: boolean
  currentPage: string
  
  // Device Detection
  deviceType: 'mobile' | 'tablet' | 'desktop'
  isOnline: boolean
  
  // Settings
  theme: 'light' | 'dark'
  studyTimeLimit: 5 | 10 | 15 | null
  
  // Actions
  setMobileMenuOpen: (open: boolean) => void
  setCurrentPage: (page: string) => void
  setDeviceType: (type: 'mobile' | 'tablet' | 'desktop') => void
  setOnlineStatus: (online: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setStudyTimeLimit: (limit: 5 | 10 | 15 | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      isMobileMenuOpen: false,
      currentPage: '/',
      deviceType: 'desktop',
      isOnline: true,
      theme: 'light',
      studyTimeLimit: null,
      
      // Actions
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setDeviceType: (type) => set({ deviceType: type }),
      setOnlineStatus: (online) => set({ isOnline: online }),
      setTheme: (theme) => set({ theme }),
      setStudyTimeLimit: (limit) => set({ studyTimeLimit: limit }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        studyTimeLimit: state.studyTimeLimit,
      }),
    }
  )
)