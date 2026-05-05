import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TaskStore {
  selectedCommunity: string | null
  selectedList: string | null
  viewMode: "list" | "kanban" | "calendar" | "timeline"
  filter: string
  searchQuery: string
  
  setSelectedCommunity: (id: string | null) => void
  setSelectedList: (id: string | null) => void
  setViewMode: (mode: "list" | "kanban" | "calendar" | "timeline") => void
  setFilter: (filter: string) => void
  setSearchQuery: (query: string) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      selectedCommunity: null,
      selectedList: null,
      viewMode: "list",
      filter: "all",
      searchQuery: "",
      
      setSelectedCommunity: (id) => set({ selectedCommunity: id }),
      setSelectedList: (id) => set({ selectedList: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setFilter: (filter) => set({ filter }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: "task-store",
    }
  )
)